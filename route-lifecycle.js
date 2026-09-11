// Resources owned by a route are disposed before mounting the next view.
export function createRouteLifecycle() {
  const controller = new AbortController();
  const frames = new Set();
  const timers = new Set();
  const observers = new Set();
  const scope = {
    get signal() {
      return controller.signal;
    },
    on(target, type, callback, options = {}) {
      target?.addEventListener(type, callback, {
        ...(typeof options === 'boolean' ? { capture: options } : options),
        signal: controller.signal,
      });
    },
    requestAnimationFrame(callback) {
      if (controller.signal.aborted) return 0;
      const id = window.requestAnimationFrame((time) => {
        frames.delete(id);
        if (!controller.signal.aborted) callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
      window.cancelAnimationFrame(id);
    },
    setTimeout(callback, delay) {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!controller.signal.aborted) callback();
      }, delay);
      timers.add(id);
      return id;
    },
    observe(Type, callback, options) {
      const observer = new Type((...args) => {
        if (!controller.signal.aborted) callback(...args);
      }, options);
      observers.add(observer);
      return observer;
    },
    dispose() {
      controller.abort();
      frames.forEach(window.cancelAnimationFrame);
      timers.forEach(window.clearTimeout);
      observers.forEach((observer) => observer.disconnect());
      frames.clear();
      timers.clear();
      observers.clear();
    },
  };
  return scope;
}
