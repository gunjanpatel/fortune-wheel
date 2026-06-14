// ─── Constants & Data Sets ───────────────────────────────────────────────────
const KAKKO = ['ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ', 'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ', 'ક્ષ', 'જ્ઞ'];
const TRAPS = {
  'ઘ': 'ધ', 'ધ': 'ઘ',
  'ડ': 'ઈ', 'ઈ': 'ડ',
  'ઠ': 'ઢ', 'ઢ': 'ઠ',
  'ત': 'ભ', 'ભ': 'ત',
  'ખ': 'બ', 'બ': 'ખ',
  'ક': 'ફ', 'ફ': 'ક'
};

const BARAKHADI_FORMULAS = [
  { c: 'ક', v: 'ા', result: 'કા', speak: 'Ka' },
  { c: 'ખ', v: 'િ', result: 'ખિ', speak: 'Khi' },
  { c: 'ગ', v: 'ી', result: 'ગી', speak: 'Gee' },
  { c: 'ઘ', v: 'ુ', result: 'ઘુ', speak: 'Ghu' },
  { c: 'ચ', v: 'ૂ', result: 'ચૂ', speak: 'Choo' },
  { c: 'છ', v: 'ે', result: 'છે', speak: 'Chhe' },
  { c: 'જ', v: 'ૈ', result: 'જૈ', speak: 'Jai' },
  { c: 'ટ', v: 'ો', result: 'ટો', speak: 'To' },
  { c: 'ઠ', v: 'ૌ', result: 'ઠૌ', speak: 'Thau' },
  { c: 'ડ', v: 'ં', result: 'ડં', speak: 'Dam' }
];

const CIPHER_LETTERS = ['ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ'];
const CIPHER_PRONUNCIATIONS = {
  'ક': 'Ka', 'ખ': 'Kha', 'ગ': 'Ga', 'ઘ': 'Gha',
  'ચ': 'Cha', 'છ': 'Chha', 'જ': 'Ja', 'ઝ': 'Zha'
};

// ─── Navigation & Highscores ─────────────────────────────────────────────────
function launchMode(mode) {
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('connectorView').classList.add('hidden');
  document.getElementById('blasterView').classList.add('hidden');
  document.getElementById('cipherView').classList.add('hidden');

  if (mode === 'connector') {
    document.getElementById('connectorView').classList.remove('hidden');
    initConnector();
  } else if (mode === 'blaster') {
    document.getElementById('blasterView').classList.remove('hidden');
    initBlaster();
  } else if (mode === 'cipher') {
    document.getElementById('cipherView').classList.remove('hidden');
    initCipher();
  }
}

function exitToMenu() {
  document.getElementById('connectorView').classList.add('hidden');
  document.getElementById('blasterView').classList.add('hidden');
  document.getElementById('cipherView').classList.add('hidden');
  document.getElementById('menuScreen').classList.remove('hidden');
  stopBlasterGame();
  clearInterval(cipherInterval);
  updateHighscoresUI();
}

function updateHighscoresUI() {
  const conn = localStorage.getItem('gujarati_connector_best') || '--';
  const blast = localStorage.getItem('gujarati_blaster_best') || '--';
  const ciph = localStorage.getItem('gujarati_cipher_best') || '--';

  document.getElementById('bestConnector').textContent = conn !== '--' ? `${conn} steps` : '--';
  document.getElementById('bestBlaster').textContent = blast !== '--' ? `${blast} pts` : '--';
  document.getElementById('bestCipher').textContent = ciph !== '--' ? `${ciph}s` : '--';
}

// ─── Mode A: Kakko Connector Logic ──────────────────────────────────────────
let connectorPath = [];
let connectorStepIndex = 0;
let connectorCompletedPaths = 0;

