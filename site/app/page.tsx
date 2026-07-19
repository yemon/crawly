import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowTo } from '@/components/HowTo';
import { Faq } from '@/components/Faq';
import { ComingSoon } from '@/components/ComingSoon';
import { OpenSource } from '@/components/OpenSource';
import { Footer } from '@/components/Footer';
import { SpiderCanvasClient } from '@/components/SpiderCanvasClient';
import { JsonLd } from '@/components/JsonLd';
import { graphLd, faqLd, howToInstallLd } from '@/lib/structured-data';
import { SITE, absoluteUrl } from '@/lib/site';

// Home is fully static-rendered at build time.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: `${SITE.name} — Comic Spider that Records & Replays UI Tests for React and Next.js`,
  description: SITE.description,
  alternates: { canonical: '/' },
};

const breadcrumbLd = {
  '@type': 'BreadcrumbList',
  '@id': absoluteUrl('/#breadcrumbs'),
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
  ],
} as const;

const pageGraph = graphLd([faqLd, howToInstallLd, breadcrumbLd]);

export default function Page() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ink focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" role="main">
        <div id="top" />
        <Hero />
        <Features />
        <HowTo />
        <Faq />
        <ComingSoon />
        <OpenSource />
      </main>

      <Footer />

      {/* Decorative animation. Client-only, dynamically imported, not in SSR HTML. */}
      <SpiderCanvasClient />

      {/* Per-page structured data: FAQ + HowTo + Breadcrumbs.
          Global Organization/Person/WebSite/SoftwareApplication live in layout.tsx. */}
      <JsonLd data={pageGraph} />
    </>
  );
}
