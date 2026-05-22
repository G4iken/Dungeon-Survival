import { Projectile } from '../entities/Projectile.js';
import { angleTo, distance, normalize } from '../utils/math.js';

export function updateEnemyAI(enemy, game, dt, canMoveTo) {
  const player = game.player;
  const d = distance(enemy, { x: player.cx, y: player.cy });
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  enemy.projectileCooldown = Math.max(0, enemy.projectileCooldown - dt);

  if (enemy.health <= enemy.maxHealth * 0.18 && enemy.type !== 'miniboss') {
    enemy.state = 'flee';
  } else if (d <= enemy.attackRange) {
    enemy.state = 'attack';
  } else if (d <= enemy.detectionRange) {
    enemy.state = 'chase';
    enemy.searchTimer = 1.6;
  } else if (enemy.searchTimer > 0) {
    enemy.state = 'search';
    enemy.searchTimer -= dt;
  } else if (enemy.state !== 'patrol') {
    enemy.state = 'idle';
  }

  let vx = 0;
  let vy = 0;

  if (enemy.state === 'idle') {
    if (Math.random() < 0.008) enemy.state = 'patrol';
  }

  if (enemy.state === 'patrol') {
    enemy.patrolAngle += (Math.random() - 0.5) * dt * 2;
    vx = Math.cos(enemy.patrolAngle) * enemy.speed * 0.35;
    vy = Math.sin(enemy.patrolAngle) * enemy.speed * 0.35;
    if (Math.random() < 0.004) enemy.state = 'idle';
  }

  if (enemy.state === 'chase') {
    if (enemy.type === 'archer' && d < 130) {
      const n = normalize(enemy.x - player.cx, enemy.y - player.cy);
      vx = n.x * enemy.speed * 0.85;
      vy = n.y * enemy.speed * 0.85;
    } else {
      const n = normalize(player.cx - enemy.x, player.cy - enemy.y);
      vx = n.x * enemy.speed;
      vy = n.y * enemy.speed;
    }
  }

  if (enemy.state === 'search') {
    const n = normalize(Math.cos(enemy.patrolAngle), Math.sin(enemy.patrolAngle));
    enemy.patrolAngle += dt;
    vx = n.x * enemy.speed * 0.45;
    vy = n.y * enemy.speed * 0.45;
  }

  if (enemy.state === 'flee') {
    const n = normalize(enemy.x - player.cx, enemy.y - player.cy);
    vx = n.x * enemy.speed * 1.1;
    vy = n.y * enemy.speed * 1.1;
  }

  const nextX = enemy.x + vx * dt;
  const nextY = enemy.y + vy * dt;
  if (canMoveTo(enemy, nextX, enemy.y)) enemy.x = nextX;
  if (canMoveTo(enemy, enemy.x, nextY)) enemy.y = nextY;

  if (enemy.state === 'attack' && enemy.attackCooldown <= 0) {
    if (enemy.type === 'archer') {
      fireEnemyProjectile(enemy, game);
      enemy.attackCooldown = 1.2;
    } else {
      damagePlayer(game, enemy.damage);
      enemy.attackCooldown = enemy.type === 'miniboss' ? 0.75 : 1.05;
    }
  }

  if (enemy.type === 'archer' && d <= enemy.attackRange && enemy.projectileCooldown <= 0) {
    fireEnemyProjectile(enemy, game);
    enemy.projectileCooldown = 1.4;
  }

  if (enemy.type === 'miniboss' && enemy.projectileCooldown <= 0) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + game.timeSurvived * 0.3;
      game.projectiles.push(new Projectile({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(a) * 155,
        vy: Math.sin(a) * 155,
        damage: Math.ceil(enemy.damage * 0.45),
        owner: 'enemy',
        color: '#ef4444',
        radius: 5,
        life: 2.1,
      }));
    }
    enemy.projectileCooldown = 3.2;
  }
}

function fireEnemyProjectile(enemy, game) {
  const angle = angleTo(enemy, { x: game.player.cx, y: game.player.cy });
  game.projectiles.push(new Projectile({
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * 220,
    vy: Math.sin(angle) * 220,
    damage: enemy.damage,
    owner: 'enemy',
    color: enemy.type === 'archer' ? '#facc15' : '#ef4444',
    radius: 5,
  }));
}

export function damagePlayer(game, rawDamage) {
  const player = game.player;
  if (player.invulnerable > 0) return false;
  const damage = Math.max(1, Math.floor(rawDamage - player.defense));
  player.health = Math.max(0, player.health - damage);
  player.damageTakenRecently += damage;
  player.invulnerable = 0.55;
  game.cameraShake = Math.min(14, game.cameraShake + 8);
  game.floatingTexts.push({ x: player.cx, y: player.cy - 18, text: `-${damage}`, life: 0.7, color: '#fb7185' });
  if (game.settings.sound) game.sound.hit();
  return true;
}