function initConnector() {
  connectorStepIndex = 0;
  // Generate random target sequence of length 4 from KAKKO (sequential)
  const startIndex = Math.floor(Math.random() * (KAKKO.length - 4));
  connectorPath = KAKKO.slice(startIndex, startIndex + 4);

  // Update target display
  document.getElementById('connectorTarget').textContent = connectorPath.join(' → ');
  document.getElementById('connectorStep').textContent = `0/${connectorPath.length}`;

  const grid = document.getElementById('connectorGrid');
  grid.innerHTML = '';

  // Prepare tile contents: 4 correct path nodes, trap nodes, and fillers
  const tilesData = [];
  connectorPath.forEach(char => {
    tilesData.push({ char, type: 'path' });
    // Add trap if exists
    if (TRAPS[char]) {
      tilesData.push({ char: TRAPS[char], type: 'trap' });
    }
  });

  // Fill up to 16 tiles
  while (tilesData.length < 16) {
    const randomChar = KAKKO[Math.floor(Math.random() * KAKKO.length)];
    if (!connectorPath.includes(randomChar) && !tilesData.some(t => t.char === randomChar)) {
      tilesData.push({ char: randomChar, type: 'filler' });
    }
  }

  // Shuffle tiles
  shuffle(tilesData);

  // Render Grid
  tilesData.forEach((tile, index) => {
    const tileEl = document.createElement('button');
    tileEl.className = 'connector-tile';
    tileEl.textContent = tile.char;
    tileEl.dataset.char = tile.char;

    tileEl.addEventListener('click', () => {
      handleConnectorClick(tileEl, tile.char);
    });

    grid.appendChild(tileEl);
  });
}

function handleConnectorClick(tileEl, char) {
  const expectedChar = connectorPath[connectorStepIndex];
  if (char === expectedChar) {
    // Correct step
    tileEl.classList.add('correct');
    speakText(char === 'ક' ? 'Ka' : char);
    connectorStepIndex++;
    document.getElementById('connectorStep').textContent = `${connectorStepIndex}/${connectorPath.length}`;

    if (connectorStepIndex === connectorPath.length) {
      // Game Won
      connectorCompletedPaths++;
      const currentBest = localStorage.getItem('gujarati_connector_best');
      if (!currentBest || connectorCompletedPaths > parseInt(currentBest)) {
        localStorage.setItem('gujarati_connector_best', connectorCompletedPaths);
      }
      showWinOverlay(`Completed ${connectorCompletedPaths} connector path(s) successfully!`, `🎉 Path Tracing Master!`);
    }
  } else {
    // Wrong step: highlight trap/error
    tileEl.classList.add('wrong');
    speakText("Uh oh!");
    setTimeout(() => {
      tileEl.classList.remove('wrong');
    }, 500);
  }
}

// ─── Mode B: Barakhadi Blaster (Phonetic Equation Matcher) ───────────────────
let blasterCanvas, blasterCtx;
let blasterScore = 0;
let blasterTimeLeft = 30;
let blasterTimerInterval = null;
let blasterActive = false;
let blasterTarget = null;
let bubbles = [];
let blasterAnimationFrame = null;

function initBlaster() {
  blasterCanvas = document.getElementById('blasterCanvas');
  blasterCtx = blasterCanvas.getContext('2d');
  
  // Fit canvas sizes
  resizeBlasterCanvas();
  
  blasterScore = 0;
  blasterTimeLeft = 30;
  bubbles = [];
  blasterActive = true;

  document.getElementById('blasterScore').textContent = '0';
  document.getElementById('blasterTimer').textContent = '30s';
  document.getElementById('blasterStartBtn').textContent = 'Restart Blaster';

  // Clear timers
  clearInterval(blasterTimerInterval);
  cancelAnimationFrame(blasterAnimationFrame);

  // Create new equation target
  nextBlasterTarget();

  // Bind click/tap
  blasterCanvas.onclick = handleBlasterClick;

  // Start timers
  blasterTimerInterval = setInterval(() => {
    blasterTimeLeft--;
    document.getElementById('blasterTimer').textContent = `${blasterTimeLeft}s`;
    if (blasterTimeLeft <= 0) {
      endBlasterGame();
    }
  }, 1000);

  // Animation Loop
  blasterLoop();
}

function resizeBlasterCanvas() {
  const rect = blasterCanvas.parentNode.getBoundingClientRect();
  blasterCanvas.width = rect.width;
  blasterCanvas.height = rect.height;
}

function nextBlasterTarget() {
  blasterTarget = BARAKHADI_FORMULAS[Math.floor(Math.random() * BARAKHADI_FORMULAS.length)];
  
  // Decide progression: Older kids see combined syllable, younger see addition
  const isAdvanced = blasterScore >= 5;
  const targetLabel = document.getElementById('blasterTargetFormula');
  
  if (isAdvanced) {
    targetLabel.textContent = `Linguistic Dismantle: ${blasterTarget.result} = ? + ${blasterTarget.v}`;
  } else {
    targetLabel.textContent = `${blasterTarget.c} + ${blasterTarget.v} = ?`;
  }
}

