'use strict';

const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  // GridFS file ID (ObjectId of the file in fs.files)
  gridfsId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  instrument: { type: String, required: true },
  genre: { type: String, required: true },
  piece_name: { type: String, default: null },
  user_description: { type: String, default: '' },
  bpm_detected: { type: Number, default: null },
  dominant_freq_range: { type: String, default: null },
  duration: { type: Number, required: true },
  analysis: { type: mongoose.Schema.Types.Mixed, default: null },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Virtual `id` field that mirrors `_id` as a string (for API compatibility)
trackSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

trackSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Track', trackSchema);
