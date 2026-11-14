/**
 * Удаляет приложение из реестра.
 * Требует разрешения apps.manage.
 */
import { uninstallApp } from '../../store.js';

/**
 * @param {{ id:string }} params
 * @returns {{ id:string }}
 */
export default function removeApp({ id } = {}) {
  if (!id) throw new Error('id is required');
  uninstallApp(id);
  return { id };
}
