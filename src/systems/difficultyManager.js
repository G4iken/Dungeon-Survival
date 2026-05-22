import { clamp } from '../utils/random.js';

export function createDifficulty(mode = 'Normal') {
  const base = mode === 'Easy' ? 0.85 : mode === 'Hard' ? 1.25 : 1;
  return {
    mode,
    multiplier: base,
    enemySpawnBonus: 0,
    lootBonus: 0,
    directorAggression: mode === 'Hard' ? 0.2 : 0,
  };
}

export function updateDifficulty(game) {
  const player = game.player;
  const healthRatio = player.health / player.maxHealth;
  const clearRate = game.roomsCleared / Math.max(1, game.timeSurvived / 50);
  const killRate = game.enemiesKilled / Math.max(1, game.timeSurvived / 40);
  const struggling = healthRatio < 0.35 || player.damageTakenRecently > 45;
  const dominating = healthRatio > 0.75 && (clearRate > 1 || killRate > 2);

  if (struggling) {
    game.difficulty.multiplier = clamp(game.difficulty.multiplier - 0.015, 0.75, 2.2);
    game.difficulty.enemySpawnBonus = clamp(game.difficulty.enemySpawnBonus - 0.01, -0.25, 0.5);
    game.difficulty.directorAggression = clamp(game.difficulty.directorAggression - 0.01, -0.2, 0.45);
  } else if (dominating) {
    game.difficulty.multiplier = clamp(game.difficulty.multiplier + 0.012, 0.75, 2.2);
    game.difficulty.enemySpawnBonus = clamp(game.difficulty.enemySpawnBonus + 0.01, -0.25, 0.7);
    game.difficulty.lootBonus = clamp(game.difficulty.lootBonus + 0.006, 0, 0.35);
    game.difficulty.directorAggression = clamp(game.difficulty.directorAggression + 0.01, -0.2, 0.6);
  }

  player.damageTakenRecently *= 0.985;
}
