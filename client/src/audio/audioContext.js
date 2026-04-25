// Singleton Web Audio API AudioContext — ensures only one AudioContext instance
// exists across the app to avoid resource exhaustion

/**
 * Returns the shared AudioContext instance, creating it on first call.
 * @returns {AudioContext}
 */
let audioContext;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error('Web Audio API not supported');
  if (!window.__sharedAudioContext) {
    window.__sharedAudioContext = new AudioCtx();
  }
  return window.__sharedAudioContext;
}
