import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { analyzeTrack, uploadTrack } from '../api/tracksApi';
import { extractAudioFeatures } from '../audio/audioFeatures';
import DropZone from '../components/upload/DropZone';
import TrackMetadataForm from '../components/upload/TrackMetadataForm';

const panelMotion = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(8px)' },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleSubmit(metadata) {
    setIsSubmitting(true);
    setUploadError('');

    if (selectedFile) {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      formData.append('piece_name', metadata.name);
      formData.append('user_description', metadata.description);
      formData.append('instrument', metadata.instrument);
      formData.append('genre', metadata.genre);

      try {
        const features = await extractAudioFeatures(selectedFile);
        formData.append('duration', String(features.durationSeconds));
        formData.append('bpm_detected', String(features.bpm));
        formData.append('dominant_freq_range', features.dominantFrequency.dominantRange);

        const uploadedTrack = await uploadTrack(formData);
        await analyzeTrack(uploadedTrack.id);
      } catch (error) {
        setIsSubmitting(false);
        setUploadError(error.response?.data?.error || error.message || 'Upload failed. Please try another audio file.');
        return;
      }
    }

    window.setTimeout(() => {
      navigate('/compositions');
    }, 1800);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_74%_8%,rgba(14,165,233,0.18),transparent_28%)]" />
      <motion.div
        className="pointer-events-none absolute left-[12%] top-[16%] h-36 w-36 rounded-full border border-sky-300/20"
        animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.46, 0.22] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[12%] right-[10%] h-52 w-52 rounded-full border border-violet-300/20"
        animate={{ scale: [1.08, 1, 1.08], opacity: [0.16, 0.36, 0.16] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl content-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="mb-5 text-sm font-semibold uppercase tracking-[0.32em] text-orchestra-300"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
          >
            OrchestrAI
          </motion.p>
          <motion.h1
            className="max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Upload a track. Let the AI conductor find your orchestra.
          </motion.h1>
          <motion.button
            className="btn-primary mt-9 text-base"
            onClick={() => setShowUpload(true)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Upload Your Track
          </motion.button>
        </motion.div>

        <motion.div
          className="panel relative overflow-hidden"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
          <AnimatePresence mode="wait">
            {!showUpload && !isSubmitting ? (
              <motion.div key="intro" {...panelMotion}>
              <h2 className="text-xl font-bold text-white">How it works</h2>
              <ol className="mt-6 space-y-5 text-slate-300">
                {[
                  'Upload a short audio clip',
                  'AI analyzes the mood, tempo, and instrument',
                  'Your track gets matched into collaborative compositions',
                ].map((step, index) => (
                <motion.li
                  className="flow-step"
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.32 }}
                >
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </motion.li>
                ))}
              </ol>
              </motion.div>
            ) : null}

            {showUpload && !isSubmitting ? (
              <motion.div key="upload" {...panelMotion}>
              <h2 className="text-2xl font-bold text-white">Upload Track</h2>
              <div className="mt-6">
                <DropZone selectedFile={selectedFile} onFileSelected={setSelectedFile} />
              </div>
              <TrackMetadataForm
                disabled={!selectedFile}
                submitLabel="Submit to Conductor"
                onSubmit={handleSubmit}
              />
              {uploadError ? (
                <p className="mt-4 rounded-md border border-red-400/20 bg-red-950/30 p-3 text-sm text-red-100">
                  {uploadError}
                </p>
              ) : null}
              </motion.div>
            ) : null}

            {isSubmitting ? (
              <motion.div
                key="submitting"
                className="flex min-h-[420px] flex-col items-center justify-center text-center"
                {...panelMotion}
              >
              <motion.div
                className="listening-ring mb-8"
                aria-hidden="true"
                animate={{ rotate: 360, scale: [0.96, 1.03, 0.96] }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
              <h2 className="text-3xl font-black text-white">The conductor is listening...</h2>
              <p className="mt-4 max-w-md text-slate-300">
                Analyzing your track and looking for compatible compositions.
              </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
