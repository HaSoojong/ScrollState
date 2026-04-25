// Flat-file storage service — reads and writes JSON data files for tracks and
// compositions, and manages audio file paths on disk
'use strict';

const Track = require('../models/Track');
const Composition = require('../models/Composition');
const mongoose = require('mongoose');

// Map filename string to the correct Mongoose model
function getModel(filename) {
  if (filename === 'tracks.json') return Track;
  if (filename === 'compositions.json') return Composition;
  throw new Error(`Unknown collection: ${filename}`);
}

async function readAll(filename) {
  const Model = getModel(filename);
  return Model.find({}).lean({ virtuals: true });
}

async function writeAll(filename, data) {
  // Not used in MongoDB path — no-op kept for compatibility
}

async function findById(filename, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const Model = getModel(filename);
  return Model.findById(id).lean({ virtuals: true });
}

async function save(filename, item) {
  const Model = getModel(filename);
  const doc = new Model(item);
  await doc.save();
  return doc.toJSON();
}

async function update(filename, id, updates) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw Object.assign(new Error('Invalid ID'), { status: 400 });
  const Model = getModel(filename);
  const doc = await Model.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean({ virtuals: true });
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  return doc;
}

module.exports = { readAll, writeAll, findById, save, update };
