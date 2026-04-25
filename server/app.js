// Express app setup — configures middleware (CORS, JSON parsing, static files)
// and mounts the /api/tracks and /api/compositions routers
'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const tracksRouter = require('./routes/tracks');
const compositionsRouter = require('./routes/compositions');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded audio files statically
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

// Mount routers
app.use('/api/tracks', tracksRouter);
app.use('/api/compositions', compositionsRouter);

// Mount global error handler (must be last)
app.use(errorHandler);

module.exports = app;
