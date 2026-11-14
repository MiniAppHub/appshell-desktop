/**
 * Устанавливает приложение по id из каталога или по ссылке на манифест.
 * Требует разрешения apps.manage.
 */
import { installFromManifest, resolveApp } from '../../store.js';

/**
 * @param {{ manifestUrl?:string, id?:string }} [params]
 * @returns {Promise<import('../../store.js').InstalledApp>}
 */
export default async function installApp({ manifestUrl, id } = {}) {
  if (manifestUrl) return installFromManifest(manifestUrl);
  if (id) return resolveApp(id);
  throw new Error('manifestUrl or id is required');
}
