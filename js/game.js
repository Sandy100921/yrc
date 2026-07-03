const COLORS = ['cyan', 'pink', 'yellow', 'purple'];
const STAR_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21 8 13.6 2 9.4h7.6z"/></svg>`;

const state = {
  score: 0,
  lives: 3,
  timeLeft: 60,
  combo: 0,
  maxCombo: 0,
  caught: 0,
  missed: 0,
  running: false,
  spawnInterval: null,
  timerInterval: null,
  loopId: null,
  stars: [],
  difficulty: 1
};

const els = {
  area: document.getElementById('gameArea'),
  score: document.getElementById('scoreValue'),
  lives: document.getElementById('livesValue'),
  time: document.getElementById('timeValue'),
  combo: document.getElementById('comboValue'),
  comboBanner: document.getElementById('comboBanner'),
  startOverlay: document.getElementById('startOverlay'),
  pauseOverlay: document.getElementById('pauseOverlay')
};

function updateHUD() {
  els.score.textContent = state.score;
  els.lives.textContent = '❤'.repeat(state.lives) + (state.lives === 0 ? '' : ' '.repeat(3 - state.lives));
  els.time.textContent = state.timeLeft;
  els.combo.textContent = state.combo > 1 ? `×${state.combo}` : '—';
}

function showComboBanner(text) {
  els.comboBanner.textContent = text;
  els.comboBanner.classList.add('show');
  setTimeout(() => els.comboBanner.classList.remove('show'), 600);
}

function spawnStar() {
  if (!state.running) return;

  const star = document.createElement('div');
  star.className = `falling-star ${COLORS[Math.floor(Math.random() * COLORS.length)]}`;
  star.innerHTML = STAR_SVG;

  const size = 40 + Math.random() * 16;
  star.style.width = size + 'px';
  star.style.height = size + 'px';

  const maxX = els.area.clientWidth - size;
  star.style.left = Math.random() * maxX + 'px';
  star.style.top = '-60px';

  const speed = 1.8 + state.difficulty * 0.35 + Math.random() * 0.8;
  const data = { el: star, y: -60, speed, caught: false };

  star.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!state.running || data.caught) return;
    catchStar(data);
  });

  els.area.appendChild(star);
  state.stars.push(data);
}

function catchStar(data) {
  data.caught = true;
  state.caught++;
  state.combo++;
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;

  const basePoints = 10;
  const comboBonus = Math.max(0, state.combo - 1) * 5;
  const points = basePoints + comboBonus;
  state.score += points;

  const rect = data.el.getBoundingClientRect();
  const areaRect = els.area.getBoundingClientRect();
  showBurst(rect.left - areaRect.left + rect.width / 2, rect.top - areaRect.top, `+${points}`);

  if (state.combo === 5) showComboBanner('连击 ×5!');
  if (state.combo === 10) showComboBanner('超神连击!');
  if (state.combo === 15) showComboBanner('无敌!!!');

  data.el.remove();
  state.stars = state.stars.filter((s) => s !== data);
  updateHUD();
}

function showBurst(x, y, text) {
  const burst = document.createElement('div');
  burst.className = 'catch-burst';
  burst.textContent = text;
  burst.style.left = x + 'px';
  burst.style.top = y + 'px';
  els.area.appendChild(burst);
  setTimeout(() => burst.remove(), 600);
}

function missStar(data) {
  if (data.caught) return;
  data.caught = true;
  state.missed++;
  state.combo = 0;
  state.lives--;
  data.el.remove();
  state.stars = state.stars.filter((s) => s !== data);
  updateHUD();

  if (state.lives <= 0) {
    endGame();
  }
}

function gameLoop() {
  if (!state.running) return;

  const bottom = els.area.clientHeight;

  state.stars.forEach((data) => {
    if (data.caught) return;
    data.y += data.speed;
    data.el.style.top = data.y + 'px';

    if (data.y > bottom) {
      missStar(data);
    }
  });

  state.loopId = requestAnimationFrame(gameLoop);
}

function startGame() {
  state.score = 0;
  state.lives = 3;
  state.timeLeft = 60;
  state.combo = 0;
  state.maxCombo = 0;
  state.caught = 0;
  state.missed = 0;
  state.difficulty = 1;
  state.running = true;
  state.stars.forEach((s) => s.el.remove());
  state.stars = [];

  els.startOverlay.classList.remove('visible');
  els.pauseOverlay.classList.remove('visible');
  updateHUD();

  state.spawnInterval = setInterval(spawnStar, 900);
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    state.difficulty = 1 + (60 - state.timeLeft) / 15;
    updateHUD();
    if (state.timeLeft <= 0) endGame();
  }, 1000);

  gameLoop();
}

function pauseGame() {
  if (!state.running) return;
  state.running = false;
  clearInterval(state.spawnInterval);
  clearInterval(state.timerInterval);
  cancelAnimationFrame(state.loopId);
  els.pauseOverlay.classList.add('visible');
}

function resumeGame() {
  state.running = true;
  els.pauseOverlay.classList.remove('visible');
  state.spawnInterval = setInterval(spawnStar, Math.max(400, 900 - state.difficulty * 80));
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    state.difficulty = 1 + (60 - state.timeLeft) / 15;
    updateHUD();
    if (state.timeLeft <= 0) endGame();
  }, 1000);
  gameLoop();
}

function endGame() {
  state.running = false;
  clearInterval(state.spawnInterval);
  clearInterval(state.timerInterval);
  cancelAnimationFrame(state.loopId);

  const isNewRecord = updateHighScore('star', state.score);
  saveSessionResult('star', {
    score: state.score,
    caught: state.caught,
    missed: state.missed,
    maxCombo: state.maxCombo,
    isNewRecord,
    rank: getRankText(state.score)
  });

  window.location.href = 'result.html';
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('quitBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    if (state.running) pauseGame();
    else if (els.pauseOverlay.classList.contains('visible')) resumeGame();
  }
  if (e.code === 'Space' && els.startOverlay.classList.contains('visible')) {
    e.preventDefault();
    startGame();
  }
});

updateHUD();
