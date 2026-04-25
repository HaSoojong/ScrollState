import React from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import CompositionPage from './pages/CompositionPage';
import CommunityFeedPage from './pages/CommunityFeedPage';

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
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                Upload
              </NavLink>
              <NavLink
                to="/compositions"
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                Compositions
              </NavLink>
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/compositions" element={<CommunityFeedPage />} />
            <Route path="/feed" element={<Navigate to="/compositions" replace />} />
            <Route path="/composition/:id" element={<CompositionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
