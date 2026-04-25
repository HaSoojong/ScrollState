// Handler functions for /api/compositions routes.
'use strict';

const fileStorage = require('../services/fileStorage');
const conductorAgent = require('../services/conductorAgent');

function stringifyId(id) {
  return id?.toString?.() || String(id);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getTrackSignature(track) {
  return (
    track.audio_signature ||
    [
      normalizeText(track.originalName),
      track.size || 0,
      Math.round((Number(track.duration) || 0) * 10) / 10,
      normalizeText(track.instrument),
      normalizeText(track.genre),
      normalizeText(track.piece_name),
    ].join('|')
  );
}

function uniqueTracksByAudio(tracks) {
  const seen = new Set();

  return tracks.filter((track) => {
    const signature = getTrackSignature(track);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function enrichComposition(composition, tracks) {
  const trackIds = new Set((composition.track_ids || []).map(stringifyId));
  const compositionTracks = uniqueTracksByAudio(tracks.filter((track) => trackIds.has(stringifyId(track.id || track._id))));
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

function normalizeTrackIds(trackIds = []) {
  return trackIds.map(stringifyId).filter(Boolean).sort();
}

function hasSameTrackSet(firstTrackIds = [], secondTrackIds = []) {
  const first = normalizeTrackIds(firstTrackIds);
  const second = normalizeTrackIds(secondTrackIds);

  return first.length > 0 && first.length === second.length && first.every((id, index) => id === second[index]);
}

function getCompositionAudioSignatures(compositionTrackIds, tracks) {
  const trackIds = new Set((compositionTrackIds || []).map(stringifyId));

  return uniqueTracksByAudio(tracks.filter((track) => trackIds.has(stringifyId(track.id || track._id))))
    .map(getTrackSignature)
    .sort();
}

function hasSameAudioSet(firstTrackIds = [], secondTrackIds = [], tracks = []) {
  const first = getCompositionAudioSignatures(firstTrackIds, tracks);
  const second = getCompositionAudioSignatures(secondTrackIds, tracks);

  return first.length > 0 && first.length === second.length && first.every((signature, index) => signature === second[index]);
}

// POST /api/compositions/generate
async function generateComposition(req, res, next) {
  try {
    const allTracks = await fileStorage.readAll('tracks.json');
    const analyzedTracks = uniqueTracksByAudio(allTracks.filter((track) => track.analysis !== null));

    if (analyzedTracks.length === 0) {
      return res.status(400).json({ error: 'No analyzed tracks available. Please analyze tracks first.' });
    }

    const plan = await conductorAgent.conductComposition(analyzedTracks);
    const plannedTrackIds = normalizeTrackIds(plan.track_ids);

    if (plannedTrackIds.length === 0) {
      return res.status(400).json({ error: 'Conductor did not select any tracks for a composition.' });
    }

    const existingCompositions = await fileStorage.readAll('compositions.json');
    const duplicate = existingCompositions.find(
      (composition) =>
        hasSameTrackSet(composition.track_ids, plannedTrackIds) ||
        hasSameAudioSet(composition.track_ids, plannedTrackIds, allTracks),
    );
    if (duplicate) {
      return res.status(200).json({
        ...enrichComposition(duplicate, allTracks),
        alreadyExists: true,
      });
    }

    const newComposition = {
      title: plan.title,
      track_ids: plannedTrackIds,
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
      const compositionTracks = uniqueTracksByAudio(allTracks.filter(
        (item) => updatedTrackIds.includes(stringifyId(item.id || item._id)) && item.analysis,
      ));

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
