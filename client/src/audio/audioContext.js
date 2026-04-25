// Singleton Web Audio API AudioContext — ensures only one AudioContext instance
// exists across the app to avoid resource exhaustion

/**
 * Returns the shared AudioContext instance, creating it on first call.
 * @returns {AudioContext}
 */
let audioContext;

export function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}
