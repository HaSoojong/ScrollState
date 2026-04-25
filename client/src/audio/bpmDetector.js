// BPM detection via beat detection using the Web Audio API —
// analyzes an AudioBuffer and estimates the track's beats per minute

/**
 * Detects the BPM of an AudioBuffer using onset/beat detection.
 * @param {AudioBuffer} audioBuffer
 * @returns {Promise<number>} estimated BPM
 */
export async function detectBpm(audioBuffer) {
  const channel = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.1);
  const energies = [];

  for (let i = 0; i < channel.length; i += windowSize) {
    let energy = 0;
    for (let j = 0; j < windowSize && i + j < channel.length; j += 1) {
      energy += Math.abs(channel[i + j]);
    }
    energies.push(energy / windowSize);
  }

  const average = energies.reduce((sum, value) => sum + value, 0) / Math.max(energies.length, 1);
  const peaks = energies
    .map((energy, index) => ({ energy, index }))
    .filter(({ energy, index }) => energy > average * 1.35 && index > 0);

  if (peaks.length < 2) return 96;

  const intervals = [];
  for (let i = 1; i < peaks.length; i += 1) {
    intervals.push((peaks[i].index - peaks[i - 1].index) * 0.1);
  }

  const averageInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  const bpm = Math.round(60 / averageInterval);

  if (!Number.isFinite(bpm)) return 96;
  while (bpm < 70) return bpm * 2;
  while (bpm > 180) return Math.round(bpm / 2);
  return bpm;
}
