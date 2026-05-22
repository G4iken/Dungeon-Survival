import { uid } from '../utils/helpers.js';

const ENEMY_BLUEPRINTS = {
  basic: {
    name: 'Shadow Grunt',
    color: '#fb7185',
    health: 42,
    damage: 10,
    speed: 72,
    attackRange: 30,
    detectionRange: 220,
    xp: 18,
    gold: 6,
    radius: 13,
  },
  archer: {
    name: 'Bone Archer',
    color: '#facc15',
    health: 30,
    damage: 8,
    speed: 62,
    attackRange: 180,
    detectionRange: 260,
    xp: 22,
    gold: 8,
    radius: 12,
  },
  tank: {
    name: 'Dungeon Brute',
    color: '#f97316',
    health: 82,
    damage: 16,
    speed: 44,
    attackRange: 34,
    detectionRange: 200,
    xp: 32,
    gold: 12,
    radius: 16,
  },
  fast: {
    name: 'Feral Wisp',
    color: '#a78bfa',
    health: 24,
    damage: 7,
    speed: 118,
    attackRange: 28,
    detectionRange: 230,
    xp: 16,
    gold: 5,
    radius: 10,
  },
  miniboss: {
    name: 'Abyss Knight',
    color: '#ef4444',
    health: 180,
    damage: 22,
    speed: 58,
    attackRange: 42,
    detectionRange: 320,
    xp: 100,
    gold: 45,
    radius: 22,
  },
};

export class Enemy {
  constructor(type, x, y, scale = 1) {
    const base = ENEMY_BLUEPRINTS[type] || ENEMY_BLUEPRINTS.basic;
    this.id = uid('enemy');
    this.type = type;
    this.name = base.name;
    this.x = x;
    this.y = y;
    this.r = base.radius;
    this.color = base.color;
    this.maxHealth = Math.floor(base.health * scale);
    this.health = this.maxHealth;
    this.damage = Math.floor(base.damage * scale);
    this.speed = base.speed * Math.min(1.45, 0.9 + scale * 0.12);
    this.attackRange = base.attackRange;
    this.detectionRange = base.detectionRange;
    this.xp = Math.floor(base.xp * scale);
    this.gold = Math.floor(base.gold * scale);
    this.state = 'idle';
    this.attackCooldown = 0;
    this.searchTimer = 0;
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.projectileCooldown = 0;
    this.roomId = null;
    this.dead = false;
  }
}

export function getEnemyTypes() {
  return Object.keys(ENEMY_BLUEPRINTS);
}
