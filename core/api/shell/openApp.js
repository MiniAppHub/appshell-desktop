/**
 * Открывает установленное приложение вместо текущего.
 * Требует разрешения shell.launcher.
 */
import { call } from '../../bus.js';

/**
 * @param {{ id:string }} params
 * @returns {{ id:string, name:string, url:string }}
 */
export default function openApp({ id } = {}) {
  if (!id) throw new Error('id is required');
  const app = call('openApp', id);
  return { id: app.id, name: app.name, url: app.url };
}
