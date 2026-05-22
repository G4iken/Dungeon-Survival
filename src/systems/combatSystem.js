import { RARITY } from '../game/constants.js';
import { generateEnemyDrop } from './lootSystem.js';

export function performPlayerAttack(game, angle) {
  const player = game.player;
  if (player.attackCooldown > 0) return;
  player.attackCooldown = 0.32;
  player.facing = angle;
  game.attackFlash = { angle, life: 0.14 };
  game.cameraShake = Math.min(10, game.cameraShake + 3);
  if (game.settings.sound) game.sound.attack();

  const arcRadius = 64;
  const halfArc = Math.PI * 0.42;
  let hitAny = false;

  for (const enemy of game.enemies) {
    if (enemy.dead) continue;
    const dx = enemy.x - player.cx;
    const dy = enemy.y - player.cy;
    const dist = Math.hypot(dx, dy);
    if (dist > arcRadius + enemy.r) continue;
    const targetAngle = Math.atan2(dy, dx);
    const diff = Math.abs(Math.atan2(Math.sin(targetAngle - angle), Math.cos(targetAngle - angle)));
    if (diff <= halfArc) {
      const crit = Math.random() < player.critChance;
      const damage = Math.floor(player.damage * (crit ? 1.75 : 1));
      enemy.health -= damage;
      hitAny = true;
      game.floatingTexts.push({
        x: enemy.x,
        y: enemy.y - enemy.r,
        text: crit ? `${damage}!` : `${damage}`,
        life: 0.65,
        color: crit ? '#fbbf24' : '#e0f2fe',
      });
      const knock = 8;
      enemy.x += Math.cos(angle) * knock;
      enemy.y += Math.sin(angle) * knock;
      if (enemy.health <= 0) killEnemy(game, enemy);
    }
  }

  if (hitAny && game.settings.sound) game.sound.enemyHit();
}

export function killEnemy(game, enemy) {
  enemy.dead = true;
  game.enemiesKilled += 1;
  game.score += enemy.xp * 3 + enemy.gold;
  game.player.gold += enemy.gold;
  const leveled = game.player.addXp(enemy.xp);
  const drops = generateEnemyDrop(enemy, game.difficulty.lootBonus);
  game.items.push(...drops.map((item) => ({ ...item, x: enemy.x + (Math.random() - 0.5) * 20, y: enemy.y + (Math.random() - 0.5) * 20 })));
  if (leveled) {
    game.pendingLevelUp = true;
    if (game.settings.sound) game.sound.levelUp();
  }

  if (enemy.type === 'miniboss') {
    game.items.push({
      id: `artifact_${Date.now()}`,
      name: 'Abyss Core',
      type: 'artifact',
      x: enemy.x,
      y: enemy.y,
      w: 18,
      h: 18,
      rarity: RARITY.LEGENDARY,
      value: 1,
      description: '+12 damage and +10 max health when used.',
      picked: false,
    });
  }
}

export function applyUpgrade(player, upgrade) {
  if (upgrade === 'damage') player.damage += 6;
  if (upgrade === 'health') {
    player.maxHealth += 24;
    player.health = Math.min(player.maxHealth, player.health + 24);
  }
  if (upgrade === 'speed') player.speed += 16;
  if (upgrade === 'stamina') {
    player.maxStamina += 22;
    player.stamina = player.maxStamina;
  }
  if (upgrade === 'crit') player.critChance = Math.min(0.45, player.critChance + 0.06);
}
