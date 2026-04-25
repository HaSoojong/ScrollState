🎵 OrchestrAI — Collaborative Music Orchestra Builder
Project Plan & Architecture

Concept
A web app where musicians upload short audio clips (a guitar riff, a vocal melody, a drum beat), and an AI "conductor" (Claude) analyzes each track, identifies musical properties, suggests what's missing, matches compatible submissions, and arranges them into collaborative compositions — connecting strangers into an orchestra.

Focus Area
Creative Flourishing — Amplify human creativity and help people find meaning.

Why This Wins
Judging Criteria
How We Score
Impact Potential
Democratizes music collaboration — no studio, no geography, no expensive software. A guitarist in Ithaca + a vocalist in Mumbai = a song.
Technical Execution
Multi-step agentic Claude pipeline: audio analysis → gap detection → matching → arrangement suggestions. Real Claude API depth, not a wrapper.
Ethical Alignment
Every contributor is credited. AI conducts but never creates the music — humans stay the artists. Expands access to collaborative creation.
Presentation
You play the result. Judges hear a combined piece built by strangers during the hackathon. Nothing else in the room competes with that.


Core Features (MVP — Must Ship)
1. Track Upload & Profile
Upload an audio clip (MP3/WAV, 15-60 seconds)
Add metadata: instrument, genre preference, skill level
Optional: short text description of what you were going for
2. AI Conductor — Track Analysis (Claude API)
User uploads a track → backend converts audio to analyzable format
Use Web Audio API on frontend to extract:
Tempo (BPM) via beat detection
Dominant frequency range (maps to instrument register)
Duration and waveform shape
Send extracted features + user metadata to Claude API
Claude returns:
Detected key (estimated from metadata + frequency analysis)
Mood/energy classification
Suggested compatible instruments/parts
What's "missing" to make a fuller arrangement
3. Composition Matching (Claude API — Agentic)
Claude acts as the matchmaker/conductor across all uploaded tracks
Agentic loop:
Fetch all available tracks and their analysis
Identify compatible groups (key, tempo, mood)
Suggest arrangements: "Track A (guitar, E minor, 90 BPM) + Track D (vocals, E minor, 88 BPM) + Track F (drums, 90 BPM) could form a composition"
Generate arrangement notes: "Layer the guitar as foundation, bring vocals in at 0:08, drums throughout"
This is the agentic core — Claude reasons across multiple tracks autonomously
4. Composition View & Playback
Visual timeline showing layered tracks (like a simple DAW)
Play tracks simultaneously using Web Audio API
Adjust individual track volume
Show each contributor's name and instrument
5. Community Feed
Browse completed compositions
See contributor credits
"Join this composition" — if a piece needs a bass line, you can record and submit one

Stretch Features (If Time Allows)
Live recording via browser microphone (MediaRecorder API)
Voting/reactions on compositions
Claude arrangement notes displayed as a "conductor's commentary" explaining why the tracks work together
Export — download the mixed composition as a single audio file
AI-suggested prompts — "This composition needs a mellow bass line in C major at 72 BPM. Can you contribute?"

Tech Stack
Frontend
React (Vite for fast setup)
Tailwind CSS for styling
Web Audio API for playback, waveform visualization, and basic audio analysis
Wavesurfer.js (open source) for waveform display in the timeline view
Backend
Node.js + Express (fast to scaffold)
Claude API (claude-sonnet-4-20250514) for track analysis, matching, and arrangement
Multer for file upload handling
File-based storage (JSON + uploaded audio files on disk) — no database needed for a hackathon
Audio Processing
Web Audio API (browser-side) for tempo detection, frequency analysis, waveform extraction
Send extracted features as structured data to Claude (not raw audio)
Tone.js (optional) for more advanced audio manipulation if needed

Architecture Diagram
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│                (Next.js)                │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Upload   │ │ Composition│ │  Community  │ │
│  │  + Record │ │  Timeline  │ │    Feed     │ │
│  └────┬─────┘ └─────┬────┘ └──────┬──────┘ │
│       │              │             │         │
│  ┌────┴──────────────┴─────────────┴──────┐ │
│  │         Web Audio API Layer            │ │
│  │   (analysis, playback, visualization)  │ │
│  └────────────────┬───────────────────────┘ │
└───────────────────┼─────────────────────────┘
                    │ HTTP / REST
┌───────────────────┼─────────────────────────┐
│                   │     Backend              │
│              (Node + Express)                │
│                                             │
│  ┌────────────┐  ┌────────────────────────┐ │
│  │   Upload   │  │    Claude API Service   │ │
│  │   Handler  │  │                        │ │
│  │  (Multer)  │  │  ┌──────────────────┐  │ │
│  └─────┬──────┘  │  │ Track Analyzer   │  │ │
│        │         │  │ (single track)   │  │ │
│        ▼         │  ├──────────────────┤  │ │
│  ┌───────────┐   │  │ Conductor Agent  │  │ │
│  │   File    │   │  │ (multi-track     │  │ │
│  │  Storage  │   │  │  matching +      │  │ │
│  │ (JSON +   │   │  │  arrangement)    │  │ │
│  │  audio)   │   │  └──────────────────┘  │ │
│  └───────────┘   └────────────────────────┘ │
└─────────────────────────────────────────────┘


