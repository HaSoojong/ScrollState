import { useEffect, useRef, useState } from 'react';
import { getAudioContext } from '../audio/audioContext';

/**
 * Hook to load buffers, detect onset per merge_plan guidance, and schedule playback.
 * Expects mergePlan: { timeline, web_audio_alignment_js } where timeline contains
 * start_sec_from_zero, gain_db, fade_in_sec, fade_out_sec, pan, track_id, rationale.
 */
export function useMergePlanPlayer({ mergePlan, trackIdToUrl }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const sourcesRef = useRef([]);
  const gainNodesRef = useRef([]);
  const bufferCacheRef = useRef(new Map());
  const startTimeRef = useRef(null);

  async function fetchAsArrayBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.arrayBuffer();
  }

  async function decodeBuffer(url, audioCtx) {
    if (bufferCacheRef.current.has(url)) return bufferCacheRef.current.get(url);
    const data = await fetchAsArrayBuffer(url);
    const buffer = await audioCtx.decodeAudioData(data);
    bufferCacheRef.current.set(url, buffer);
    return buffer;
  }

  function dbToGain(db) {
    return Math.pow(10, db / 20);
  }

  function detectOnsetRms(buffer, { frameSize = 1024, hopSize = 512, thresholdDb = -40, consecutive = 3 }) {
    const channelData = buffer.getChannelData(0);
    const len = channelData.length;
    const sr = buffer.sampleRate;
    const threshold = Math.pow(10, thresholdDb / 20);
    let aboveCount = 0;
    for (let start = 0; start < len; start += hopSize) {
      let sum = 0;
      const end = Math.min(start + frameSize, len);
      for (let i = start; i < end; i++) {
        const sample = channelData[i];
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / (end - start));
      if (rms > threshold) {
        aboveCount += 1;
        if (aboveCount >= consecutive) {
          return start / sr;
        }
      } else {
        aboveCount = 0;
      }
    }
    return 0;
  }

  async function loadAndPrepare() {
    if (!mergePlan?.timeline) return;
    setIsLoading(true);
    setError(null);
    const audioCtx = getAudioContext();

    const buffers = await Promise.all(
      mergePlan.timeline.map(async (entry) => {
        const url = trackIdToUrl(entry.track_id);
        const buffer = await decodeBuffer(url, audioCtx);
        const detectedOnset = detectOnsetRms(buffer, {});
        return { entry, buffer, detectedOnset };
      })
    );

    // Compute global min onset
    const minOnset = Math.min(...buffers.map(b => b.detectedOnset));

    // Schedule
    const now = audioCtx.currentTime + 0.1;
    startTimeRef.current = now;
    buffers.forEach(({ entry, buffer, detectedOnset }) => {
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = audioCtx.createGain();
      const panNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

      // Gain and fades
      const baseGain = dbToGain(entry.gain_db || 0);
      gainNode.gain.setValueAtTime(0.0001, now);
      const startAt = now + (entry.start_sec_from_zero || 0) + (detectedOnset - minOnset);
      const fadeIn = Math.max(entry.fade_in_sec || 0.05, 0.01);
      const fadeOut = Math.max(entry.fade_out_sec || 0, 0);

      gainNode.gain.linearRampToValueAtTime(baseGain, startAt + fadeIn);
      if (fadeOut > 0) {
        const endAt = startAt + buffer.duration;
        gainNode.gain.setValueAtTime(baseGain, endAt - fadeOut);
        gainNode.gain.linearRampToValueAtTime(0.0001, endAt);
      }

      if (panNode) {
        panNode.pan.setValueAtTime(entry.pan ?? 0, now);
        source.connect(panNode).connect(gainNode).connect(audioCtx.destination);
      } else {
        source.connect(gainNode).connect(audioCtx.destination);
      }

      // Apply emphasis segments per track by scheduling gain automation
      const segments = (mergePlan.emphasis_segments || []).filter(seg => seg.track_id === entry.track_id);
      segments.forEach(seg => {
        const segStart = now + (seg.start_sec || 0);
        const segEnd = now + (seg.end_sec || 0);
        const boost = dbToGain(seg.gain_boost_db || 0);
        gainNode.gain.setValueAtTime(gainNode.gain.value * boost, segStart);
        gainNode.gain.setValueAtTime(gainNode.gain.value, segEnd);
      });

      source.start(startAt, detectedOnset);
      sourcesRef.current.push(source);
      gainNodesRef.current.push(gainNode);
    });

    setIsLoading(false);
    setIsPlaying(true);
  }

  function stop() {
    const audioCtx = getAudioContext();
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (_) {}
    });
    sourcesRef.current = [];
    gainNodesRef.current = [];
    setIsPlaying(false);
    startTimeRef.current = null;
    // Optionally close? Keep shared context alive.
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loadAndPrepare, stop, isLoading, isPlaying, error };
}
