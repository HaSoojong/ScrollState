// Express app setup — configures middleware (CORS, JSON parsing, static files)
// and mounts the /api/tracks and /api/compositions routers
'use strict';

const express = require('express');
const cors = require('cors');
const tracksRouter = require('./routes/tracks');
const compositionsRouter = require('./routes/compositions');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// TODO: configure middleware (cors, express.json, static uploads serving)

// TODO: mount routers
// app.use('/api/tracks', tracksRouter);
// app.use('/api/compositions', compositionsRouter);

// TODO: mount global error handler
// app.use(errorHandler);

module.exports = app;
