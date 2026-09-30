/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Eye, Download, Check, Sparkles, Code2, Copy, X } from 'lucide-react';
import { PuzzlePiece, PuzzleSettings } from '../types';
import { generateStandaloneHTML } from './StandaloneTemplate';
import { motion, AnimatePresence } from 'motion/react';

interface PuzzleBoardProps {
  imageUrl: string;
  settings: PuzzleSettings;
  onBack: () => void;
}

export default function PuzzleBoard({ imageUrl, settings, onBack }: PuzzleBoardProps) {
  const { rows, cols } = settings;
  const totalPieces = rows * cols;

  // Estados do Jogo
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Modos e Controles Visuais
  const [showGuide, setShowGuide] = useState<boolean>(settings.showGuideImage ?? true);
  const [showNumbers, setShowNumbers] = useState<boolean>(settings.showNumbers);
  const [aspectRatio, setAspectRatio] = useState<string>('1/1');
  const [aspectRatioValue, setAspectRatioValue] = useState<number>(1);
  const [showEmbedModal, setShowEmbedModal] = useState<boolean>(false);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);

  // Estados de Interação
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);
  const [dragOverCellId, setDragOverCellId] = useState<string | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar proporção da imagem para ajustar o tabuleiro proporcionalmente
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const w = img.naturalWidth || 1;
      const h = img.naturalHeight || 1;
      const ratio = w / h;
      setAspectRatioValue(ratio);
      
      if (Math.abs(ratio - 1) < 0.15) {
        setAspectRatio('1/1');
      } else if (Math.abs(ratio - 1.77) < 0.2) {
        setAspectRatio('16/9');
      } else if (Math.abs(ratio - 1.33) < 0.15) {
        setAspectRatio('4/3');
      } else if (Math.abs(ratio - 0.75) < 0.15) {
        setAspectRatio('3/4');
      } else if (Math.abs(ratio - 0.56) < 0.2) {
        setAspectRatio('9/16');
      } else {
        setAspectRatio(`${w}/${h}`);
      }
    };
  }, [imageUrl]);

  // Inicializar quebra-cabeça
  useEffect(() => {
    resetPuzzle();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rows, cols, imageUrl]);

  // Iniciar timer na primeira interação
  const startTimer = () => {
    if (gameStarted || isCompleted) return;
    setGameStarted(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
  };

  // Funções de Áudio Sintetizado offline (Web Audio API)
  const playTone = (freqs: number[], duration: number, type: OscillatorType = 'sine') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + duration);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + duration);
      });
    } catch (e) {
      // Ignora erro de autoplay
    }
  };

  const playSnapSound = () => playTone([587.33, 880], 0.15, 'sine');
  const playVictorySound = () => playTone([261.63, 329.63, 392.00, 523.25], 0.45, 'triangle');

  // Embaralhar e reiniciar
  const resetPuzzle = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSecondsElapsed(0);
    setMovesCount(0);
    setMatchedCount(0);
    setGameStarted(false);
    setIsCompleted(false);
    setSelectedPieceId(null);
    setDraggedPieceId(null);

    // Criar peças
    const newPieces: PuzzlePiece[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pieceId = `piece-${r}-${c}`;
        const posX = cols > 1 ? (c / (cols - 1)) * 100 : 0;
        const posY = rows > 1 ? (r / (rows - 1)) * 100 : 0;

        newPieces.push({
          id: pieceId,
          correctRow: r,
          correctCol: c,
          currentCell: null,
          style: {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
            backgroundPosition: `${posX}% ${posY}%`,
          },
        });
      }
    }

    const shuffledPieces = [...newPieces];
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledPieces[i];
      shuffledPieces[i] = shuffledPieces[j];
      shuffledPieces[j] = temp;
    }

    setPieces(shuffledPieces);
  };

  // Resolver quebra-cabeça automaticamente para teste
  const autoSolve = () => {
    startTimer();
    const solved = pieces.map((p) => ({
      ...p,
      currentCell: `slot-${p.correctRow}-${p.correctCol}`,
    }));
    setPieces(solved);
    setMatchedCount(totalPieces);
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    playVictorySound();
  };

  // --- LÓGICA DE MOVIMENTO E DRAG & DROP ---
  const handleDragStart = (id: string) => {
    startTimer();
    setDraggedPieceId(id);
    setSelectedPieceId(id);
  };

  const handleDropOnCell = (cellId: string) => {
    const pieceId = draggedPieceId;
    if (!pieceId) return;

    movePieceToCell(pieceId, cellId);
    setDraggedPieceId(null);
    setDragOverCellId(null);
  };

  const handleDropOnPool = () => {
    const pieceId = draggedPieceId;
    if (!pieceId) return;

    movePieceToPool(pieceId);
    setDraggedPieceId(null);
    setDragOverCellId(null);
  };

  const movePieceToCell = (pieceId: string, cellId: string) => {
    setPieces((prevPieces) => {
      const occupant = prevPieces.find((p) => p.currentCell === cellId);
      
      if (occupant) {
        const [_, occupantRow, occupantCol] = cellId.split('-').map(Number);
        if (occupant.correctRow === occupantRow && occupant.correctCol === occupantCol) {
          return prevPieces;
        }
      }

      const updated = prevPieces.map((p) => {
        if (p.id === pieceId) {
          return { ...p, currentCell: cellId };
        }
        if (occupant && p.id === occupant.id) {
          return { ...p, currentCell: null };
        }
        return p;
      });

      let matches = 0;
      updated.forEach((p) => {
        if (p.currentCell === `slot-${p.correctRow}-${p.correctCol}`) {
          matches++;
        }
      });

      setMovesCount((m) => m + 1);
      
      const currentPiece = updated.find((p) => p.id === pieceId);
      const [_, targetRow, targetCol] = cellId.split('-').map(Number);
      if (currentPiece && currentPiece.correctRow === targetRow && currentPiece.correctCol === targetCol) {
        playSnapSound();
      }

      setMatchedCount(matches);

      if (matches === totalPieces) {
        setIsCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playVictorySound();
      }

      return updated;
    });
  };

  const movePieceToPool = (pieceId: string) => {
    setPieces((prevPieces) => {
      const updated = prevPieces.map((p) => {
        if (p.id === pieceId) {
          return { ...p, currentCell: null };
        }
        return p;
      });

      let matches = 0;
      updated.forEach((p) => {
        if (p.currentCell === `slot-${p.correctRow}-${p.correctCol}`) {
          matches++;
        }
      });

      setMovesCount((m) => m + 1);
      setMatchedCount(matches);
      return updated;
    });
  };

  // --- INTERAÇÃO POR CLIQUE ---
  const handlePieceClick = (e: React.MouseEvent, pieceId: string, isPieceLocked: boolean) => {
    e.stopPropagation();
    if (isPieceLocked || isCompleted) return;
    
    startTimer();

    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null);
    } else {
      setSelectedPieceId(pieceId);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (isCompleted) return;
    const targetCellId = `slot-${row}-${col}`;

    if (selectedPieceId) {
      movePieceToCell(selectedPieceId, targetCellId);
      setSelectedPieceId(null);
    }
  };

  const handlePoolClick = () => {
    if (selectedPieceId && !isCompleted) {
      movePieceToPool(selectedPieceId);
      setSelectedPieceId(null);
    }
  };

  // --- GERAÇÃO E DOWNLOAD STANDALONE HTML ---
  const getGeneratedCode = () => {
    let label = 'Fácil';
    if (settings.difficulty === 'facil') label = 'Fácil';
    if (settings.difficulty === 'medio') label = 'Médio';

    const customMsg = settings.showCompletionMessage && settings.completionMessage?.trim()
      ? settings.completionMessage.trim()
      : undefined;

    return generateStandaloneHTML(
      imageUrl,
      rows,
      cols,
      label,
      showNumbers,
      aspectRatioValue,
      settings.showGuideImage,
      customMsg
    );
  };

  const handleDownloadStandalone = () => {
    const htmlContent = getGeneratedCode();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quebra_cabeca_${settings.difficulty}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const iframeEmbedCode = `<iframe src="${currentOrigin}" width="100%" height="720" style="border:none; border-radius:16px; overflow:hidden; max-width:100%; box-shadow:0 4px 12px rgba(0,0,0,0.08);" allow="autoplay" loading="lazy"></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div id="puzzle-board-container" className="space-y-6 max-w-5xl mx-auto">
      
      {/* Barra de navegação e botões superiores */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar para Ajustes
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Resolver (Ajuda/Demonstração) */}
          <button
            onClick={autoSolve}
            disabled={isCompleted}
            className="px-3.5 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 rounded-xl border border-indigo-100 text-xs font-semibold transition-all cursor-pointer"
            title="Preencher automaticamente para testes"
          >
            💡 Resolver Automaticamente
          </button>

          {/* Botão Mostrar/Ocultar Imagem de Guia */}
          {settings.showGuideImage && (
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showGuide
                  ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye size={14} /> Imagem de Guia
            </button>
          )}

          {/* Botão Reiniciar */}
          <button
            onClick={resetPuzzle}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> Reiniciar
          </button>

          {/* Botão Código Embed */}
          <button
            onClick={() => setShowEmbedModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold border border-sky-200 transition-all cursor-pointer"
          >
            <Code2 size={14} /> Código Embed
          </button>

          {/* Botão Exportar Standalone */}
          <button
            onClick={handleDownloadStandalone}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download size={14} /> Baixar HTML Standalone
          </button>
        </div>
      </div>

      {/* Grid Principal do Jogo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Lado Esquerdo: Tabuleiro do Quebra-Cabeça (7 Colunas) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          <div className="relative w-full max-w-[480px] bg-white border border-slate-200 p-3 rounded-2xl shadow-md">
            
            {/* O Tabuleiro de Grid */}
            <div
              id="game-board-grid"
              className="grid w-full relative overflow-hidden bg-slate-100 rounded-xl"
              style={{
                aspectRatio,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => {
                  const cellId = `slot-${r}-${c}`;
                  const matchedPiece = pieces.find((p) => p.currentCell === cellId);
                  const isCorrect = matchedPiece
                    ? matchedPiece.correctRow === r && matchedPiece.correctCol === c
                    : false;

                  return (
                    <div
                      key={cellId}
                      onClick={() => handleCellClick(r, c)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!isCorrect) setDragOverCellId(cellId);
                      }}
                      onDragLeave={() => setDragOverCellId(null)}
                      onDrop={(e) => handleDropOnCell(cellId)}
                      className={`relative w-full h-full transition-all duration-200 flex items-center justify-center border ${
                        settings.showGridLines ? 'border-dashed border-slate-300' : 'border-transparent'
                      } ${
                        dragOverCellId === cellId ? 'border-sky-500 bg-sky-500/10' : 'bg-slate-200/20'
                      }`}
                    >
                      {matchedPiece && (
                        <div
                          draggable={!isCorrect}
                          onDragStart={() => handleDragStart(matchedPiece.id)}
                          onDragEnd={() => setDraggedPieceId(null)}
                          onClick={(e) => handlePieceClick(e, matchedPiece.id, isCorrect)}
                          style={matchedPiece.style}
                          className={`absolute inset-0 bg-no-repeat transition-transform ${
                            isCorrect 
                              ? 'piece-locked cursor-not-allowed border border-emerald-500/20 shadow-inner' 
                              : 'cursor-grab active:cursor-grabbing hover:scale-[0.99] border border-slate-200'
                          } ${
                            selectedPieceId === matchedPiece.id ? 'outline-3 outline-sky-400 outline-offset-[-3px] ring-4 ring-sky-500/20 scale-[0.98] shadow-lg' : ''
                          }`}
                        >
                          {isCorrect && (
                            <div className="absolute bottom-1 right-1 bg-emerald-500/95 text-white w-4.5 h-4.5 flex items-center justify-center rounded-full shadow border border-emerald-600/20 pointer-events-none">
                              <Check size={11} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Imagem de Guia em Marca d'Água por Baixo */}
            <div
              className="absolute inset-3 pointer-events-none rounded-xl bg-cover bg-center transition-opacity duration-300"
              style={{
                backgroundImage: `url(${imageUrl})`,
                aspectRatio,
                opacity: showGuide ? 0.25 : 0,
              }}
            />
          </div>

          {/* Mensagem de Vitória Embutida abaixo do quebra-cabeça */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="w-full max-w-[480px] bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm text-center space-y-3 overflow-hidden mt-2"
              >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800">Parabéns!</h3>
                  <p className="text-emerald-700 text-xs font-semibold whitespace-pre-wrap">
                    {settings.showCompletionMessage && settings.completionMessage?.trim()
                      ? settings.completionMessage.trim()
                      : 'Você montou o quebra-cabeça com sucesso!'}
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={resetPuzzle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Jogar Novamente
                  </button>
                  <button
                    onClick={handleDownloadStandalone}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-[11px] transition-all border border-slate-200 cursor-pointer shadow-xs"
                  >
                    Baixar HTML
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Lado Direito: Estoque de Peças Livres e Opções Rápidas (5 Colunas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnPool}
              onClick={handlePoolClick}
              className="flex flex-wrap gap-2.5 p-4 min-h-[160px] max-h-[300px] overflow-y-auto bg-slate-50 rounded-2xl border border-slate-200 justify-start content-start items-start shadow-inner"
            >
              {pieces.filter((p) => p.currentCell === null).length === 0 ? (
                <div className="text-center p-6 space-y-2 w-full">
                  <span className="text-2xl">🎉</span>
                  <p className="text-xs font-semibold text-slate-500">Todas as peças estão no tabuleiro!</p>
                  <p className="text-[10px] text-slate-400">Ordene-as para resolver o desafio.</p>
                </div>
              ) : (
                pieces
                  .filter((p) => p.currentCell === null)
                  .map((p) => (
                    <motion.div
                      key={p.id}
                      layoutId={p.id}
                      draggable
                      onDragStart={() => handleDragStart(p.id)}
                      onDragEnd={() => setDraggedPieceId(null)}
                      onClick={(e) => handlePieceClick(e, p.id, false)}
                      style={{
                        ...p.style,
                        width: '64px',
                        height: '64px',
                      }}
                      className={`relative bg-no-repeat rounded-xl cursor-grab active:cursor-grabbing shadow-md border border-slate-200 overflow-hidden flex-shrink-0 transition-transform hover:scale-105 duration-200 ${
                        selectedPieceId === p.id
                          ? 'outline-3 outline-sky-400 outline-offset-[-3px] ring-4 ring-sky-500/20 scale-[0.98]'
                          : ''
                      }`}
                    >
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Código Embed com Isolamento */}
      <AnimatePresence>
        {showEmbedModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold">
                    <Code2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Código de Incorporação (Embed Seguro)</h3>
                    <p className="text-xs text-slate-500">100% isolado — seguro para Google Sites, Moodle, WordPress, Notion, etc.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Informação sobre Isolamento */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600" /> Isolamento Completo Garantido
                </p>
                <p className="text-emerald-700 leading-relaxed">
                  O código HTML e os scripts utilizam escopo fechado (IIFE), identificadores únicos e estilos CSS encapsulados. Ele não conflita com os scripts do site hospedeiro e nem é quebrado por estilos externos.
                </p>
              </div>

              {/* Opção 1: iFrame Embed */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Opção 1: Tag iFrame (Recomendado para CMS, Moodle, Google Sites)</span>
                  {copiedEmbed && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={12} /> Copiado!
                    </span>
                  )}
                </label>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto select-all leading-relaxed">
                    {iframeEmbedCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(iframeEmbedCode)}
                    className="absolute right-2 top-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Copy size={13} /> Copiar
                  </button>
                </div>
              </div>

              {/* Opção 2: Baixar arquivo HTML autônomo */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Ou salve o arquivo completo para rodar offline:</span>
                <button
                  onClick={handleDownloadStandalone}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={14} /> Baixar HTML Isolado
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
