const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');

const GRID = 20;
const CELL = 20;
canvas.width = GRID * CELL;
canvas.height = GRID * CELL;

const COLORS = {
  snake: '#00f5ff',
  snakeHead: '#ffe566',
  food: '#ff2d95',
  grid: 'rgba(255,255,255,0.03)'
};

let snake, direction, nextDirection, food, score, running, loopId, speed;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = 140;
  spawnFood();
  updateHUD();
}

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID)
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function updateHUD() {
  document.getElementById('scoreValue').textContent = score;
  document.getElementById('lengthValue').textContent = snake.length;
}

function drawCell(x, y, color, glow) {
  ctx.fillStyle = color;
  ctx.shadowBlur = glow ? 12 : 0;
  ctx.shadowColor = color;
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  ctx.shadowBlur = 0;
}

function draw() {
  ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i <= GRID; i++) {
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(canvas.width, i * CELL);
    ctx.stroke();
  }

  drawCell(food.x, food.y, COLORS.food, true);

  snake.forEach((seg, i) => {
    drawCell(seg.x, seg.y, i === 0 ? COLORS.snakeHead : COLORS.snake, i === 0);
  });
}

function tick() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    return endGame();
  }
  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    speed = Math.max(70, speed - 3);
    spawnFood();
    updateHUD();
  } else {
    snake.pop();
  }

  draw();
  loopId = setTimeout(tick, speed);
}

function startGame() {
  if (running) return;
  running = true;
  document.getElementById('startOverlay').classList.remove('visible');
  resetGame();
  draw();
  loopId = setTimeout(tick, speed);
}

function endGame() {
  running = false;
  clearTimeout(loopId);
  const isNewRecord = updateHighScore('snake', score);
  saveSessionResult('snake', {
    score,
    length: snake.length,
    isNewRecord,
    rank: getSnakeRankText(score)
  });
  window.location.href = 'snake-result.html';
}

function setDirection(x, y) {
  if (!running) return;
  if (direction.x + x === 0 && direction.y + y === 0) return;
  nextDirection = { x, y };
}

document.addEventListener('keydown', (e) => {
  const map = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0]
  };
  if (map[e.code]) {
    e.preventDefault();
    setDirection(...map[e.code]);
  }
  if (e.code === 'Space' && !running) {
    e.preventDefault();
    startGame();
  }
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('padUp').addEventListener('click', () => setDirection(0, -1));
document.getElementById('padDown').addEventListener('click', () => setDirection(0, 1));
document.getElementById('padLeft').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('padRight').addEventListener('click', () => setDirection(1, 0));

resetGame();
draw();
