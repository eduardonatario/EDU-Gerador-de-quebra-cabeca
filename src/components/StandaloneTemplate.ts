/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gera um arquivo HTML autônomo (standalone) completamente isolado para o quebra-cabeça.
 * Não polui o escopo global (JS em IIFE estrita), possui CSS 100% encapsulado e com prefixos únicos,
 * não depende de bibliotecas externas conflitantes (como Tailwind global CDN que sobrescreveria estilos de sites hospedeiros),
 * e funciona perfeitamente tanto como arquivo independente quanto embutido via <iframe> ou direto no DOM de LMS/CMS.
 */
export function generateStandaloneHTML(
  imageUrl: string,
  rows: number,
  cols: number,
  difficultyLabel: string,
  showNumbersByDefault: boolean,
  aspectRatio: number,
  showGuideImage: boolean = true,
  completionMessage?: string
): string {
  const uniqueId = 'edupz_' + Math.random().toString(36).substring(2, 9);
  const safeCompletionMsg = completionMessage && completionMessage.trim()
    ? completionMessage.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    : 'Você montou o quebra-cabeça com sucesso!';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quebra-Cabeça</title>
  <style>
    /* Reset e Isolamento Total de Estilos para Não Afetar e Não Ser Afetado por Outros Códigos */
    #${uniqueId}-container,
    #${uniqueId}-container * {
      box-sizing: border-box !important;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
    }

    #${uniqueId}-container {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      background-color: #f8fafc;
      color: #1e293b;
    }

    /* Confetti Canvas */
    #${uniqueId}-confetti-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      display: none;
    }

    /* Grid do Layout */
    .${uniqueId}-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      width: 100%;
      align-items: start;
    }

    @media (min-width: 860px) {
      .${uniqueId}-layout {
        grid-template-columns: 7fr 5fr;
      }
    }

    /* Coluna do Tabuleiro */
    .${uniqueId}-board-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .${uniqueId}-board-box {
      position: relative;
      width: 100%;
      max-width: 480px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }

    .${uniqueId}-board-grid {
      display: grid;
      width: 100%;
      position: relative;
      overflow: hidden;
      background-color: #f1f5f9;
      border-radius: 10px;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    }

    .${uniqueId}-image-guide {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      bottom: 12px;
      pointer-events: none;
      border-radius: 10px;
      background-size: cover;
      background-position: center;
      transition: opacity 0.3s ease;
      opacity: 0;
    }

    /* Slots do Tabuleiro */
    .${uniqueId}-slot {
      position: relative;
      border: 1px dashed #cbd5e1;
      background-color: rgba(241, 245, 249, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, border-color 0.2s;
      width: 100%;
      height: 100%;
    }

    .${uniqueId}-slot.${uniqueId}-drag-over {
      border-color: #38bdf8 !important;
      background-color: rgba(56, 189, 248, 0.15) !important;
    }

    /* Coluna Lateral (Estoque de Peças e Controles) */
    .${uniqueId}-side-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .${uniqueId}-panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .${uniqueId}-pool {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 12px;
      min-height: 140px;
      max-height: 280px;
      overflow-y: auto;
      background-color: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      align-items: flex-start;
      align-content: flex-start;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    /* Peças */
    .${uniqueId}-piece {
      position: relative;
      background-repeat: no-repeat;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      overflow: hidden;
    }

    .${uniqueId}-piece:hover {
      transform: scale(1.04);
    }

    .${uniqueId}-piece:active {
      cursor: grabbing;
    }

    .${uniqueId}-piece.${uniqueId}-dragging {
      opacity: 0.5;
      transform: scale(0.95);
    }

    .${uniqueId}-piece.${uniqueId}-selected {
      outline: 3px solid #0284c7 !important;
      outline-offset: -2px;
      transform: scale(0.97);
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.25) !important;
    }

    .${uniqueId}-piece.${uniqueId}-locked {
      cursor: not-allowed !important;
      pointer-events: none !important;
      outline: none !important;
      border-color: rgba(16, 185, 129, 0.3) !important;
      transform: none !important;
    }

    .${uniqueId}-num-badge {
      position: absolute;
      bottom: 3px;
      right: 3px;
      background-color: rgba(255, 255, 255, 0.95);
      color: #1e293b;
      font-size: 10px;
      font-weight: 700;
      font-family: monospace !important;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid #cbd5e1;
      pointer-events: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    /* Botões e Controles */
    .${uniqueId}-btn-guide {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 14px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .${uniqueId}-btn-guide:hover {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
    }

    .${uniqueId}-guide-switch {
      width: 36px;
      height: 20px;
      background-color: #cbd5e1;
      border-radius: 10px;
      display: flex;
      align-items: center;
      padding: 2px;
      transition: background-color 0.25s;
    }

    .${uniqueId}-guide-switch-active {
      background-color: #0284c7;
    }

    .${uniqueId}-guide-dot {
      width: 16px;
      height: 16px;
      background-color: #ffffff;
      border-radius: 50%;
      transition: transform 0.25s;
      transform: translateX(0);
    }

    .${uniqueId}-guide-dot-active {
      transform: translateX(16px);
    }

    .${uniqueId}-btn-primary {
      width: 100%;
      padding: 12px 16px;
      background-color: #059669;
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
      transition: background-color 0.2s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .${uniqueId}-btn-primary:hover {
      background-color: #047857;
    }

    .${uniqueId}-btn-primary:active {
      transform: scale(0.99);
    }

    /* Banner de Vitória */
    .${uniqueId}-victory-banner {
      display: none;
      width: 100%;
      max-width: 480px;
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 16px;
      padding: 18px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      animation: ${uniqueId}-fade-in 0.4s ease-out;
    }

    .${uniqueId}-victory-icon {
      width: 40px;
      height: 40px;
      background-color: #d1fae5;
      color: #059669;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px auto;
      font-size: 20px;
    }

    .${uniqueId}-victory-title {
      font-size: 17px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 6px;
    }

    .${uniqueId}-victory-text {
      font-size: 13px;
      font-weight: 500;
      color: #047857;
      white-space: pre-wrap;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .${uniqueId}-instruction {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      font-weight: 500;
    }

    @keyframes ${uniqueId}-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ${uniqueId}-pulse-success {
      0%, 100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); }
      50% { box-shadow: 0 0 14px 3px rgba(34, 197, 94, 0.6); }
    }

    .${uniqueId}-snap-success {
      animation: ${uniqueId}-pulse-success 0.5s ease-out;
    }
  </style>
</head>
<body>

  <!-- Container Isolado da Aplicação -->
  <div id="${uniqueId}-container">
    <canvas id="${uniqueId}-confetti-canvas"></canvas>

    <div class="${uniqueId}-layout">
      <!-- Coluna Esquerda: Tabuleiro -->
      <div class="${uniqueId}-board-col">
        <div class="${uniqueId}-board-box">
          <div 
            id="${uniqueId}-puzzle-board" 
            class="${uniqueId}-board-grid"
            style="aspect-ratio: ${aspectRatio}; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); grid-template-rows: repeat(${rows}, minmax(0, 1fr));"
          >
            <!-- Slots inseridos via JS -->
          </div>

          <!-- Guia de Imagem de Fundo -->
          <div 
            id="${uniqueId}-image-guide" 
            class="${uniqueId}-image-guide"
            style="background-image: url('${imageUrl}'); aspect-ratio: ${aspectRatio};"
          ></div>
        </div>

        <!-- Banner de Devolutiva / Vitória -->
        <div id="${uniqueId}-victory-banner" class="${uniqueId}-victory-banner">
          <div class="${uniqueId}-victory-icon">✓</div>
          <div class="${uniqueId}-victory-title">Parabéns!</div>
          <div class="${uniqueId}-victory-text">${safeCompletionMsg}</div>
          <div style="display: flex; justify-content: center; gap: 8px;">
            <button id="${uniqueId}-btn-play-again" class="${uniqueId}-btn-primary" style="width: auto; padding: 8px 18px; font-size: 12px;">
              Jogar Novamente
            </button>
          </div>
        </div>
      </div>

      <!-- Coluna Direita: Estoque de Peças e Ações -->
      <div class="${uniqueId}-side-col">
        <div class="${uniqueId}-panel">
          <div id="${uniqueId}-pieces-pool" class="${uniqueId}-pool">
            <!-- Peças inseridas via JS -->
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${showGuideImage ? `
            <button id="${uniqueId}-btn-guide" class="${uniqueId}-btn-guide" type="button">
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #334155;">Mostrar Imagem de Guia</div>
                <div style="font-size: 11px; color: #64748b;">Ver marca d'água de referência</div>
              </div>
              <div id="${uniqueId}-guide-switch" class="${uniqueId}-guide-switch">
                <div id="${uniqueId}-guide-dot" class="${uniqueId}-guide-dot"></div>
              </div>
            </button>
            ` : ''}

            <p class="${uniqueId}-instruction">Arraste ou clique nas peças para posicioná-las</p>

            <button id="${uniqueId}-btn-restart" class="${uniqueId}-btn-primary" type="button">
              Embaralhar e Reiniciar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Script 100% Encapsulado em IIFE - Zero Vazamento no Escopo Global -->
  <script>
  (function() {
    'use strict';

    // Constantes do Quebra-Cabeça
    var ROWS = ${rows};
    var COLS = ${cols};
    var TOTAL_PIECES = ROWS * COLS;
    var IMAGE_URL = ${JSON.stringify(imageUrl)};
    var SHOW_NUMBERS = ${showNumbersByDefault};

    // Referências ao container raiz isolado
    var root = document.getElementById('${uniqueId}-container');
    if (!root) return;

    var boardEl = root.querySelector('#${uniqueId}-puzzle-board');
    var poolEl = root.querySelector('#${uniqueId}-pieces-pool');
    var guideEl = root.querySelector('#${uniqueId}-image-guide');
    var victoryBannerEl = root.querySelector('#${uniqueId}-victory-banner');
    var confettiCanvasEl = root.querySelector('#${uniqueId}-confetti-canvas');
    var btnGuideEl = root.querySelector('#${uniqueId}-btn-guide');
    var guideSwitchEl = root.querySelector('#${uniqueId}-guide-switch');
    var guideDotEl = root.querySelector('#${uniqueId}-guide-dot');
    var btnRestartEl = root.querySelector('#${uniqueId}-btn-restart');
    var btnPlayAgainEl = root.querySelector('#${uniqueId}-btn-play-again');

    // Estado interno isolado
    var pieces = [];
    var matchedCount = 0;
    var selectedPieceId = null;
    var draggedPieceId = null;
    var showGuide = false;
    var audioCtx = null;

    // Web Audio sintetizado seguro
    function playAudio(freqs, duration, type) {
      type = type || 'sine';
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        var startTime = audioCtx.currentTime;
        freqs.forEach(function(freq, idx) {
          var osc = audioCtx.createOscillator();
          var gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = type;
          osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, startTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + duration);
          osc.start(startTime + idx * 0.08);
          osc.stop(startTime + idx * 0.08 + duration);
        });
      } catch (e) {
        // Ignora silenciosamente se o navegador restringir áudio em iframes não focados
      }
    }

    function playSnap() {
      playAudio([587.33, 880], 0.15, 'sine');
    }

    function playVictory() {
      playAudio([261.63, 329.63, 392.00, 523.25], 0.45, 'triangle');
    }

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }

    function initGame() {
      if (!boardEl || !poolEl) return;

      boardEl.innerHTML = '';
      poolEl.innerHTML = '';
      matchedCount = 0;
      selectedPieceId = null;
      draggedPieceId = null;

      if (victoryBannerEl) victoryBannerEl.style.display = 'none';
      if (confettiCanvasEl) confettiCanvasEl.style.display = 'none';

      // 1. Criar Slots do Tabuleiro
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          (function(row, col) {
            var cell = document.createElement('div');
            cell.id = '${uniqueId}-slot-' + row + '-' + col;
            cell.className = '${uniqueId}-slot';
            
            // Drag & drop listeners
            cell.addEventListener('dragover', function(e) {
              e.preventDefault();
              cell.classList.add('${uniqueId}-drag-over');
            });
            cell.addEventListener('dragleave', function() {
              cell.classList.remove('${uniqueId}-drag-over');
            });
            cell.addEventListener('drop', function(e) {
              e.preventDefault();
              cell.classList.remove('${uniqueId}-drag-over');
              if (draggedPieceId) {
                placePieceInSlot(draggedPieceId, cell);
              }
            });

            // Clique / Toque
            cell.addEventListener('click', function() {
              if (selectedPieceId) {
                placePieceInSlot(selectedPieceId, cell);
                clearSelection();
              }
            });

            boardEl.appendChild(cell);
          })(r, c);
        }
      }

      // Drag & drop no Pool
      poolEl.addEventListener('dragover', function(e) {
        e.preventDefault();
      });
      poolEl.addEventListener('drop', function(e) {
        e.preventDefault();
        if (draggedPieceId) {
          returnPieceToPool(draggedPieceId);
        }
      });
      poolEl.addEventListener('click', function() {
        if (selectedPieceId) {
          returnPieceToPool(selectedPieceId);
          clearSelection();
        }
      });

      // 2. Criar Peças
      pieces = [];
      for (var pr = 0; pr < ROWS; pr++) {
        for (var pc = 0; pc < COLS; pc++) {
          var pId = '${uniqueId}-piece-' + pr + '-' + pc;
          var posX = COLS > 1 ? (pc / (COLS - 1)) * 100 : 0;
          var posY = ROWS > 1 ? (pr / (ROWS - 1)) * 100 : 0;

          pieces.push({
            id: pId,
            correctRow: pr,
            correctCol: pc,
            currentCell: null,
            posX: posX,
            posY: posY
          });
        }
      }

      var shuffled = pieces.slice();
      shuffle(shuffled);

      shuffled.forEach(function(p) {
        var pieceEl = document.createElement('div');
        pieceEl.id = p.id;
        pieceEl.draggable = true;
        pieceEl.className = '${uniqueId}-piece';
        pieceEl.style.width = '64px';
        pieceEl.style.height = '64px';
        pieceEl.style.borderRadius = '10px';
        pieceEl.style.backgroundImage = 'url(' + JSON.stringify(IMAGE_URL) + ')';
        pieceEl.style.backgroundSize = (COLS * 100) + '% ' + (ROWS * 100) + '%';
        pieceEl.style.backgroundPosition = p.posX + '% ' + p.posY + '%';

        if (SHOW_NUMBERS) {
          var badge = document.createElement('span');
          badge.className = '${uniqueId}-num-badge';
          badge.innerText = (p.correctRow * COLS + p.correctCol + 1).toString();
          pieceEl.appendChild(badge);
        }

        pieceEl.addEventListener('dragstart', function() {
          draggedPieceId = p.id;
          pieceEl.classList.add('${uniqueId}-dragging');
        });
        pieceEl.addEventListener('dragend', function() {
          pieceEl.classList.remove('${uniqueId}-dragging');
          var allSlots = boardEl.querySelectorAll('.${uniqueId}-slot');
          allSlots.forEach(function(s) { s.classList.remove('${uniqueId}-drag-over'); });
        });

        pieceEl.addEventListener('click', function(e) {
          e.stopPropagation();
          handlePieceClick(p.id);
        });

        poolEl.appendChild(pieceEl);
      });
    }

    function clearSelection() {
      if (selectedPieceId) {
        var prev = root.querySelector('#' + selectedPieceId);
        if (prev) prev.classList.remove('${uniqueId}-selected');
      }
      selectedPieceId = null;
    }

    function handlePieceClick(pieceId) {
      var pieceEl = root.querySelector('#' + pieceId);
      if (!pieceEl || pieceEl.classList.contains('${uniqueId}-locked')) return;

      if (selectedPieceId === pieceId) {
        clearSelection();
        return;
      }

      clearSelection();
      selectedPieceId = pieceId;
      pieceEl.classList.add('${uniqueId}-selected');
    }

    function placePieceInSlot(pieceId, slotEl) {
      var pieceEl = root.querySelector('#' + pieceId);
      if (!pieceEl) return;

      if (slotEl.childElementCount > 0) {
        var existing = slotEl.firstElementChild;
        if (existing.classList.contains('${uniqueId}-locked')) return;
        returnPieceToPool(existing.id);
      }

      slotEl.appendChild(pieceEl);
      pieceEl.style.width = '100%';
      pieceEl.style.height = '100%';
      pieceEl.style.borderRadius = '0px';

      var pieceData = pieces.find(function(p) { return p.id === pieceId; });
      if (pieceData) {
        pieceData.currentCell = slotEl.id;
      }

      checkPieceMatch(pieceData, pieceEl, slotEl);
    }

    function returnPieceToPool(pieceId) {
      var pieceEl = root.querySelector('#' + pieceId);
      if (!pieceEl) return;

      var pieceData = pieces.find(function(p) { return p.id === pieceId; });
      if (pieceData) {
        pieceData.currentCell = null;
      }

      pieceEl.style.width = '64px';
      pieceEl.style.height = '64px';
      pieceEl.style.borderRadius = '10px';
      poolEl.appendChild(pieceEl);

      checkAllPositions();
    }

    function checkPieceMatch(pieceData, pieceEl, slotEl) {
      if (!pieceData) return;
      var expectedId = '${uniqueId}-slot-' + pieceData.correctRow + '-' + pieceData.correctCol;
      var isMatch = slotEl.id === expectedId;

      if (isMatch && !pieceEl.classList.contains('${uniqueId}-locked')) {
        pieceEl.classList.add('${uniqueId}-locked');
        pieceEl.draggable = false;
        playSnap();

        var badge = pieceEl.querySelector('.${uniqueId}-num-badge');
        if (badge) badge.style.display = 'none';

        slotEl.classList.add('${uniqueId}-snap-success');
        setTimeout(function() {
          slotEl.classList.remove('${uniqueId}-snap-success');
        }, 500);
      }

      checkAllPositions();
    }

    function checkAllPositions() {
      var count = 0;
      pieces.forEach(function(p) {
        var pieceEl = root.querySelector('#' + p.id);
        var expectedSlotId = '${uniqueId}-slot-' + p.correctRow + '-' + p.correctCol;
        if (pieceEl && p.currentCell === expectedSlotId) {
          count++;
          if (!pieceEl.classList.contains('${uniqueId}-locked')) {
            pieceEl.classList.add('${uniqueId}-locked');
            pieceEl.draggable = false;
          }
        }
      });

      matchedCount = count;
      if (matchedCount === TOTAL_PIECES) {
        endGame();
      }
    }

    function endGame() {
      playVictory();
      if (confettiCanvasEl) {
        confettiCanvasEl.style.display = 'block';
        triggerConfetti();
      }
      setTimeout(function() {
        if (victoryBannerEl) {
          victoryBannerEl.style.display = 'block';
        }
      }, 500);
    }

    function triggerConfetti() {
      if (!confettiCanvasEl) return;
      var ctx = confettiCanvasEl.getContext('2d');
      confettiCanvasEl.width = window.innerWidth;
      confettiCanvasEl.height = window.innerHeight;

      var colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#06b6d4'];
      var particles = [];

      for (var i = 0; i < 90; i++) {
        particles.push({
          x: Math.random() * confettiCanvasEl.width,
          y: Math.random() * confettiCanvasEl.height - confettiCanvasEl.height,
          r: Math.random() * 6 + 4,
          d: Math.random() * confettiCanvasEl.height,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.07 + 0.02,
          tiltAngle: 0
        });
      }

      function draw() {
        ctx.clearRect(0, 0, confettiCanvasEl.width, confettiCanvasEl.height);
        var remaining = 0;
        particles.forEach(function(p, idx) {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
          if (p.y <= confettiCanvasEl.height) remaining++;
          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();
        });

        if (remaining > 0) {
          requestAnimationFrame(draw);
        } else {
          confettiCanvasEl.style.display = 'none';
        }
      }
      draw();
    }

    // Toggle Imagem Guia
    if (btnGuideEl && guideEl && guideSwitchEl && guideDotEl) {
      btnGuideEl.addEventListener('click', function() {
        showGuide = !showGuide;
        if (showGuide) {
          guideEl.style.opacity = '0.25';
          guideSwitchEl.classList.add('${uniqueId}-guide-switch-active');
          guideDotEl.classList.add('${uniqueId}-guide-dot-active');
        } else {
          guideEl.style.opacity = '0';
          guideSwitchEl.classList.remove('${uniqueId}-guide-switch-active');
          guideDotEl.classList.remove('${uniqueId}-guide-dot-active');
        }
      });
    }

    // Botões de reiniciar
    if (btnRestartEl) btnRestartEl.addEventListener('click', initGame);
    if (btnPlayAgainEl) btnPlayAgainEl.addEventListener('click', initGame);

    // Inicialização segura
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGame);
    } else {
      initGame();
    }
  })();
  </script>
</body>
</html>`;
}
