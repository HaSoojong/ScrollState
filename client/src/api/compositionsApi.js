// Frontend fetch wrappers for /api/compositions routes —
// abstracts HTTP calls to the backend compositions API

/**
 * Trigger Claude to generate a new composition from available tracks.
 * @returns {Promise<object>} newly created Composition object
 */
export async function generateComposition() {
  // TODO: implement
}

/**
 * Fetch all compositions.
 * @returns {Promise<object[]>} array of Composition objects
 */
export async function getAllCompositions() {
  // TODO: implement
}

/**
 * Fetch a single composition by ID.
 * @param {string} id
 * @returns {Promise<object>} Composition object
 */
export async function getCompositionById(id) {
  // TODO: implement
}

/**
 * Add a new track to an existing composition.
 * @param {string} compositionId
 * @param {string} trackId
 * @returns {Promise<object>} updated Composition object
 */
export async function addTrackToComposition(compositionId, trackId) {
  // TODO: implement
}
