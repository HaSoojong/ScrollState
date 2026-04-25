// Multer configuration for audio file uploads into GridFS.
'use strict';

const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { isValidMimeType } = require('../utils/audioValidation');

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/orchestrai',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => ({
    bucketName: 'audioFiles',
    filename: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
  }),
});

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
