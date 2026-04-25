// Express router for /api/compositions — declares all composition-related route stubs
'use strict';

const express = require('express');
const router = express.Router();
const compositionsController = require('../controllers/compositionsController');

// POST /api/compositions/generate — trigger Claude to create a new composition
router.post('/generate', compositionsController.generateComposition);

// GET /api/compositions — list all compositions
router.get('/', compositionsController.getAllCompositions);

// GET /api/compositions/:id — get a single composition by ID
router.get('/:id', compositionsController.getCompositionById);

// POST /api/compositions/:id/add — add a track to an existing composition
router.post('/:id/add', compositionsController.addTrackToComposition);
router.post('/:id/tracks', compositionsController.addTrackToComposition);

module.exports = router;
