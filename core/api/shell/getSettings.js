/**
 * Текущие настройки оболочки.
 * @returns {import('../../store.js').ShellSettings}
 */
import { getSettings as read } from '../../store.js';

export default function getSettings() {
  return read();
}
