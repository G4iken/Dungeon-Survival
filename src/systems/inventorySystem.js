export function addItemToInventory(player, item) {
  if (item.type === 'gold') {
    player.gold += item.value;
    return true;
  }
  if (player.inventory.length >= 16) return false;
  player.inventory.push(item);
  return true;
}

export function useInventoryItem(player, index) {
  const item = player.inventory[index];
  if (!item) return { used: false, message: 'No item selected.' };

  if (item.type === 'healthPotion') {
    if (player.health >= player.maxHealth) return { used: false, message: 'Health is already full.' };
    player.health = Math.min(player.maxHealth, player.health + item.value);
  } else if (item.type === 'staminaPotion') {
    if (player.stamina >= player.maxStamina) return { used: false, message: 'Stamina is already full.' };
    player.stamina = Math.min(player.maxStamina, player.stamina + item.value);
  } else if (item.type === 'weapon') {
    player.damage += item.value;
  } else if (item.type === 'armor') {
    player.defense += Math.max(1, Math.floor(item.value / 3));
  } else if (item.type === 'speedCharm') {
    player.speed += item.value;
  } else if (item.type === 'artifact') {
    player.damage += item.value;
    player.maxHealth += item.value;
    player.health = Math.min(player.maxHealth, player.health + item.value);
  } else {
    return { used: false, message: 'This item cannot be used.' };
  }

  player.inventory.splice(index, 1);
  return { used: true, message: `Used ${item.name}.` };
}
