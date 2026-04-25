// Handler functions for /api/compositions routes.
'use strict';

const fileStorage = require('../services/fileStorage');
const conductorAgent = require('../services/conductorAgent');

function stringifyId(id) {
  return id?.toString?.() || String(id);
}

function enrichComposition(composition, tracks) {
  const trackIds = new Set((composition.track_ids || []).map(stringifyId));
  const compositionTracks = tracks.filter((track) => trackIds.has(stringifyId(track.id || track._id)));
  const firstTrack = compositionTracks[0] || {};

  return {
    ...composition,
    id: stringifyId(composition.id || composition._id),
    track_ids: Array.from(trackIds),
    tracks: compositionTracks,
    instruments: compositionTracks.map((track) => track.instrument).filter(Boolean),
    genre: firstTrack.genre || 'Collaborative',
    bpm: firstTrack.bpm_detected || 96,
    mood: firstTrack.analysis?.mood || 'Evolving',
  };
}

// POST /api/compositions/generate
async function generateComposition(req, res, next) {
  try {
    const allTracks = await fileStorage.readAll('tracks.json');
    const analyzedTracks = allTracks.filter((track) => track.analysis !== null);

    if (analyzedTracks.length === 0) {
      return res.status(400).json({ error: 'No analyzed tracks available. Please analyze tracks first.' });
    }

    const plan = await conductorAgent.conductComposition(analyzedTracks);

    const newComposition = {
      title: plan.title,
      track_ids: plan.track_ids,
      conductor_notes: plan.conductor_notes,
      missing_parts: plan.missing_parts,
      help_wanted_prompt: plan.help_wanted_prompt,
    };

    const saved = await fileStorage.save('compositions.json', newComposition);
    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(201).json(enrichComposition(saved, tracks));
  } catch (err) {
    next(err);
  }
}

// GET /api/compositions
async function getAllCompositions(req, res, next) {
  try {
    const compositions = await fileStorage.readAll('compositions.json');
    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(200).json(compositions.map((composition) => enrichComposition(composition, tracks)));
  } catch (err) {
    next(err);
  }
}

// GET /api/compositions/:id
async function getCompositionById(req, res, next) {
  try {
    const composition = await fileStorage.findById('compositions.json', req.params.id);
    if (!composition) return res.status(404).json({ error: 'Composition not found' });

    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(200).json(enrichComposition(composition, tracks));
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

    const currentIds = (composition.track_ids || []).map(stringifyId);
    if (!currentIds.includes(trackId)) {
      const updatedTrackIds = [...currentIds, trackId];

      const allTracks = await fileStorage.readAll('tracks.json');
      const compositionTracks = allTracks.filter(
        (item) => updatedTrackIds.includes(stringifyId(item.id || item._id)) && item.analysis,
      );

      const newPlan = await conductorAgent.conductComposition(compositionTracks);

      const updated = await fileStorage.update('compositions.json', req.params.id, {
        track_ids: updatedTrackIds,
        conductor_notes: newPlan.conductor_notes,
        missing_parts: newPlan.missing_parts,
        help_wanted_prompt: newPlan.help_wanted_prompt,
      });

      const tracks = await fileStorage.readAll('tracks.json');
      return res.status(200).json(enrichComposition(updated, tracks));
    }

    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(200).json(enrichComposition(composition, tracks));
  } catch (err) {
    next(err);
  }
}

module.exports = { generateComposition, getAllCompositions, getCompositionById, addTrackToComposition };
