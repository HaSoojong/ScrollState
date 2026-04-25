// Handler functions for /api/tracks routes —
// each function receives (req, res, next) and delegates to services
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

    const duration = parseFloat(req.body.duration);
    if (!isValidDuration(duration)) {
      return res.status(400).json({ error: 'Duration must be between 15 and 60 seconds' });
    }

    const trackData = {
      gridfsId: req.file.id,           // ObjectId from GridFS
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
      duration
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
    res.status(200).json(tracks);
  } catch (err) {
    next(err);
  }
}

// GET /api/tracks/:id
async function getTrackById(req, res, next) {
  try {
    const track = await fileStorage.findById('tracks.json', req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.status(200).json(track);
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
    res.status(200).json(updatedTrack);
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadTrack, getAllTracks, getTrackById, analyzeTrack };
