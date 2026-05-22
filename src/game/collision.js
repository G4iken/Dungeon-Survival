import { rectHitsWall } from '../systems/dungeonGenerator.js';

export function canRectMove(dungeon, x, y, w, h) {
  return !rectHitsWall(dungeon, { x, y, w, h });
}

export function canCircleMove(dungeon, x, y, r) {
  return !rectHitsWall(dungeon, { x: x - r, y: y - r, w: r * 2, h: r * 2 });
}
