// Multer configuration for audio file uploads —
// stores files to data/uploads/, enforces MIME type and size limits
'use strict';

const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/orchestrai',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'audioFiles',  // GridFS bucket name (collection prefix)
      filename: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    };
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3 and WAV are allowed.'), false);
  }
}

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
}).single('audio');

module.exports = { uploadMiddleware };
