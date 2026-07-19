import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { ARTICLES, articleUrl } from '@/lib/articles';
import { SITE, absoluteUrl } from '@/lib/site';
import { graphLd } from '@/lib/structured-data';

export const dynamic = 'force-static';

const title = 'Articles on UI testing for React and Next.js';
const description =
  'Practical guides from the Crawly team on record-and-replay testing, flaky React tests, free tools for testing React and Next.js UIs, and the ideas behind Crawly.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/articles' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/articles'),
    title: `${title} — ${SITE.name}`,
    description,
    siteName: SITE.name,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
};

const collectionLd = {
  '@type': 'CollectionPage',
  '@id': absoluteUrl('/articles') + '#collection',
  name: title,
  description,
  url: absoluteUrl('/articles'),
  isPartOf: { '@id': absoluteUrl('/#website') },
  inLanguage: 'en',
  publisher: { '@id': absoluteUrl('/#organization') },
  hasPart: ARTICLES.map((a) => ({
    '@type': 'TechArticle',
    '@id': articleUrl(a.slug) + '#article',
    headline: a.title,
    url: articleUrl(a.slug),
    description: a.description,
    datePublished: a.publishedAt,
  })),
};

const breadcrumbLd = {
  '@type': 'BreadcrumbList',
  '@id': absoluteUrl('/articles') + '#breadcrumbs',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
    { '@type': 'ListItem', position: 2, name: 'Articles', item: absoluteUrl('/articles') },
  ],
} as const;

const pageGraph = graphLd([collectionLd, breadcrumbLd]);

export default function ArticlesIndex() {
  const sorted = [...ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <>
      <Nav />
      <main id="main" role="main">
        <section className="max-w-[1120px] mx-auto px-5 pt-14 pb-12">
          <nav aria-label="Breadcrumb" className="text-sm text-neutral-600 mb-6">
            <ol className="flex gap-2 list-none p-0 m-0">
              <li><Link href="/" className="underline hover:no-underline">Home</Link></li>
              <li aria-hidden>›</li>
              <li className="text-neutral-800" aria-current="page">Articles</li>
            </ol>
          </nav>
          <h1 className="font-bang tracking-[2px] text-[clamp(38px,5vw,56px)] leading-[0.98] mb-3">
            ARTICLES
          </h1>
          <p className="text-[17px] text-neutral-800 max-w-[620px] mb-10">
            Practical writing on UI testing for React and Next.js — from the team behind Crawly.
            No thought leadership. Just the tradeoffs, the fixes, and the tools that hold up.
          </p>
          <ol className="grid gap-5 grid-cols-1 lg:grid-cols-2 list-none p-0 m-0">
            {sorted.map((a) => (
              <li key={a.slug}>
                <Link href={`/articles/${a.slug}`} className="crd block no-underline text-ink h-full hover:shadow-popLg transition-shadow">
                  <div className="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                    <span className="chip">{a.section.toUpperCase()}</span>
                    <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                    <span aria-hidden>·</span>
                    <span>{a.readMinutes} min read</span>
                  </div>
                  <h2 className="font-bang tracking-[1.4px] text-[24px] leading-[1.15] my-1">
                    {a.title}
                  </h2>
                  <p className="text-[14.5px] text-neutral-700 mt-2 mb-0">{a.summary}</p>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
      <JsonLd data={pageGraph} />
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
