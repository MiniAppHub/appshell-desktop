// Собирает www/ из корня репозитория: index.html, core/ и api/ в том же виде, в каком их читает рантайм.
// Переменные окружения задают лаунчер, каталог и платформу; config.json пишется в www/.
import { cpSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const launcher = process.env.LAUNCHER_APP || 'miniapphub.home';
const catalogUrl = process.env.CATALOG_URL || 'https://miniapphub.github.io/catalog.json';
const launcherUrl = process.env.LAUNCHER_URL || '';
const platform = process.env.PLATFORM || 'windows';

rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });
cpSync('index.html', 'www/index.html');
cpSync('core', 'www/core', { recursive: true });
cpSync('api', 'www/api', { recursive: true });

const config = { launcher, catalogUrl, version: pkg.version, platform };
if (launcherUrl) config.launcherUrl = launcherUrl;
writeFileSync('www/config.json', JSON.stringify(config, null, 2) + '\n');
console.log('www/ собран:', JSON.stringify(config));
