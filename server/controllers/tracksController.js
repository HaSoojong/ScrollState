// Handler functions for /api/tracks routes.
'use strict';

const fileStorage = require('../services/fileStorage');
const trackAnalyzer = require('../services/trackAnalyzer');
const { isValidDuration } = require('../utils/audioValidation');
const { mongoose } = require('../db');
const { GridFSBucket } = require('mongodb');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getTrackSignature(track) {
  return [
    normalizeText(track.originalName),
    track.size || 0,
    Math.round((Number(track.duration) || 0) * 10) / 10,
    normalizeText(track.instrument),
    normalizeText(track.genre),
    normalizeText(track.piece_name),
  ].join('|');
}

function uniqueTracksByAudio(tracks) {
  const seen = new Set();

  return tracks.filter((track) => {
    const signature = track.audio_signature || getTrackSignature(track);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

async function deleteUploadedFile(fileId) {
  if (!fileId || !mongoose.connection.db) return;
  const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'audioFiles' });
  await bucket.delete(fileId).catch(() => {});
}

function sanitizeFilename(filename) {
  return `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
}

function uploadBufferToGridFS(file) {
  return new Promise((resolve, reject) => {
    if (!mongoose.connection.db) {
      reject(new Error('Database connection is not ready'));
      return;
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'audioFiles' });
    const filename = sanitizeFilename(file.originalname);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date(),
      },
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        id: uploadStream.id,
        filename,
      });
    });
    uploadStream.end(file.buffer);
  });
}

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

    const trackCandidate = {
      originalName: req.file.originalname,
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
    trackCandidate.audio_signature = getTrackSignature(trackCandidate);

    const existingTracks = await fileStorage.readAll('tracks.json');
    const duplicateTrack = existingTracks.find(
      (track) => (track.audio_signature || getTrackSignature(track)) === trackCandidate.audio_signature,
    );
    if (duplicateTrack) {
      return res.status(200).json({
        ...duplicateTrack,
        alreadyExists: true,
      });
    }

    const uploadedFile = await uploadBufferToGridFS(req.file);
    const trackData = {
      ...trackCandidate,
      gridfsId: uploadedFile.id,
      filename: uploadedFile.filename,
    };

    try {
      const saved = await fileStorage.save('tracks.json', trackData);
      return res.status(201).json(saved);
    } catch (error) {
      await deleteUploadedFile(uploadedFile.id);
      throw error;
    }
  } catch (err) {
    next(err);
  }
}

// GET /api/tracks
async function getAllTracks(req, res, next) {
  try {
    const tracks = await fileStorage.readAll('tracks.json');
    return res.status(200).json(uniqueTracksByAudio(tracks));
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
