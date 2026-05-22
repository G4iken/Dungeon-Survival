export function createInput() {
  return {
    keys: new Set(),
    mouse: { x: 0, y: 0, down: false, clicked: false },
    dashPressed: false,
  };
}

export function isDown(input, key) {
  return input.keys.has(key.toLowerCase());
}
