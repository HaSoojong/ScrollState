// Multer configuration for audio file uploads —
// stores files to data/uploads/, enforces MIME type and size limits
'use strict';

const multer = require('multer');

// TODO: configure multer disk storage (destination, filename)
// TODO: configure file filter (accept audio/mpeg, audio/wav only)
// TODO: set file size limit from process.env.MAX_FILE_SIZE_BYTES

const uploadMiddleware = null; // TODO: replace with configured multer().single('audio')

module.exports = { uploadMiddleware };
