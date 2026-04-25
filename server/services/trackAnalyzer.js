// Claude API Call 1: single-track analysis —
// sends track metadata and extracted audio features to Claude and returns
// a structured analysis (estimated key, mood, energy, compatible instruments, notes)
'use strict';

/**
 * Analyzes a single track using the Claude API.
 * @param {object} track - Track object with metadata and audio features
 * @returns {Promise<{
 *   estimated_key: string,
 *   mood: string,
 *   energy: string,
 *   compatible_instruments: string[],
 *   arrangement_notes: string
 * }>}
 */
async function analyzeTrack(track) {
  // TODO: implement
}

module.exports = { analyzeTrack };
