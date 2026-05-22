import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, ROOM_TYPES, TILE_SIZE, TOTAL_FLOORS } from './constants.js';
import { createInput, isDown } from './inputManager.js';
import { startLoop } from './gameLoop.js';
import { renderGame } from './renderer.js';
import { canCircleMove, canRectMove } from './collision.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Projectile } from '../entities/Projectile.js';
import { generateDungeon, getRoomAt, isWallAt } from '../systems/dungeonGenerator.js';
import { createDirector, chooseRoomEvent, narratorMessageFor } from '../systems/aiDirector.js';
import { createDifficulty, updateDifficulty } from '../systems/difficultyManager.js';
import { updateEnemyAI, damagePlayer } from '../systems/enemyAI.js';
import { performPlayerAttack, applyUpgrade } from '../systems/combatSystem.js';
import { createPotion, generateRoomLoot } from '../systems/lootSystem.js';
import { addItemToInventory, useInventoryItem } from '../systems/inventorySystem.js';
import { clearSave, loadGame, saveBestScore, saveGame } from '../systems/saveSystem.js';
import { createSoundSystem } from '../systems/soundSystem.js';
import { angleTo, distance } from '../utils/math.js';
import { clamp, randomInt, weightedPick } from '../utils/random.js';

function makeNewGame(settings) {
  const dungeon = generateDungeon(1);
  const player = new Player(dungeon.spawn.x - 12, dungeon.spawn.y - 12);
  return {
    floor: 1,
    dungeon,
    player,
    enemies: [],
    items: [createPotion(dungeon.spawn.x + 24, dungeon.spawn.y, 'health')],
    projectiles: [],
    floatingTexts: [],
    particles: [],
    currentRoomId: 0,
    score: 0,
    timeSurvived: 0,
    roomsCleared: 0,
    enemiesKilled: 0,
    gameOver: false,
    victory: false,
    pendingLevelUp: false,
    attackFlash: null,
    cameraShake: 0,
    narrator: `Floor 1/${TOTAL_FLOORS}: You wake inside a shifting dungeon. Find the exit portal.`,
    saveTimer: 0,
    difficulty: createDifficulty(settings.difficulty),
    director: createDirector(),
    settings,
    sound: createSoundSystem(),
  };
}

function restoreGame(settings) {
  const saved = loadGame();
  if (!saved) return makeNewGame(settings);
  return {
    ...makeNewGame(settings),
    floor: saved.floor || 1,
    dungeon: saved.dungeon,
    player: saved.player,
    enemies: saved.enemies || [],
    items: saved.items || [],
    projectiles: [],
    roomsCleared: saved.roomsCleared || 0,
    enemiesKilled: saved.enemiesKilled || 0,
    score: saved.score || 0,
    timeSurvived: saved.timeSurvived || 0,
    currentRoomId: saved.currentRoomId || 0,
    difficulty: saved.difficulty || createDifficulty(settings.difficulty),
    narrator: `Save loaded. Floor ${saved.floor || 1}/${TOTAL_FLOORS}: The dungeon remembers you.`,
  };
}

