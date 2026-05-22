export function createSoundSystem() {
  let ctx = null;

  function beep(freq = 440, duration = 0.07, type = 'sine', volume = 0.04) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // The game must still work when audio is blocked or unavailable.
    }
  }

  return {
    attack: () => beep(310, 0.06, 'square', 0.035),
    enemyHit: () => beep(170, 0.08, 'sawtooth', 0.035),
    hit: () => beep(95, 0.12, 'triangle', 0.055),
    pickup: () => beep(620, 0.08, 'sine', 0.045),
    levelUp: () => {
      beep(520, 0.08, 'sine', 0.045);
      setTimeout(() => beep(760, 0.09, 'sine', 0.045), 80);
    },
    gameOver: () => beep(70, 0.45, 'sawtooth', 0.055),
    victory: () => {
      beep(500, 0.1, 'sine', 0.045);
      setTimeout(() => beep(700, 0.1, 'sine', 0.045), 100);
      setTimeout(() => beep(920, 0.16, 'sine', 0.045), 200);
    },
  };
}
