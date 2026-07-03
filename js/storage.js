const STORAGE_PREFIX = 'neonArcade';

(function migrateLegacy() {
  try {
    const old = localStorage.getItem('neonStarGame');
    if (old && !localStorage.getItem(`${STORAGE_PREFIX}_star`)) {
      localStorage.setItem(`${STORAGE_PREFIX}_star`, old);
    }
  } catch { /* ignore */ }
})();

function getGameData(gameId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${gameId}`);
    return raw ? JSON.parse(raw) : { highScore: 0, gamesPlayed: 0 };
  } catch {
    return { highScore: 0, gamesPlayed: 0 };
  }
}

function saveGameData(gameId, data) {
  localStorage.setItem(`${STORAGE_PREFIX}_${gameId}`, JSON.stringify(data));
}

function getHighScore(gameId = 'star') {
  return getGameData(gameId).highScore;
}

function saveSessionResult(gameId, result) {
  sessionStorage.setItem(`lastResult_${gameId}`, JSON.stringify(result));
}

function getSessionResult(gameId = 'star') {
  try {
    const raw = sessionStorage.getItem(`lastResult_${gameId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function updateHighScore(gameId, score) {
  const data = getGameData(gameId);
  const isNewRecord = score > data.highScore;
  if (isNewRecord) {
    data.highScore = score;
  }
  data.gamesPlayed = (data.gamesPlayed || 0) + 1;
  saveGameData(gameId, data);
  return isNewRecord;
}

function getRankText(score) {
  if (score >= 500) return '星际大师';
  if (score >= 300) return '接星高手';
  if (score >= 150) return '霓虹猎手';
  if (score >= 50) return '见习收集者';
  return '宇宙新手';
}

function getMemoryRankText(score) {
  if (score >= 900) return '记忆之神';
  if (score >= 750) return '过目不忘';
  if (score >= 600) return '脑力达人';
  if (score >= 400) return '专注学徒';
  return '记忆新手';
}

function getSnakeRankText(score) {
  if (score >= 200) return '蛇王';
  if (score >= 120) return '猎食者';
  if (score >= 60) return '滑行者';
  if (score >= 20) return '小蛇';
  return '蛋仔';
}
