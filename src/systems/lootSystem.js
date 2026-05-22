import { Item } from '../entities/Item.js';
import { RARITY } from '../game/constants.js';
import { chance, randomInt, weightedPick } from '../utils/random.js';

const rarityColorMap = {
  [RARITY.COMMON]: '#cbd5e1',
  [RARITY.RARE]: '#38bdf8',
  [RARITY.EPIC]: '#c084fc',
  [RARITY.LEGENDARY]: '#fbbf24',
};

export function getRarityColor(rarity) {
  return rarityColorMap[rarity] || rarityColorMap[RARITY.COMMON];
}

export function randomRarity(lootBonus = 0) {
  return weightedPick([
    { value: RARITY.COMMON, weight: 70 - lootBonus * 45 },
    { value: RARITY.RARE, weight: 22 + lootBonus * 15 },
    { value: RARITY.EPIC, weight: 7 + lootBonus * 20 },
    { value: RARITY.LEGENDARY, weight: 1 + lootBonus * 10 },
  ]);
}

export function createPotion(x, y, kind = 'health') {
  if (kind === 'stamina') {
    return new Item({ name: 'Stamina Potion', type: 'staminaPotion', x, y, rarity: RARITY.COMMON, value: 35, description: 'Restores 35 stamina.' });
  }
  return new Item({ name: 'Health Potion', type: 'healthPotion', x, y, rarity: RARITY.COMMON, value: 30, description: 'Restores 30 health.' });
}

export function createUpgradeLoot(x, y, lootBonus = 0) {
  const rarity = randomRarity(lootBonus);
  const value = rarity === RARITY.LEGENDARY ? 14 : rarity === RARITY.EPIC ? 9 : rarity === RARITY.RARE ? 6 : 3;
  const type = weightedPick([
    { value: 'weapon', weight: 4 },
    { value: 'armor', weight: 3 },
    { value: 'speedCharm', weight: 2 },
    { value: 'artifact', weight: rarity === RARITY.LEGENDARY ? 2 : 0.35 },
  ]);
  const names = {
    weapon: `${rarity} Blade Rune`,
    armor: `${rarity} Armor Plate`,
    speedCharm: `${rarity} Wind Charm`,
    artifact: `${rarity} Ancient Artifact`,
  };
  const descriptions = {
    weapon: `Use to gain +${value} damage.`,
    armor: `Use to gain +${Math.max(1, Math.floor(value / 3))} defense.`,
    speedCharm: `Use to gain +${value} movement speed.`,
    artifact: `Use to gain +${value} damage and +${value} max health.`,
  };
  return new Item({ name: names[type], type, x, y, rarity, value, description: descriptions[type] });
}

export function generateEnemyDrop(enemy, lootBonus = 0) {
  const drops = [];
  if (chance(0.25 + lootBonus)) drops.push(createPotion(enemy.x, enemy.y, chance(0.5) ? 'health' : 'stamina'));
  if (chance(0.2 + lootBonus * 0.7)) drops.push(createUpgradeLoot(enemy.x, enemy.y, lootBonus));
  if (chance(0.5)) {
    drops.push(new Item({ name: `${randomInt(3, 12)} Gold`, type: 'gold', x: enemy.x, y: enemy.y, value: randomInt(3, 12), rarity: RARITY.COMMON, description: 'Currency collected immediately.' }));
  }
  return drops;
}

export function generateRoomLoot(room, dungeon, lootBonus = 0) {
  const cx = (room.x + room.w / 2) * 32;
  const cy = (room.y + room.h / 2) * 32;
  const items = [];
  items.push(createUpgradeLoot(cx - 14, cy, lootBonus + 0.1));
  if (chance(0.75)) items.push(createPotion(cx + 22, cy + 4, 'health'));
  if (chance(0.5)) items.push(createPotion(cx, cy + 26, 'stamina'));
  return items;
}
