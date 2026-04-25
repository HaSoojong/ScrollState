'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/orchestrai_test';
process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS = process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '2500';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const app = require('../app');
const { connectDB, mongoose } = require('../db');
const Track = require('../models/Track');

let server;
let baseUrl;

async function clearTestData() {
  if (mongoose.connection.readyState !== 1) return;

  await Track.deleteMany({});
  const db = mongoose.connection.db;
  await db.collection('audioFiles.files').deleteMany({});
  await db.collection('audioFiles.chunks').deleteMany({});
}

async function uploadTestAudio() {
  const formData = new FormData();
  const audioBytes = new Uint8Array([73, 68, 51, 3, 0, 0, 0, 0, 0, 12, 84, 69, 83, 84]);
  const audio = new Blob([audioBytes], { type: 'audio/mpeg' });

  formData.append('audio', audio, 'duplicate-test.mp3');
  formData.append('duration', '30');
  formData.append('instrument', 'Guitar');
  formData.append('genre', 'Indie');
  formData.append('piece_name', 'Duplicate Integration Test');
  formData.append('user_description', 'Same file uploaded twice should not create duplicate tracks.');
  formData.append('bpm_detected', '96');
  formData.append('dominant_freq_range', 'mid');

  const response = await fetch(`${baseUrl}/api/tracks/upload`, {
    method: 'POST',
    body: formData,
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

before(async () => {
  await connectDB();
  await clearTestData();

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await clearTestData();

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await mongoose.disconnect();
});

test('upload stores one Track document and one GridFS file, then dedupes repeat upload', async () => {
  const firstUpload = await uploadTestAudio();
  assert.equal(firstUpload.status, 201);
  assert.ok(firstUpload.body.id);
  assert.ok(firstUpload.body.gridfsId);

  const secondUpload = await uploadTestAudio();
  assert.equal(secondUpload.status, 200);
  assert.equal(secondUpload.body.alreadyExists, true);
  assert.equal(secondUpload.body.id, firstUpload.body.id);

  const tracks = await Track.find({}).lean();
  assert.equal(tracks.length, 1);
  assert.equal(String(tracks[0]._id), firstUpload.body.id);
  assert.equal(String(tracks[0].gridfsId), String(firstUpload.body.gridfsId));

  const files = await mongoose.connection.db.collection('audioFiles.files').find({}).toArray();
  assert.equal(files.length, 1);
  assert.equal(String(files[0]._id), String(firstUpload.body.gridfsId));

  const audioResponse = await fetch(`${baseUrl}/audio/${firstUpload.body.gridfsId}`);
  assert.equal(audioResponse.status, 200);
  assert.equal(audioResponse.headers.get('content-type'), 'audio/mpeg');
  assert.ok((await audioResponse.arrayBuffer()).byteLength > 0);
});
