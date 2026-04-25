import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function normalizeComposition(composition) {
  const analysis = composition.analysis || {};
  const rawTracks = composition.tracks || composition.instruments || composition.track_instruments || composition.track_ids || [];
  const tracks = Array.isArray(rawTracks)
    ? rawTracks.map((track) => (typeof track === 'string' ? track : track.instrument || track.piece_name || track.originalName))
    : [];
  const missingParts =
    composition.missingParts || composition.missing_parts || composition.needs || analysis.missing_parts || [];

  return {
    id: composition.id || composition._id || composition.title,
    title: composition.title || composition.piece_name || composition.name || 'Untitled Composition',
    genre: composition.genre || analysis.genre || 'Collaborative',
    bpm: composition.bpm || analysis.bpm || 96,
    mood: composition.mood || analysis.mood || 'Evolving',
    tracks: tracks.filter(Boolean),
    missingParts: Array.isArray(missingParts) ? missingParts : [],
    conductorNote:
      composition.conductorNote ||
      composition.conductor_notes ||
      composition.conductor_note ||
      'The conductor found a promising blend and is listening for one more part to complete the arrangement.',
  };
}

function WaveformBars({ seed = 0 }) {
  const heights = [32, 54, 72, 44, 66, 88, 58, 36, 76, 50, 70, 42, 82, 62, 38, 68, 48, 78];

  return (
    <div className="waveform" aria-label="Small waveform visual">
      {heights.map((height, index) => (
        <motion.span
          key={`${height}-${index}`}
          style={{ height: `${Math.max(24, (height + seed * 9 + index * 3) % 76)}%` }}
          initial={{ scaleY: 0.3, opacity: 0.45 }}
          animate={{ scaleY: [0.45, 1, 0.62] }}
          transition={{
            duration: 1.3 + (index % 4) * 0.16,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: index * 0.025,
          }}
        />
      ))}
    </div>
  );
}

export default function CompositionCard({ composition, index = 0 }) {
  const item = normalizeComposition(composition);

  return (
    <motion.article
      className="card flex min-h-[420px] flex-col"
      layout
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <div>
        <h2 className="text-2xl font-black text-white">{item.title}</h2>
        <p className="mt-2 text-sm font-medium text-slate-400">
          {item.genre} · {item.bpm} BPM · {item.mood}
        </p>
      </div>

      <WaveformBars seed={index} />

      <div className="space-y-5 text-sm">
        <div>
          <p className="label">Current tracks:</p>
          <p className="mt-1 text-slate-200">{item.tracks.length ? item.tracks.join(' · ') : 'Awaiting tracks'}</p>
        </div>
        <div>
          <p className="label">Needs:</p>
          <p className="mt-1 text-slate-200">
            {item.missingParts.length ? item.missingParts.join(' · ') : 'Open collaboration'}
          </p>
        </div>
        <div>
          <p className="label">Conductor note:</p>
          <p className="mt-1 leading-6 text-slate-300">"{item.conductorNote}"</p>
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-7">
        <motion.button className="btn-secondary flex-1" type="button" whileTap={{ scale: 0.97 }}>
          Play
        </motion.button>
        <motion.div className="flex flex-1" whileTap={{ scale: 0.97 }}>
          <Link className="btn-primary w-full text-center" to={`/composition/${encodeURIComponent(item.id)}`}>
            Join
          </Link>
        </motion.div>
      </div>
    </motion.article>
  );
}
