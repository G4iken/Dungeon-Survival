import { uid } from '../utils/helpers.js';

export class Projectile {
  constructor({ x, y, vx, vy, damage, owner = 'enemy', color = '#facc15', radius = 5, life = 2.2 }) {
    this.id = uid('projectile');
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.owner = owner;
    this.color = color;
    this.radius = radius;
    this.life = life;
  }
}
