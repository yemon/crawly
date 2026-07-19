import { SITE, absoluteUrl } from './site';

// Central article registry. Individual page.tsx files under
// app/articles/<slug>/ own the JSX body; this file owns everything a listing,
// sitemap, or JSON-LD needs to know without loading the body itself.

export type Article = {
  slug: string;
  title: string;
  description: string; // meta description + OG description
  summary: string; // one-liner for cards
  publishedAt: string; // ISO date, UTC
  modifiedAt: string; // ISO date, UTC
  keywords: string[];
  readMinutes: number;
  wordCount: number;
  section: string;
};

export const ARTICLES: Article[] = [
  {
    slug: 'what-is-record-and-replay-ui-testing',
    title: 'What Is Record-and-Replay UI Testing? A Practical Guide for 2026',
    description:
      'Record-and-replay UI testing lets you build automated tests by using your app instead of scripting it. Learn how it works, what it catches, where it fits, and how to decide whether it earns a place in your 2026 workflow.',
    summary:
      'How record-and-replay UI testing works, what it catches, and how it compares to writing Playwright, Cypress, or Selenium tests.',
    publishedAt: '2026-07-17',
    modifiedAt: '2026-07-17',
    keywords: [
      'record-and-replay testing',
      'no-code UI testing',
      'React UI testing',
      'Next.js testing',
      'Playwright vs recorder',
      'end-to-end testing',
    ],
    readMinutes: 7,
    wordCount: 1400,
    section: 'UI testing',
  },
  {
    slug: 'why-react-ui-tests-are-flaky',
    title: 'Why Your React UI Tests Are Flaky (and How to Fix It)',
    description:
      'A flaky React test is a timing problem in disguise. This guide covers the nine most common causes, and the exact fix for each, so you can turn a jittery suite into one you can trust.',
    summary:
      'Nine causes of flaky React tests and the exact fixes: async waiting, stable selectors, isolated state, controlled data, mocked networks, and disabled animations.',
    publishedAt: '2026-07-17',
    modifiedAt: '2026-07-17',
    keywords: [
      'flaky tests',
      'flaky React tests',
      'React Testing Library',
      'Playwright waiting',
      'test isolation',
      'data-testid',
      'UI test reliability',
    ],
    readMinutes: 8,
    wordCount: 1500,
    section: 'UI testing',
  },
  {
    slug: 'free-ui-testing-tools-react-nextjs-2026',
    title: 'Free UI Testing Tools for React and Next.js in 2026',
    description:
      'A practical roundup of nine free UI testing tools for React and Next.js in 2026: Playwright, Cypress, React Testing Library, Vitest, Storybook, Crawly, BackstopJS, Lost Pixel, and Selenium. What each is best at, what it costs, and where it falls short.',
    summary:
      'Nine genuinely free tools for testing React and Next.js UIs in 2026 — Playwright, Cypress, RTL, Vitest, Storybook, Crawly, BackstopJS, Lost Pixel, Selenium.',
    publishedAt: '2026-07-17',
    modifiedAt: '2026-07-17',
    keywords: [
      'free UI testing tools',
      'React testing tools',
      'Next.js testing tools',
      'Playwright',
      'Cypress',
      'React Testing Library',
      'Vitest',
      'Storybook',
      'Crawly',
      'BackstopJS',
      'Lost Pixel',
      'Selenium',
    ],
    readMinutes: 9,
    wordCount: 1600,
    section: 'UI testing',
  },
];

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(
  ARTICLES.map((a) => [a.slug, a]),
);

export function articleUrl(slug: string): string {
  return absoluteUrl(`/articles/${slug}`);
}

export function articleJsonLd(article: Article, opts?: { faqQuestions?: number }) {
  return {
    '@type': 'TechArticle',
    '@id': articleUrl(article.slug) + '#article',
    headline: article.title,
    description: article.description,
    url: articleUrl(article.slug),
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    inLanguage: 'en',
    articleSection: article.section,
    keywords: article.keywords.join(', '),
    wordCount: article.wordCount,
    author: { '@id': `${SITE.author.url}#person` },
    publisher: { '@id': absoluteUrl('/#organization') },
    image: absoluteUrl('/opengraph-image'),
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl(article.slug) },
    isAccessibleForFree: true,
    ...(opts?.faqQuestions ? { commentCount: opts.faqQuestions } : {}),
  };
}

export function articleBreadcrumbLd(article: Article) {
  return {
    '@type': 'BreadcrumbList',
    '@id': articleUrl(article.slug) + '#breadcrumbs',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: absoluteUrl('/articles') },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl(article.slug) },
    ],
  };
}

export function articleFaqLd(articleSlug: string, qas: readonly { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    '@id': absoluteUrl(`/articles/${articleSlug}#faq`),
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
    })),
  };
}
