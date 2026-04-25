// Multer configuration for audio file uploads —
// stores files to data/uploads/, enforces MIME type and size limits
'use strict';

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../data/uploads'));
  },
  filename: function (req, file, cb) {
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + sanitized);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3 and WAV are allowed.'));
  }
}

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('audio');

module.exports = { uploadMiddleware };
