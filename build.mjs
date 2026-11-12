// Собирает www/ из ядра (git submodule core/) и переопределений для Windows (Tauri).
import { cpSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const launcher = process.env.LAUNCHER_APP || 'miniapphub.home';
const catalogUrl = process.env.CATALOG_URL || 'https://miniapphub.github.io/catalog.json';
const launcherUrl = process.env.LAUNCHER_URL || '';
const platform = process.env.PLATFORM || 'windows';

rmSync('www', { recursive: true, force: true });
mkdirSync('www/core', { recursive: true });

for (const f of ['index.html', 'tokens.css']) {
  if (!existsSync(`core/${f}`)) throw new Error(`ядро не найдено: core/${f} (нужен submodule)`);
  cpSync(`core/${f}`, `www/${f}`);
}
for (const f of ['runtime.js', 'store.js', 'bus.js', 'sdk.js', 'api']) {
  cpSync(`core/core/${f}`, `www/core/${f}`, { recursive: true });
}
if (existsSync('api')) cpSync('api', 'www/api', { recursive: true });

const config = { launcher, catalogUrl, version: pkg.version, platform };
if (launcherUrl) config.launcherUrl = launcherUrl;
writeFileSync('www/config.json', JSON.stringify(config, null, 2) + '\n');

console.log('www/ собран:', JSON.stringify(config));
