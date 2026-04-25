import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateComposition, getAllCompositions } from '../api/compositionsApi';
import CompositionCard from '../components/feed/CompositionCard';

const fallbackCompositions = [
  {
    id: 'midnight-e-minor',
    title: 'Midnight in E Minor',
    genre: 'Indie Folk',
    bpm: 92,
    mood: 'Melancholy',
    tracks: ['Guitar', 'Vocals', 'Drums'],
    missingParts: ['Bass line', 'Harmony vocals'],
    conductorNote:
      'Soft vocals fit well over the guitar, but the piece needs a bass line to feel complete.',
  },
  {
    id: 'neon-rain',
    title: 'Neon Rain',
    genre: 'Synth Pop',
    bpm: 110,
    mood: 'Energetic',
    tracks: ['Synth', 'Drums', 'Vocals'],
    missingParts: ['Lead guitar'],
    conductorNote:
      'The rhythm section has a bright pulse. A melodic guitar hook would give the chorus a sharper lift.',
  },
  {
    id: 'blue-hour-transit',
    title: 'Blue Hour Transit',
    genre: 'Jazz',
    bpm: 78,
    mood: 'Nocturnal',
    tracks: ['Piano', 'Brush drums', 'Upright bass'],
    missingParts: ['Muted trumpet', 'Ambient texture'],
    conductorNote:
      'The trio leaves space in the upper register, making it a strong match for a restrained lead voice.',
  },
];

export default function CommunityFeedPage() {
  const [compositions, setCompositions] = useState(fallbackCompositions);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getAllCompositions()
      .then((items) => {
        if (isMounted && Array.isArray(items) && items.length > 0) {
          setCompositions(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCompositions(fallbackCompositions);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const newComposition = await generateComposition();
      if (newComposition) {
        setCompositions((current) => [newComposition, ...current]);
      }
    } catch (error) {
      console.warn('Composition generation backend is unavailable.', error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <motion.div
        className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orchestra-300">
            AI studio
          </p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Compositions</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? 'Generating...' : 'Generate New Matches'}
          </motion.button>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="btn-secondary">
            Upload Another Track
          </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" layout>
        <AnimatePresence initial={false}>
          {compositions.map((composition, index) => (
            <CompositionCard key={composition.id || composition.title} composition={composition} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
