// Multer configuration for audio file uploads.
'use strict';

const multer = require('multer');
const { isValidMimeType } = require('../utils/audioValidation');

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (isValidMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a browser-readable audio file.'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('audio');

module.exports = { uploadMiddleware };
