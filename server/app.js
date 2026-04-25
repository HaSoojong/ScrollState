'use strict';

const express = require('express');
const cors = require('cors');
const tracksRouter = require('./routes/tracks');
const compositionsRouter = require('./routes/compositions');
const audioRouter = require('./routes/audio');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tracks', tracksRouter);
app.use('/api/compositions', compositionsRouter);
app.use('/audio', audioRouter);   // GridFS audio streaming

// Mount global error handler (must be last)
app.use(errorHandler);

module.exports = app;
