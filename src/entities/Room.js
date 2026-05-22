export class Room {
  constructor({ id, x, y, w, h, type }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.spawned = false;
    this.cleared = type === 'Spawn';
    this.visited = false;
    this.locked = false;
    this.traps = [];
  }

  get center() {
    return {
      x: this.x + Math.floor(this.w / 2),
      y: this.y + Math.floor(this.h / 2),
    };
  }
}
