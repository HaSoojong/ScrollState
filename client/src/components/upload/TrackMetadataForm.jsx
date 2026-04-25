import React, { useState } from 'react';
import { motion } from 'framer-motion';

const instruments = ['Guitar', 'Vocals', 'Drums', 'Bass', 'Other'];
const genres = ['Indie', 'Pop', 'Jazz', 'Rock', 'Other'];

export default function TrackMetadataForm({ disabled = false, submitLabel = 'Submit', onSubmit }) {
  const [metadata, setMetadata] = useState({
    name: '',
    instrument: 'Guitar',
    genre: 'Indie',
    description: '',
  });

  function updateField(field, value) {
    setMetadata((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(metadata);
  }

  return (
    <motion.form
      className="mt-6 space-y-5"
      onSubmit={handleSubmit}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.055 } },
      }}
    >
      <motion.label className="field" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <span>Name</span>
        <input
          value={metadata.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Track or artist name"
          required
        />
      </motion.label>

      <motion.label className="field" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <span>Instrument</span>
        <select value={metadata.instrument} onChange={(event) => updateField('instrument', event.target.value)}>
          {instruments.map((instrument) => (
            <option key={instrument}>{instrument}</option>
          ))}
        </select>
      </motion.label>

      <motion.label className="field" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <span>Genre</span>
        <select value={metadata.genre} onChange={(event) => updateField('genre', event.target.value)}>
          {genres.map((genre) => (
            <option key={genre}>{genre}</option>
          ))}
        </select>
      </motion.label>

      <motion.label className="field" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <span>Description</span>
        <textarea
          value={metadata.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Optional"
          rows={4}
        />
      </motion.label>

      <motion.button
        className="btn-primary w-full"
        type="submit"
        disabled={disabled}
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
      >
        {submitLabel}
      </motion.button>
    </motion.form>
  );
}
