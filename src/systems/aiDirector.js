import { ROOM_TYPES } from '../game/constants.js';
import { weightedPick } from '../utils/random.js';

export function createDirector() {
  return {
    lastEvent: 'None',
    messageTimer: 0,
    eventHistory: [],
  };
}

export function chooseRoomEvent(game, room) {
  if (room.type === ROOM_TYPES.SPAWN) return 'safe';
  if (room.type === ROOM_TYPES.EXIT) return 'exit';
  if (room.type === ROOM_TYPES.BOSS) return 'miniboss';
  if (room.type === ROOM_TYPES.TREASURE) return 'treasure';
  if (room.type === ROOM_TYPES.HEALING) return 'healing';
  if (room.type === ROOM_TYPES.TRAP) return 'trap';

  const player = game.player;
  const healthRatio = player.health / player.maxHealth;
  const aggression = game.difficulty.directorAggression;

  const event = weightedPick([
    { value: 'ambush', weight: 2.2 + aggression * 3 },
    { value: 'treasure', weight: 0.7 + game.difficulty.lootBonus * 3 },
    { value: 'healing', weight: healthRatio < 0.45 ? 2.5 : 0.35 },
    { value: 'trap', weight: 0.8 + aggression },
    { value: 'quiet', weight: healthRatio < 0.25 ? 1.3 : 0.5 },
  ]);

  game.director.lastEvent = event;
  game.director.eventHistory.push(event);
  game.narrator = narratorMessageFor(event);
  return event;
}

export function narratorMessageFor(event) {
  const messages = {
    ambush: 'The dungeon grows restless. Something is hunting you...',
    treasure: 'A faint golden glow leaks through the cracked stones.',
    healing: 'The air softens. A healing relic pulses nearby.',
    trap: 'The floor whispers. Step carefully.',
    miniboss: 'A heavy presence blocks your path.',
    quiet: 'For a moment, the shadows hold their breath.',
    exit: 'The exit portal hums with unstable magic.',
  };
  return messages[event] || 'The dungeon shifts around you.';
}
