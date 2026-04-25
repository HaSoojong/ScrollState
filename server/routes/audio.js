'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// GET /audio/:id — stream audio file from GridFS by gridfsId
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'audioFiles' });
    const objectId = new mongoose.Types.ObjectId(id);

    // Check the file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'audio/mpeg');
    res.set('Content-Length', file.length);
    res.set('Accept-Ranges', 'bytes');

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on('error', next);
    downloadStream.pipe(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
