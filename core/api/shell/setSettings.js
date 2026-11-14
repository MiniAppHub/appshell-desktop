/**
 * Изменяет настройки оболочки.
 */
import { setSettings as write } from '../../store.js';

/**
 * @param {{ catalogUrl?:string, launcher?:string|null, theme?:'dark'|'light' }} [params]
 * @returns {import('../../store.js').ShellSettings}
 */
export default function setSettings(params = {}) {
  /** @type {Record<string, any>} */
  const allowed = {};
  for (const key of ['catalogUrl', 'launcher', 'theme']) {
    if (key in params) allowed[key] = params[key];
  }
  return write(allowed);
}
