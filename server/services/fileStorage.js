// Flat-file storage service — reads and writes JSON data files for tracks and
// compositions, and manages audio file paths on disk
'use strict';

const path = require('path');
const { readFile, writeFile } = require('fs/promises');

function getFilePath(filename) {
  return path.join(__dirname, '../../data/', filename);
}

/**
 * Read all records from a JSON data file.
 * @param {string} filename  e.g. 'tracks.json'
 * @returns {Promise<object[]>}
 */
async function readAll(filename) {
  try {
    const raw = await readFile(getFilePath(filename), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

/**
 * Write the full records array back to a JSON data file.
 * @param {string} filename
 * @param {object[]} data
 * @returns {Promise<void>}
 */
async function writeAll(filename, data) {
  await writeFile(getFilePath(filename), JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Find a single record by ID.
 * @param {string} filename
 * @param {string} id
 * @returns {Promise<object | null>}
 */
async function findById(filename, id) {
  const records = await readAll(filename);
  return records.find((item) => item.id === id) || null;
}

/**
 * Append a new record to a collection.
 * @param {string} filename
 * @param {object} item
 * @returns {Promise<object>} the saved item
 */
async function save(filename, item) {
  const records = await readAll(filename);
  records.push(item);
  await writeAll(filename, records);
  return item;
}

/**
 * Update an existing record by ID.
 * @param {string} filename
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>} the updated record
 */
async function update(filename, id, updates) {
  const records = await readAll(filename);
  const index = records.findIndex((item) => item.id === id);
  if (index === -1) {
    const err = new Error(`Record with id '${id}' not found in ${filename}`);
    err.status = 404;
    throw err;
  }
  records[index] = { ...records[index], ...updates };
  await writeAll(filename, records);
  return records[index];
}

module.exports = { readAll, writeAll, findById, save, update };
