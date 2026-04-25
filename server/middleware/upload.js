// Multer configuration for audio file uploads.
'use strict';

const multer = require('multer');
const { isValidMimeType } = require('../utils/audioValidation');

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (isValidMimeType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a browser-readable audio file.'), false);
  }
}

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('audio');

module.exports = { uploadMiddleware };
