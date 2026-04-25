import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { getAllTracks } from '../api/tracksApi';
import { getCompositionById, getMergePlan } from '../api/compositionsApi';
import { useMergePlanPlayer } from '../hooks/useMergePlanPlayer';

function getTrackUrl(track) {
  return track.file_url || (track.filename ? `/uploads/${encodeURIComponent(track.filename)}` : '');
}

function formatTrackName(track) {
  return track.piece_name || track.name || track.originalName || 'Untitled track';
}

function buildTrackMap(compositionTracks = [], extraTracks = []) {
  const map = new Map();
  [...compositionTracks, ...extraTracks].forEach((track) => {
    if (!track) return;
    map.set(String(track.id || track._id), track);
  });
  return map;
}

export default function CompositionPage() {
  const { id } = useParams();
  const [composition, setComposition] = useState(null);
  const [status, setStatus] = useState('loading');
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [mergePlan, setMergePlan] = useState(null);
  const [planStatus, setPlanStatus] = useState('idle');
  const [planError, setPlanError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');

    getCompositionById(id)
      .then((item) => {
        if (isMounted) {
          setComposition(item);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (isMounted) setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    getAllTracks()
      .then(setAllTracks)
      .catch(() => setAllTracks([]));
  }, []);

  const compositionTracks = useMemo(() => composition?.tracks || [], [composition]);
  const compositionTrackIds = useMemo(
    () => (composition?.track_ids || []).map((trackId) => String(trackId)),
    [composition],
  );

  const availableTracks = useMemo(
    () => allTracks.filter((track) => !compositionTrackIds.includes(String(track.id))),
    [allTracks, compositionTrackIds],
  );

  useEffect(() => {
    if (!selectedTrackId && availableTracks.length > 0) {
      setSelectedTrackId(String(availableTracks[0].id));
    }
  }, [availableTracks, selectedTrackId]);

  const trackMap = useMemo(
    () => buildTrackMap(compositionTracks, [availableTracks.find((t) => String(t.id) === selectedTrackId)]),
    [compositionTracks, availableTracks, selectedTrackId],
  );

  const { loadAndPrepare, stop, isPlaying, isLoading: audioLoading } = useMergePlanPlayer({
    mergePlan,
    trackIdToUrl: (trackId) => {
      const track = trackMap.get(String(trackId));
      if (!track) throw new Error(`Missing track ${trackId}`);
      return getTrackUrl(track);
    },
  });

  async function fetchMergePlan() {
    if (!composition?.id || !selectedTrackId) return;
    try {
      setPlanStatus('loading');
      setPlanError(null);
      const { merge_plan } = await getMergePlan(composition.id, selectedTrackId);
      if (merge_plan?.error) {
        setPlanError(merge_plan.error);
        setPlanStatus('error');
        return;
      }
      setMergePlan(merge_plan);
      setPlanStatus('ready');
    } catch (err) {
      setPlanError(err?.message || 'Failed to build merge plan');
      setPlanStatus('error');
    }
  }

  if (status === 'loading') {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="panel">Loading composition...</div>
      </section>
    );
  }

  if (status === 'error' || !composition) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="panel">
          <h1 className="text-2xl font-black text-white">Composition not found</h1>
          <Link className="btn-secondary mt-6" to="/compositions">
            Back to Compositions
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <motion.div
        className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orchestra-300">Composition</p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{composition.title}</h1>
          <p className="mt-3 text-slate-400">
            {composition.genre || 'Collaborative'} · {composition.bpm || 96} BPM · {composition.mood || 'Evolving'}
          </p>
        </div>
        <Link className="btn-secondary" to="/compositions">
          Back to Feed
        </Link>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <h2 className="text-2xl font-black text-white">Timeline</h2>
          <div className="mt-6 space-y-4">
            {compositionTracks.length ? (
              compositionTracks.map((track, index) => (
                <motion.div
                  key={track.id || track.filename}
                  className="rounded-lg border border-white/10 bg-slate-950/55 p-4"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + index * 0.06, duration: 0.3 }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold text-white">{formatTrackName(track)}</h3>
                      <p className="text-sm text-slate-400">
                        {track.instrument || 'Instrument'} · {track.genre || 'Genre'} · {track.duration || '?'}s
                      </p>
                    </div>
                    <audio className="w-full max-w-md" controls src={getTrackUrl(track)} />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-400">No tracks have been attached to this composition yet.</p>
            )}
          </div>

          <div className="mt-8 rounded-lg border border-emerald-300/20 bg-emerald-950/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-white">AI merge preview (experimental)</h3>
                <p className="text-sm text-emerald-100/80">Build a Claude merge plan for an incoming track and audition alignment.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-secondary"
                  onClick={fetchMergePlan}
                  disabled={!selectedTrackId || planStatus === 'loading'}
                >
                  {planStatus === 'loading' ? 'Building plan…' : 'Build merge plan'}
                </button>
                <button
                  className="btn-primary"
                  onClick={loadAndPrepare}
                  disabled={!mergePlan || audioLoading}
                >
                  {isPlaying ? 'Playing…' : audioLoading ? 'Loading…' : 'Play aligned mix'}
                </button>
                <button className="btn-tertiary" onClick={stop}>
                  Stop
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-200" htmlFor="incoming-track">
                Incoming track to merge
              </label>
              <select
                id="incoming-track"
                className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
              >
                {availableTracks.length === 0 ? <option value="">No available tracks</option> : null}
                {availableTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {formatTrackName(track)} ({track.instrument || 'Instrument'})
                  </option>
                ))}
              </select>

              {planError ? <p className="text-sm text-red-300">{planError}</p> : null}
              {mergePlan ? (
                <pre className="max-h-64 overflow-auto rounded-md bg-slate-950/80 p-3 text-xs text-emerald-100">
                  {JSON.stringify(mergePlan, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-slate-300">No merge plan yet.</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.aside
          className="panel h-fit"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
        >
          <h2 className="text-xl font-black text-white">Conductor Notes</h2>
          <p className="mt-4 leading-7 text-slate-300">{composition.conductor_notes}</p>

          <div className="mt-7">
            <p className="label">Needs</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(composition.missing_parts || []).map((part) => (
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200" key={part}>
                  {part}
                </span>
              ))}
            </div>
          </div>

          {composition.help_wanted_prompt ? (
            <div className="mt-7 rounded-lg border border-sky-300/20 bg-sky-950/20 p-4 text-sm leading-6 text-slate-200">
              {composition.help_wanted_prompt}
            </div>
          ) : null}
        </motion.aside>
      </div>
    </section>
  );
}
