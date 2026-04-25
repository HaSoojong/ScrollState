// Handler functions for /api/tracks routes.
'use strict';

const fileStorage = require('../services/fileStorage');
const trackAnalyzer = require('../services/trackAnalyzer');
const { isValidDuration } = require('../utils/audioValidation');

// POST /api/tracks/upload
async function uploadTrack(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const duration = parseFloat(req.body.duration || req.body.durationSeconds || req.body.duration_seconds);
    if (!isValidDuration(duration)) {
      return res.status(400).json({ error: 'Duration must be between 15 and 60 seconds' });
    }

    const pieceName = req.body.piece_name || req.body.name || req.body.title || null;
    const userDescription = req.body.user_description || req.body.description || '';

    const trackData = {
      gridfsId: req.file.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      file_url: `/audio/${req.file.id}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      instrument: req.body.instrument,
      genre: req.body.genre,
      piece_name: pieceName,
      user_description: userDescription,
      bpm_detected: parseFloat(req.body.bpm_detected) || null,
      dominant_freq_range: req.body.dominant_freq_range || null,
      duration,
    };

    const saved = await fileStorage.save('tracks.json', trackData);
    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

// GET /api/tracks
async function getAllTracks(req, res, next) {
  try {
    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(200).json(tracks);
  } catch (err) {
    next(err);
  }
}

// GET /api/tracks/:id
async function getTrackById(req, res, next) {
  try {
    const track = await fileStorage.findById('tracks.json', req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    return res.status(200).json(track);
  } catch (err) {
    next(err);
  }
}

// POST /api/tracks/:id/analyze
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
