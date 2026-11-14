/**
 * Реестр установленных приложений.
 */
import { getInstalled } from '../../store.js';

/**
 * @returns {import('../../store.js').InstalledApp[]}
 */
export default function getInstalledApps() {
  return getInstalled();
}
