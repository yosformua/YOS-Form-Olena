(function () {
  const SUPPORTED = ['uk', 'ru', 'en'];
  const DEFAULT_LANG = 'uk';
  const STORAGE_KEY = 'site_lang';
  const cache = {};

  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function detectInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || '').slice(0, 2);
    if (SUPPORTED.includes(nav)) return nav;
    return DEFAULT_LANG;
  }

  async function loadLang(code) {
    if (cache[code]) return cache[code];
    const res = await fetch(`lang/${code}.json`);
    if (!res.ok) throw new Error(`Cannot load lang file: ${code}`);
    const data = await res.json();
    cache[code] = data;
    return data;
  }

  function applyTranslations(dict) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = getByPath(dict, key);
      if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const value = getByPath(dict, key);
      if (value !== undefined) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getByPath(dict, key);
      if (value !== undefined) el.setAttribute('placeholder', value);
    });

    // data-i18n-attr-title="key" -> sets attribute "title"
    document.querySelectorAll('*').forEach((el) => {
      for (const attr of el.attributes) {
        if (attr.name.startsWith('data-i18n-attr-')) {
          const targetAttr = attr.name.replace('data-i18n-attr-', '');
          const value = getByPath(dict, attr.value);
          if (value !== undefined) el.setAttribute(targetAttr, value);
        }
      }
    });

    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
      const value = getByPath(dict, titleKey);
      if (value !== undefined) document.title = value;
    }

    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    document.documentElement.setAttribute('lang', currentLang);
  }

  let currentLang = DEFAULT_LANG;

  async function setLang(code) {
    if (!SUPPORTED.includes(code)) return;
    currentLang = code;
    localStorage.setItem(STORAGE_KEY, code);
    const dict = await loadLang(code);
    applyTranslations(dict);
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: code, dict } }));
  }

  async function init() {
    currentLang = detectInitialLang();
    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    await setLang(currentLang);
  }

  window.i18n = {
    setLang,
    getLang: () => currentLang,
    t: (key) => getByPath(cache[currentLang], key),
  };

  document.addEventListener('DOMContentLoaded', init);
})();
