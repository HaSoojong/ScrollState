import React, { useState } from 'react';

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
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <label className="field">
        <span>Name</span>
        <input
          value={metadata.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Track or artist name"
          required
        />
      </label>

      <label className="field">
        <span>Instrument</span>
        <select value={metadata.instrument} onChange={(event) => updateField('instrument', event.target.value)}>
          {instruments.map((instrument) => (
            <option key={instrument}>{instrument}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Genre</span>
        <select value={metadata.genre} onChange={(event) => updateField('genre', event.target.value)}>
          {genres.map((genre) => (
            <option key={genre}>{genre}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          value={metadata.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Optional"
          rows={4}
        />
      </label>

      <button className="btn-primary w-full" type="submit" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}
