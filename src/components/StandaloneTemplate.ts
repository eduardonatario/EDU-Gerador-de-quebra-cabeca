/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  // Determine a nice default height for the puzzle based on aspect ratio
  // If the image is wide, the height is smaller. If tall, larger.
  // Standard puzzle container is 480px max-width.
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerador de quebra-cabeça</title>
  <!-- Tailwind CSS v4 CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    
    .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }

    /* Estilo para a peça sendo arrastada */
    .dragging {
      opacity: 0.5;
      transform: scale(0.95);
    }

    /* Estilo para o slot que está recebendo a peça */
    .drag-over {
      border-color: #38bdf8 !important;
      background-color: rgba(56, 189, 248, 0.1) !important;
    }

    /* Peça selecionada no modo de clique */
    .selected-piece {
      outline: 3px solid #38bdf8 !important;
      outline-offset: -3px;
      transform: scale(0.98);
      box-shadow: 0 10px 15px -3px rgba(56, 189, 248, 0.3) !important;
    }

    /* Peça travada na posição correta */
    .piece-locked {
      cursor: not-allowed !important;
      pointer-events: none !important;
      outline: none !important;
    }

    /* Efeito de vitória no slot */
    @keyframes pulse-success {
      0%, 100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); }
      50% { box-shadow: 0 0 15px 4px rgba(34, 197, 94, 0.6); }
    }
    .snap-success {
      animation: pulse-success 0.5s ease-out;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between py-6 px-4 md:px-8 bg-slate-50 text-slate-800">

  <!-- Confetti Canvas -->
  <canvas id="confetti-canvas" class="fixed inset-0 w-full h-full pointer-events-none z-50 hidden"></canvas>

  <div class="max-w-6xl mx-auto w-full pt-4">

    <!-- Área de Estatísticas -->
    <div class="hidden grid-cols-3 gap-3 max-w-lg mx-auto mb-6 text-center">
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tempo</p>
        <p id="timer" class="text-lg md:text-xl font-bold text-slate-800 font-mono">00:00</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Movimentos</p>
        <p id="moves" class="text-lg md:text-xl font-bold text-slate-800 font-mono">0</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Encaixadas</p>
        <p id="matched" class="text-lg md:text-xl font-bold text-emerald-600 font-mono">0 / ${rows * cols}</p>
      </div>
    </div>

    <!-- Layout Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Lado Esquerdo: Tabuleiro do Quebra-Cabeça -->
      <div class="lg:col-span-7 flex flex-col items-center gap-4">
        <div class="relative w-full max-w-[480px] bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          
          <!-- Tabuleiro Real -->
          <div 
            id="puzzle-board" 
            class="grid w-full relative overflow-hidden bg-slate-100 rounded-lg shadow-inner"
            style="aspect-ratio: ${aspectRatio}; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); grid-template-rows: repeat(${rows}, minmax(0, 1fr));"
          >
            <!-- Os slots do grid serão inseridos aqui pelo JS -->
          </div>

          <!-- Guia de Imagem de Fundo (Ajustável) -->
          <div 
            id="image-guide" 
            class="absolute inset-3 pointer-events-none rounded-lg bg-cover bg-center transition-opacity duration-300 opacity-0"
            style="background-image: url('${imageUrl}'); aspect-ratio: ${aspectRatio};"
          ></div>
        </div>

        <!-- Mensagem de Vitória Embutida abaixo do quebra-cabeça -->
        <div id="victory-banner" class="hidden w-full max-w-[480px] bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm text-center space-y-3">
          <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-emerald-800">Parabéns!</h3>
            <p class="text-emerald-700 text-xs font-semibold whitespace-pre-wrap">
              ${completionMessage && completionMessage.trim()
                ? completionMessage.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                : 'Você montou o quebra-cabeça com sucesso!'}
            </p>
          </div>
          <div class="flex gap-2 justify-center pt-1">
            <button
              onclick="restartGame()"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      </div>

      <!-- Lado Direito: Estoque de Peças e Controles -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        
        <!-- Estoque de Peças (Pool) -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <!-- Container do Estoque -->
          <div 
            id="pieces-pool" 
            class="flex flex-wrap gap-2.5 p-3 min-h-[140px] max-h-[300px] overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 justify-start content-start items-start shadow-inner"
          >
            <!-- As peças serão inseridas aqui pelo JS -->
          </div>

          <!-- Ações Rápidas (Minimalistas) -->
          <div class="flex flex-col gap-3">
            <!-- Botão Mostrar Guia -->
            ${showGuideImage ? `
            <button 
              id="btn-guide" 
              class="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer text-left"
              onclick="toggleGuide()"
            >
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-slate-700">Mostrar Imagem de Guia</span>
                <span class="text-xs text-slate-500">Ver imagem original em marca d'água</span>
              </div>
              <div id="guide-indicator" class="w-10 h-6 bg-slate-200 rounded-full flex items-center p-1 transition-colors">
                <div class="w-4 h-4 bg-slate-400 rounded-full transition-transform transform translate-x-0"></div>
              </div>
            </button>
            ` : ''}

            <!-- Mensagem de Instrução -->
            <p class="text-xs text-center text-slate-500 font-medium pt-1">
              Arraste as peças para montar o quebra-cabeça
            </p>

            <!-- Botão Reiniciar -->
            <button 
              class="w-full p-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              onclick="restartGame()"
            >
              Embaralhar e Reiniciar
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>



  <!-- Rodapé -->
  <footer class="text-center text-xs text-slate-400 mt-12">
  </footer>

  <script>
    // Configurações do Quebra-Cabeça
    const ROWS = ${rows};
    const COLS = ${cols};
    const TOTAL_PIECES = ROWS * COLS;
    const IMAGE_URL = \`${imageUrl}\`;

    // Estados do Jogo
    let pieces = [];
    let movesCount = 0;
    let matchedCount = 0;
    let timerInterval = null;
    let secondsElapsed = 0;
    let gameStarted = false;
    let selectedPieceId = null;

    // Configurações visuais de suporte
    let showGuide = false;
    let showNumbers = ${showNumbersByDefault};

    // Sons Sintetizados via Web Audio API
    function playAudioTone(freqs, duration, type = 'sine') {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
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
        console.log("AudioContext blocked or not supported by browser", e);
      }
    }

    function playSnapSound() {
      // Tom agudo ascendente rápido para indicação de sucesso local
      playAudioTone([587.33, 880], 0.15, 'sine');
    }

    function playVictorySound() {
      // Acorde triunfal maior
      playAudioTone([261.63, 329.63, 392.00, 523.25], 0.45, 'triangle');
    }

    // Inicialização do Jogo
    window.addEventListener('DOMContentLoaded', () => {
      initGame();
    });

    function initGame() {
      const board = document.getElementById('puzzle-board');
      const pool = document.getElementById('pieces-pool');

      // Limpar elementos antigos
      board.innerHTML = '';
      pool.innerHTML = '';

      // Reset de estado
      movesCount = 0;
      matchedCount = 0;
      secondsElapsed = 0;
      gameStarted = false;
      selectedPieceId = null;
      clearInterval(timerInterval);
      document.getElementById('moves').innerText = '0';
      document.getElementById('timer').innerText = '00:00';
      document.getElementById('matched').innerText = '0 / ' + TOTAL_PIECES;

      // Criar células (slots) no tabuleiro
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement('div');
          cell.id = \`slot-\${r}-\${c}\`;
          cell.className = 'relative border border-dashed border-slate-300 bg-slate-100/50 flex items-center justify-center transition-colors';
          cell.style.width = '100%';
          cell.style.height = '100%';
          
          // Eventos de Drag & Drop para o Slot
          cell.addEventListener('dragover', dragOver);
          cell.addEventListener('dragleave', dragLeave);
          cell.addEventListener('drop', dropOnSlot);
          
          // Clique no slot do board para mover peça selecionada
          cell.addEventListener('click', () => clickOnSlot(r, c));

          board.appendChild(cell);
        }
      }

      // Eventos para o pool aceitar peças de volta
      pool.addEventListener('dragover', dragOver);
      pool.addEventListener('drop', dropOnPool);
      pool.addEventListener('click', () => clickOnPool());

      // Criar as peças
      pieces = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const pieceId = \`piece-\${r}-\${c}\`;
          
          // Cálculo de background-position
          const posX = COLS > 1 ? (c / (COLS - 1)) * 100 : 0;
          const posY = ROWS > 1 ? (r / (ROWS - 1)) * 100 : 0;

          const piece = {
            id: pieceId,
            correctRow: r,
            correctCol: c,
            currentCell: null,
            posX,
            posY
          };
          pieces.push(piece);
        }
      }

      // Embaralhar as peças
      const shuffledPieces = [...pieces];
      shuffleArray(shuffledPieces);

      // Renderizar as peças embaralhadas na área de estoque (pool)
      shuffledPieces.forEach(p => {
        const pieceEl = document.createElement('div');
        pieceEl.id = p.id;
        pieceEl.draggable = true;
        pieceEl.className = 'relative rounded-md cursor-grab active:cursor-grabbing shadow-md border border-slate-200 overflow-hidden flex-shrink-0 transition-all hover:scale-105';
        
        // Estilo e posicionamento da imagem fatiada
        pieceEl.style.width = '70px';
        pieceEl.style.height = '70px';
        pieceEl.style.backgroundImage = \`url('\${IMAGE_URL}')\`;
        pieceEl.style.backgroundSize = \`\${COLS * 100}% \${ROWS * 100}%\`;
        pieceEl.style.backgroundPosition = \`\${p.posX}% \${p.posY}%\`;

        // Indicador de número para ajuda
        const numLabel = document.createElement('span');
        numLabel.className = 'absolute bottom-1 right-1 bg-white/95 text-slate-800 font-mono font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-slate-200 pointer-events-none transition-all shadow-sm ' + (showNumbers ? 'block' : 'hidden');
        numLabel.id = \`num-\${p.id}\`;
        numLabel.innerText = (p.correctRow * COLS + p.correctCol + 1).toString();
        pieceEl.appendChild(numLabel);

        // Adicionar eventos de arrasto
        pieceEl.addEventListener('dragstart', dragStart);
        pieceEl.addEventListener('dragend', dragEnd);
        
        // Evento de clique para o modo toque
        pieceEl.addEventListener('click', (e) => {
          e.stopPropagation();
          clickOnPiece(p.id);
        });

        pool.appendChild(pieceEl);
      });

      updatePoolCount();
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    // Cronômetro do Jogo
    function startTimer() {
      if (gameStarted) return;
      gameStarted = true;
      secondsElapsed = 0;
      timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        const formattedTime = 
          String(minutes).padStart(2, '0') + ':' + 
          String(seconds).padStart(2, '0');
        document.getElementById('timer').innerText = formattedTime;
      }, 1000);
    }

    function updatePoolCount() {
      const remaining = document.getElementById('pieces-pool').childElementCount;
      const countEl = document.getElementById('pool-count');
      if (countEl) {
        countEl.innerText = remaining + ' restantes';
      }
    }

    // Funções de Arrastar e Soltar (Drag & Drop)
    let draggedPieceId = null;

    function dragStart(e) {
      draggedPieceId = this.id;
      this.classList.add('dragging');
      startTimer();
    }

    function dragEnd() {
      this.classList.remove('dragging');
      // Limpar todos os estilos de drag-over
      const slots = document.querySelectorAll('#puzzle-board > div');
      slots.forEach(s => s.classList.remove('drag-over'));
    }

    function dragOver(e) {
      e.preventDefault();
      if (this.id.startsWith('slot-')) {
        this.classList.add('drag-over');
      }
    }

    function dragLeave() {
      this.classList.remove('drag-over');
    }

    function dropOnSlot(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      const pieceId = draggedPieceId;
      if (!pieceId) return;

      placePieceInSlot(pieceId, this);
    }

    function dropOnPool(e) {
      e.preventDefault();
      const pieceId = draggedPieceId;
      if (!pieceId) return;

      returnPieceToPool(pieceId);
    }

    // Funções de Clique para Celulares (Modo Alternativo de Toque)
    function clickOnPiece(pieceId) {
      startTimer();
      const pieceEl = document.getElementById(pieceId);
      
      // Se a peça já está travada na posição correta, ignorar
      if (pieceEl.classList.contains('piece-locked')) return;

      // Se clicar na mesma peça, desmarcar
      if (selectedPieceId === pieceId) {
        pieceEl.classList.remove('selected-piece');
        selectedPieceId = null;
        return;
      }

      // Limpar seleção anterior
      if (selectedPieceId) {
        const prevSel = document.getElementById(selectedPieceId);
        if (prevSel) prevSel.classList.remove('selected-piece');
      }

      // Selecionar nova peça
      selectedPieceId = pieceId;
      pieceEl.classList.add('selected-piece');
    }

    function clickOnSlot(row, col) {
      if (!selectedPieceId) return;
      const slot = document.getElementById(\`slot-\${row}-\${col}\`);
      
      placePieceInSlot(selectedPieceId, slot);
      
      // Limpar seleção
      const pieceEl = document.getElementById(selectedPieceId);
      if (pieceEl) pieceEl.classList.remove('selected-piece');
      selectedPieceId = null;
    }

    function clickOnPool() {
      if (!selectedPieceId) return;
      returnPieceToPool(selectedPieceId);
      
      // Limpar seleção
      const pieceEl = document.getElementById(selectedPieceId);
      if (pieceEl) pieceEl.classList.remove('selected-piece');
      selectedPieceId = null;
    }

    // Lógica Central de Movimentação de Peças
    function placePieceInSlot(pieceId, slotEl) {
      const pieceEl = document.getElementById(pieceId);
      if (!pieceEl) return;

      // Se o slot já possui uma peça
      if (slotEl.childElementCount > 0) {
        const currentInSlot = slotEl.firstElementChild;
        // Se a peça atual já estiver locked, não podemos substituir
        if (currentInSlot.classList.contains('piece-locked')) return;
        
        // Caso contrário, devolver a peça anterior para o estoque (pool)
        returnPieceToPool(currentInSlot.id);
      }

      // Adicionar a peça ao slot
      slotEl.appendChild(pieceEl);
      
      // Redimensionar peça para preencher a célula (100% da célula do grid)
      pieceEl.style.width = '100%';
      pieceEl.style.height = '100%';
      pieceEl.classList.remove('rounded-md');

      // Extrair linha/col do slot
      const [_, r, c] = slotEl.id.split('-').map(Number);
      
      // Atualizar o estado da peça
      const pieceData = pieces.find(p => p.id === pieceId);
      if (pieceData) {
        pieceData.currentCell = slotEl.id;
      }

      // Incrementar contagem de movimentos
      movesCount++;
      document.getElementById('moves').innerText = movesCount;

      // Verificar se a peça está na posição correta
      checkPieceMatch(pieceData, pieceEl, slotEl);
      updatePoolCount();
    }

    function returnPieceToPool(pieceId) {
      const pieceEl = document.getElementById(pieceId);
      const pool = document.getElementById('pieces-pool');
      if (!pieceEl) return;

      // Remover do slot antigo
      const pieceData = pieces.find(p => p.id === pieceId);
      if (pieceData) {
        pieceData.currentCell = null;
      }

      // Retornar ao tamanho de estoque e borda arredondada
      pieceEl.style.width = '70px';
      pieceEl.style.height = '70px';
      pieceEl.classList.add('rounded-md');

      pool.appendChild(pieceEl);
      
      movesCount++;
      document.getElementById('moves').innerText = movesCount;
      
      checkAllPositions();
      updatePoolCount();
    }

    function checkPieceMatch(pieceData, pieceEl, slotEl) {
      if (!pieceData) return;

      const [_, sRow, sCol] = slotEl.id.split('-').map(Number);
      const isMatchNow = pieceData.correctRow === sRow && pieceData.correctCol === sCol;

      if (isMatchNow && !pieceEl.classList.contains('piece-locked')) {
        // Travar peça na posição correta
        pieceEl.classList.add('piece-locked');
        pieceEl.draggable = false;
        
        // Efeito sonoro sintetizado offline
        playSnapSound();

        // Remover número auxiliar se estivesse ativado (ou mantê-lo estático de forma discreta)
        const numLabel = document.getElementById(\`num-\${pieceData.id}\`);
        if (numLabel) {
          numLabel.style.display = 'none';
        }

        // Adicionar brilho de sucesso no slot temporário
        slotEl.classList.add('snap-success');
        setTimeout(() => {
          slotEl.classList.remove('snap-success');
        }, 500);
      }

      checkAllPositions();
    }

    function checkAllPositions() {
      let matched = 0;
      pieces.forEach(p => {
        const pieceEl = document.getElementById(p.id);
        if (pieceEl && p.currentCell === \`slot-\${p.correctRow}-\${p.correctCol}\`) {
          matched++;
          if (!pieceEl.classList.contains('piece-locked')) {
            pieceEl.classList.add('piece-locked');
            pieceEl.draggable = false;
            const numLabel = document.getElementById(\`num-\${p.id}\`);
            if (numLabel) numLabel.style.display = 'none';
          }
        }
      });

      matchedCount = matched;
      document.getElementById('matched').innerText = \`\${matchedCount} / \${TOTAL_PIECES}\`;

      // Vitória!
      if (matchedCount === TOTAL_PIECES) {
        endGame();
      }
    }

    // Fim de jogo e comemoração
    function endGame() {
      clearInterval(timerInterval);
      playVictorySound();

      // Ativar e disparar confetes no Canvas
      const canvas = document.getElementById('confetti-canvas');
      canvas.classList.remove('hidden');
      triggerConfetti();

      // Exibir o banner de sucesso embutido
      setTimeout(() => {
        const victoryBanner = document.getElementById('victory-banner');
        if (victoryBanner) {
          victoryBanner.classList.remove('hidden');
        }
      }, 600);
    }

    // Controles visuais de ajuda
    function toggleGuide() {
      showGuide = !showGuide;
      const guide = document.getElementById('image-guide');
      const indicator = document.getElementById('guide-indicator');
      const dot = indicator.firstElementChild;

      if (showGuide) {
        guide.style.opacity = '0.25';
        indicator.classList.remove('bg-slate-700');
        indicator.classList.add('bg-sky-500');
        dot.classList.remove('translate-x-0');
        dot.classList.add('translate-x-4');
        dot.classList.remove('bg-slate-400');
        dot.classList.add('bg-white');
      } else {
        guide.style.opacity = '0';
        indicator.classList.remove('bg-sky-500');
        indicator.classList.add('bg-slate-700');
        dot.classList.remove('translate-x-4');
        dot.classList.add('translate-x-0');
        dot.classList.remove('bg-white');
        dot.classList.add('bg-slate-400');
      }
    }

    function closeSuccessModal() {
      const victoryBanner = document.getElementById('victory-banner');
      if (victoryBanner) victoryBanner.classList.add('hidden');
      const canvas = document.getElementById('confetti-canvas');
      canvas.classList.add('hidden');
    }

    function restartGame() {
      initGame();
      // Ocultar o banner se estiver aberto
      const victoryBanner = document.getElementById('victory-banner');
      if (victoryBanner) victoryBanner.classList.add('hidden');
      document.getElementById('confetti-canvas').classList.add('hidden');
    }

    // --- SISTEMA DE CONFETES LEVE (SEM DEPENDÊNCIAS) ---
    function triggerConfetti() {
      const canvas = document.getElementById('confetti-canvas');
      const ctx = canvas.getContext('2d');
      
      // Ajustar tamanho do canvas
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#06b6d4'];
      const particles = [];

      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 6 + 4,
          d: Math.random() * canvas.height,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.07 + 0.02,
          tiltAngle: 0
        });
      }

      let animationId;
      function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let remaining = 0;
        particles.forEach((p, idx) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

          if (p.y <= canvas.height) remaining++;

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();
        });

        if (remaining > 0) {
          animationId = requestAnimationFrame(drawConfetti);
        } else {
          canvas.classList.add('hidden');
        }
      }

      drawConfetti();

      // Cancelar ao fechar o modal
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }
  </script>
</body>
</html>`;
}
