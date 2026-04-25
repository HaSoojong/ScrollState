// Claude API Call 2: multi-track agentic matching & arrangement —
// takes a set of analyzed tracks and uses Claude to select compatible ones,
// produce a conductor_notes commentary, identify missing_parts, and generate
// a help_wanted_prompt for future contributors
'use strict';

const { callClaude } = require('./claudeClient');

const SYSTEM_PROMPT = `You are an orchestral conductor building compositions from individual musician submissions. Review the provided tracks and create a composition plan. Return ONLY valid JSON with no additional text or markdown.`;

function getTrackId(track) {
  return track.id || track._id?.toString();
}

/**
 * Runs the conductor agent to build or update a composition from analyzed tracks.
 * @param {object[]} analyzedTracks - Array of Track objects with populated .analysis fields
 * @returns {Promise<{
 *   title: string,
 *   track_ids: string[],
 *   conductor_notes: string,
 *   missing_parts: string[],
 *   help_wanted_prompt: string
 * }>}
 */
async function conductComposition(tracks) {
  if (!process.env.ANTHROPIC_API_KEY) {
    const sortedTracks = [...tracks].sort((a, b) => (a.bpm_detected || 96) - (b.bpm_detected || 96));
    const selectedTracks = sortedTracks.slice(0, Math.min(sortedTracks.length, 4));
    const primary = selectedTracks[0] || {};
    const instruments = selectedTracks.map((track) => track.instrument).filter(Boolean);
    const missingParts = ['bass line', 'harmony vocals', 'ambient texture'].filter(
      (part) => !instruments.some((instrument) => part.toLowerCase().includes(instrument.toLowerCase())),
    );

    return {
      title: primary.piece_name || `${primary.genre || 'Collaborative'} Session`,
      track_ids: selectedTracks.map(getTrackId).filter(Boolean),
      conductor_notes: `These ${selectedTracks.length} track${selectedTracks.length === 1 ? '' : 's'} share a compatible tempo and mood. Start with ${primary.instrument || 'the foundation track'}, then layer supporting parts to preserve space in the arrangement.`,
      missing_parts: missingParts.length ? missingParts : ['lead melody'],
      help_wanted_prompt: `This composition could use ${missingParts[0] || 'a lead melody'} to complete the arrangement.`,
    };
  }

  const userMessage = `Review these analyzed tracks and create a composition:

${tracks.map((t, i) => `Track ${i + 1}:
- ID: ${getTrackId(t)}
- Instrument: ${t.instrument}
- Genre: ${t.genre}
- Piece Name: ${t.piece_name || 'Original'}
- BPM: ${t.bpm_detected || 'unknown'}
- Analysis: ${JSON.stringify(t.analysis)}`).join('\n\n')}

Create a composition plan. If tracks share a piece_name, group them together. Otherwise, match by compatible key, tempo, and mood.

Return a JSON object with exactly these fields:
{
  "title": "string - composition title",
  "track_ids": ["array of track IDs to include in this composition"],
  "conductor_notes": "string - detailed notes on how the tracks should be performed together",
  "missing_parts": ["array of instrument types that would enhance this composition"],
  "help_wanted_prompt": "string - a friendly invitation for other musicians to contribute missing parts"
}`;

  const responseText = await callClaude(SYSTEM_PROMPT, userMessage);
  const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { conductComposition };