const GameCanvas = forwardRef(function GameCanvas({ paused, loadSaved, settings, onSnapshot, onPause, onInventory, onLevelUp, onGameOver, onVictory }, ref) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const inputRef = useRef(createInput());
  const pausedRef = useRef(paused);
  const callbacksRef = useRef({ onSnapshot, onPause, onInventory, onLevelUp, onGameOver, onVictory });

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    callbacksRef.current = { onSnapshot, onPause, onInventory, onLevelUp, onGameOver, onVictory };
  }, [onSnapshot, onPause, onInventory, onLevelUp, onGameOver, onVictory]);

  useImperativeHandle(ref, () => ({
    useItem(index) {
      const game = gameRef.current;
      if (!game) return { used: false, message: 'Game not ready.' };
      const result = useInventoryItem(game.player, index);
      if (result.used && game.settings.sound) game.sound.pickup();
      publishSnapshot(game);
      return result;
    },
    chooseUpgrade(upgrade) {
      const game = gameRef.current;
      if (!game) return;
      applyUpgrade(game.player, upgrade);
      game.pendingLevelUp = false;
      game.narrator = `Upgrade installed: ${upgrade}.`;
      saveGame(game);
      publishSnapshot(game);
    },
    save() {
      if (gameRef.current) saveGame(gameRef.current);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = loadSaved ? restoreGame(settings) : makeNewGame(settings);
    gameRef.current = game;
    publishSnapshot(game);

    const input = inputRef.current;

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const wasAlreadyDown = input.keys.has(key);
      input.keys.add(key);
      if (key === 'shift' && !wasAlreadyDown) input.dashPressed = true;
      if (key === 'escape') callbacksRef.current.onPause?.();
      if (key === 'i') callbacksRef.current.onInventory?.();
      if ([' ', 'shift', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    };

    const onKeyUp = (event) => input.keys.delete(event.key.toLowerCase());
    const onMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      input.mouse.x = (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      input.mouse.y = (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    };
    const onMouseDown = () => {
      input.mouse.down = true;
      input.mouse.clicked = true;
    };
    const onMouseUp = () => {
      input.mouse.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const stop = startLoop((dt) => {
      if (!pausedRef.current) updateGame(game, input, dt, callbacksRef.current);
      renderGame(ctx, game);
    });

    return () => {
      stop();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [loadSaved, settings]);

  return (
    <div className="canvas-frame">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </div>
  );
});

export default GameCanvas;

function updateGame(game, input, dt, callbacks) {
  if (game.gameOver || game.victory) return;
  const player = game.player;
  game.timeSurvived += dt;
  game.saveTimer += dt;
  game.cameraShake = Math.max(0, game.cameraShake - dt * 22);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.stamina = Math.min(player.maxStamina, player.stamina + dt * 12);

  if (game.attackFlash) {
    game.attackFlash.life -= dt;
    if (game.attackFlash.life <= 0) game.attackFlash = null;
  }

  handlePlayerMovement(game, input, dt);
  handlePlayerActions(game, input);
  updateRoom(game);
  updateEnemies(game, dt);
  updateProjectiles(game, dt);
  updateItems(game, input);
  updateTraps(game, dt);
  updateFloatingTexts(game, dt);
  updateDifficulty(game);
  checkEndStates(game, callbacks);

  if (game.pendingLevelUp) {
    game.pendingLevelUp = false;
    callbacks.onLevelUp?.();
  }

  if (game.saveTimer > 6) {
    game.saveTimer = 0;
    saveGame(game);
  }

  publishSnapshot(game);
}

function handlePlayerMovement(game, input, dt) {
  const p = game.player;
  const DASH_STAMINA_COST = 25;
  const DASH_DURATION = 0.16;
  const DASH_SPEED = 720;

  let dx = 0;
  let dy = 0;
  if (isDown(input, 'w')) dy -= 1;
  if (isDown(input, 's')) dy += 1;
  if (isDown(input, 'a')) dx -= 1;
  if (isDown(input, 'd')) dx += 1;

  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
    p.facing = Math.atan2(dy, dx);
  }

  // Dash must be an actual short burst, not just one fast movement frame.
  // Use a key-press trigger so stamina is spent once per Shift press.
  if (input.dashPressed) {
    input.dashPressed = false;
    const dashX = len > 0 ? dx : Math.cos(p.facing);
    const dashY = len > 0 ? dy : Math.sin(p.facing);

    if (p.stamina >= DASH_STAMINA_COST && p.dashCooldown <= 0) {
      p.stamina -= DASH_STAMINA_COST;
      p.dashCooldown = 0.55;
      p.dashRemaining = DASH_DURATION;
      p.dashDirX = dashX;
      p.dashDirY = dashY;
      p.invulnerable = Math.max(p.invulnerable, DASH_DURATION + 0.06);
      game.cameraShake = Math.min(10, game.cameraShake + 4);
      game.floatingTexts.push({
        x: p.cx - 16,
        y: p.cy - 18,
        text: 'Dash',
        life: 0.45,
        color: '#fbbf24',
      });
    } else if (p.stamina < DASH_STAMINA_COST) {
      game.narrator = 'Not enough stamina to dash.';
    }
  }

  const normalSpeed = p.speed;
  let remainingDt = dt;

  if (p.dashRemaining > 0) {
    const dashDt = Math.min(remainingDt, p.dashRemaining);
    movePlayerBy(game, p, p.dashDirX * DASH_SPEED * dashDt, p.dashDirY * DASH_SPEED * dashDt);
    p.dashRemaining = Math.max(0, p.dashRemaining - dashDt);
    remainingDt -= dashDt;
  }

  if (remainingDt > 0 && len > 0) {
    movePlayerBy(game, p, dx * normalSpeed * remainingDt, dy * normalSpeed * remainingDt);
  }
}

function movePlayerBy(game, p, moveX, moveY) {
  const nx = p.x + moveX;
  const ny = p.y + moveY;
  if (canRectMove(game.dungeon, nx, p.y, p.w, p.h)) p.x = nx;
  if (canRectMove(game.dungeon, p.x, ny, p.w, p.h)) p.y = ny;
}

function handlePlayerActions(game, input) {
  const p = game.player;
  let wantsAttack = false;
  let angle = p.facing;

  if (input.mouse.clicked) {
    wantsAttack = true;
    angle = angleTo({ x: p.cx, y: p.cy }, input.mouse);
  }
  if (isDown(input, ' ')) wantsAttack = true;
  if (isDown(input, 'arrowup')) { wantsAttack = true; angle = -Math.PI / 2; }
  if (isDown(input, 'arrowdown')) { wantsAttack = true; angle = Math.PI / 2; }
  if (isDown(input, 'arrowleft')) { wantsAttack = true; angle = Math.PI; }
  if (isDown(input, 'arrowright')) { wantsAttack = true; angle = 0; }

  if (wantsAttack) performPlayerAttack(game, angle);
  input.mouse.clicked = false;
}

function updateRoom(game) {
  const room = getRoomAt(game.dungeon, game.player.cx, game.player.cy);
  if (!room) return;
  if (room.id !== game.currentRoomId) {
    game.currentRoomId = room.id;
    enterRoom(game, room);
  }

  const livingEnemiesInRoom = game.enemies.filter((enemy) => !enemy.dead && enemy.roomId === room.id);
  if (room.spawned && livingEnemiesInRoom.length === 0 && !room.cleared) {
    room.cleared = true;
    room.locked = false;
    game.roomsCleared += 1;
    game.score += 100;
    game.narrator = room.type === ROOM_TYPES.EXIT ? narratorMessageFor('exit') : 'Room cleared. The doors loosen their grip.';
    if ([ROOM_TYPES.TREASURE, ROOM_TYPES.BOSS].includes(room.type)) {
      game.items.push(...generateRoomLoot(room, game.dungeon, game.difficulty.lootBonus));
    }
    saveGame(game);
  }
}

function enterRoom(game, room) {
  room.visited = true;
  if (room.spawned) return;
  room.spawned = true;
  const event = chooseRoomEvent(game, room);
  if (event === 'quiet' || event === 'safe') return;
  if (event === 'treasure') {
    game.items.push(...generateRoomLoot(room, game.dungeon, game.difficulty.lootBonus + 0.15));
    room.cleared = true;
    return;
  }
  if (event === 'healing') {
    const c = { x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) };
    game.items.push(createPotion(c.x * TILE_SIZE, c.y * TILE_SIZE, 'health'));
    game.items.push(createPotion(c.x * TILE_SIZE + 20, c.y * TILE_SIZE, 'stamina'));
    room.cleared = true;
    return;
  }
  if (event === 'trap') {
    createTraps(room);
    spawnRoomEnemies(game, room, 1);
    return;
  }
  if (event === 'miniboss') {
    spawnRoomEnemies(game, room, 1, true);
    return;
  }
  spawnRoomEnemies(game, room, event === 'ambush' ? 2 : 1);
}

function spawnRoomEnemies(game, room, bonus = 1, forceBoss = false) {
  room.locked = true;
  const count = forceBoss ? 1 : clamp(randomInt(2, 4) + Math.round(game.difficulty.enemySpawnBonus * 3) + bonus - 1, 1, 7);
  const scale = game.difficulty.multiplier + game.floor * 0.08;
  for (let i = 0; i < count; i++) {
    const type = forceBoss ? 'miniboss' : weightedPick([
      { value: 'basic', weight: 45 },
      { value: 'fast', weight: 20 + game.floor * 2 },
      { value: 'archer', weight: 18 + game.floor },
      { value: 'tank', weight: 12 + game.floor },
    ]);
    const pos = randomFloorPointInRoom(room);
    const enemy = new Enemy(type, pos.x, pos.y, scale);
    enemy.roomId = room.id;
    game.enemies.push(enemy);
  }
}

function randomFloorPointInRoom(room) {
  return {
    x: randomInt(room.x + 1, room.x + room.w - 2) * TILE_SIZE + TILE_SIZE / 2,
    y: randomInt(room.y + 1, room.y + room.h - 2) * TILE_SIZE + TILE_SIZE / 2,
  };
}

function createTraps(room) {
  const amount = randomInt(2, 4);
  for (let i = 0; i < amount; i++) {
    const p = randomFloorPointInRoom(room);
    room.traps.push({ x: p.x, y: p.y, cooldown: 0, active: false });
  }
}

function updateEnemies(game, dt) {
  const canMoveTo = (enemy, x, y) => canCircleMove(game.dungeon, x, y, enemy.r);
  for (const enemy of game.enemies) {
    if (!enemy.dead) updateEnemyAI(enemy, game, dt, canMoveTo);
  }
  game.enemies = game.enemies.filter((enemy) => !enemy.dead);
}

function updateProjectiles(game, dt) {
  const p = game.player;
  for (const projectile of game.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;
    if (isWallAt(game.dungeon, projectile.x, projectile.y)) projectile.life = 0;
    if (projectile.owner === 'enemy' && distance(projectile, { x: p.cx, y: p.cy }) < projectile.radius + 13) {
      damagePlayer(game, projectile.damage);
      projectile.life = 0;
    }
  }
  game.projectiles = game.projectiles.filter((projectile) => projectile.life > 0);
}

function updateItems(game, input) {
  const p = game.player;
  const wantsPickup = isDown(input, 'e');
  for (const item of game.items) {
    if (item.picked) continue;
    if (distance(item, { x: p.cx, y: p.cy }) < 26 && wantsPickup) {
      const added = addItemToInventory(p, item);
      if (added) {
        item.picked = true;
        game.score += item.type === 'gold' ? item.value : 15;
        game.narrator = item.type === 'gold' ? `Picked up ${item.value} gold.` : `Picked up ${item.name}.`;
        if (game.settings.sound) game.sound.pickup();
      } else {
        game.narrator = 'Inventory full.';
      }
    }
  }
  game.items = game.items.filter((item) => !item.picked);
}

function updateTraps(game, dt) {
  const p = game.player;
  const room = game.dungeon.rooms.find((r) => r.id === game.currentRoomId);
  if (!room?.traps?.length) return;
  for (const trap of room.traps) {
    trap.cooldown -= dt;
    trap.active = trap.cooldown > 0.8;
    if (trap.cooldown <= 0) trap.cooldown = 2.2 + Math.random() * 1.3;
    if (trap.active && distance(trap, { x: p.cx, y: p.cy }) < 24) {
      damagePlayer(game, 12 + game.floor * 2);
      trap.active = false;
      trap.cooldown = 1.5;
    }
  }
}

function updateFloatingTexts(game, dt) {
  for (const text of game.floatingTexts) {
    text.y -= dt * 22;
    text.life -= dt;
  }
  game.floatingTexts = game.floatingTexts.filter((text) => text.life > 0);
}

function checkEndStates(game, callbacks) {
  if (game.player.health <= 0) {
    game.gameOver = true;
    game.score += Math.floor(game.timeSurvived);
    saveBestScore(game.score);
    clearSave();
    if (game.settings.sound) game.sound.gameOver();
    callbacks.onGameOver?.();
    return;
  }

  const exitRoom = game.dungeon.rooms.find((room) => room.type === ROOM_TYPES.EXIT);
  if (exitRoom && exitRoom.cleared && distance({ x: game.dungeon.exit.x, y: game.dungeon.exit.y }, { x: game.player.cx, y: game.player.cy }) < 34) {
    if (game.floor < TOTAL_FLOORS) {
      advanceFloor(game);
      return;
    }

    game.victory = true;
    game.score += 1500 + Math.floor(game.timeSurvived * 2) + game.floor * 250;
    saveBestScore(game.score);
    clearSave();
    if (game.settings.sound) game.sound.victory();
    callbacks.onVictory?.();
  }
}

function advanceFloor(game) {
  const previousFloor = game.floor;
  const nextFloor = previousFloor + 1;
  const nextDungeon = generateDungeon(nextFloor);

  game.floor = nextFloor;
  game.dungeon = nextDungeon;
  game.player.x = nextDungeon.spawn.x - game.player.w / 2;
  game.player.y = nextDungeon.spawn.y - game.player.h / 2;
  game.player.health = Math.min(game.player.maxHealth, game.player.health + Math.ceil(game.player.maxHealth * 0.18));
  game.player.stamina = game.player.maxStamina;
  game.enemies = [];
  game.items = [createPotion(nextDungeon.spawn.x + 24, nextDungeon.spawn.y, 'health')];
  game.projectiles = [];
  game.floatingTexts = [];
  game.particles = [];
  game.currentRoomId = 0;
  game.attackFlash = null;
  game.cameraShake = 12;
  game.score += 500 + previousFloor * 175;
  game.difficulty.multiplier = clamp(game.difficulty.multiplier + 0.08, 0.75, 2.4);
  game.difficulty.enemySpawnBonus = clamp(game.difficulty.enemySpawnBonus + 0.04, -0.25, 0.8);
  game.difficulty.lootBonus = clamp(game.difficulty.lootBonus + 0.03, 0, 0.5);
  game.difficulty.directorAggression = clamp(game.difficulty.directorAggression + 0.03, -0.2, 0.7);
  game.director.lastEvent = 'floor-up';
  const spawnRoom = nextDungeon.rooms[0];
  if (spawnRoom) {
    spawnRoom.visited = true;
    spawnRoom.cleared = true;
  }
  game.narrator = `Portal stabilized. Floor ${nextFloor}/${TOTAL_FLOORS} is deeper, darker, and more dangerous.`;
  saveGame(game);
  publishSnapshot(game);
}

function publishSnapshot(game) {
  const room = game.dungeon.rooms.find((r) => r.id === game.currentRoomId);
  game.__snapshot = {
    player: { ...game.player, inventory: [...game.player.inventory] },
    floor: game.floor,
    totalFloors: TOTAL_FLOORS,
    score: game.score,
    timeSurvived: game.timeSurvived,
    roomsCleared: game.roomsCleared,
    enemiesKilled: game.enemiesKilled,
    enemiesRemaining: game.enemies.filter((enemy) => !enemy.dead && enemy.roomId === game.currentRoomId).length,
    roomType: room?.type,
    directorEvent: game.director.lastEvent,
    difficultyMode: game.difficulty.mode,
    difficultyMultiplier: Number(game.difficulty.multiplier.toFixed(2)),
    narrator: game.narrator,
    objective: game.floor >= TOTAL_FLOORS ? 'Clear the final floor and escape through the portal.' : 'Clear this floor and enter the portal to descend deeper.',
    currentRoomId: game.currentRoomId,
    rooms: game.dungeon.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, type: r.type, visited: r.visited, cleared: r.cleared })),
    gameOver: game.gameOver,
    victory: game.victory,
  };
  // Reduce React updates a little while keeping the HUD responsive.
  if (!game.__lastPublish || performance.now() - game.__lastPublish > 120 || game.gameOver || game.victory) {
    game.__lastPublish = performance.now();
    window.requestAnimationFrame(() => {
      const event = new CustomEvent('game-snapshot', { detail: game.__snapshot });
      window.dispatchEvent(event);
    });
  }
}
