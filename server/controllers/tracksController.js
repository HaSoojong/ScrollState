// Handler functions for /api/tracks routes —
// each function receives (req, res, next) and delegates to services
'use strict';

const fileStorage = require('../services/fileStorage');
const { generateId } = require('../utils/uuid');
const { isValidDuration } = require('../utils/audioValidation');
const trackAnalyzer = require('../services/trackAnalyzer');

/**
 * POST /api/tracks/upload
 * Saves the uploaded audio file and track metadata, then returns the new Track object.
 */
async function uploadTrack(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const duration = parseFloat(req.body.duration);
    if (!isValidDuration(duration)) {
      return res.status(400).json({ error: 'Duration must be between 15 and 60 seconds' });
    }

    const track = {
      id: generateId(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      instrument: req.body.instrument,
      genre: req.body.genre,
      piece_name: req.body.piece_name || null,
      user_description: req.body.user_description || '',
      bpm_detected: parseFloat(req.body.bpm_detected) || null,
      dominant_freq_range: req.body.dominant_freq_range || null,
      duration,
      analysis: null,
      uploadedAt: new Date().toISOString(),
    };

    const saved = await fileStorage.save('tracks.json', track);
    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tracks
 * Returns all tracks from flat-file storage.
 */
async function getAllTracks(req, res, next) {
  try {
    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(200).json(tracks);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tracks/:id
 * Returns a single track by ID or 404 if not found.
 */
async function getTrackById(req, res, next) {
  try {
    const track = await fileStorage.findById('tracks.json', req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    return res.status(200).json(track);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tracks/:id/analyze
 * Triggers Claude single-track analysis and persists the result.
 */
async function analyzeTrack(req, res, next) {
  try {
    const track = await fileStorage.findById('tracks.json', req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const analysis = await trackAnalyzer.analyzeTrack(track);
    const updatedTrack = await fileStorage.update('tracks.json', req.params.id, { analysis });

    return res.status(200).json(updatedTrack);
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadTrack, getAllTracks, getTrackById, analyzeTrack };
