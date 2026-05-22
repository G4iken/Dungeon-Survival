import { Player } from '../entities/Player.js';

const SAVE_KEY = 'ai-dungeon-survival-save-v1';
const SETTINGS_KEY = 'ai-dungeon-survival-settings-v1';
const BEST_KEY = 'ai-dungeon-survival-best-score-v1';

export function saveGame(game) {
  if (!game || !game.player || game.gameOver || game.victory) return;
  const data = {
    savedAt: new Date().toISOString(),
    player: game.player.toJSON ? game.player.toJSON() : game.player,
    dungeon: game.dungeon,
    enemies: game.enemies.filter((enemy) => !enemy.dead),
    items: game.items.filter((item) => !item.picked),
    roomsCleared: game.roomsCleared,
    enemiesKilled: game.enemiesKilled,
    score: game.score,
    floor: game.floor,
    timeSurvived: game.timeSurvived,
    difficulty: game.difficulty,
    currentRoomId: game.currentRoomId,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    data.player = Player.from(data.player);
    return data;
  } catch {
    return null;
  }
}

export function hasSaveGame() {
  return Boolean(localStorage.getItem(SAVE_KEY));
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveBestScore(score) {
  const best = getBestScore();
  if (score > best) localStorage.setItem(BEST_KEY, String(score));
}

export function getBestScore() {
  return Number(localStorage.getItem(BEST_KEY) || 0);
}
