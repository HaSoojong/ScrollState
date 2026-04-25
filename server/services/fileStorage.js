// Flat-file storage service — reads and writes JSON data files for tracks and
// compositions, and manages audio file paths on disk
'use strict';

/**
 * Read all records from a JSON data file.
 * @param {'tracks' | 'compositions'} collection
 * @returns {Promise<object[]>}
 */
async function readAll(collection) {
  // TODO: implement
}

/**
 * Write the full records array back to a JSON data file.
 * @param {'tracks' | 'compositions'} collection
 * @param {object[]} records
 * @returns {Promise<void>}
 */
async function writeAll(collection, records) {
  // TODO: implement
}

/**
 * Find a single record by ID.
 * @param {'tracks' | 'compositions'} collection
 * @param {string} id
 * @returns {Promise<object | null>}
 */
async function findById(collection, id) {
  // TODO: implement
}

/**
 * Append a new record to a collection.
 * @param {'tracks' | 'compositions'} collection
 * @param {object} record
 * @returns {Promise<object>} the saved record
 */
async function save(collection, record) {
  // TODO: implement
}

/**
 * Update an existing record by ID.
 * @param {'tracks' | 'compositions'} collection
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>} the updated record
 */
async function update(collection, id, updates) {
  // TODO: implement
}

module.exports = { readAll, writeAll, findById, save, update };
