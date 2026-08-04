/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import PuzzleSetup from './components/PuzzleSetup';
import PuzzleBoard from './components/PuzzleBoard';
import { PuzzleSettings } from './types';

export default function App() {
  const [view, setView] = useState<'setup' | 'board'>('setup');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [settings, setSettings] = useState<PuzzleSettings | null>(null);

  const handleStartPuzzle = (url: string, newSettings: PuzzleSettings) => {
    setImageUrl(url);
    setSettings(newSettings);
    setView('board');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-sky-100 selection:text-sky-900">

      {/* Main Content Area */}
      <main className="flex-grow py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {view === 'setup' ? (
            <PuzzleSetup onStart={handleStartPuzzle} />
          ) : (
            <PuzzleBoard
              imageUrl={imageUrl}
              settings={settings!}
              onBack={() => setView('setup')}
            />
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="py-4 px-4 text-center text-xs text-slate-400">
      </footer>
    </div>
  );
}

