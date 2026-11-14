import './shim.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../core/api/_dispatch.js';
import { upsertApp, setConfig } from '../core/store.js';

beforeEach(() => {
  localStorage.clear();
  setConfig({ catalogUrl: 'https://miniapphub.github.io/catalog.json', launcher: 'miniapphub.home' });
});

test('действие подключается как отдельный файл с default-экспортом', async () => {
  const r = await dispatch({ appId: null }, 'shell', 'getVersion', {});
  assert.equal(typeof r.version, 'string');
  assert.equal(r.api, 1);
});

test('неизвестное действие отклоняется', async () => {
  await assert.rejects(dispatch({ appId: null }, 'shell', 'nope', {}), /unknown action/);
});

test('имя действия защищено от подстановки пути', async () => {
  await assert.rejects(dispatch({ appId: null }, 'shell', '../evil', {}), /invalid action name/);
});

test('getSettings отдаёт значения из конфига', async () => {
  const r = await dispatch({ appId: null }, 'shell', 'getSettings', {});
  assert.equal(r.catalogUrl, 'https://miniapphub.github.io/catalog.json');
  assert.equal(r.theme, 'dark');
});

test('setSettings нормализует и проверяет значения', async () => {
  const r = await dispatch({ appId: null }, 'shell', 'setSettings', { theme: 'light', evil: 1 });
  assert.equal(r.theme, 'light');
  assert.equal(r.evil, undefined);
  await assert.rejects(dispatch({ appId: null }, 'shell', 'setSettings', { theme: 'neon' }), /dark or light/);
  await assert.rejects(dispatch({ appId: null }, 'shell', 'setSettings', { catalogUrl: 'ftp://x' }), /http/);
});

test('installApp требует apps.manage', async () => {
  await assert.rejects(
    dispatch({ appId: 'a.b' }, 'apps', 'installApp', { id: 'x.y' }),
    /permission denied: apps.manage/,
  );
});

test('apps.installApp разрешён странице каталога платформы', async () => {
  upsertApp({ id: 'x.y', name: 'Y', version: '1.0.0', url: 'https://x/', permissions: [] });
  const r = await dispatch(
    { appId: null, pageUrl: 'https://miniapphub.github.io/catalog.html' },
    'apps', 'installApp', { id: 'x.y' },
  );
  assert.equal(r.id, 'x.y');
});

test('setLauncher требует shell.launcher', async () => {
  upsertApp({ id: 'a.b', name: 'B', version: '1', url: 'https://x/', permissions: [] });
  await assert.rejects(
    dispatch({ appId: 'a.b' }, 'shell', 'setLauncher', { id: 'a.b' }),
    /permission denied: shell.launcher/,
  );
});

test('getInstalled возвращает реестр', async () => {
  upsertApp({ id: 'a.b', name: 'B', version: '1', url: 'https://x/', permissions: [] });
  const list = await dispatch({ appId: null }, 'apps', 'getInstalled', {});
  assert.equal(list.length, 1);
});
