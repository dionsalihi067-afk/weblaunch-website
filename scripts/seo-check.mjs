#!/usr/bin/env node
/**
 * SEO smoke test. Without arguments it verifies the build is fresh and starts its
 * own `next start` for the current build; pass a base URL to test a running server.
 * Usage: npm run build && npm run seo:check [-- http://localhost:3000]
 *
 * Checks every sitemap URL (mapped onto the base URL): 200 status, html lang,
 * self-referencing canonical, reciprocal hreflang + x-default, valid JSON-LD,
 * no noindex. Also checks robots.txt and that legacy routes 308-redirect.
 */
import { assertFreshBuild, startNextServer } from './lib/next-server.mjs';

const EXPLICIT_BASE = process.argv[2] || process.env.SEO_CHECK_BASE || '';
let BASE = EXPLICIT_BASE.replace(/\/+$/, '');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weblaunchworks.com').replace(/\/+$/, '');
const LANG_TAG = { al: 'sq', en: 'en', de: 'de', fr: 'fr', it: 'it', tr: 'tr', es: 'es' };

const errors = [];
const fetchWithTimeout = (url, opts = {}) => fetch(url, { ...opts, signal: AbortSignal.timeout(60_000) });
const fail = (url, msg) => errors.push(`${url}: ${msg}`);
const toLocal = (url) => url.replace(SITE_URL, BASE);

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1].replace(/&amp;/g, '&') : null;
}

function parseHead(html) {
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const canonical = links.filter((l) => attr(l, 'rel') === 'canonical').map((l) => attr(l, 'href'));
  const hreflang = {};
  for (const l of links) {
    const lang = attr(l, 'hrefLang') ?? attr(l, 'hreflang');
    if (attr(l, 'rel') === 'alternate' && lang) hreflang[lang] = attr(l, 'href');
  }
  const htmlLang = html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] ?? null;
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return { canonical, hreflang, htmlLang, robots, jsonLd };
}

async function main() {
  const robotsRes = await fetchWithTimeout(`${BASE}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  if (robotsRes.status !== 200) fail('/robots.txt', `status ${robotsRes.status}`);
  if (!robotsTxt.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('/robots.txt', 'missing absolute sitemap reference');
  if (/Disallow:\s*\/\s*$/m.test(robotsTxt)) fail('/robots.txt', 'disallows entire site');

  const sitemapRes = await fetchWithTimeout(`${BASE}/sitemap.xml`);
  const sitemap = await sitemapRes.text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) fail('/sitemap.xml', 'no URLs');
  if (new Set(urls).size !== urls.length) fail('/sitemap.xml', 'duplicate URLs');

  const pages = new Map();
  for (const url of urls) {
    if (!url.startsWith(`${SITE_URL}/`)) fail(url, 'sitemap URL not on canonical origin');
    const res = await fetchWithTimeout(toLocal(url), { redirect: 'manual' });
    if (res.status !== 200) {
      fail(url, `status ${res.status}`);
      continue;
    }
    pages.set(url, parseHead(await res.text()));
  }

  for (const [url, page] of pages) {
    const locale = new URL(url).pathname.split('/')[1];
    if (page.htmlLang !== LANG_TAG[locale]) fail(url, `html lang "${page.htmlLang}", expected "${LANG_TAG[locale]}"`);
    if (page.canonical.length !== 1) fail(url, `${page.canonical.length} canonical tags`);
    else if (page.canonical[0] !== url) fail(url, `canonical ${page.canonical[0]} is not self-referencing`);
    if (/noindex/i.test(page.robots)) fail(url, 'noindex on sitemap URL');
    if (!page.hreflang['x-default']) fail(url, 'missing x-default hreflang');
    if (page.hreflang.al) fail(url, 'invalid hreflang "al" (use "sq")');
    for (const [lang, tag] of Object.entries(LANG_TAG)) {
      const alt = page.hreflang[tag];
      if (!alt) {
        fail(url, `missing hreflang ${tag}`);
        continue;
      }
      const target = pages.get(alt);
      if (!target) fail(url, `hreflang ${tag} -> ${alt} not in sitemap`);
      else if (target.hreflang[LANG_TAG[locale]] !== url) fail(url, `hreflang ${lang} not reciprocal`);
    }
    if (page.jsonLd.length === 0) fail(url, 'no JSON-LD');
    for (const block of page.jsonLd) {
      try {
        JSON.parse(block);
      } catch {
        fail(url, 'invalid JSON-LD');
      }
    }
  }

  for (const [from, to] of [['/en/privacy', '/en/privacy-policy'], ['/en/terms', '/en/terms-and-conditions']]) {
    const res = await fetchWithTimeout(`${BASE}${from}`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    if (res.status !== 308 || !location.endsWith(to)) fail(from, `expected 308 -> ${to}, got ${res.status} ${location}`);
  }

  const missing = await fetchWithTimeout(`${BASE}/en/services/does-not-exist`, { redirect: 'manual' });
  if (missing.status !== 404) fail('/en/services/does-not-exist', `expected 404, got ${missing.status}`);

  console.log(`Checked ${pages.size}/${urls.length} sitemap URLs against ${BASE}`);
  if (errors.length) {
    console.error(`\n${errors.length} SEO issue(s):`);
    for (const e of errors.slice(0, 100)) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }
  console.log('All SEO checks passed.');
}

async function run() {
  if (BASE) return main();
  assertFreshBuild();
  const server = await startNextServer();
  BASE = server.baseUrl;
  try {
    await main();
  } finally {
    await server.stop();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
