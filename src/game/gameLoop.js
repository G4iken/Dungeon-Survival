export function startLoop(callback) {
  let frameId = 0;
  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    callback(dt);
    frameId = requestAnimationFrame(loop);
  }

  frameId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frameId);
}
