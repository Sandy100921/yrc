const SYMBOLS = ['⚡', '🌙', '🔮', '💎', '🎯', '🎵', '🌸', '🔥'];
const BOARD = document.getElementById('memoryBoard');

const state = {
  cards: [],
  flipped: [],
  matched: 0,
  moves: 0,
  lock: false,
  startTime: null,
  timerId: null,
  elapsed: 0
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcScore(moves, seconds) {
  return Math.max(0, Math.round(1000 - moves * 12 - seconds * 4));
}

function updateHUD() {
  document.getElementById('movesValue').textContent = state.moves;
  document.getElementById('pairsValue').textContent = `${state.matched}/8`;
  document.getElementById('timeValue').textContent = state.elapsed;
}

function startTimer() {
  if (state.timerId) return;
  state.startTime = Date.now();
  state.timerId = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    updateHUD();
  }, 1000);
}

function buildBoard() {
  BOARD.innerHTML = '';
  const pairs = shuffle([...SYMBOLS, ...SYMBOLS]);
  state.cards = pairs.map((symbol, index) => ({ symbol, index, matched: false }));

  pairs.forEach((symbol, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = i;
    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-back">?</div>
        <div class="memory-card-front">${symbol}</div>
      </div>`;
    card.addEventListener('click', () => flipCard(i));
    BOARD.appendChild(card);
  });
}

function getCardEl(index) {
  return BOARD.querySelector(`[data-index="${index}"]`);
}

function flipCard(index) {
  if (state.lock) return;
  const data = state.cards[index];
  const el = getCardEl(index);
  if (!data || data.matched || el.classList.contains('flipped')) return;

  startTimer();
  el.classList.add('flipped');
  state.flipped.push(index);

  if (state.flipped.length < 2) return;

  state.moves++;
  updateHUD();
  state.lock = true;

  const [a, b] = state.flipped;
  if (state.cards[a].symbol === state.cards[b].symbol) {
    setTimeout(() => {
      getCardEl(a).classList.add('matched');
      getCardEl(b).classList.add('matched');
      state.cards[a].matched = true;
      state.cards[b].matched = true;
      state.matched++;
      state.flipped = [];
      state.lock = false;
      updateHUD();
      if (state.matched === 8) finishGame();
    }, 400);
  } else {
    setTimeout(() => {
      getCardEl(a).classList.remove('flipped');
      getCardEl(b).classList.remove('flipped');
      state.flipped = [];
      state.lock = false;
    }, 700);
  }
}

function finishGame() {
  clearInterval(state.timerId);
  const score = calcScore(state.moves, state.elapsed);
  const isNewRecord = updateHighScore('memory', score);
  saveSessionResult('memory', {
    score,
    moves: state.moves,
    time: state.elapsed,
    isNewRecord,
    rank: getMemoryRankText(score)
  });
  setTimeout(() => { window.location.href = 'memory-result.html'; }, 500);
}

function initGame() {
  state.flipped = [];
  state.matched = 0;
  state.moves = 0;
  state.lock = false;
  state.elapsed = 0;
  clearInterval(state.timerId);
  state.timerId = null;
  buildBoard();
  updateHUD();
}

document.getElementById('restartBtn').addEventListener('click', initGame);
initGame();
