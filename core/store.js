/**
 * Хранилище оболочки: конфиг запуска, настройки, реестр установленных приложений.
 * @module store
 */

/**
 * @typedef {Object} InstalledApp
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {string} url
 * @property {string[]} permissions
 * @property {string|null} [icon]
 * @property {boolean} [system]  системное приложение, его нельзя удалить
 */

/**
 * @typedef {Object} ShellConfig
 * @property {string} launcher      id приложения-лаунчера
 * @property {string} catalogUrl    адрес catalog.json
 * @property {string} version       версия оболочки
 * @property {string} platform      android | windows | web
 * @property {string} [launcherUrl] прямой адрес лаунчера на случай офлайн-первого запуска
 */

/**
 * @typedef {Object} ShellSettings
 * @property {string} catalogUrl
 * @property {string|null} launcher
 * @property {'dark'|'light'} theme
 */

const K_SETTINGS = 'mapp.settings.v1';
const K_APPS = 'mapp.apps.v1';

/** @type {ShellConfig} */
let boot = {
  launcher: 'miniapphub.home',
  catalogUrl: '',
  version: '0.0.0',
  platform: 'web',
};

/**
 * @param {Partial<ShellConfig>} cfg
 */
export function setConfig(cfg) {
  boot = { ...boot, ...(cfg || {}) };
  if (!boot.launcher) boot.launcher = 'miniapphub.home';
}

/** @returns {ShellConfig} */
export function config() { return boot; }

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** @returns {ShellSettings} */
export function getSettings() {
  /** @type {ShellSettings} */
  const base = { catalogUrl: boot.catalogUrl || '', launcher: null, theme: 'dark' };
  return { ...base, ...read(K_SETTINGS, {}) };
}

/**
 * @param {Partial<ShellSettings>} patch
 * @returns {ShellSettings}
 */
export function setSettings(patch = {}) {
  const next = { ...getSettings(), ...patch };
  if (next.catalogUrl && !/^https?:\/\//.test(next.catalogUrl)) throw new Error('catalogUrl must be http(s)');
  if (!['dark', 'light'].includes(next.theme)) throw new Error('theme must be dark or light');
  const clean = { catalogUrl: next.catalogUrl, launcher: next.launcher ?? null, theme: next.theme };
  localStorage.setItem(K_SETTINGS, JSON.stringify(clean));
  return clean;
}

/** @returns {InstalledApp[]} */
export function getInstalled() {
  const value = read(K_APPS, []);
  return Array.isArray(value) ? value.filter((a) => a && a.id && a.url) : [];
}

/**
 * @param {string} id
 * @returns {InstalledApp|null}
 */
export function findApp(id) {
  return getInstalled().find((a) => a.id === id) || null;
}

/**
 * @param {InstalledApp} app
 * @returns {InstalledApp}
 */
export function upsertApp(app) {
  const apps = getInstalled().filter((a) => a.id !== app.id);
  apps.push(app);
  localStorage.setItem(K_APPS, JSON.stringify(apps));
  return app;
}

/**
 * @param {string} id
 * @returns {true}
 */
export function uninstallApp(id) {
  const app = findApp(id);
  if (app && app.system) throw new Error('system app cannot be removed: ' + id);
  localStorage.setItem(K_APPS, JSON.stringify(getInstalled().filter((a) => a.id !== id)));
  return true;
}

/** Адрес Маркета по умолчанию: витрина на Pages лаунчера. */
export const DEFAULT_MARKET_URL = 'https://miniapphub.github.io/app-miniapphub-home/market.html';
/** Идентификатор системного Маркета. */
export const MARKET_ID = 'miniapphub.market';

/**
 * Ставит Маркет системным приложением, если его нет или сменился адрес.
 * Вызывается при каждом запуске оболочки.
 * @param {string} [marketUrl]
 * @returns {InstalledApp}
 */
export function ensureMarket(marketUrl = DEFAULT_MARKET_URL) {
  const current = findApp(MARKET_ID);
  if (current && current.url === marketUrl) return current;
  return upsertApp({
    id: MARKET_ID,
    name: 'Маркет',
    version: boot.version,
    url: marketUrl,
    permissions: [],
    icon: new URL('assets/market.svg', marketUrl).href,
    system: true,
  });
}

/**
 * @param {string} [url]
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function fetchCatalog(url = getSettings().catalogUrl) {
  if (!url) throw new Error('catalogUrl is not configured');
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error('catalog HTTP ' + res.status);
  const data = await res.json();
  const apps = Array.isArray(data.apps) ? data.apps : [];
  return apps.filter((a) => a && a.id && a.url && a.version);
}

/**
 * Возвращает установленное приложение либо ставит его из каталога по id.
 * @param {string} id
 * @returns {Promise<InstalledApp>}
 */
export async function resolveApp(id) {
  const installed = findApp(id);
  if (installed) return installed;
  const apps = await fetchCatalog();
  const entry = apps.find((a) => a.id === id);
  if (!entry) throw new Error('app not found in catalog: ' + id);
  return upsertApp({
    id: entry.id,
    name: entry.name,
    version: entry.version,
    url: entry.url,
    permissions: Array.isArray(entry.permissions) ? entry.permissions : [],
    icon: entry.icon || null,
  });
}

/**
 * Ставит приложение по прямой ссылке на манифест.
 * @param {string} manifestUrl
 * @returns {Promise<InstalledApp>}
 */
export async function installFromManifest(manifestUrl) {
  if (!/^https?:\/\//.test(manifestUrl)) throw new Error('manifestUrl must be http(s)');
  const res = await fetch(manifestUrl, { cache: 'no-cache' });
  if (!res.ok) throw new Error('manifest HTTP ' + res.status);
  const m = await res.json();
  if (!m.id || !m.name || !m.version) throw new Error('invalid manifest');
  const base = new URL('.', manifestUrl).href;
  const dir = String((m.routers && m.routers.app) || 'public').replace(/\/?$/, '/');
  return upsertApp({
    id: m.id,
    name: m.name,
    version: m.version,
    url: new URL(dir, base).href,
    permissions: Array.isArray(m.permissions) ? m.permissions : [],
    icon: m.icon ? new URL(m.icon, base).href : null,
  });
}
