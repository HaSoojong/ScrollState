// Dominant frequency range extraction using FFT via the Web Audio API —
// identifies the primary frequency band (bass, mid, treble) of a track

/**
 * Analyzes an AudioBuffer and returns the dominant frequency range.
 * @param {AudioBuffer} audioBuffer
 * @returns {Promise<{ dominantRange: string, peakFrequencyHz: number }>}
 */
export async function extractDominantFrequency(audioBuffer) {
  const channel = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const fftSize = 2048;
  const bins = new Float32Array(fftSize / 2);

  for (let i = 0; i < fftSize && i < channel.length; i += 1) {
    for (let k = 0; k < bins.length; k += 1) {
      const angle = (2 * Math.PI * k * i) / fftSize;
      bins[k] += channel[i] * Math.cos(angle);
    }
  }

  let peakIndex = 1;
  for (let i = 2; i < bins.length; i += 1) {
    if (Math.abs(bins[i]) > Math.abs(bins[peakIndex])) {
      peakIndex = i;
    }
  }

  const peakFrequencyHz = Math.round((peakIndex * sampleRate) / fftSize);
  let dominantRange = 'mid';
  if (peakFrequencyHz < 250) dominantRange = 'bass';
  if (peakFrequencyHz > 2000) dominantRange = 'treble';

  return { dominantRange, peakFrequencyHz };
}
