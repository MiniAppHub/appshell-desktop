/**
 * Канал между действиями API и рантаймом оболочки.
 * @module bus
 */

/** @type {Map<string, Function>} */
const handlers = new Map();

/**
 * @param {string} name
 * @param {Function} fn
 */
export function register(name, fn) { handlers.set(name, fn); }

/**
 * @param {string} name
 * @param {...any} args
 * @returns {any}
 */
export function call(name, ...args) {
  const fn = handlers.get(name);
  if (!fn) throw new Error('runtime: handler "' + name + '" is not registered');
  return fn(...args);
}
