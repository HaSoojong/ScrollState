// Frontend fetch wrappers for /api/tracks routes —
// abstracts HTTP calls to the backend tracks API

/**
 * Upload a new audio track with metadata.
 * @param {FormData} formData
 * @returns {Promise<object>} created Track object
 */
export async function uploadTrack(formData) {
  // TODO: implement
}

/**
 * Fetch all tracks.
 * @returns {Promise<object[]>} array of Track objects
 */
export async function getAllTracks() {
  // TODO: implement
}

/**
 * Fetch a single track by ID.
 * @param {string} id
 * @returns {Promise<object>} Track object
 */
export async function getTrackById(id) {
  // TODO: implement
}

/**
 * Trigger Claude analysis for a single track.
 * @param {string} id
 * @returns {Promise<object>} updated Track object with analysis
 */
export async function analyzeTrack(id) {
  // TODO: implement
}
