/**
 * Открывает ссылку в системном браузере (через оболочку Tauri, иначе новая вкладка).
 * @param {{ url:string }} params
 * @returns {Promise<{ opened:boolean }>}
 */
export default async function openExternal({ url } = {}) {
  if (!url || !/^https?:\/\//.test(url)) throw new Error('url must be http(s)');
  const tauri = window.__TAURI__;
  if (tauri && tauri.shell && tauri.shell.open) {
    await tauri.shell.open(url);
    return { opened: true };
  }
  window.open(url, '_blank', 'noopener');
  return { opened: true };
}
