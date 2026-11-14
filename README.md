# appshell-desktop

Оболочка MiniAppHub для Windows на Tauri 2. Как и мобильная версия, **своего интерфейса не имеет**:
окно показывает страницу с единственным iframe, внутри которого работает мини-приложение-лаунчер.

```
index.html     ← страница с iframe (приходит из ядра)
core/          ← рантайм, мост API, действия, SDK (часть этого репозитория)
api/           ← переопределения действий для Windows
src-tauri/     ← Rust-обвязка Tauri
www/           ← результат сборки (генерируется)
```

## Переменные репозитория
| Переменная | По умолчанию | Назначение |
|---|---|---|
| `LAUNCHER_APP` | `miniapphub.home` | id приложения-лаунчера |
| `CATALOG_URL` | `https://miniapphub.github.io/catalog.json` | реестр мини-приложений |
| `LAUNCHER_URL` | — | резервный адрес лаунчера |

## Сборка
```bash
npm install
npm run build:www
npx tauri build
```
MSI и NSIS-установщик собираются в GitHub Actions и прикрепляются к релизу тега `v*`.
