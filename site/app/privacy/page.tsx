import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { SITE, absoluteUrl } from '@/lib/site';
import { graphLd } from '@/lib/structured-data';

export const dynamic = 'force-static';

const title = 'Privacy Policy';
const description =
  'What Crawly collects, where it lives, and what happens to it. Short version: recordings stay in your browser and nothing is sent anywhere.';

const effectiveDate = '2026-07-18';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/privacy' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/privacy'),
    title: `${title} — ${SITE.name}`,
    description,
    siteName: SITE.name,
  },
  robots: { index: true, follow: true },
};

const webPageLd = {
  '@type': 'WebPage',
  '@id': absoluteUrl('/privacy') + '#page',
  name: title,
  description,
  url: absoluteUrl('/privacy'),
  isPartOf: { '@id': absoluteUrl('/#website') },
  inLanguage: 'en',
  datePublished: effectiveDate,
  dateModified: effectiveDate,
};

const breadcrumbLd = {
  '@type': 'BreadcrumbList',
  '@id': absoluteUrl('/privacy') + '#breadcrumbs',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
    { '@type': 'ListItem', position: 2, name: 'Privacy', item: absoluteUrl('/privacy') },
  ],
} as const;

const pageGraph = graphLd([webPageLd, breadcrumbLd]);

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main id="main" role="main">
        <section className="max-w-[760px] mx-auto px-5 pt-14 pb-16">
          <nav aria-label="Breadcrumb" className="text-sm text-neutral-600 mb-6">
            <ol className="flex gap-2 list-none p-0 m-0">
              <li><Link href="/" className="underline hover:no-underline">Home</Link></li>
              <li aria-hidden>›</li>
              <li className="text-neutral-800" aria-current="page">Privacy</li>
            </ol>
          </nav>

          <h1 className="font-bang tracking-[2px] text-[clamp(38px,5vw,56px)] leading-[0.98] mb-3">
            PRIVACY POLICY
          </h1>
          <p className="text-[13px] text-neutral-600 mb-8">
            Effective date: {formatDate(effectiveDate)}
          </p>

          <div className="space-y-6 text-[16px] leading-[1.6] text-neutral-900">
            <section aria-labelledby="short-version">
              <h2 id="short-version" className="font-bang tracking-[1.4px] text-[24px] mt-2 mb-2">
                THE SHORT VERSION
              </h2>
              <p>
                Crawly is a Chrome extension that records what you click and type on a website so you
                can replay it later. Recordings live in your browser. They are never sent to Crawly,
                to <a href={SITE.url} className="underline hover:no-underline">{SITE.domain}</a>,
                to any server, or to any third party. There is no telemetry, no analytics, no
                account, and no login.
              </p>
            </section>

            <section aria-labelledby="what-crawly-stores">
              <h2 id="what-crawly-stores" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                WHAT CRAWLY STORES
              </h2>
              <p>When you record a crawl on a site you have allowed, Crawly saves:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Click targets and the CSS/text selectors used to find them.</li>
                <li>Values you type into <code>&lt;input&gt;</code> and <code>&lt;textarea&gt;</code> fields, and dropdown selections.</li>
                <li>A short trail of mouse positions for the spider replay animation.</li>
                <li>Page navigation events during the recording.</li>
                <li>Extension settings you set (theme, per-crawl names, auto-run flags).</li>
              </ul>
              <p>
                Everything is written to <code>chrome.storage.local</code>, which is a per-profile
                storage area managed by your browser. It stays on the device the extension is
                installed on.
              </p>
            </section>

            <section aria-labelledby="password-warning">
              <h2 id="password-warning" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                PASSWORDS AND OTHER SENSITIVE FIELDS
              </h2>
              <p>
                <strong>Payment card fields</strong> (any input with an <code>autocomplete</code>{' '}
                value starting with <code>cc-</code>) and <strong>one-time codes</strong> (
                <code>autocomplete=&quot;one-time-code&quot;</code>) are always skipped. Crawly does
                not record their values.
              </p>
              <p>
                <strong>Password fields</strong> are treated as your choice. When you start a
                recording on a page that contains a password field, Crawly shows a modal and asks
                you to pick:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Skip passwords</strong> — recommended. Passwords are ignored during recording.</li>
                <li>
                  <strong>Record anyway</strong> — Crawly captures what you type into the password
                  field and saves it. It is saved as plaintext in <code>chrome.storage.local</code>.
                  Anyone with access to your Chrome profile can read it. Anyone who exports the
                  crawl (from the extension&apos;s EXPORT button) can read it in the exported JSON.
                  Only pick this for throwaway test credentials against a staging or local
                  environment. Do not record real passwords for accounts you care about.
                </li>
              </ul>
            </section>

            <section aria-labelledby="what-leaves-your-browser">
              <h2 id="what-leaves-your-browser" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                WHAT LEAVES YOUR BROWSER
              </h2>
              <p>
                Nothing, unless <em>you</em> take an action that moves it. The extension makes no
                network requests. It does not phone home, does not report install or usage events,
                and does not load any remote scripts. The only ways data can leave your browser
                are:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You click <strong>EXPORT</strong> on a crawl and save the JSON file. Then it&apos;s in that file, wherever you put it.</li>
                <li>You share your Chrome profile with someone else (through Chrome Sync, a shared device, or a backup).</li>
              </ul>
              <p>Both of those are your choice, not Crawly&apos;s.</p>
            </section>

            <section aria-labelledby="per-site-permission">
              <h2 id="per-site-permission" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                PER-SITE PERMISSION
              </h2>
              <p>
                Crawly does not receive access to your browsing at install time. When you open the
                Crawly popup on a site for the first time, it says <strong>NOT ALLOWED YET</strong>.
                When you click <strong>ALLOW</strong>, Chrome shows its own permission prompt for
                that specific site. Crawly can only see the site once you grant that prompt. Click
                <strong> REVOKE</strong> to remove the permission at any time; the extension will
                stop running on that site and Chrome will confirm the change.
              </p>
            </section>

            <section aria-labelledby="what-crawly-does-not-do">
              <h2 id="what-crawly-does-not-do" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                WHAT CRAWLY DOES NOT DO
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Does not collect analytics, telemetry, or usage metrics.</li>
                <li>Does not sell, rent, or share any user data — there is no data to sell.</li>
                <li>Does not use user data for advertising, credit checks, or any purpose unrelated to the extension&apos;s single feature (recording and replaying UI actions).</li>
                <li>Does not include any third-party trackers, SDKs, or remote code.</li>
                <li>Does not read pages you have not explicitly allowed via the permission prompt.</li>
              </ul>
              <p>
                This aligns with Google&apos;s{' '}
                <a
                  href="https://developer.chrome.com/docs/webstore/user-data-faq"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:no-underline"
                >
                  Limited Use policy
                </a>{' '}
                for user data in Chrome extensions.
              </p>
            </section>

            <section aria-labelledby="deletion">
              <h2 id="deletion" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                DELETING YOUR DATA
              </h2>
              <p>
                Delete a single crawl from the popup&apos;s <strong>DELETE</strong> button. To
                remove everything at once, uninstall the extension from{' '}
                <code>chrome://extensions</code>. Uninstalling clears the extension&apos;s local
                storage on that profile.
              </p>
            </section>

            <section aria-labelledby="children">
              <h2 id="children" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                CHILDREN
              </h2>
              <p>
                Crawly is a developer tool aimed at people building and testing web applications.
                It is not directed at children under 13 and does not knowingly collect information
                from them. Nothing is collected from anyone, but this section exists because
                reviewers look for it.
              </p>
            </section>

            <section aria-labelledby="changes">
              <h2 id="changes" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                CHANGES TO THIS POLICY
              </h2>
              <p>
                If we change this policy, the effective date at the top will change and a summary of
                what moved will land in the{' '}
                <a
                  href={SITE.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:no-underline"
                >
                  Crawly GitHub repository
                </a>{' '}
                so you can see the diff.
              </p>
            </section>

            <section aria-labelledby="contact">
              <h2 id="contact" className="font-bang tracking-[1.4px] text-[24px] mt-6 mb-2">
                CONTACT
              </h2>
              <p>
                Questions, concerns, or a security report: open an issue at{' '}
                <a
                  href={SITE.githubUrl + '/issues'}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:no-underline"
                >
                  {SITE.githubUrl.replace('https://', '')}/issues
                </a>
                . For anything that shouldn&apos;t be public, use the security advisory feature on
                the same repository.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={pageGraph} />
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
