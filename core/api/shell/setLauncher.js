/**
 * Назначает приложение лаунчером по умолчанию.
 * Требует разрешения shell.launcher.
 */
import { setSettings } from '../../store.js';

/**
 * @param {{ id:string|null }} params
 * @returns {import('../../store.js').ShellSettings}
 */
export default function setLauncher({ id = null } = {}) {
  return setSettings({ launcher: id });
}
