 OrchestrAI Implementation Plan                                                              
                                                                                                      
     Context                                                                                     
                                                                                                      
     OrchestrAI is a hackathon project — a collaborative music orchestra builder where musicians
     upload audio clips and Claude AI acts as a "conductor" to analyze tracks, match compatible ones,
     and arrange them into compositions. The entire codebase is scaffolded (40+ files with correct
     structure, routes, exports, and JSDoc) but every function body is // TODO: implement. This plan
     covers implementing all TODOs in the right order.

     ---
     Phase 1: Backend Infrastructure

     Goal: Server starts, file storage works, uploads accepted. No Claude yet.

     ┌───────────────────────────────────┬────────────────────────────────────────────────────────────
     ┐
     │               File                │                     What to implement
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ server/utils/audioValidation.js   │ isValidMimeType — check against ALLOWED_MIME_TYPES;
     │
     │                                   │ isValidDuration — check 15-60s range
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ server/middleware/errorHandler.js │ Log error, send { error } JSON with err.statusCode || 500
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │                                   │ Configure Multer: diskStorage to data/uploads/, file
     │
     │ server/middleware/upload.js       │ filter for audio MIME types, size limit from env, export
     │
     │                                   │ multer.single('audio')
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ server/services/fileStorage.js    │ readAll / writeAll / findById / save / update — all
     │
     │                                   │ read/write DATA_DIR/<collection>.json
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ server/app.js                     │ Wire up cors(), express.json(), express.static for
     │
     │                                   │ uploads, mount routers + error handler
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ server/index.js                   │ Add console.log in listen callback
     │
     └───────────────────────────────────┴────────────────────────────────────────────────────────────
     ┘

     Verify: node server/index.js starts on port 3001 without errors.

     ---
     Phase 2: Backend Controllers (CRUD)

     Goal: All REST endpoints work for track upload/retrieval and composition CRUD.

     File: server/controllers/tracksController.js
     What to implement: uploadTrack — extract file + metadata, create record with generateId(), save;
       getAllTracks / getTrackById — read from fileStorage; analyzeTrack — call trackAnalyzer service,

       update record
     ────────────────────────────────────────
     File: server/controllers/compositionsController.js
     What to implement: generateComposition — read analyzed tracks, call conductorAgent, save;
       getAllCompositions / getCompositionById — read; addTrackToComposition — add track, re-run
     conductor

     Verify: curl POST to /api/tracks/upload with FormData. GET /api/tracks returns uploaded tracks.

     ---
     Phase 3: Claude API Integration

     Goal: Track analysis and conductor agent produce real AI results.

     ┌───────────────────────────────────┬────────────────────────────────────────────────────────────
     ┐
     │               File                │                     What to implement
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │                                   │ getClient() — singleton Anthropic client; callClaude({
     │
     │ server/services/claudeClient.js   │ system, messages }) — call messages.create(), return
     │
     │                                   │ response.content[0].text
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │                                   │ Build music-theory-expert system prompt, send track
     │
     │ server/services/trackAnalyzer.js  │ metadata, parse JSON response (with code-fence stripping +
     │
     │                                   │  fallback)
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │                                   │ Build orchestral-conductor system prompt, send all
     │
     │ server/services/conductorAgent.js │ analyzed tracks, parse JSON with title, conductor_notes,
     │
     │                                   │ missing_parts, help_wanted_prompt. Validate returned track
     │
     │                                   │  IDs. Handle piece_name matching.
     │
     └───────────────────────────────────┴────────────────────────────────────────────────────────────
     ┘

     Key detail: Strip markdown code fences before JSON.parse: text.replace(/^```json?\n?/,
     '').replace(/\n?```$/, '').trim()

     Verify: POST /api/tracks/:id/analyze returns populated analysis. POST /api/compositions/generate
     creates a composition with conductor notes.

     ---
     Phase 4: Frontend Foundation + Styling

     Goal: App renders with routing, nav bar, dark theme, API wrappers ready.

     ┌───────────────────────────────────┬────────────────────────────────────────────────────────────
     ┐
     │               File                │                     What to implement
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ client/src/styles/index.css       │ Add dark theme base styles (bg-gray-950, text-gray-100),
     │
     │                                   │ .btn-primary, .btn-secondary, .card utility classes
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ client/tailwind.config.js         │ Extend with custom orchestra color palette (purples/blues)
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ client/src/App.jsx                │ BrowserRouter + nav bar + Routes: / UploadPage,
     │
     │                                   │ /composition/:id CompositionPage, /feed CommunityFeedPage
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ client/src/api/tracksApi.js       │ Axios wrappers for all 4 track endpoints
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ client/src/api/compositionsApi.js │ Axios wrappers for all 4 composition endpoints
     │
     ├───────────────────────────────────┼────────────────────────────────────────────────────────────
     ┤
     │ client/vite.config.js             │ Add /uploads to proxy config (needed for audio file
     │
     │                                   │ loading)
     │
     └───────────────────────────────────┴────────────────────────────────────────────────────────────
     ┘

     Verify: npm run dev in client — nav bar renders, links navigate between pages.

     ---
     Phase 5: Client-Side Audio Processing

     Goal: Extract BPM, frequency range, and waveform from audio files in the browser.

     ┌───────────────────────────────────────┬────────────────────────────────────────────────────────
     ┐
     │                 File                  │                   What to implement
     │
     ├───────────────────────────────────────┼────────────────────────────────────────────────────────
     ┤
     │ client/src/audio/audioContext.js      │ Singleton AudioContext with lazy init + resume() for
     │
     │                                       │ Chrome autoplay policy
     │
     ├───────────────────────────────────────┼────────────────────────────────────────────────────────
     ┤
     │                                       │ Energy-based onset detection: compute energy in 50ms
     │
     │ client/src/audio/bpmDetector.js       │ windows, find peaks above local average, average
     │
     │                                       │ inter-peak intervals, convert to BPM (fallback: 120)
     │
     ├───────────────────────────────────────┼────────────────────────────────────────────────────────
     ┤
     │ client/src/audio/frequencyAnalyzer.js │ FFT via raw channel data, find peak frequency bin,
     │
     │                                       │ classify into bass/mid/upper-mid/treble range
     │
     ├───────────────────────────────────────┼────────────────────────────────────────────────────────
     ┤
     │ client/src/audio/waveformExtractor.js │ Downsample AudioBuffer to 1000 amplitude values via
     │
     │                                       │ block averaging
     │
     ├───────────────────────────────────────┼────────────────────────────────────────────────────────
     ┤
     │ client/src/audio/audioFeatures.js     │ Orchestrator: decode File to AudioBuffer, run all
     │
     │                                       │ extractors in parallel via Promise.all
     │
     └───────────────────────────────────────┴────────────────────────────────────────────────────────
     ┘

     Pitfall: OfflineAudioContext + AnalyserNode may yield zeros. Use manual FFT on raw channel data
     instead.

     Verify: In browser console, pass a File to extractAudioFeatures — returns { bpm,
     dominantFrequency, waveform, durationSeconds }.

     ---
     Phase 6: Upload Flow (Full E2E)

     Goal: User drops file, sees waveform + features, fills metadata, uploads, gets Claude analysis
     back.

     ┌────────────────────────────────────────────────────┬───────────────────────────────────────────
     ┐
     │                        File                        │             What to implement
     │
     ├────────────────────────────────────────────────────┼───────────────────────────────────────────
     ┤
     │ client/src/components/shared/WaveformDisplay.jsx   │ Wavesurfer.js v7: create instance in ref,
     │
     │                                                    │  load audioUrl, cleanup on unmount
     │
     ├────────────────────────────────────────────────────┼───────────────────────────────────────────
     ┤
     │ client/src/components/shared/AudioPlayer.jsx       │ Wrap WaveformDisplay with play/pause
     │
     │                                                    │ button + time display
     │
     ├────────────────────────────────────────────────────┼───────────────────────────────────────────
     ┤
     │ client/src/components/upload/DropZone.jsx          │ Drag-and-drop + file input, validate MIME
     │
     │                                                    │  type, call onFileSelected
     │
     ├────────────────────────────────────────────────────┼───────────────────────────────────────────
     ┤
     │                                                    │ Controlled form: musician_name,
     │
     │ client/src/components/upload/TrackMetadataForm.jsx │ instrument dropdown, genre dropdown,
     │
     │                                                    │ skill_level, piece_name, description
     │
     ├────────────────────────────────────────────────────┼───────────────────────────────────────────
     ┤
     │ client/src/components/upload/WaveformPreview.jsx   │ Create blob URL from File, render
     │
     │                                                    │ WaveformDisplay + feature stats
     │
     ├────────────────────────────────────────────────────┼───────────────────────────────────────────
     ┤
     │                                                    │ Orchestrate: DropZone -> extract features
     │
     │ client/src/pages/UploadPage.jsx                    │  -> WaveformPreview -> TrackMetadataForm
     │
     │                                                    │ -> upload + auto-analyze -> show results
     │
     └────────────────────────────────────────────────────┴───────────────────────────────────────────
     ┘

     Verify: Full flow: drop file -> see waveform + BPM -> fill form -> submit -> see Claude analysis.
      Check data/tracks.json.

     ---
     Phase 7: Composition View + Multi-Track Playback

     Goal: Stacked waveform timeline, synchronized playback, conductor notes.

     ┌────────────────────────────────────────────────────────┬───────────────────────────────────────
     ┐
     │                          File                          │           What to implement
     │
     ├────────────────────────────────────────────────────────┼───────────────────────────────────────
     ┤
     │ client/src/components/composition/TrackLane.jsx        │ Waveform + musician name + instrument
     │
     │                                                        │  badge per track
     │
     ├────────────────────────────────────────────────────────┼───────────────────────────────────────
     ┤
     │ client/src/components/composition/Timeline.jsx         │ Stack TrackLane components vertically
     │
     ├────────────────────────────────────────────────────────┼───────────────────────────────────────
     ┤
     │                                                        │ Create Audio elements per track,
     │
     │ client/src/components/composition/PlaybackControls.jsx │ play/pause/stop all simultaneously,
     │
     │                                                        │ master volume slider
     │
     ├────────────────────────────────────────────────────────┼───────────────────────────────────────
     ┤
     │                                                        │ Display conductor_notes,
     │
     │ client/src/components/composition/ConductorNotes.jsx   │ missing_parts list,
     │
     │                                                        │ help_wanted_prompt
     │
     ├────────────────────────────────────────────────────────┼───────────────────────────────────────
     ┤
     │                                                        │ Fetch composition + tracks by URL
     │
     │ client/src/pages/CompositionPage.jsx                   │ param, render Timeline +
     │
     │                                                        │ PlaybackControls + ConductorNotes +
     │
     │                                                        │ credits
     │
     └────────────────────────────────────────────────────────┴───────────────────────────────────────
     ┘

     Key decision: Use HTML Audio elements for synchronized playback (more reliable than coordinating
     multiple WaveSurfer instances). WaveSurfer is used for visual waveforms only.

     Verify: Navigate to /composition/:id — tracks display, "Play All" plays simultaneously, conductor
      notes show.

     ---
     Phase 8: Community Feed

     Goal: Browse compositions, generate new ones, navigate to details.

     ┌───────────────────────────────────────────────────┬────────────────────────────────────────────
     ┐
     │                       File                        │             What to implement
     │
     ├───────────────────────────────────────────────────┼────────────────────────────────────────────
     ┤
     │ client/src/components/feed/ContributorCredits.jsx │ List musician name + instrument badges
     │
     ├───────────────────────────────────────────────────┼────────────────────────────────────────────
     ┤
     │ client/src/components/feed/JoinCompositionCTA.jsx │ Display help_wanted_prompt + link to
     │
     │                                                   │ upload page
     │
     ├───────────────────────────────────────────────────┼────────────────────────────────────────────
     ┤
     │ client/src/components/feed/CompositionCard.jsx    │ Card with title, track count, notes
     │
     │                                                   │ excerpt, link to /composition/:id
     │
     ├───────────────────────────────────────────────────┼────────────────────────────────────────────
     ┤
     │ client/src/pages/CommunityFeedPage.jsx            │ Fetch all compositions, render grid of
     │
     │                                                   │ cards, "Generate New Composition" button
     │
     └───────────────────────────────────────────────────┴────────────────────────────────────────────
     ┘

     Verify: /feed shows composition cards. Click navigates to composition view. Generate button
     creates new composition.

     ---
     Phase 9: Stretch — Browser Recording

     Goal: Record audio via microphone directly in the browser.

     ┌───────────────────────────────────────────────┬────────────────────────────────────────────────
     ┐
     │                     File                      │               What to implement
     │
     ├───────────────────────────────────────────────┼────────────────────────────────────────────────
     ┤
     │ client/src/components/upload/RecordButton.jsx │ MediaRecorder API: request mic, record,
     │
     │                                               │ produce File blob, pass to onRecorded
     │
     ├───────────────────────────────────────────────┼────────────────────────────────────────────────
     ┤
     │ client/src/pages/UploadPage.jsx               │ Add RecordButton alongside DropZone
     │
     └───────────────────────────────────────────────┴────────────────────────────────────────────────
     ┘

     ---
     Dependency Graph

     Phase 1 (Backend infra) -> Phase 2 (Controllers) -> Phase 3 (Claude API)
     Phase 4 (Frontend foundation) -> Phase 5 (Audio processing)
                                              |
     Phase 6 (Upload flow) <- requires Phases 2 + 4 + 5
     Phase 7 (Composition view) <- requires Phase 6
     Phase 8 (Community feed) <- requires Phase 7
     Phase 9 (Stretch: recording) <- requires Phase 6

     Phases 1-3 and Phases 4-5 can be built in parallel.

     Pitfalls to Watch

     1. Windows path separators: Use '/uploads/' + filename (forward slash), not path.join for URL
     paths
     2. Claude non-JSON responses: Strip code fences before parsing, provide fallback object
     3. Audio file proxy: Add /uploads to Vite proxy config so Wavesurfer.js can load audio from
     Express
     4. AudioContext autoplay: First getAudioContext() call must be inside a user gesture handler
     5. Flat-file race conditions: Acceptable for hackathon, but keep read-modify-write atomic per
     function

     End-to-End Verification

     1. Start server: cd server && npm install && npm run dev
     2. Start client: cd client && npm install && npm run dev
     3. Upload 2-3 audio clips with metadata
     4. Verify analysis results appear for each track
     5. Generate a composition from the feed page
     6. Open the composition — play all tracks simultaneously
     7. Verify conductor notes and "join" CTA display correctly