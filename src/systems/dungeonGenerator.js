import { MAP_HEIGHT, MAP_WIDTH, ROOM_TYPES, TILE, TILE_SIZE } from '../game/constants.js';
import { Room } from '../entities/Room.js';
import { pick, randomInt } from '../utils/random.js';

function intersects(a, b) {
  return !(
    a.x + a.w + 1 < b.x ||
    b.x + b.w + 1 < a.x ||
    a.y + a.h + 1 < b.y ||
    b.y + b.h + 1 < a.y
  );
}

function carveRoom(tiles, room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      tiles[y][x] = TILE.FLOOR;
    }
  }
}

function carveHorizontal(tiles, x1, x2, y) {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  for (let x = start; x <= end; x++) tiles[y][x] = TILE.FLOOR;
}

function carveVertical(tiles, y1, y2, x) {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  for (let y = start; y <= end; y++) tiles[y][x] = TILE.FLOOR;
}

function farthestRoomFromSpawn(rooms) {
  const spawn = rooms[0].center;
  let farthest = rooms[0];
  let bestDistance = -1;
  for (const room of rooms) {
    const center = room.center;
    const distance = Math.hypot(center.x - spawn.x, center.y - spawn.y);
    if (distance > bestDistance) {
      bestDistance = distance;
      farthest = room;
    }
  }
  return farthest;
}

export function generateDungeon(floor = 1) {
  const tiles = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(TILE.WALL));
  const rooms = [];
  const attempts = 140;
  const targetRooms = Math.min(10, 6 + Math.floor(floor / 2));

  // Randomly place non-overlapping rectangular rooms.
  for (let i = 0; i < attempts && rooms.length < targetRooms; i++) {
    const w = randomInt(4, 8);
    const h = randomInt(4, 6);
    const x = randomInt(1, MAP_WIDTH - w - 2);
    const y = randomInt(1, MAP_HEIGHT - h - 2);
    const candidate = new Room({ id: rooms.length, x, y, w, h, type: ROOM_TYPES.NORMAL });
    if (rooms.every((room) => !intersects(candidate, room))) {
      rooms.push(candidate);
      carveRoom(tiles, candidate);
    }
  }

  // Connect every room to the previous room with L-shaped corridors.
  // This guarantees that the dungeon is playable and every room is reachable.
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1].center;
    const current = rooms[i].center;
    if (Math.random() < 0.5) {
      carveHorizontal(tiles, prev.x, current.x, prev.y);
      carveVertical(tiles, prev.y, current.y, current.x);
    } else {
      carveVertical(tiles, prev.y, current.y, prev.x);
      carveHorizontal(tiles, prev.x, current.x, current.y);
    }
  }

  rooms[0].type = ROOM_TYPES.SPAWN;
  rooms[0].cleared = true;

  const exitRoom = farthestRoomFromSpawn(rooms);
  exitRoom.type = ROOM_TYPES.EXIT;

  const bossCandidates = rooms.filter((room) => room.id !== 0 && room.id !== exitRoom.id);
  if (bossCandidates.length) {
    const bossRoom = bossCandidates[Math.floor(bossCandidates.length * 0.7)] || bossCandidates[0];
    bossRoom.type = ROOM_TYPES.BOSS;
  }

  for (const room of rooms) {
    if ([ROOM_TYPES.SPAWN, ROOM_TYPES.EXIT, ROOM_TYPES.BOSS].includes(room.type)) continue;
    room.type = pick([ROOM_TYPES.NORMAL, ROOM_TYPES.NORMAL, ROOM_TYPES.NORMAL, ROOM_TYPES.TREASURE, ROOM_TYPES.TRAP, ROOM_TYPES.HEALING]);
  }

  const spawnCenter = rooms[0].center;
  const exitCenter = exitRoom.center;

  return {
    floor,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tiles,
    rooms,
    spawn: { x: spawnCenter.x * TILE_SIZE + TILE_SIZE / 2, y: spawnCenter.y * TILE_SIZE + TILE_SIZE / 2 },
    exit: { x: exitCenter.x * TILE_SIZE + TILE_SIZE / 2, y: exitCenter.y * TILE_SIZE + TILE_SIZE / 2 },
  };
}

export function getRoomAt(dungeon, worldX, worldY) {
  const tx = Math.floor(worldX / TILE_SIZE);
  const ty = Math.floor(worldY / TILE_SIZE);
  return dungeon.rooms.find((room) => tx >= room.x && tx < room.x + room.w && ty >= room.y && ty < room.y + room.h) || null;
}

export function isWallAt(dungeon, worldX, worldY) {
  const tx = Math.floor(worldX / TILE_SIZE);
  const ty = Math.floor(worldY / TILE_SIZE);
  if (tx < 0 || ty < 0 || tx >= dungeon.width || ty >= dungeon.height) return true;
  return dungeon.tiles[ty][tx] === TILE.WALL;
}

export function rectHitsWall(dungeon, rect) {
  return (
    isWallAt(dungeon, rect.x, rect.y) ||
    isWallAt(dungeon, rect.x + rect.w, rect.y) ||
    isWallAt(dungeon, rect.x, rect.y + rect.h) ||
    isWallAt(dungeon, rect.x + rect.w, rect.y + rect.h)
  );
}
