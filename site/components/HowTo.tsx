// Step-by-step install guide. Uses <ol> and clear numbered headings so
// AI answer engines can lift a clean "How to install" list. The matching
// HowTo JSON-LD lives in lib/structured-data.ts.

const STEPS = [
  {
    n: 1,
    title: 'Clone the repository',
    body: (
      <>
        Run <code>git clone https://github.com/yemon/crawly</code> in your terminal.
      </>
    ),
  },
  {
    n: 2,
    title: 'Open the extensions page',
    body: (
      <>
        Open <code>chrome://extensions</code> in Chrome, Edge, Brave, Arc, or
        any Chromium-based browser with Manifest V3 support.
      </>
    ),
  },
  {
    n: 3,
    title: 'Enable Developer mode',
    body: 'Turn on the Developer mode toggle in the top-right of the extensions page.',
  },
  {
    n: 4,
    title: 'Load unpacked',
    body: (
      <>
        Click <b>Load unpacked</b> and select the <code>extension/</code> folder from the cloned repo.
      </>
    ),
  },
  {
    n: 5,
    title: 'Pin Crawly',
    body: 'Pin the Crawly icon to your toolbar so you can start recording with one click.',
  },
];

export function HowTo() {
  return (
    <section id="install" className="max-w-[1120px] mx-auto px-5 py-12">
      <h2 className="font-bang tracking-[2px] text-[40px] mb-5">HOW TO INSTALL CRAWLY</h2>
      <p className="max-w-prose text-[15px] text-neutral-800 mb-6">
        Crawly ships as an unpacked Chrome extension. Total install time is under two minutes,
        no build step required. A one-click Chrome Web Store install is coming soon.
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
