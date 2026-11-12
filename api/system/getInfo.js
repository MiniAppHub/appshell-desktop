import { config } from '../../core/store.js';

/**
 * Переопределение для Windows: платформа Tauri, версия WebView2.
 * @returns {Promise<{ platform:string, shell:string, language:string, online:boolean, time:string, webview:string }>}
 */
export default async function getInfo() {
  const cfg = config();
  const tauri = window.__TAURI__;
  return {
    platform: cfg.platform,
    shell: cfg.version,
    language: navigator.language,
    online: navigator.onLine,
    time: new Date().toISOString(),
    webview: tauri ? 'tauri' : 'browser',
  };
}