Claude API Usage (Key Selling Point)
Call 1: Track Analysis
System: You are a music theory expert and orchestral conductor.
Analyze this audio track based on the following extracted features
and user-provided metadata.

User: {
  instrument: "acoustic guitar",
  genre: "indie folk",
  bpm_detected: 92,
  dominant_freq_range: "200-800Hz",
  duration: "32s",
  user_description: "melancholy fingerpicking pattern"
}

→ Claude returns: key estimation, mood, energy level,
  compatible instruments, arrangement suggestions

Call 2: Conductor Agent (Agentic Multi-Step)
System: You are an orchestral conductor building compositions
from individual musician submissions. Analyze all available
tracks and create optimal groupings.

Step 1: Review all track analyses
Step 2: Identify compatible groups by key, tempo, mood
Step 3: For each group, create arrangement instructions
Step 4: Identify gaps — what instrument/part would complete
        each composition?

→ Claude returns: composition groupings, arrangement notes,
  "help wanted" prompts for missing parts


Team Task Division (4 people)
Person 1 — Frontend: Upload & Recording
File upload component with drag-and-drop
Browser audio recording (stretch goal)
Waveform visualization for uploaded tracks
Track metadata form
Person 2 — Frontend: Composition View & Feed
Multi-track timeline component (layered waveforms)
Playback controls with per-track volume
Community feed showing all compositions
Contributor credit display
Person 3 — Backend: API & File Handling
Express server setup with routes
File upload handling (Multer)
Audio feature extraction pipeline (or receive from frontend)
JSON-based data storage for tracks and compositions
Serve audio files for playback
Person 4 — Backend: Claude Integration & Agent Logic
Claude API integration for track analysis
Conductor agent: multi-step matching and arrangement logic
Prompt engineering and testing
"Gap detection" — what instruments are needed
Generate conductor commentary for compositions

API Routes
POST   /api/tracks/upload        — Upload audio + metadata
GET    /api/tracks                — List all tracks
GET    /api/tracks/:id            — Get single track + analysis
POST   /api/tracks/:id/analyze    — Trigger Claude analysis

POST   /api/compositions/generate — Run conductor agent
GET    /api/compositions          — List all compositions
GET    /api/compositions/:id      — Get composition details
POST   /api/compositions/:id/add  — Add a track to a composition


Data Models
Track
{
  "id": "uuid",
  "musician_name": "string",
  "instrument": "string",
  "genre": "string",
  "file_path": "string",
  "duration_seconds": 32,
  "bpm": 92,
“Piece_name”:”string”, #If piece name match by piece name if original piece use analysis to match
  "analysis": {
    "estimated_key": "E minor",
    "mood": "melancholy",
    "energy": "low-medium",
    "compatible_instruments": ["cello", "soft vocals", "light percussion"],
    "arrangement_notes": "Works as a foundation track. Fingerpicking pattern leaves space for a vocal melody in the upper register."
  },
  "created_at": "timestamp"
}

Composition
{
  "id": "uuid",
  "title": "Generated or user-given title",
  "tracks": ["track_id_1", "track_id_2", "track_id_3"],
  "conductor_notes": "Claude's arrangement commentary",
  "missing_parts": ["bass line", "harmony vocals"],
  "help_wanted_prompt": "This composition needs a warm bass line in E minor around 90 BPM to ground the arrangement.",
  "created_at": "timestamp"
}


Demo Script (3-Minute Presentation)
0:00–0:30 — "Musicians everywhere create alone. OrchestrAI connects them." Show the problem.
0:30–1:15 — Live upload a guitar track. Show Claude analyzing it in real time. Display the analysis: key, mood, what it needs.
1:15–2:00 — Show the conductor agent matching it with 2-3 other tracks uploaded during the hackathon. Display the arrangement notes.
2:00–2:30 — Hit play. The combined composition plays. Judges hear the result.
2:30–3:00 — Show the "help wanted" feature: "This piece needs a bass line. Can you contribute?" Zoom out on the vision — a global orchestra built by strangers.
Key Risks & Mitigations
Risk
Mitigation
Audio analysis accuracy
Don't try to do perfect key detection — use user-provided metadata + Claude's reasoning. Be honest about estimation in the UI.
Tracks don't sound good together
Pre-seed with 3-4 compatible sample tracks. Claude's arrangement notes help set expectations.
Time crunch
Prioritize: upload → analysis → playback of 2+ tracks together. Everything else is polish.
Claude API rate limits
Cache analysis results. Don't re-analyze on every page load.


