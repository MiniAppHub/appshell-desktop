/**
 * Информация об окружении. Платформа может переопределить это действие.
 */
import { config } from '../../store.js';

/**
 * @returns {{ platform:string, shell:string, language:string, online:boolean, time:string }}
 */
export default function getInfo() {
  const cfg = config();
  const nav = typeof navigator === 'undefined' ? {} : navigator;
  return {
    platform: cfg.platform,
    shell: cfg.version,
    language: nav.language || 'ru',
    online: nav.onLine !== false,
    time: new Date().toISOString(),
  };
}
