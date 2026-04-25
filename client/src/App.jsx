import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import CompositionPage from './pages/CompositionPage';
import CommunityFeedPage from './pages/CommunityFeedPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/compositions" element={<CommunityFeedPage />} />
          <Route path="/feed" element={<Navigate to="/compositions" replace />} />
          <Route path="/composition/:id" element={<CompositionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function AnimatedNavLink({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-link relative ${isActive ? 'nav-link-active' : ''}`}>
      {({ isActive }) => (
        <>
          <span className="relative z-10">{children}</span>
          {isActive ? (
            <motion.span
              layoutId="active-nav-pill"
              className="absolute inset-0 rounded-md bg-white/10"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-orchestra-950 text-slate-100">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-orchestra-950/85 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <NavLink to="/" className="text-lg font-bold tracking-wide text-white">
              OrchestrAI
            </NavLink>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <AnimatedNavLink to="/">
                Upload
              </AnimatedNavLink>
              <AnimatedNavLink to="/compositions">
                Compositions
              </AnimatedNavLink>
            </div>
          </nav>
        </header>

        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
