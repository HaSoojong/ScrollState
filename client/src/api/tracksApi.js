import axios from 'axios';

/**
 * Upload a new audio track with metadata.
 * @param {FormData} formData
 * @returns {Promise<object>} created Track object
 */
export async function uploadTrack(formData) {
  const response = await axios.post('/api/tracks/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Fetch all tracks.
 * @returns {Promise<object[]>} array of Track objects
 */
export async function getAllTracks() {
  const response = await axios.get('/api/tracks');
  return response.data;
}

/**
 * Fetch a single track by ID.
 * @param {string} id
 * @returns {Promise<object>} Track object
 */
export async function getTrackById(id) {
  const response = await axios.get(`/api/tracks/${id}`);
  return response.data;
}

/**
 * Trigger Claude analysis for a single track.
 * @param {string} id
 * @returns {Promise<object>} updated Track object with analysis
 */
export async function analyzeTrack(id) {
  const response = await axios.post(`/api/tracks/${id}/analyze`);
  return response.data;
}
