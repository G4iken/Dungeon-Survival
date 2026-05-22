import { PLAYER_BASE } from '../game/constants.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 24;
    this.h = 24;
    this.facing = 0;
    this.health = PLAYER_BASE.maxHealth;
    this.maxHealth = PLAYER_BASE.maxHealth;
    this.stamina = PLAYER_BASE.maxStamina;
    this.maxStamina = PLAYER_BASE.maxStamina;
    this.speed = PLAYER_BASE.speed;
    this.damage = PLAYER_BASE.damage;
    this.defense = PLAYER_BASE.defense;
    this.critChance = PLAYER_BASE.critChance;
    this.level = 1;
    this.xp = 0;
    this.nextLevelXp = 60;
    this.gold = 0;
    this.inventory = [];
    this.attackCooldown = 0;
    this.dashCooldown = 0;
    this.dashRemaining = 0;
    this.dashDirX = 1;
    this.dashDirY = 0;
    this.invulnerable = 0;
    this.damageTakenRecently = 0;
  }

  get cx() {
    return this.x + this.w / 2;
  }

  get cy() {
    return this.y + this.h / 2;
  }

  addXp(amount) {
    this.xp += amount;
    if (this.xp >= this.nextLevelXp) {
      this.xp -= this.nextLevelXp;
      this.level += 1;
      this.nextLevelXp = Math.floor(this.nextLevelXp * 1.35 + 20);
      return true;
    }
    return false;
  }

  toJSON() {
    return { ...this };
  }

  static from(data) {
    const player = new Player(data.x, data.y);
    Object.assign(player, data);
    return player;
  }
}
