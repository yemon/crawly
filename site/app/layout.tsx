import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SITE, absoluteUrl } from '@/lib/site';
import {
  graphLd,
  organizationLd,
  personLd,
  websiteLd,
  softwareApplicationLd,
} from '@/lib/structured-data';
import { JsonLd } from '@/components/JsonLd';
import './globals.css';

const bangers = localFont({
  src: '../public/fonts/bangers.woff2',
  variable: '--font-bangers',
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Comic Spider that Records & Replays UI Tests for React and Next.js`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  creator: SITE.author.name,
  publisher: SITE.author.name,
  category: 'technology',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Record a flow once, let a spider replay it forever`,
    description: SITE.description,
    locale: 'en_US',
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: `${SITE.name} — comic spider UI tester for React and Next.js`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Comic Spider that Tests Your UI`,
    description: SITE.shortDescription,
    images: [absoluteUrl('/opengraph-image')],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon128.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon128.png', sizes: '128x128', type: 'image/png' }],
    shortcut: '/icons/icon32.png',
  },
  manifest: '/site.webmanifest',
  referrer: 'strict-origin-when-cross-origin',
  verification: {
    // add these when you register with search engines:
    // google: 'REPLACE_ME',
    // yandex: 'REPLACE_ME',
  },
  other: {
    'apple-mobile-web-app-title': SITE.name,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: SITE.themeColor,
};

const graph = graphLd([
  organizationLd,
  personLd,
  websiteLd,
  softwareApplicationLd,
]);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="noir" className={bangers.variable}>
      <head>
        {/* Preconnect to zero external origins on purpose: everything ships from same-origin. */}
        <link rel="alternate" type="application/rss+xml" title={`${SITE.name} releases`} href={`${SITE.githubUrl}/releases.atom`} />
      </head>
      <body className="font-sans antialiased text-ink">
        {children}
        <JsonLd data={graph} />
      </body>
    </html>
  );
}
