// Orchestrates all audio feature extraction and returns a structured feature object —
// calls bpmDetector, frequencyAnalyzer, and waveformExtractor, then combines results
import { getAudioContext } from './audioContext';
import { detectBpm } from './bpmDetector';
import { extractDominantFrequency } from './frequencyAnalyzer';
import { extractWaveform } from './waveformExtractor';

/**
 * Extracts all audio features from a File or AudioBuffer.
 * @param {File} audioFile
 * @returns {Promise<{
 *   bpm: number,
 *   dominantFrequency: { dominantRange: string, peakFrequencyHz: number },
 *   waveform: Float32Array,
 *   durationSeconds: number
 * }>}
 */
export async function extractAudioFeatures(audioFile) {
  const audioContext = getAudioContext();
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  const [bpm, dominantFrequency] = await Promise.all([
    detectBpm(audioBuffer),
    extractDominantFrequency(audioBuffer),
  ]);

  return {
    bpm,
    dominantFrequency,
    waveform: extractWaveform(audioBuffer, 160),
    durationSeconds: audioBuffer.duration,
  };
}
