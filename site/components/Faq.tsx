// FAQ questions and answers must stay in sync with lib/structured-data.ts
// (faqLd). Keeping them here as one array so we can generate both the visible
// UI and the JSON-LD from the same source in a later refactor.

const QAS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is Crawly?',
    a: (
      <>
        <dfn className="crawly-dfn">Crawly</dfn> is a free, open source Chrome extension that
        records your clicks and keystrokes, then replays them on your React or Next.js app with
        a comic-book spider. It types character by character at 25 ms per key, uses native
        value setters so React controlled inputs accept every keystroke, and yells &ldquo;KPOW!&rdquo;
        when a run passes or &ldquo;BOOM!&rdquo; when it fails.
      </>
    ),
  },
  {
    q: 'How do I install Crawly?',
    a: (
      <>
        Clone the repository from GitHub, open <code>chrome://extensions</code> in your browser,
        enable <b>Developer mode</b>, click <b>Load unpacked</b>, and select the{' '}
        <code>extension/</code> folder. See the{' '}
        <a href="#install" className="underline">step-by-step install guide</a>. A one-click
        Chrome Web Store install is coming soon.
      </>
    ),
  },
  {
    q: 'Does Crawly send my recordings anywhere?',
    a: (
      <>
        No. Everything stays in <code>chrome.storage.local</code> inside your browser. Crawly
        makes zero network requests, ships no telemetry, and never uploads a recording. You can
        export a crawl as a <code>.crawly.json</code> file yourself if you want to share or
        commit it.
      </>
    ),
  },
  {
    q: 'Does Crawly work with React and Next.js controlled inputs?',
    a: (
      <>
        Yes. Crawly types with <em>native value setters</em> and dispatches real{' '}
        <code>input</code> events, which is exactly what React controlled components need to
        accept each keystroke. Selectors prefer <code>data-testid</code>, <code>id</code>,{' '}
        <code>name</code>, <code>aria-label</code>, and <code>placeholder</code> before falling
        back to a structural path, so hashed CSS class names from Next.js builds do not break
        anything.
      </>
    ),
  },
  {
    q: 'How is Crawly different from Cypress, Playwright, or Selenium?',
    a: (
      <>
        Cypress, Playwright, and Selenium are code-first frameworks that live in your test suite
        and run in CI. Crawly is a zero-config Chrome extension: no <code>npm install</code>, no
        config file, no scripts. You record a flow by using your app, then hit RUN. It is aimed
        at quick manual regression checks and shareable &ldquo;did the signup flow still work&rdquo;
        crawls, not at replacing your framework of choice for CI-scale coverage. For a deeper
        walk-through, see{' '}
        <a href="/articles/free-ui-testing-tools-react-nextjs-2026" className="underline">
          our roundup of free UI testing tools
        </a>.
      </>
    ),
  },
  {
    q: 'Is Crawly free? What license does it use?',
    a: (
      <>
        Crawly is free and open source under the <b>Apache License 2.0</b>. You can read the code,
        fork it, modify it, and use it commercially. The full license text lives in the{' '}
        <a
          href="https://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Apache 2.0 LICENSE
        </a>{' '}
        file at the root of the GitHub repository.
      </>
    ),
  },
  {
    q: 'Does Crawly ask permission before running on my site?',
    a: (
      <>
        Yes. On <code>localhost</code> and <code>127.0.0.1</code> (any port), Crawly works right
        away. On every other domain, Crawly shows a comic-panel consent prompt once, per origin,
        before it will record or replay anything. You can revoke consent for any domain from the
        popup at any time.
      </>
    ),
  },
  {
    q: 'Can a crawl span multiple pages?',
    a: (
      <>
        Yes. Recording and replay both survive full page loads within the same origin. Every
        navigation is stamped as a <code>nav</code> step that doubles as an assertion: if the app
        lands on the wrong path during replay, the spider panics with <b>OMG!</b> and{' '}
        <b>BOOM!</b> instead of passing silently.
      </>
    ),
  },
  {
    q: 'What is the .crawly.json file?',
    a: (
      <>
        It is the portable export format for a saved crawl. It contains the origin, path prefix,
        and every recorded step (clicks, typed values, selects, navigations). You can commit a{' '}
        <code>.crawly.json</code> to a repo, hand it to a teammate, and import it back into
        another Crawly install. Values are stored in plain text, so avoid recording real
        credentials.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section id="faq" className="max-w-[1120px] mx-auto px-5 py-12">
      <h2 className="font-bang tracking-[2px] text-[40px] mb-5">FREQUENTLY ASKED QUESTIONS</h2>
      <div className="grid gap-3 max-w-[840px]">
        {QAS.map(({ q, a }) => (
          <details key={q} className="crd group" name="crawly-faq">
            <summary className="font-bang tracking-wide text-[19px] cursor-pointer list-none flex items-center justify-between">
              <span>{q}</span>
              <span aria-hidden className="font-bang text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="mt-2 text-[14.5px] leading-6 text-neutral-800">{a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
