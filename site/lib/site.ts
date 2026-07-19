export const SITE = {
  name: 'Crawly',
  tagline: 'Your friendly neighborhood UI tester',
  domain: 'crawly.site',
  url: 'https://crawly.site',
  githubUrl: 'https://github.com/yemon/crawly',
  chromeStoreUrl: 'https://chromewebstore.google.com/detail/crawly/gfnpolakklaamjmodeoemdjolbhbaamn',
  version: '1.3.0',
  license: 'Apache-2.0',
  licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
  author: {
    name: 'yemon',
    url: 'https://github.com/yemon',
  },
  description:
    'Crawly is a free, open source Chrome extension. Record clicks and keystrokes, then a tiny comic spider replays them on your React or Next.js app, typing at 25 ms per key and yelling KPOW when everything passes.',
  shortDescription:
    'A comic spider that records and replays UI tests. Record once, replay forever.',
  keywords: [
    'UI testing',
    'browser extension',
    'Chrome extension',
    'record and replay',
    'React testing',
    'Next.js testing',
    'end-to-end testing',
    'e2e testing',
    'no-code testing',
    'test automation',
    'open source testing tool',
    'Manifest V3 extension',
  ],
  themeColor: '#141414',
} as const;

export type SiteConfig = typeof SITE;

export function absoluteUrl(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${p}`;
}
