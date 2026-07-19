// Step-by-step install guide. Uses <ol> and clear numbered headings so
// AI answer engines can lift a clean "How to install" list. The matching
// HowTo JSON-LD lives in lib/structured-data.ts.

import { SITE } from '@/lib/site';

const STEPS = [
  {
    n: 1,
    title: 'Open the Chrome Web Store listing',
    body: (
      <>
        Head to the{' '}
        <a href={SITE.chromeStoreUrl} target="_blank" rel="noreferrer" className="underline">
          Crawly listing on the Chrome Web Store
        </a>{' '}
        in Chrome, Edge, Brave, Arc, or any Chromium-based browser with
        Manifest V3 support.
      </>
    ),
  },
  {
    n: 2,
    title: 'Add to Chrome',
    body: (
      <>
        Click <b>Add to Chrome</b> and confirm the permissions prompt.
      </>
    ),
  },
  {
    n: 3,
    title: 'Pin Crawly',
    body: 'Pin the Crawly icon to your toolbar so you can start recording with one click.',
  },
  {
    n: 4,
    title: 'Record your first crawl',
    body: (
      <>
        Open any React or Next.js app, click the Crawly icon, hit{' '}
        <b>RECORD A CRAWL</b>, use your app, then <b>STOP &amp; SAVE</b>. Press{' '}
        <b>RUN</b> to watch the spider replay it.
      </>
    ),
  },
];

export function HowTo() {
  return (
    <section id="install" className="max-w-[1120px] mx-auto px-5 py-12">
      <h2 className="font-bang tracking-[2px] text-[40px] mb-5">HOW TO INSTALL CRAWLY</h2>
      <p className="max-w-prose text-[15px] text-neutral-800 mb-6">
        Crawly is live on the Chrome Web Store. One click to add it, and you
        are recording in under a minute — no build step, no account.
      </p>
      <ol className="grid gap-3 max-w-[720px] list-none p-0 m-0">
        {STEPS.map((s) => (
          <li key={s.n} className="crd flex gap-4 items-start">
            <span
              aria-hidden
              className="font-bang tracking-widest text-[26px] bg-ink text-white rounded-full min-w-[42px] h-[42px] flex items-center justify-center leading-none pt-1"
            >
              {s.n}
            </span>
            <div>
              <h3 className="font-bang tracking-[1.4px] text-[20px] mb-1">{s.title}</h3>
              <p className="text-[14px] text-neutral-800 m-0">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
