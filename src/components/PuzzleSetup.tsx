/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Difficulty, PuzzleSettings } from '../types';
import { PRESET_IMAGES } from '../presets';
import { motion } from 'motion/react';

interface PuzzleSetupProps {
  onStart: (imageUrl: string, settings: PuzzleSettings) => void;
}

export default function PuzzleSetup({ onStart }: PuzzleSetupProps) {
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0].url);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('facil');
  const [customRows, setCustomRows] = useState<number>(3);
  const [customCols, setCustomCols] = useState<number>(3);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [guideOpacity, setGuideOpacity] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDifficultyChange = (level: Difficulty) => {
    setDifficulty(level);
    if (level === 'facil') {
      setCustomRows(3);
      setCustomCols(3);
    } else if (level === 'medio') {
      setCustomRows(4);
      setCustomCols(4);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('A imagem é muito grande. Escolha uma imagem de até 10MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setSelectedImage(e.target.result);
        setInputUrl('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setSelectedImage(inputUrl.trim());
      setUploadError('');
    }
  };

  const handleStartGame = () => {
    let rows = 3;
    let cols = 3;

    if (difficulty === 'facil') {
      rows = 3;
      cols = 3;
    } else if (difficulty === 'medio') {
      rows = 4;
      cols = 4;
    }

    onStart(selectedImage, {
      difficulty,
      rows,
      cols,
      showGridLines,
      showNumbers,
      guideOpacity,
    });
  };

  return (
    <div id="puzzle-setup-container" className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Título e introdução */}
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Gerador de quebra-cabeça
          </h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Insira um link.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Lado Esquerdo: Carregamento de Imagem (7 Colunas) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <ImageIcon size={18} className="text-sky-600" /> 1. Escolha a Imagem
              </h3>
              
              {/* Abas e Métodos de Upload */}
              <div className="space-y-4">
                
                {/* Colagem de URL */}
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <LinkIcon size={16} />
                    </span>
                    <input
                      type="url"
                      placeholder="Ou cole a URL de qualquer imagem da internet..."
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 transition-all shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-sm"
                  >
                    Carregar
                  </button>
                </form>

                {uploadError && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Galeria de Modelos Prontos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelos de Imagem Disponíveis</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setSelectedImage(img.url);
                      setInputUrl('');
                      setUploadError('');
                    }}
                    className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer ${
                      selectedImage === img.url
                        ? 'border-sky-500 ring-2 ring-sky-500/20 scale-[0.98]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={img.url}
                        alt={img.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-white/95 text-[9px] text-sky-700 px-1.5 py-0.5 rounded-md font-semibold border border-slate-200 shadow-sm">
                        {img.category}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50/50 flex-grow flex flex-col justify-between border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1">{img.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Por {img.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lado Direito: Ajustes e Configurações (5 Colunas) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Nível de Dificuldade */}
              <div>
                <h3 className="text-md font-semibold text-slate-800 mb-3">
                  2. Dificuldade
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['facil', 'medio'] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDifficultyChange(level)}
                      className={`py-3 px-2 rounded-xl border text-sm font-semibold capitalize transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        difficulty === level
                          ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-md shadow-sky-100'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>
                        {level === 'facil' ? 'Fácil' : 'Médio'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        {level === 'facil' ? '3x3 (9 pçs)' : '4x4 (16 pçs)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opções de Auxílio de Partida */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  3. Opções Iniciais de Ajuda
                </h3>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={showGridLines}
                      onChange={(e) => setShowGridLines(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded text-sky-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700">Mostrar bordas das células</span>
                      <span className="text-[10px] text-slate-400">Desenha linhas pontilhadas como guia no tabuleiro</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Visualização Prévia da Imagem Selecionada */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex gap-4 items-center bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Imagem Selecionada</p>
                  <p className="text-sm font-semibold text-slate-700 truncate mt-0.5">
                    URL Personalizada / Modelo
                  </p>
                </div>
              </div>

              {/* Botão de Começar */}
              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer text-center text-md"
              >
                Começar Atividade 🎮
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
