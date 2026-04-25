// Waveform shape data extraction for visualization —
// down-samples an AudioBuffer into a normalized array of amplitude values
// suitable for rendering a waveform display

/**
 * Extracts a down-sampled waveform data array from an AudioBuffer.
 * @param {AudioBuffer} audioBuffer
 * @param {number} [samples=1000] number of data points to produce
 * @returns {Float32Array} normalized amplitude values in range [-1, 1]
 */
export function extractWaveform(audioBuffer, samples = 1000) {
  const channel = audioBuffer.getChannelData(0);
  const blockSize = Math.max(1, Math.floor(channel.length / samples));
  const waveform = new Float32Array(samples);

  for (let i = 0; i < samples; i += 1) {
    let sum = 0;
    const start = i * blockSize;
    for (let j = 0; j < blockSize && start + j < channel.length; j += 1) {
      sum += Math.abs(channel[start + j]);
    }
    waveform[i] = sum / blockSize;
  }

  return waveform;
}
