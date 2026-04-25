import React, { useRef, useState } from 'react';

export default function DropZone({ selectedFile, onFileSelected }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectFile(file) {
    if (file && file.type.startsWith('audio/')) {
      onFileSelected(file);
    }
  }

  return (
    <div
      className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        selectFile(event.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      <p className="text-lg font-bold text-white">{selectedFile ? selectedFile.name : 'Drag audio file here'}</p>
      <p className="mt-2 text-sm text-slate-400">MP3, WAV, M4A, or any browser-readable audio file</p>
    </div>
  );
}
