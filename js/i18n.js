/**
 * Luna Sync — i18n Engine
 * Path-based routing: /en/ → English, /zh/ → Chinese
 * JSON-driven, zero dependencies.
 */

(function () {
  'use strict';

  // ─── Detect language from URL path ───
  const path = window.location.pathname;
  const match = path.match(/^\/(en|zh)\//);
  const currentLang = match ? match[1] : 'en';

  // ─── Load dictionary ───
  async function loadDictionary(lang) {
    try {
      const res = await fetch(`/i18n/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[Luna i18n] Failed to load dictionary:', err);
      return null;
    }
  }

  // ─── Render content into DOM ───
  function render(dict) {
    if (!dict) return;

    // Meta tags
    document.title = dict.meta.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', dict.meta.description);

    // Data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const keys = el.getAttribute('data-i18n').split('.');
      let value = dict;
      for (const key of keys) {
        value = value?.[key];
      }
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });

    // Data-i18n-html elements (for rich HTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const keys = el.getAttribute('data-i18n-html').split('.');
      let value = dict;
      for (const key of keys) {
        value = value?.[key];
      }
      if (typeof value === 'string') {
        el.innerHTML = value;
      }
    });

    // Data-i18n-attr elements
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const raw = el.getAttribute('data-i18n-attr');
      const [attr, ...keyParts] = raw.split(':');
      let value = dict;
      for (const key of keyParts) {
        value = value?.[key];
      }
      if (typeof value === 'string') {
        el.setAttribute(attr, value);
      }
    });

    // Lang switch button
    const switchBtn = document.getElementById('lang-switch');
    if (switchBtn) {
      const targetLang = currentLang === 'en' ? 'zh' : 'en';
      const label = dict.nav?.langSwitch || (targetLang === 'en' ? 'English' : '中文');
      const targetPath = path.replace(/^\/(en|zh)\//, `/${targetLang}/`);
      switchBtn.textContent = label;
      switchBtn.setAttribute('href', targetPath);
    }

    // Rebuild FAQ items (data-i18n-list)
    document.querySelectorAll('[data-i18n-list]').forEach(el => {
      const keys = el.getAttribute('data-i18n-list').split('.');
      let list = dict;
      for (const key of keys) {
        list = list?.[key];
      }
      if (!Array.isArray(list)) return;

      const templateId = el.getAttribute('data-i18n-template');
      const template = document.getElementById(templateId);
      if (!template) return;

      el.innerHTML = '';
      list.forEach((item, index) => {
        const clone = template.content.cloneNode(true);
        // Resolve data attributes on cloned content
        clone.querySelectorAll('[data-i18n]').forEach(sub => {
          const subKeys = sub.getAttribute('data-i18n').split('.');
          // If starts with $, it's relative to current item
          if (subKeys[0] === '$') {
            sub.textContent = item[subKeys.slice(1).join('.')] || '';
          } else {
            let val = dict;
            for (const k of subKeys) val = val?.[k];
            if (typeof val === 'string') sub.textContent = val;
          }
        });
        clone.querySelectorAll('[data-i18n-item]').forEach(sub => {
          const field = sub.getAttribute('data-i18n-item');
          sub.textContent = item[field] || '';
        });
        el.appendChild(clone);
      });
    });

    // Build features from dict (alternative to list template)
    document.querySelectorAll('[data-i18n-features]').forEach(el => {
      const keys = el.getAttribute('data-i18n-features').split('.');
      let features = dict;
      for (const key of keys) features = features?.[key];
      if (!Array.isArray(features)) return;

      const children = el.children;
      features.forEach((feat, i) => {
        if (children[i]) {
          const titleEl = children[i].querySelector('[data-i18n-feat-title]');
          const descEl = children[i].querySelector('[data-i18n-feat-desc]');
          const tagEl = children[i].querySelector('[data-i18n-feat-tag]');
          if (titleEl) titleEl.textContent = feat.title;
          if (descEl) descEl.textContent = feat.desc;
          if (tagEl) tagEl.textContent = feat.tag;
        }
      });
    });
  }

  // ─── Init ───
  loadDictionary(currentLang).then(dict => {
    render(dict);
    // Set html lang attribute
    document.documentElement.lang = currentLang;
  });

  // Expose for debugging
  window.__lunaLang = currentLang;
})();
