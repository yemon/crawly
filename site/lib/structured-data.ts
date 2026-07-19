import { SITE, absoluteUrl } from './site';

// Central place for JSON-LD graph objects. Search engines and AI answer
// engines (Perplexity, ChatGPT, Google AI Overviews, etc.) all consume this
// same schema.org data — one source of truth keeps them consistent.

export const organizationLd = {
  '@type': 'Organization',
  '@id': absoluteUrl('/#organization'),
  name: SITE.name,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/icons/icon128.png'),
    width: 128,
    height: 128,
  },
  sameAs: [SITE.githubUrl],
} as const;

export const personLd = {
  '@type': 'Person',
  '@id': `${SITE.author.url}#person`,
  name: SITE.author.name,
  url: SITE.author.url,
} as const;

export const websiteLd = {
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  publisher: { '@id': absoluteUrl('/#organization') },
  inLanguage: 'en',
} as const;

export const softwareApplicationLd = {
  '@type': 'SoftwareApplication',
  '@id': absoluteUrl('/#software'),
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  softwareVersion: SITE.version,
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'BrowserExtension',
  operatingSystem: 'Windows, macOS, Linux, ChromeOS',
  browserRequirements: 'Requires a Chromium-based browser with Manifest V3 support (Chrome, Edge, Brave, Arc, Opera).',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  license: SITE.licenseUrl,
  isAccessibleForFree: true,
  installUrl: SITE.chromeStoreUrl || SITE.githubUrl,
  downloadUrl: SITE.githubUrl,
  codeRepository: SITE.githubUrl,
  programmingLanguage: 'JavaScript',
  releaseNotes: `${SITE.githubUrl}/blob/main/CHANGELOG.md`,
  author: { '@id': `${SITE.author.url}#person` },
  publisher: { '@id': absoluteUrl('/#organization') },
  image: absoluteUrl('/opengraph-image'),
  screenshot: absoluteUrl('/opengraph-image'),
  featureList: [
    'Record clicks, typed values, select choices, and mouse waypoints',
    'Replay with a comic spider that types character-by-character at 25 ms per key',
    'React and Next.js controlled-input support via native value setters',
    'Multi-page runs that survive same-origin navigation',
    'Auto-run on page load with per-tab loop protection',
    'Per-domain consent gate; localhost gets a free pass',
    'Export and import crawls as portable .crawly.json files',
    'Zero telemetry, zero network calls, storage stays in the browser',
    'Selectors prefer data-testid, id, name, aria-label, and placeholder',
    'NOIR and HERO comic-book themes',
  ],
  keywords: SITE.keywords.join(', '),
} as const;

export const faqLd = {
  '@type': 'FAQPage',
  '@id': absoluteUrl('/#faq'),
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Crawly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Crawly is a free, open source Chrome extension that records your clicks and keystrokes, then replays them on your React or Next.js app with a comic-book spider. It types character by character at 25 ms per key, uses native value setters so React controlled inputs accept every keystroke, and yells "KPOW!" when a run passes or "BOOM!" when it fails.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I install Crawly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open the Crawly listing on the Chrome Web Store (https://chromewebstore.google.com/detail/crawly/gfnpolakklaamjmodeoemdjolbhbaamn) and click "Add to Chrome". Pin the icon to your toolbar and you are ready to record. If you prefer to run from source, clone the GitHub repo and load extension/ unpacked from chrome://extensions with Developer mode on.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Crawly send my recordings anywhere?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Everything stays in chrome.storage.local inside your browser. Crawly makes zero network requests, ships no telemetry, and never uploads a recording. You can export a crawl as a .crawly.json file yourself if you want to share or commit it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Crawly work with React and Next.js controlled inputs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Crawly types with native value setters and dispatches real input events, which is exactly what React controlled components need to accept each keystroke. Selectors prefer data-testid, id, name, aria-label, and placeholder before falling back to a structural path, so hashed CSS class names from Next.js builds do not break anything.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Crawly different from Cypress, Playwright, or Selenium?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cypress, Playwright, and Selenium are code-first frameworks that live in your test suite and run in CI. Crawly is a zero-config Chrome extension: no npm install, no config file, no scripts. You record a flow by using your app, then hit RUN. It is aimed at quick manual regression checks and shareable "did the signup flow still work" crawls, not at replacing your framework of choice for CI-scale coverage.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Crawly free? What license does it use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Crawly is free and open source under the Apache License 2.0. You can read the code, fork it, modify it, and use it commercially. The full license text lives in the LICENSE file at the root of the GitHub repository.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Crawly ask permission before running on my site?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. On localhost and 127.0.0.1 (any port), Crawly works right away. On every other domain, Crawly shows a comic-panel consent prompt once, per origin, before it will record or replay anything. You can revoke consent for any domain from the popup at any time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a crawl span multiple pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Recording and replay both survive full page loads within the same origin. Every navigation is stamped as a nav step that doubles as an assertion: if the app lands on the wrong path during replay, the spider panics with OMG! and BOOM! instead of passing silently.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the .crawly.json file?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It is the portable export format for a saved crawl. It contains the origin, path prefix, and every recorded step (clicks, typed values, selects, navigations). You can commit a .crawly.json to a repo, hand it to a teammate, and import it back into another Crawly install. Values are stored in plain text, so avoid recording real credentials.',
      },
    },
  ],
} as const;

export const howToInstallLd = {
  '@type': 'HowTo',
  '@id': absoluteUrl('/#howto-install'),
  name: 'How to install Crawly',
  description: 'Install the Crawly extension from the Chrome Web Store in one click.',
  totalTime: 'PT1M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Open the Chrome Web Store listing',
      text: `Open ${SITE.chromeStoreUrl} in Chrome, Edge, Brave, Arc, or any Chromium browser with Manifest V3 support.`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Add to Chrome',
      text: 'Click "Add to Chrome" and confirm the permissions prompt.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Pin Crawly',
      text: 'Pin the Crawly icon to your toolbar so you can start recording with one click.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Record your first crawl',
      text: 'Open any React or Next.js app, click the Crawly icon, hit "RECORD A CRAWL", use your app, then "STOP & SAVE". Press "RUN" to watch the spider replay it.',
    },
  ],
} as const;

export function graphLd(objects: readonly Record<string, unknown>[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': objects,
  });
}
