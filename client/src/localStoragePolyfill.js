// Polyfill localStorage for Node.js 22+ build environments
// Node 22+ exposes localStorage as a throwing getter — this patches it before any module accesses it
if (typeof globalThis !== 'undefined') {
  try {
    globalThis.localStorage;
  } catch (e) {
    const store = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k) => store[k] ?? null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        key: (i) => Object.keys(store)[i] ?? null,
        get length() { return Object.keys(store).length; }
      },
      writable: true,
      configurable: true
    });
  }
}
