import './shim.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ensureMarket, getInstalled, uninstallApp, upsertApp, setConfig, MARKET_ID } from '../core/store.js';

beforeEach(() => {
  localStorage.clear();
  setConfig({ catalogUrl: 'https://miniapphub.github.io/catalog.json', launcher: 'miniapphub.home', version: '0.1.0' });
});

test('Маркет ставится системным приложением', () => {
  const m = ensureMarket();
  assert.equal(m.id, MARKET_ID);
  assert.equal(m.system, true);
  assert.equal(m.name, 'Маркет');
});

test('повторный запуск не дублирует Маркет', () => {
  ensureMarket();
  ensureMarket();
  assert.equal(getInstalled().filter((a) => a.id === MARKET_ID).length, 1);
});

test('системный Маркет нельзя удалить', () => {
  ensureMarket();
  assert.throws(() => uninstallApp(MARKET_ID), /system app cannot be removed/);
  assert.equal(getInstalled().some((a) => a.id === MARKET_ID), true);
});

test('обычное приложение удаляется', () => {
  upsertApp({ id: 'x.y', name: 'Y', version: '1.0.0', url: 'https://x/', permissions: [] });
  uninstallApp('x.y');
  assert.equal(getInstalled().some((a) => a.id === 'x.y'), false);
});
