// Handler functions for /api/compositions routes —
// each function receives (req, res, next) and delegates to services
'use strict';

const fileStorage = require('../services/fileStorage');
const conductorAgent = require('../services/conductorAgent');
const { generateId } = require('../utils/uuid');

/**
 * POST /api/compositions/generate
 * Calls the conductor agent to match analyzed tracks into a new composition.
 */
async function generateComposition(req, res, next) {
  try {
    // Get all tracks that have been analyzed
    const allTracks = await fileStorage.readAll('tracks.json');
    const analyzedTracks = allTracks.filter(t => t.analysis !== null);

    if (analyzedTracks.length === 0) {
      return res.status(400).json({ error: 'No analyzed tracks available. Please analyze tracks first.' });
    }

    const compositionPlan = await conductorAgent.conductComposition(analyzedTracks);

    const newComposition = {
      id: generateId(),
      title: compositionPlan.title,
      track_ids: compositionPlan.track_ids,
      conductor_notes: compositionPlan.conductor_notes,
      missing_parts: compositionPlan.missing_parts,
      help_wanted_prompt: compositionPlan.help_wanted_prompt,
      createdAt: new Date().toISOString(),
    };

    const saved = await fileStorage.save('compositions.json', newComposition);
    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/compositions
 * Returns all compositions from flat-file storage.
 */
async function getAllCompositions(req, res, next) {
  try {
    const compositions = await fileStorage.readAll('compositions.json');
    return res.status(200).json(compositions);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/compositions/:id
 * Returns a single composition by ID or 404 if not found.
 */
async function getCompositionById(req, res, next) {
  try {
    const composition = await fileStorage.findById('compositions.json', req.params.id);
    if (!composition) {
      return res.status(404).json({ error: 'Composition not found' });
    }
    return res.status(200).json(composition);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/compositions/:id/add
 * Adds a new track to an existing open composition and re-runs the conductor agent.
 */
async function addTrackToComposition(req, res, next) {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ error: 'trackId is required' });

    const composition = await fileStorage.findById('compositions.json', req.params.id);
    if (!composition) return res.status(404).json({ error: 'Composition not found' });

    const track = await fileStorage.findById('tracks.json', trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    // Add track if not already in composition
    if (!composition.track_ids.includes(trackId)) {
      const updatedTrackIds = [...composition.track_ids, trackId];

      // Re-run conductor agent on the updated set of tracks
      const allTracks = await fileStorage.readAll('tracks.json');
      const compositionTracks = allTracks.filter(t => updatedTrackIds.includes(t.id) && t.analysis);

      const newPlan = await conductorAgent.conductComposition(compositionTracks);

      const updatedComposition = await fileStorage.update('compositions.json', req.params.id, {
        track_ids: updatedTrackIds,
        conductor_notes: newPlan.conductor_notes,
        missing_parts: newPlan.missing_parts,
        help_wanted_prompt: newPlan.help_wanted_prompt,
      });

      return res.status(200).json(updatedComposition);
    }

    return res.status(200).json(composition);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateComposition,
  getAllCompositions,
  getCompositionById,
  addTrackToComposition,
};
