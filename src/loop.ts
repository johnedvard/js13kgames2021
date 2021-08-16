let lastTime: number;
export const loop = (updateAndDrawFn: Function) => {
  const raf = (start: number) => {
    lastTime = lastTime || start;
    const now = performance.now();
    let dt = now - lastTime;

    // prevent updating the game with a very large dt if the game were to lose focus
    if (dt > 999) {
      dt = 1 / 60;
    } else {
      dt /= 1000;
    }

    lastTime = now;

    updateAndDrawFn(dt);
    window.requestAnimationFrame(raf);
  };
  window.requestAnimationFrame(raf);
};