function spawnBubble() {
  if (bubbles.length >= 6) return;
  
  const radius = 35 + Math.random() * 10;
  const x = radius + Math.random() * (blasterCanvas.width - radius * 2);
  const y = blasterCanvas.height + radius;
  const speed = 1.2 + Math.random() * 1.5;
  
  // Choose value: either the correct result, components, or fake options
  const randFormula = BARAKHADI_FORMULAS[Math.floor(Math.random() * BARAKHADI_FORMULAS.length)];
  let value = randFormula.result;
  
  const isAdvanced = blasterScore >= 5;
  if (isAdvanced) {
    // Spawn root consonants instead of blends
    value = Math.random() < 0.4 ? blasterTarget.c : randFormula.c;
  } else {
    value = Math.random() < 0.4 ? blasterTarget.result : randFormula.result;
  }

  bubbles.push({ x, y, radius, speed, value, color: `hsl(${20 + Math.random() * 40}, 90%, 60%)` });
}

function blasterLoop() {
  if (!blasterActive) return;

  blasterCtx.clearRect(0, 0, blasterCanvas.width, blasterCanvas.height);

  // Spawn bubbles periodically
  if (Math.random() < 0.02) spawnBubble();

  // Draw & Update Bubbles
  bubbles.forEach((bubble, index) => {
    bubble.y -= bubble.speed;

    // Draw bubble outline & glow
    blasterCtx.beginPath();
    blasterCtx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    blasterCtx.fillStyle = bubble.color + '22';
    blasterCtx.fill();
    blasterCtx.lineWidth = 2;
    blasterCtx.strokeStyle = bubble.color;
    blasterCtx.stroke();

    // Draw Character text
    blasterCtx.fillStyle = '#ffffff';
    blasterCtx.font = 'bold 24px Inter, system-ui';
    blasterCtx.textAlign = 'center';
    blasterCtx.textBaseline = 'middle';
    blasterCtx.fillText(bubble.value, bubble.x, bubble.y);
  });

  // Filter out bubbles floating off-screen
  bubbles = bubbles.filter(b => b.y + b.radius > 0);

  blasterAnimationFrame = requestAnimationFrame(blasterLoop);
}

function handleBlasterClick(event) {
  if (!blasterActive) return;

  const rect = blasterCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Check bubble collision
  bubbles.forEach((bubble, idx) => {
    const dist = Math.hypot(clickX - bubble.x, clickY - bubble.y);
    if (dist <= bubble.radius) {
      // Pop!
      bubbles.splice(idx, 1);
      
      const isAdvanced = blasterScore >= 5;
      const expectedMatch = isAdvanced ? blasterTarget.c : blasterTarget.result;

      if (bubble.value === expectedMatch) {
        // Correct pop
        blasterScore++;
        document.getElementById('blasterScore').textContent = blasterScore;
        speakText(blasterTarget.speak);
        nextBlasterTarget();
      } else {
        // Incorrect pop: lose time
        blasterTimeLeft = Math.max(0, blasterTimeLeft - 3);
        document.getElementById('blasterTimer').textContent = `${blasterTimeLeft}s`;
        speakText("Whoops!");
      }
    }
  });
}

function endBlasterGame() {
  stopBlasterGame();
  
  const currentBest = localStorage.getItem('gujarati_blaster_best') || 0;
  let isNew = false;
  if (blasterScore > parseInt(currentBest)) {
    localStorage.setItem('gujarati_blaster_best', blasterScore);
    isNew = true;
  }

  showWinOverlay(`Popped matching Barakhadi syllables, scoring ${blasterScore} points!`, `🏆 Kinetic Blaster Winner!`, isNew);
}

function stopBlasterGame() {
  blasterActive = false;
  clearInterval(blasterTimerInterval);
  cancelAnimationFrame(blasterAnimationFrame);
}

// ─── Mode C: Kakko Audio Cipher Logic ────────────────────────────────────────
let cipherCards = [];
let cipherFlipped = [];
let cipherMatches = 0;
let cipherTurns = 0;
let cipherTimeElapsed = 0;
let cipherInterval = null;
let cipherActive = false;

