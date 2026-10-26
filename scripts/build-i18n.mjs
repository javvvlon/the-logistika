#!/usr/bin/env node
// Generates /en/index.html and /uz/index.html from the Russian source page (index.html)
// using i18n/translations.json. No dependencies. Run: node scripts/build-i18n.mjs
// Fails (exit 1) if any Cyrillic text is left in a generated page, so nothing ships half-translated.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'index.html'), 'utf8');
const { pairs } = JSON.parse(readFileSync(join(root, 'i18n/translations.json'), 'utf8'));

const LANGS = {
  en: { col: 1, locale: 'en_US', path: '/en/' },
  uz: { col: 2, locale: 'uz_UZ', path: '/uz/' }
};

const CYR = 'А-Яа-яЁё';
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// longest strings first, so phrases win over the single words they contain
const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);

let failed = false;

for (const [lang, cfg] of Object.entries(LANGS)) {
  let html = source;

  for (const row of sorted) {
    const ru = row[0];
    const target = row[cfg.col];
    if (!target) continue;
    const re = new RegExp(`(?<![${CYR}])${escapeRe(ru)}(?![${CYR}])`, 'g');
    html = html.replace(re, () => target);
  }

  // language-specific meta
  html = html
    .replace('<html lang="ru"', `<html lang="${lang}"`)
    .replace('<meta property="og:locale" content="ru_RU">', `<meta property="og:locale" content="${cfg.locale}">`)
    .replace('<link rel="canonical" href="https://your-domain.uz/">', `<link rel="canonical" href="https://your-domain.uz${cfg.path}">`)
    .replace('<meta property="og:url" content="https://your-domain.uz/">', `<meta property="og:url" content="https://your-domain.uz${cfg.path}">`)
    .replace('"inLanguage": "ru"', `"inLanguage": "${lang}"`);

  // language switcher: move the active state
  html = html
    .replace('class="lang__item is-active" href="/" hreflang="ru" lang="ru" data-lang="ru" aria-current="page"', 'class="lang__item" href="/" hreflang="ru" lang="ru" data-lang="ru"')
    .replace(`class="lang__item" href="${cfg.path}" hreflang="${lang}" lang="${lang}" data-lang="${lang}"`, `class="lang__item is-active" href="${cfg.path}" hreflang="${lang}" lang="${lang}" data-lang="${lang}" aria-current="page"`);

  // anything Russian left? (ignore the "RU" switcher label and lang attributes — they are Latin)
  const leftovers = [...new Set(html.match(new RegExp(`[^<>"]*[${CYR}][^<>"]*`, 'g')) || [])];
  if (leftovers.length) {
    failed = true;
    console.error(`\n[${lang}] untranslated text — add rows to i18n/translations.json:`);
    leftovers.forEach((t) => console.error('  • ' + t.trim()));
  }

  const out = join(root, lang, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`✓ ${lang}/index.html`);
}

process.exit(failed ? 1 : 0);
