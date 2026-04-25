'use strict';

const { callClaude } = require('./claudeClient');

// System prompt for the merge skill. Mirrors SKILL.md expectations and forces JSON-only output.
const SYSTEM_PROMPT = `You are the skill "audio-merge-tracks-with-start-alignment".
Generate ONLY valid JSON (no markdown, no extra prose) that aligns a newly uploaded track with existing composition tracks by detecting musical onset (ignore leading silence), identifies moving lines (rhythmic or melodic motifs), and produces a Web Audio–ready merge plan with segment emphasis.

Required JSON shape:
{
  "timeline": [
    {
      "track_id": "string",
      "start_sec_from_zero": number,
      "gain_db": number,
      "fade_in_sec": number,
      "fade_out_sec": number,
      "pan": number,
      "rationale": "string"
    }
  ],
  "emphasis_segments": [
    {
      "track_id": "string",
      "start_sec": number,
      "end_sec": number,
      "gain_boost_db": number,
      "reason": "string"
    }
  ],
  "web_audio_alignment_js": "string",
  "mix_notes": "string",
  "version": "audio-merge-tracks-with-start-alignment.v1"
}

Alignment guidance (for your reasoning):
- For each AudioBuffer, detect first sustained onset using RMS over small windows (e.g., 1024 hop 512); find the first window where RMS > -40 dBFS (or adaptive mean+20dB) for at least 3 hops; set start_time_seconds to that offset (fallback 0).
- Align all tracks so their start_time_seconds coincide at t=0: start_sec_from_zero = (track.start_time_seconds - min_start_time).
- Respect intentional pickup offsets if arrangement notes imply them; otherwise align onsets.

Moving line detection:
- Look for elevated spectral flux and RMS variance in 200–500 ms windows; treat these as likely melodic/rhythmic motifs. Suggest +2 to +4 dB boosts via emphasis_segments with short, smooth spans.

Mix guidance:
- Normalize perceived loudness; if unknown, attenuate dense/loud sources by ~3–6 dB.
- Use gentle fades to avoid clicks; pan optional.

Constraints:
- If any track lacks analysis, you must return an error JSON with { "error": "missing analysis" }.
- Return only JSON; no code fences.`;

function ensureAnalyzed(track) {
  return track && track.analysis;
}

/**
 * Build a merge plan that aligns a new track into an existing composition.
 * @param {object} composition
 * @param {object[]} existingTracks
 * @param {object} newTrack
 * @returns {Promise<object>} JSON merge plan
 */
async function buildMergePlan(composition, existingTracks, newTrack) {
  if (!ensureAnalyzed(newTrack) || existingTracks.some(t => !ensureAnalyzed(t))) {
    return { error: 'missing analysis' };
  }

  const message = `Composition context:
${JSON.stringify({
    id: composition.id,
    title: composition.title,
    conductor_notes: composition.conductor_notes || '',
    track_ids: composition.track_ids || []
  }, null, 2)}

Existing tracks (analyzed):
${JSON.stringify(existingTracks, null, 2)}

Newly uploaded track (analyzed):
${JSON.stringify(newTrack, null, 2)}

Produce the required JSON merge plan described above.`;

  const responseText = await callClaude(SYSTEM_PROMPT, message);
  const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { buildMergePlan };
