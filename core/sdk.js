/**
 * Клиентский SDK мини-приложения.
 * Работает через postMessage: `mapp.shell('getSettings')`.
 * @module sdk
 */

/** @typedef {{ ok:true, result:any } | { ok:false, error:string }} ApiResponse */

const FROM_APP = 'mapp';
const FROM_SHELL = 'mapp-shell';

export class Mapp {
  /** @param {Window} [target] */
  constructor(target = window.parent) {
    this.target = target;
    this.seq = 0;
    /** @type {Map<number, Function>} */
    this.pending = new Map();
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || msg.source !== FROM_SHELL || msg.id == null) return;
      const done = this.pending.get(msg.id);
      if (done) {
        this.pending.delete(msg.id);
        done(msg.response);
      }
    });
  }

  /** Запущено ли приложение внутри оболочки. */
  static get inShell() {
    return window.parent !== window;
  }

  /**
   * @param {string} namespace
   * @param {string} action
   * @param {Object} [params]
   * @param {number} [timeout]
   * @returns {Promise<ApiResponse>}
   */
  _call(namespace, action, params = {}, timeout = 8000) {
    if (window.parent === window) return Promise.resolve({ ok: false, error: 'not-in-shell' });
    const id = ++this.seq;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve({ ok: false, error: 'timeout' });
      }, timeout);
      this.pending.set(id, (response) => {
        clearTimeout(timer);
        resolve(response);
      });
      this.target.postMessage({ source: FROM_APP, id, namespace, action, params }, '*');
    });
  }

  /**
   * @param {string} action
   * @param {Object} [params]
   * @returns {Promise<ApiResponse>}
   */
  shell(action, params) { return this._call('shell', action, params); }

  /**
   * @param {string} action
   * @param {Object} [params]
   * @returns {Promise<ApiResponse>}
   */
  apps(action, params) { return this._call('apps', action, params); }

  /**
   * @param {string} action
   * @param {Object} [params]
   * @returns {Promise<ApiResponse>}
   */
  system(action, params) { return this._call('system', action, params); }
}

/** Готовый экземпляр для мини-приложения. */
export const mapp = new Mapp();
