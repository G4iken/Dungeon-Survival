export const TILE_SIZE = 32;
export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 20;
export const CANVAS_WIDTH = TILE_SIZE * MAP_WIDTH;
export const CANVAS_HEIGHT = TILE_SIZE * MAP_HEIGHT;
export const TOTAL_FLOORS = 5;

export const TILE = {
  WALL: 1,
  FLOOR: 0,
};

export const ROOM_TYPES = {
  SPAWN: 'Spawn',
  NORMAL: 'Combat',
  TREASURE: 'Treasure',
  TRAP: 'Trap',
  HEALING: 'Healing',
  BOSS: 'Boss',
  EXIT: 'Exit',
};

export const RARITY = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
};

export const COLORS = {
  wall: '#111018',
  wallEdge: '#2d241b',
  floor: '#211c24',
  floorAlt: '#2b2430',
  player: '#f3d27a',
  playerStroke: '#fff4c7',
  portal: '#a855f7',
  common: '#cbd5e1',
  rare: '#38bdf8',
  epic: '#c084fc',
  legendary: '#fbbf24',
};

export const PLAYER_BASE = {
  maxHealth: 100,
  maxStamina: 100,
  speed: 165,
  damage: 18,
  defense: 2,
  critChance: 0.08,
};
