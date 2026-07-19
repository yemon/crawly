// Feature grid. Each card has a stable heading (h3) — good for GEO, since AI
// answer engines quote by heading + description pair.

type Feature = {
  title: string;
  body: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: 'RECORD & REPLAY',
    body: (
      <>
        Click record, use your app like a human. Crawly captures clicks, typing,
        selects, and mouse moves, then replays them any time. Selectors prefer{' '}
        <code>data-testid</code> and <code>id</code>, so hashed React class
        names are no problem.
      </>
    ),
  },
  {
    title: 'TYPES LIKE A PERSON',
    body: (
      <>
        Character by character, <b>25 ms per key</b>, through native setters and
        real <code>input</code> events. Controlled React inputs accept every
        keystroke like it came from a keyboard.
      </>
    ),
  },
  {
    title: 'COMIC ALERTS',
    body: (
      <>
        <span className="font-bang tracking-wider">BANG!</span> on clicks,{' '}
        <span className="font-bang tracking-wider">THWIP!</span> for webs,{' '}
        <span className="font-bang tracking-wider">OMG!</span> when a button
        goes missing or gets disabled,{' '}
        <span className="font-bang tracking-wider">BOOM!</span> when a run
        fails, <span className="font-bang tracking-wider">KPOW!</span> when
        everything passes.
      </>
    ),
  },
  {
    title: 'MULTI-PAGE RUNS',
    body: (
      <>
        Runs checkpoint before every step and survive real navigations. Each
        landing doubles as an assertion: land on the wrong page and the spider
        panics loudly instead of passing quietly.
      </>
    ),
  },
  {
    title: 'AUTO-RUN & SHARING',
    body: (
      <>
        Flip AUTO and a crawl runs itself whenever a matching page loads.
        Export any crawl as <code>.crawly.json</code>, commit it, share it.
        Imports never get auto-run rights until you say so.
      </>
    ),
  },
  {
    title: 'CONSENT FIRST',
    body: (
      <>
        <code>localhost</code> on any port just works. Every other domain gets
        asked once, in a big comic panel, before the spider records or replays
        anything. Everything stays in your browser.
      </>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="max-w-[1120px] mx-auto px-5 py-12">
      <h2 className="font-bang tracking-[2px] text-[40px] mb-5">WHAT THE SPIDER DOES</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className="crd">
            <h3 className="font-bang tracking-[1.4px] text-[21px] mb-1.5">{f.title}</h3>
            <p className="text-[13.5px] text-neutral-800 m-0">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