function initCipher() {
  cipherMatches = 0;
  cipherTurns = 0;
  cipherTimeElapsed = 0;
  cipherFlipped = [];
  cipherActive = true;

  document.getElementById('cipherFlips').textContent = '0';
  document.getElementById('cipherTime').textContent = '0s';

  clearInterval(cipherInterval);
  startCipherTimer();

  const grid = document.getElementById('cipherGrid');
  grid.innerHTML = '';

  // Prepare deck: 8 spoken cards (type A) & 8 written glyph cards (type B)
  const deck = [];
  CIPHER_LETTERS.forEach(char => {
    deck.push({ char, type: 'audio' });
    deck.push({ char, type: 'written' });
  });

  shuffle(deck);

  deck.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'cipher-card aspect-square w-full';
    cardEl.dataset.idx = index;
    cardEl.dataset.char = card.char;
    cardEl.dataset.type = card.type;

    cardEl.innerHTML = `
      <div class="cipher-inner w-full h-full">
        <div class="cipher-front font-semibold">❓</div>
        <div class="cipher-back">${card.type === 'audio' ? '🔊' : card.char}</div>
      </div>
    `;

    cardEl.addEventListener('click', () => {
      handleCipherClick(cardEl);
    });

    grid.appendChild(cardEl);
  });
}

function startCipherTimer() {
  cipherInterval = setInterval(() => {
    if (cipherActive) {
      cipherTimeElapsed++;
      document.getElementById('cipherTime').textContent = `${cipherTimeElapsed}s`;
    }
  }, 1000);
}

function handleCipherClick(cardEl) {
  if (!cipherActive) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
  if (cipherFlipped.length >= 2) return;

  cardEl.classList.add('flipped');
  cipherFlipped.push(cardEl);

  // If audio card is flipped, play phonic pronunciation
  if (cardEl.dataset.type === 'audio') {
    const char = cardEl.dataset.char;
    speakText(CIPHER_PRONUNCIATIONS[char] || char);
  }

  if (cipherFlipped.length === 2) {
    cipherTurns++;
    document.getElementById('cipherFlips').textContent = cipherTurns;
    checkCipherMatch();
  }
}

function checkCipherMatch() {
  const [c1, c2] = cipherFlipped;
  
  // Match if same character and different types (one audio card + one written card)
  const isMatch = (c1.dataset.char === c2.dataset.char) && (c1.dataset.type !== c2.dataset.type);

  if (isMatch) {
    c1.classList.add('matched');
    c2.classList.add('matched');
    cipherMatches += 2;
    cipherFlipped = [];

    if (cipherMatches === 16) {
      endCipherGame();
    }
  } else {
    setTimeout(() => {
      c1.classList.remove('flipped');
      c2.classList.remove('flipped');
      cipherFlipped = [];
    }, 1000);
  }
}

function endCipherGame() {
  cipherActive = false;
  clearInterval(cipherInterval);

  const currentBest = localStorage.getItem('gujarati_cipher_best');
  let isNew = false;
  if (!currentBest || cipherTimeElapsed < parseInt(currentBest)) {
    localStorage.setItem('gujarati_cipher_best', cipherTimeElapsed);
    isNew = true;
  }

  showWinOverlay(`Completed the auditory match in ${cipherTurns} turns and ${cipherTimeElapsed} seconds!`, `👂 Auditory Cipher Success!`, isNew);
}

// ─── Shared Utilities ────────────────────────────────────────────────────────
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'gu-IN'; // set language to Gujarati
  utterance.rate = 0.9;
  utterance.pitch = 1.25;
  window.speechSynthesis.speak(utterance);
}

function showWinOverlay(statsText, titleText, isNewRecord = false) {
  document.getElementById('winStats').textContent = statsText;
  document.getElementById('newRecordText').textContent = isNewRecord ? `🎉 Amazing! A new cognitive personal record!` : '';
  
  const titleEl = document.querySelector('#winOverlay .win-title');
  if (titleEl && titleText) titleEl.textContent = titleText;

  const overlay = document.getElementById('winOverlay');
  overlay.classList.remove('hidden');

  // Configure play again buttons to restart the active mode
  document.getElementById('overlayPlayAgain').onclick = () => {
    overlay.classList.add('hidden');
    // Detect active screen
    if (!document.getElementById('connectorView').classList.contains('hidden')) {
      initConnector();
    } else if (!document.getElementById('blasterView').classList.contains('hidden')) {
      initBlaster();
    } else if (!document.getElementById('cipherView').classList.contains('hidden')) {
      initCipher();
    }
  };
}

// Load highscores on mount
window.onload = () => {
  updateHighscoresUI();
};
