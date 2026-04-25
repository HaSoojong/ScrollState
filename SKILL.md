---
name: audio-merge-tracks-with-start-alignment
version: v1
description: Align and merge a newly uploaded user track with an existing composition by detecting musical onsets, emphasizing moving lines, and producing a Web Audio merge plan.
---

# Claude Skill: audio-merge-tracks-with-start-alignment

## Purpose
Generate a Web Audio–ready merge plan that aligns a newly uploaded user track with the existing tracks of a chosen composition by detecting where musical content actually starts (ignoring leading silence), emphasizing moving melodic/rhythmic lines, and producing mix directives (offsets, gains, fades, optional pan, and segment boosts). Claude should call this after a user uploads a track and selects a composition to join.

## Inputs
- `composition`: { `id`, `title`, optional `conductor_notes`, `track_ids`: string[] }
- `existing_tracks`: array of track objects already in the composition, each containing:
  - `id`, `instrument`, `genre`, `piece_name`, `duration` seconds
  - `gridfsId`/`filename` (for retrieval)
  - `bpm_detected`, `dominant_freq_range`, `analysis` (as produced by `trackAnalyzer.analyzeTrack`)
  - optional `audio_features.start_time_seconds` (client-side detected musical start)
- `new_track`: the uploaded user track with the same shape/fields as above (analysis must be present)

## Required Output (JSON only, no markdown)
{
  "timeline": [
    {
      "track_id": "string",              // includes new track and all existing tracks
      "start_sec_from_zero": number,      // aligned so musical onsets coincide
      "gain_db": number,                  // level adjustment suggestion
      "fade_in_sec": number,
      "fade_out_sec": number,
      "pan": number,                      // -1..1 optional
      "rationale": "string"
    }
  ],
  "emphasis_segments": [                 // optional per-track boosts for moving lines
    {
      "track_id": "string",
      "start_sec": number,
      "end_sec": number,
      "gain_boost_db": number,           // typically +2 to +4 dB
      "reason": "string"                // e.g., "melodic line" or "rhythmic motif"
    }
  ],
  "web_audio_alignment_js": "string",   // minimal snippet: detect onset via RMS / spectral flux, compute offsets, schedule sources; include automation for emphasis_segments
  "mix_notes": "string",                // concise engineer notes
  "version": "audio-merge-tracks-with-start-alignment.v1"
}

## Alignment Guidance (Web Audio API)
- Load all tracks into `AudioBuffer`s (OfflineAudioContext if available).
- For each buffer, compute leading silence and musical onset:
  - Iterate frames with a short window (e.g., 1024 samples, hop 512), compute RMS.
  - Detect first window where RMS > -40 dBFS (or adaptive: mean + 20 dB) and stays above threshold for N consecutive hops (e.g., 3).
  - Set `start_time_seconds` to that offset; fall back to 0 if none.
- Align all tracks so their `start_time_seconds` line up at timeline t=0; set `start_sec_from_zero` = (track.start_time_seconds - min_start_time).
- Keep relative offsets if `analysis.arrangement_notes` indicate intentional pickup; otherwise aim for coincident onsets.

## Mixing Guidance
- Default `gain_db` to normalize perceived loudness (e.g., align to -14 LUFS equivalent; if unknown, attenuate louder/denser sources by 3–6 dB).
- Suggest gentle `fade_in_sec` (0.05–0.2) to avoid clicks; `fade_out_sec` near tail if needed.
- `pan` optional: spread complementary instruments, keep vocals/lead centered.
- Detect **moving lines** (melodic or rhythmic motifs) by looking for sections with elevated spectral flux and RMS variance within 200–500 ms windows. In those regions, add `emphasis_segments` with +2 to +4 dB boosts; keep boosts short and smooth to avoid pumping.

## Error Handling / Constraints
- If any track lacks `analysis`, request it first (but skill itself should return an error object if called without analysis).
- Return **only** valid JSON (no markdown/code fences). Keep `timeline` order arbitrary but consistent.

## Example `web_audio_alignment_js` snippet expectations
- Should be a concise, runnable outline (not full app) using `AudioContext`/`OfflineAudioContext`, showing RMS-based onset detection, spectral-flux moving-line detection, and scheduling with computed offsets and gain automation for `emphasis_segments`.

## Invocation
Call after the user selects a composition to join; supply the composition object, its existing analyzed tracks, and the newly analyzed user track.
