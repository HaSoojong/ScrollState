// Express router for /api/tracks — declares all track-related route stubs
'use strict';

const express = require('express');
const router = express.Router();
const tracksController = require('../controllers/tracksController');
const { uploadMiddleware } = require('../middleware/upload');

// POST /api/tracks/upload — upload a new audio track with metadata
router.post('/upload', uploadMiddleware, tracksController.uploadTrack);

// GET /api/tracks — list all tracks
router.get('/', tracksController.getAllTracks);

// GET /api/tracks/:id — get a single track by ID
router.get('/:id', tracksController.getTrackById);

// POST /api/tracks/:id/analyze — trigger Claude single-track analysis
router.post('/:id/analyze', tracksController.analyzeTrack);

module.exports = router;
