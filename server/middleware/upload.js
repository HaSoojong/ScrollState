// Multer configuration for audio file uploads into GridFS.
'use strict';

const multer = require('multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');
const { isValidMimeType } = require('../utils/audioValidation');

// Use memory storage + manual GridFS upload to avoid timing issues in multer-gridfs-storage
// when the Mongo connection is not yet fully ready.
const baseUpload = multer({
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

async function uploadMiddleware(req, res, next) {
  baseUpload(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    try {
      const conn = await mongoose.connection.asPromise();
      if (conn.readyState !== 1) {
        throw new Error('Database connection is not ready');
      }

      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'audioFiles' });
      const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
      const uploadStream = bucket.openUploadStream(filename, { contentType: req.file.mimetype });
      const readable = Readable.from(req.file.buffer);

      await new Promise((resolve, reject) => {
        readable.pipe(uploadStream).on('error', reject).on('finish', resolve);
      });

      // Normalize req.file to match the expectations in tracksController
      req.file = {
        id: uploadStream.id,
        filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };

      return next();
    } catch (uploadErr) {
      return next(uploadErr);
    }
  });
}

module.exports = { uploadMiddleware };
