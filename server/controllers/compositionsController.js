// Handler functions for /api/compositions routes —
// each function receives (req, res, next) and delegates to services
'use strict';

const fileStorage = require('../services/fileStorage');
const conductorAgent = require('../services/conductorAgent');

// POST /api/compositions/generate
async function generateComposition(req, res, next) {
  try {
    const allTracks = await fileStorage.readAll('tracks.json');
    const analyzedTracks = allTracks.filter(t => t.analysis !== null);

    if (analyzedTracks.length === 0) {
      return res.status(400).json({ error: 'No analyzed tracks available. Please analyze tracks first.' });
    }

    const plan = await conductorAgent.conductComposition(analyzedTracks);

    const newComposition = {
      title: plan.title,
      track_ids: plan.track_ids,  // These are string IDs; Mongoose will coerce to ObjectId
      conductor_notes: plan.conductor_notes,
      missing_parts: plan.missing_parts,
      help_wanted_prompt: plan.help_wanted_prompt
    };

    const saved = await fileStorage.save('compositions.json', newComposition);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

// GET /api/compositions
async function getAllCompositions(req, res, next) {
  try {
    const compositions = await fileStorage.readAll('compositions.json');
    res.status(200).json(compositions);
  } catch (err) {
    next(err);
  }
}

// GET /api/compositions/:id
async function getCompositionById(req, res, next) {
  try {
    const composition = await fileStorage.findById('compositions.json', req.params.id);
    if (!composition) return res.status(404).json({ error: 'Composition not found' });
    res.status(200).json(composition);
  } catch (err) {
    next(err);
  }
}

// POST /api/compositions/:id/add
async function addTrackToComposition(req, res, next) {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ error: 'trackId is required' });

    const composition = await fileStorage.findById('compositions.json', req.params.id);
    if (!composition) return res.status(404).json({ error: 'Composition not found' });

    const track = await fileStorage.findById('tracks.json', trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const currentIds = (composition.track_ids || []).map(id => id.toString());
    if (!currentIds.includes(trackId)) {
      const updatedTrackIds = [...currentIds, trackId];

      const allTracks = await fileStorage.readAll('tracks.json');
      const compositionTracks = allTracks.filter(t => updatedTrackIds.includes(t.id) && t.analysis);

      const newPlan = await conductorAgent.conductComposition(compositionTracks);

      const updated = await fileStorage.update('compositions.json', req.params.id, {
        track_ids: updatedTrackIds,
        conductor_notes: newPlan.conductor_notes,
        missing_parts: newPlan.missing_parts,
        help_wanted_prompt: newPlan.help_wanted_prompt
      });

      return res.status(200).json(updated);
    }

    res.status(200).json(composition);
  } catch (err) {
    next(err);
  }
}

module.exports = { generateComposition, getAllCompositions, getCompositionById, addTrackToComposition };
