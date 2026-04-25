import React from 'react';
import { Link } from 'react-router-dom';

function normalizeComposition(composition) {
  const analysis = composition.analysis || {};
  const tracks = composition.tracks || composition.instruments || composition.track_instruments || [];
  const missingParts =
    composition.missingParts || composition.missing_parts || composition.needs || analysis.missing_parts || [];

  return {
    id: composition.id || composition._id || composition.title,
    title: composition.title || composition.piece_name || composition.name || 'Untitled Composition',
    genre: composition.genre || analysis.genre || 'Collaborative',
    bpm: composition.bpm || analysis.bpm || 96,
    mood: composition.mood || analysis.mood || 'Evolving',
    tracks: Array.isArray(tracks) ? tracks : [],
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
        <span
          key={`${height}-${index}`}
          style={{ height: `${Math.max(24, (height + seed * 9 + index * 3) % 76)}%` }}
        />
      ))}
    </div>
  );
}

export default function CompositionCard({ composition, index = 0 }) {
  const item = normalizeComposition(composition);

  return (
    <article className="card flex min-h-[420px] flex-col">
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
        <button className="btn-secondary flex-1" type="button">
          Play
        </button>
        <Link className="btn-primary flex-1 text-center" to={`/composition/${encodeURIComponent(item.id)}`}>
          Join
        </Link>
      </div>
    </article>
  );
}
