// Claude API Call 1: single-track analysis —
// sends track metadata and extracted audio features to Claude and returns
// a structured analysis (estimated key, mood, energy, compatible instruments, notes)
'use strict';

const { callClaude } = require('./claudeClient');

const SYSTEM_PROMPT = `You are a music theory expert and orchestral conductor. Analyze the provided track metadata and return a JSON object with your musical analysis. Return ONLY valid JSON with no additional text or markdown.`;

/**
 * Analyzes a single track using the Claude API.
 * @param {object} track - Track object with metadata and audio features
 * @returns {Promise<{
 *   estimated_key: string,
 *   mood: string,
 *   energy: string,
 *   compatible_instruments: string[],
 *   arrangement_notes: string
 * }>}
 */
async function analyzeTrack(trackData) {
  if (!process.env.ANTHROPIC_API_KEY) {
    const bpm = Number(trackData.bpm_detected) || 96;
    const mood = bpm >= 120 ? 'energetic' : bpm <= 82 ? 'nocturnal' : 'warm';
    const energy = bpm >= 120 ? 'high' : bpm <= 82 ? 'low' : 'medium';
    const compatibleByInstrument = {
      Guitar: ['bass', 'vocals', 'light percussion'],
      Vocals: ['guitar', 'piano', 'harmony vocals'],
      Drums: ['bass', 'guitar', 'synth'],
      Bass: ['drums', 'guitar', 'keys'],
      Other: ['bass', 'percussion', 'melodic lead'],
    };

    return {
      estimated_key: 'C major',
      mood,
      energy,
      compatible_instruments: compatibleByInstrument[trackData.instrument] || compatibleByInstrument.Other,
      arrangement_notes: `${trackData.instrument || 'This track'} has a ${energy} energy profile around ${bpm} BPM and can anchor a ${trackData.genre || 'collaborative'} arrangement.`,
    };
  }

  const userMessage = `Analyze this musical track submission:
- Instrument: ${trackData.instrument}
- Genre: ${trackData.genre}
- BPM: ${trackData.bpm_detected || 'unknown'}
- Dominant Frequency Range: ${trackData.dominant_freq_range || 'unknown'}
- Duration: ${trackData.duration} seconds
- Description: ${trackData.user_description || 'No description provided'}
- Piece Name: ${trackData.piece_name || 'Original piece'}

Return a JSON object with exactly these fields:
{
  "estimated_key": "string (e.g. 'C major', 'A minor')",
  "mood": "string (e.g. 'energetic', 'melancholic', 'peaceful')",
  "energy": "string ('low', 'medium', or 'high')",
  "compatible_instruments": ["array", "of", "instrument", "strings"],
  "arrangement_notes": "string with specific conductor notes for this track"
}`;

  const responseText = await callClaude(SYSTEM_PROMPT, userMessage);
  // Parse JSON — strip any accidental markdown code fences
  const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { analyzeTrack };
