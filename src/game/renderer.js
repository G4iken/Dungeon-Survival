import { COLORS, TILE, TILE_SIZE } from './constants.js';
import { getRarityColor } from '../systems/lootSystem.js';

export function renderGame(ctx, game) {
  const shake = game.cameraShake > 0 ? (Math.random() - 0.5) * game.cameraShake : 0;
  ctx.save();
  ctx.translate(shake, -shake);
  ctx.clearRect(-20, -20, ctx.canvas.width + 40, ctx.canvas.height + 40);
  drawDungeon(ctx, game);
  drawTraps(ctx, game);
  drawItems(ctx, game);
  drawPortal(ctx, game);
  drawProjectiles(ctx, game);
  drawEnemies(ctx, game);
  drawPlayer(ctx, game);
  drawAttackFlash(ctx, game);
  drawFloatingText(ctx, game);
  ctx.restore();

  drawNarrator(ctx, game);
}

function drawDungeon(ctx, game) {
  const { dungeon } = game;
  for (let y = 0; y < dungeon.height; y++) {
    for (let x = 0; x < dungeon.width; x++) {
      const tile = dungeon.tiles[y][x];
      ctx.fillStyle = tile === TILE.WALL ? COLORS.wall : ((x + y) % 2 ? COLORS.floor : COLORS.floorAlt);
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      if (tile === TILE.WALL) {
        ctx.strokeStyle = COLORS.wallEdge;
        ctx.strokeRect(x * TILE_SIZE + 0.5, y * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      }
    }
  }

  for (const room of dungeon.rooms) {
    ctx.strokeStyle = room.id === game.currentRoomId ? 'rgba(104,242,255,0.65)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = room.id === game.currentRoomId ? 2 : 1;
    ctx.strokeRect(room.x * TILE_SIZE + 4, room.y * TILE_SIZE + 4, room.w * TILE_SIZE - 8, room.h * TILE_SIZE - 8);
    if (room.visited) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(room.type, room.x * TILE_SIZE + 8, room.y * TILE_SIZE + 18);
    }
  }
}

function drawTraps(ctx, game) {
  for (const room of game.dungeon.rooms) {
    for (const trap of room.traps || []) {
      ctx.save();
      ctx.translate(trap.x, trap.y);
      ctx.rotate(game.timeSurvived * 1.5);
      ctx.fillStyle = trap.active ? 'rgba(239,68,68,0.75)' : 'rgba(248,113,113,0.35)';
      ctx.fillRect(-9, -9, 18, 18);
      ctx.restore();
    }
  }
}

function drawPortal(ctx, game) {
  const room = game.dungeon.rooms.find((r) => r.type === 'Exit');
  if (!room) return;
  const x = game.dungeon.exit.x;
  const y = game.dungeon.exit.y;
  const pulse = 6 + Math.sin(game.timeSurvived * 4) * 3;
  ctx.beginPath();
  ctx.fillStyle = 'rgba(186,115,255,0.25)';
  ctx.arc(x, y, 22 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.portal;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 18 + pulse, 0, Math.PI * 2);
  ctx.stroke();
}

function drawItems(ctx, game) {
  for (const item of game.items) {
    if (item.picked) continue;
    const glow = 4 + Math.sin(game.timeSurvived * 5 + item.x) * 2;
    ctx.fillStyle = getRarityColor(item.rarity);
    ctx.shadowColor = getRarityColor(item.rarity);
    ctx.shadowBlur = 10 + glow;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawEnemies(ctx, game) {
  for (const enemy of game.enemies) {
    if (enemy.dead) continue;
    ctx.fillStyle = enemy.color;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = enemy.type === 'miniboss' ? 18 : 8;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(15,23,42,0.95)';
    ctx.fillRect(enemy.x - enemy.r, enemy.y - enemy.r - 11, enemy.r * 2, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(enemy.x - enemy.r, enemy.y - enemy.r - 11, enemy.r * 2 * Math.max(0, enemy.health / enemy.maxHealth), 4);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(enemy.state, enemy.x - enemy.r, enemy.y + enemy.r + 12);
  }
}

function drawProjectiles(ctx, game) {
  for (const p of game.projectiles) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx, game) {
  const p = game.player;
  ctx.save();
  ctx.translate(p.cx, p.cy);
  if (p.invulnerable > 0) ctx.globalAlpha = 0.6 + Math.sin(game.timeSurvived * 40) * 0.25;
  ctx.fillStyle = COLORS.player;
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = COLORS.playerStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.rotate(p.facing);
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(8, -3, 14, 6);
  ctx.restore();
}

function drawAttackFlash(ctx, game) {
  const flash = game.attackFlash;
  if (!flash || flash.life <= 0) return;
  const p = game.player;
  ctx.save();
  ctx.translate(p.cx, p.cy);
  ctx.rotate(flash.angle);
  ctx.fillStyle = `rgba(104,242,255,${flash.life * 3.5})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 68, -0.55, 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFloatingText(ctx, game) {
  ctx.font = 'bold 14px Inter, sans-serif';
  for (const text of game.floatingTexts) {
    ctx.globalAlpha = Math.max(0, text.life / 0.7);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
    ctx.globalAlpha = 1;
  }
}

function drawNarrator(ctx, game) {
  if (!game.narrator) return;
  ctx.save();
  ctx.fillStyle = 'rgba(2,6,23,0.65)';
  ctx.fillRect(18, ctx.canvas.height - 54, ctx.canvas.width - 36, 36);
  ctx.strokeStyle = 'rgba(186,115,255,0.35)';
  ctx.strokeRect(18.5, ctx.canvas.height - 53.5, ctx.canvas.width - 37, 35);
  ctx.fillStyle = '#d8b4fe';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(game.narrator, 32, ctx.canvas.height - 31);
  ctx.restore();
}
