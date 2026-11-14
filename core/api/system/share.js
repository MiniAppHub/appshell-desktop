/**
 * Системное «Поделиться». Без Web Share копирует текст в буфер.
 */
/**
 * @param {{ title?:string, text?:string, url?:string }} [params]
 * @returns {Promise<{ shared:boolean, copied:boolean }>}
 */
export default async function share({ title = '', text = '', url = '' } = {}) {
  const nav = typeof navigator === 'undefined' ? {} : navigator;
  if (typeof nav.share === 'function') {
    await nav.share({ title, text, url });
    return { shared: true, copied: false };
  }
  const payload = [text, url].filter(Boolean).join(' ');
  if (nav.clipboard && payload) await nav.clipboard.writeText(payload);
  return { shared: false, copied: Boolean(payload) };
}
