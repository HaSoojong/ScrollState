import axios from 'axios';

/**
 * Trigger Claude to generate a new composition from available tracks.
 * @returns {Promise<object>} newly created Composition object
 */
export async function generateComposition() {
  const response = await axios.post('/api/compositions/generate');
  return response.data;
}

/**
 * Fetch all compositions.
 * @returns {Promise<object[]>} array of Composition objects
 */
export async function getAllCompositions() {
  const response = await axios.get('/api/compositions');
  return response.data;
}

/**
 * Fetch a single composition by ID.
 * @param {string} id
 * @returns {Promise<object>} Composition object
 */
export async function getCompositionById(id) {
  const response = await axios.get(`/api/compositions/${id}`);
  return response.data;
}

/**
 * Add a new track to an existing composition.
 * @param {string} compositionId
 * @param {string} trackId
 * @returns {Promise<object>} updated Composition object
 */
export async function addTrackToComposition(compositionId, trackId) {
  const response = await axios.post(`/api/compositions/${compositionId}/add`, { trackId });
  return response.data;
}

/**
 * Build a merge plan for aligning a new track into a composition.
 * @param {string} compositionId
 * @param {string} trackId
 * @returns {Promise<{ merge_plan: object }>}
 */
export async function getMergePlan(compositionId, trackId) {
  const response = await axios.post(`/api/compositions/${compositionId}/merge`, { trackId });
  return response.data;
}
