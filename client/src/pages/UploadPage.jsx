import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadTrack } from '../api/tracksApi';
import DropZone from '../components/upload/DropZone';
import TrackMetadataForm from '../components/upload/TrackMetadataForm';

export default function UploadPage() {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(metadata) {
    setIsSubmitting(true);

    if (selectedFile) {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      Object.entries(metadata).forEach(([key, value]) => formData.append(key, value));

      try {
        await uploadTrack(formData);
      } catch (error) {
        console.warn('Upload backend is unavailable; continuing demo flow.', error);
      }
    }

    window.setTimeout(() => {
      navigate('/compositions');
    }, 1800);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_74%_8%,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl content-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.32em] text-orchestra-300">
            OrchestrAI
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Upload a track. Let the AI conductor find your orchestra.
          </h1>
          <button className="btn-primary mt-9 text-base" onClick={() => setShowUpload(true)}>
            Upload Your Track
          </button>
        </div>

        <div className="panel">
          {!showUpload && !isSubmitting ? (
            <>
              <h2 className="text-xl font-bold text-white">How it works</h2>
              <ol className="mt-6 space-y-5 text-slate-300">
                <li className="flow-step">
                  <span>1</span>
                  <p>Upload a short audio clip</p>
                </li>
                <li className="flow-step">
                  <span>2</span>
                  <p>AI analyzes the mood, tempo, and instrument</p>
                </li>
                <li className="flow-step">
                  <span>3</span>
                  <p>Your track gets matched into collaborative compositions</p>
                </li>
              </ol>
            </>
          ) : null}

          {showUpload && !isSubmitting ? (
            <div>
              <h2 className="text-2xl font-bold text-white">Upload Track</h2>
              <div className="mt-6">
                <DropZone selectedFile={selectedFile} onFileSelected={setSelectedFile} />
              </div>
              <TrackMetadataForm
                disabled={!selectedFile}
                submitLabel="Submit to Conductor"
                onSubmit={handleSubmit}
              />
            </div>
          ) : null}

          {isSubmitting ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="listening-ring mb-8" aria-hidden="true" />
              <h2 className="text-3xl font-black text-white">The conductor is listening...</h2>
              <p className="mt-4 max-w-md text-slate-300">
                Analyzing your track and looking for compatible compositions.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
