/**
 * Диспетчер действий API.
 * Одно действие — один файл: `api/<namespace>/<action>.js`, экспорт по умолчанию — функция.
 * Файлы подключаются динамически, поэтому отсутствие действия не ломает остальные.
 * @module api/_dispatch
 */
import { findApp, getSettings } from '../store.js';

/** Действия, требующие разрешения из манифеста приложения. */
export const PERMISSIONS = {
  'apps/installApp': 'apps.manage',
  'apps/uninstallApp': 'apps.manage',
  'shell/setLauncher': 'shell.launcher',
  'shell/openApp': 'shell.launcher',
};

/** Действия, разрешённые странице каталога платформы. */
const TRUSTED_CATALOG = new Set(['apps/installApp']);

const NAME = /^[a-z][a-zA-Z0-9]{1,30}$/;

/** @type {Map<string, Function>} */
const actions = new Map();

/**
 * @param {string} url
 * @returns {string|null}
 */
function originOf(url) {
  try { return new URL(url).origin; } catch { return null; }
}

/** @returns {string|null} */
function catalogOrigin() {
  const { catalogUrl } = getSettings();
  return catalogUrl ? originOf(catalogUrl) : null;
}

/**
 * Ищет реализацию: сначала переопределение оболочки (`api/…`), затем ядро (`core/api/…`).
 * @param {string} namespace
 * @param {string} action
 * @returns {Promise<Function>}
 */
async function loadAction(namespace, action) {
  if (!NAME.test(namespace) || !NAME.test(action)) throw new Error('invalid action name');
  const key = namespace + '/' + action;
  if (actions.has(key)) return actions.get(key);
  const candidates = [
    '../../api/' + namespace + '/' + action + '.js',
    './' + namespace + '/' + action + '.js',
  ];
  for (const path of candidates) {
    try {
      const mod = await import(/* @vite-ignore */ path);
      if (typeof mod.default === 'function') {
        actions.set(key, mod.default);
        return mod.default;
      }
    } catch (err) {
      const message = String((err && err.message) || err);
      if (!/Cannot find module|Failed to fetch|Failed to resolve|404|not found/i.test(message)) throw err;
    }
  }
  throw new Error('unknown action: ' + namespace + '.' + action);
}

/**
 * @param {{ appId: string|null, pageUrl?: string }} ctx
 * @param {string} namespace
 * @param {string} action
 * @param {Object} [params]
 * @returns {Promise<any>}
 */
export async function dispatch(ctx, namespace, action, params = {}) {
  const key = namespace + '/' + action;
  const need = PERMISSIONS[key];
  if (need) {
    const app = ctx.appId ? findApp(ctx.appId) : null;
    let allowed = Boolean(app && (app.permissions || []).includes(need));
    if (!allowed && TRUSTED_CATALOG.has(key) && ctx.pageUrl) {
      const cat = catalogOrigin();
      if (cat && originOf(ctx.pageUrl) === cat) allowed = true;
    }
    if (!allowed) throw new Error('permission denied: ' + need);
  }
  const handler = await loadAction(namespace, action);
  return handler(params, ctx);
}
