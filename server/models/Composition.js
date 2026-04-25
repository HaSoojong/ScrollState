'use strict';

const mongoose = require('mongoose');

const compositionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Array of Track ObjectIds
  track_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  conductor_notes: { type: String, default: '' },
  missing_parts: [{ type: String }],
  help_wanted_prompt: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

compositionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

compositionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Composition', compositionSchema);
