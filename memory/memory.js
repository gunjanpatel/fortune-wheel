// ─── Constants & Emojis ───────────────────────────────────────────────────────
const EMOJIS = ['🐼', '🦁', '🐨', '🦊', '🐯', '🐸', '🐙', '🦄'];

// ─── State Variables ──────────────────────────────────────────────────────────
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let flips = 0;
let timeElapsed = 0;
let timerInterval = null;
let gameActive = false;

// ─── DOM Elements ─────────────────────────────────────────────────────────────
const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const cardGrid = document.getElementById('cardGrid');
const flipCountEl = document.getElementById('flipCount');
const timerEl = document.getElementById('timer');
const bestTimeEl = document.getElementById('bestTime');
const winOverlay = document.getElementById('winOverlay');
const winStatsEl = document.getElementById('winStats');
const newRecordTextEl = document.getElementById('newRecordText');

// Buttons
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');
const overlayRestart = document.getElementById('overlayRestart');
const overlayHome = document.getElementById('overlayHome');

// ─── Initial Setup & Listeners ────────────────────────────────────────────────
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
overlayRestart.addEventListener('click', resetGame);
homeBtn.addEventListener('click', goHome);
overlayHome.addEventListener('click', goHome);

// Load personal best on mount
updateBestTimeUI();

function goHome() {
  window.location.href = '/';
}

function updateBestTimeUI() {
  const best = localStorage.getItem('memory_best_time');
  if (best) {
    bestTimeEl.textContent = `${best}s`;
  } else {
    bestTimeEl.textContent = '--';
  }
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function startGame() {
  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  resetGame();
}

function resetGame() {
  // Clear state
  clearInterval(timerInterval);
  timerInterval = null;
  flippedCards = [];
  matchedCount = 0;
  flips = 0;
  timeElapsed = 0;
  gameActive = true;
  winOverlay.classList.add('hidden');

  // Update UI
  flipCountEl.textContent = '0';
  timerEl.textContent = '0s';
  updateBestTimeUI();

  // Create card deck
  const deck = [...EMOJIS, ...EMOJIS];
  shuffle(deck);

  // Render Grid
  cardGrid.innerHTML = '';
  cards = deck.map((emoji, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item aspect-square w-full';
    cardEl.dataset.idx = idx;
    cardEl.dataset.emoji = emoji;

    cardEl.innerHTML = `
      <div class="card-inner w-full h-full">
        <div class="card-front font-semibold">❓</div>
        <div class="card-back">${emoji}</div>
      </div>
    `;

    cardEl.addEventListener('click', () => handleCardFlip(cardEl));
    cardGrid.appendChild(cardEl);
    return cardEl;
  });

  // Start timer
  startTimer();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startTimer() {
  timeElapsed = 0;
  timerInterval = setInterval(() => {
    if (gameActive) {
      timeElapsed++;
      timerEl.textContent = `${timeElapsed}s`;
    }
  }, 1000);
}

// ─── Flip & Match Logic ───────────────────────────────────────────────────────
function handleCardFlip(cardEl) {
  if (!gameActive) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
  if (flippedCards.length >= 2) return; // Prevent double-clicking more cards

  // Flip card
  cardEl.classList.add('flipped');
  flippedCards.push(cardEl);
  flips++;
  flipCountEl.textContent = flips;

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const emoji1 = card1.dataset.emoji;
  const emoji2 = card2.dataset.emoji;

  if (emoji1 === emoji2) {
    // Match found
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCount += 2;
    flippedCards = [];

    // Check Win
    if (matchedCount === cards.length) {
      endGame();
    }
  } else {
    // No match: flip cards back after 1 second
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 900);
  }
}

// ─── End Game ─────────────────────────────────────────────────────────────────
function endGame() {
  gameActive = false;
  clearInterval(timerInterval);

  // Check personal best
  const currentBest = localStorage.getItem('memory_best_time');
  let isNewRecord = false;

  if (!currentBest || timeElapsed < parseInt(currentBest)) {
    localStorage.setItem('memory_best_time', timeElapsed);
    isNewRecord = true;
  }

  // Speak victory
  speakVictory(isNewRecord);

  // Show win overlay
  winStatsEl.textContent = `Matched all cards in ${flips} flips and ${timeElapsed} seconds!`;
  if (isNewRecord) {
    newRecordTextEl.textContent = `🎉 New Brain-Trainer Record! Personal Best: ${timeElapsed}s!`;
  } else {
    newRecordTextEl.textContent = '';
  }

  setTimeout(() => {
    winOverlay.classList.remove('hidden');
  }, 600);
}

function speakVictory(isNewRecord) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  let msg = `Fantastic cognitive achievement! You cleared the board in ${flips} flips! `;
  if (isNewRecord) {
    msg += `A brand new record of ${timeElapsed} seconds! Your brain is growing faster than ever!`;
  } else {
    msg += `Completed in ${timeElapsed} seconds. Great brain training session!`;
  }

  const utterance = new SpeechSynthesisUtterance(msg);
  utterance.rate = 1.0;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
}
