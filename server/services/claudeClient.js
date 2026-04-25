// Anthropic SDK client singleton and base caller —
// initializes the Anthropic client once and exposes a helper for making
// messages.create calls with the configured model
'use strict';

const Anthropic = require('@anthropic-ai/sdk');

// Singleton Anthropic client instance
let _client = null;

/**
 * Returns the shared Anthropic client, creating it on first call.
 * @returns {Anthropic}
 */
function getClient() {
  // TODO: implement — initialize with process.env.ANTHROPIC_API_KEY
}

/**
 * Sends a messages.create request to Claude and returns the response text.
 * @param {object} params - Parameters for Anthropic messages.create
 * @param {string} params.system - System prompt
 * @param {Array}  params.messages - Messages array
 * @returns {Promise<string>} Claude's response text
 */
async function callClaude({ system, messages }) {
  // TODO: implement
}

module.exports = { getClient, callClaude };
