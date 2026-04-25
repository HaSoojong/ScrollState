// UUID generation helper — wraps the uuid package for consistent ID creation
// across track and composition records
'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Generates a new random UUID v4 string.
 * @returns {string}
 */
function generateId() {
  // TODO: implement
  return uuidv4();
}

module.exports = { generateId };
