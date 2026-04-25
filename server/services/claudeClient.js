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
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Sends a messages.create request to Claude and returns the response text.
 * @param {string} systemPrompt - System prompt string
 * @param {string} userMessage - User message string
 * @returns {Promise<string>} Claude's response text
 */
async function callClaude(systemPrompt, userMessage) {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content[0].text;
}

module.exports = { getClient, callClaude };
