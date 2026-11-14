/**
 * Закрывает текущее приложение и открывает лаунчер.
 */
import { call } from '../../bus.js';

/**
 * Возвращает управление лаунчеру.
 * @returns {{ id:string, name:string, url:string }}
 */
export default function closeApp() {
  const cfg = call('getConfig');
  return call('openApp', cfg.launcher);
}
