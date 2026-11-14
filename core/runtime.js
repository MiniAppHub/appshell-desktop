/**
 * Рантайм оболочки MiniAppHub.
 * Собственного интерфейса у оболочки нет: страница — это iframe-песочница.
 * Рантайм читает config.json, выбирает лаунчер, поднимает мост API и грузит действия динамически.
 * @module runtime
 */
import { setConfig, config, getSettings, findApp, resolveApp, ensureMarket } from './store.js';
import { dispatch } from './api/_dispatch.js';
import { register } from './bus.js';

const frame = /** @type {HTMLIFrameElement} */ (document.getElementById('app'));

/** @type {import('./store.js').InstalledApp|null} */
let current = null;

/**
 * @param {string} text
 */
function showError(text) {
  // у оболочки нет собственного интерфейса: ошибку пишем в консоль
  console.error('[shell] ' + text);
}

/** @returns {Promise<import('./store.js').ShellConfig>} */
async function loadConfig() {
  try {
    const res = await fetch('config.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('[shell] config.json не прочитан:', err);
    return { launcher: 'miniapphub.home', catalogUrl: '', version: '0.0.0', platform: 'web' };
  }
}

/**
 * @param {string} id
 * @returns {import('./store.js').InstalledApp}
 */
function openApp(id) {
  const app = findApp(id);
  if (!app) throw new Error('app is not installed: ' + id);
  current = app;
  frame.src = app.url;
  document.documentElement.dataset.app = app.id;
  return app;
}

register('openApp', openApp);
register('getConfig', () => config());

/**
 * Мост: принимает запросы только из собственного iframe.
 * @param {MessageEvent} event
 */
async function onMessage(event) {
  if (event.source !== frame.contentWindow) return;
  const msg = event.data;
  if (!msg || msg.source !== 'mapp' || msg.id == null) return;
  if (typeof msg.namespace !== 'string' || typeof msg.action !== 'string') return;
  const ctx = { appId: current ? current.id : null, pageUrl: frame.src };
  /** @type {any} */
  let response;
  try {
    const result = await dispatch(ctx, msg.namespace, msg.action, msg.params || {});
    response = { ok: true, result };
  } catch (err) {
    response = { ok: false, error: String((err && err.message) || err) };
  }
  frame.contentWindow.postMessage({ source: 'mapp-shell', id: msg.id, response }, '*');
}

async function boot() {
  const cfg = await loadConfig();
  setConfig(cfg);
  ensureMarket(cfg.marketUrl || undefined);
  document.documentElement.dataset.theme = getSettings().theme;
  window.addEventListener('message', onMessage);

  const launcher = getSettings().launcher || cfg.launcher;
  try {
    await resolveApp(launcher);
    openApp(launcher);
  } catch (err) {
    if (cfg.launcherUrl) {
      frame.src = cfg.launcherUrl;
      return;
    }
    showError('Не удалось запустить лаунчер «' + launcher + '»: ' + ((err && err.message) || err));
  }
}

boot();
