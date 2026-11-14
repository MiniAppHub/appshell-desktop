/**
 * Версия оболочки и версия контракта API.
 */
import { config } from '../../store.js';

/**
 * @returns {{ version:string, platform:string, api:number }}
 */
export default function getVersion() {
  const cfg = config();
  return { version: cfg.version, platform: cfg.platform, api: 1 };
}
