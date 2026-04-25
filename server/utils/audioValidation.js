// Audio file validation utilities — checks MIME type (MP3/WAV only)
// and duration constraints (15–60 seconds) before processing
'use strict';

const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
const MIN_DURATION_SECONDS = 15;
const MAX_DURATION_SECONDS = 60;

/**
 * Validates that a file's MIME type is an accepted audio format.
 * @param {string} mimetype
 * @returns {boolean}
 */
function isValidMimeType(mimetype) {
  return ALLOWED_MIME_TYPES.includes(mimetype);
}

/**
 * Validates that an audio clip's duration falls within the allowed range.
 * @param {number} durationSeconds
 * @returns {boolean}
 */
function isValidDuration(durationSeconds) {
  return durationSeconds >= MIN_DURATION_SECONDS && durationSeconds <= MAX_DURATION_SECONDS;
}

module.exports = { isValidMimeType, isValidDuration, ALLOWED_MIME_TYPES, MIN_DURATION_SECONDS, MAX_DURATION_SECONDS };
