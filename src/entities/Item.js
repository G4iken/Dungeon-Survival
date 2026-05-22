import { RARITY } from '../game/constants.js';
import { uid } from '../utils/helpers.js';

export class Item {
  constructor({ name, type, x, y, rarity = RARITY.COMMON, value = 1, description = '' }) {
    this.id = uid('item');
    this.name = name;
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = 18;
    this.h = 18;
    this.rarity = rarity;
    this.value = value;
    this.description = description;
    this.picked = false;
  }
}
