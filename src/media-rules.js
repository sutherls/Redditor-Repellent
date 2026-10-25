/* Repeated-image identity from page URLs only; no downloads or image analysis. */
(() => {
  'use strict';

  function imageIdentity(value) {
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
      if (!/\.(?:png|jpe?g|webp|gif)$/i.test(url.pathname)) return null;
      url.hash = '';
      // Reddit's direct and preview hosts expose the same uploaded filename.
      // Ignore only known rendering parameters; preserve unknown content selectors.
      if (['i.redd.it', 'preview.redd.it'].includes(url.hostname) && !url.port) {
        url.hostname = 'i.redd.it';
        url.protocol = 'https:';
        for (const key of ['width', 'height', 'crop', 'format', 'auto', 's']) url.searchParams.delete(key);
        url.searchParams.sort();
      }
      return url.href;
    } catch {
      return null;
    }
  }

  globalThis.NotThisMediaRules = { imageIdentity };
})();
