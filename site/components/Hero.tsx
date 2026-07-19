import { SITE } from '@/lib/site';

// The stage markup here mirrors the IDs the SpiderCanvas client component
// looks up at runtime (addBtn, saveBug, f-bug, f-by, f-sev, tbody, overlay,
// confirm, confirmNo, confirmYes, stage, shield). If you rename any of these,
// keep components/SpiderCanvas.tsx in sync.
export function Hero() {
  return (
    <section id="demo" className="max-w-[1120px] mx-auto px-5 pt-14 pb-8 grid gap-11 items-start grid-cols-1 md:grid-cols-[1fr_1.05fr]">
      <div>
        <span className="inline-block font-bang tracking-[2px] text-[15px] bg-ink text-white rounded-full px-3.5 py-1 kicker">
          FREE CHROME EXTENSION
        </span>
        <h1 className="font-bang tracking-[2px] text-[clamp(44px,6vw,68px)] leading-[0.98] my-3">
          YOUR FRIENDLY<br />NEIGHBORHOOD<br />
          <span className="inline-block -rotate-2">UI TESTER.</span>
        </h1>

        {/* Lead paragraph doubles as the primary definitional statement for GEO. */}
        <p className="text-[17px] text-neutral-800 max-w-[460px]">
          <b>Crawly</b> is a free, open source Chrome extension that records a flow once, then
          a tiny comic spider replays it on your <b>React</b> or <b>Next.js</b> app:
          crawling to fields, <b>typing at 25 ms per key</b>, pouncing on buttons, and yelling
          <b> KPOW!</b> when everything passes. When your UI changed behind your back, you get an
          <b> OMG!</b> and a <b>BOOM!</b> instead of a silent green checkmark.
        </p>

        <div className="flex gap-3.5 flex-wrap my-5">
          <a
            className="btn primary"
            href={SITE.chromeStoreUrl || SITE.githubUrl}
            rel={SITE.chromeStoreUrl ? undefined : 'noreferrer'}
            target={SITE.chromeStoreUrl ? undefined : '_blank'}
            title={SITE.chromeStoreUrl ? 'Install from Chrome Web Store' : 'Chrome Web Store link coming soon'}
          >
            INSTALL ON CHROME
          </a>
          <a className="btn" href={SITE.githubUrl} target="_blank" rel="noreferrer">
            STAR ON GITHUB
          </a>
        </div>

        <div className="flex gap-2 flex-wrap mt-3">
          <span className="chip">OPEN SOURCE</span>
          <span className="chip">APACHE 2.0</span>
          <span className="chip">NO ACCOUNT</span>
          <span className="chip">LOCALHOST FREE PASS</span>
        </div>
      </div>

      <div className="relative order-first md:order-none">
        <div className="stage" id="stage" role="region" aria-label="Live demo: a bug tracker driven by the Crawly spider">
          <div className="stage-head">
            <span className="stage-title">Bug tracker</span>
            <span className="live"><span className="dot" />Live</span>
            <button type="button" className="app-btn primary add" id="addBtn">+ Add bug</button>
          </div>
          <table aria-label="Demo bug table">
            <thead>
              <tr><th>Title</th><th>Reporter</th><th>Severity</th><th aria-label="Row actions"></th></tr>
            </thead>
            <tbody id="tbody" />
          </table>
          <div className="overlay" id="overlay">
            <div className="sheet">
              <h3>New bug</h3>
              <label htmlFor="f-bug">Title</label>
              <input id="f-bug" autoComplete="off" placeholder="What broke?" />
              <label htmlFor="f-by">Reporter</label>
              <input id="f-by" autoComplete="off" placeholder="Who saw it?" />
              <label htmlFor="f-sev">Severity</label>
              <select id="f-sev" defaultValue="Low">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <div className="row">
                <button type="button" className="app-btn ghost" id="cancelBug">Cancel</button>
                <button type="button" className="app-btn primary" id="saveBug">Add bug</button>
              </div>
            </div>
          </div>
          <div className="confirm" id="confirm">
            <div className="sheet">
              <h3>Delete bug?</h3>
              <p>This will permanently remove the bug from the tracker.</p>
              <div className="row">
                <button type="button" className="app-btn ghost" id="confirmNo">Cancel</button>
                <button type="button" className="app-btn danger" id="confirmYes">Delete</button>
              </div>
            </div>
          </div>
          <div className="shield" title="Crawly is driving this demo" aria-hidden />
        </div>
        <p className="text-xs text-neutral-600 mt-3">
          Live demo: that is the real extension spider driving a real form on this page.
          No video, actual DOM clicks and keystrokes, on a loop.
        </p>
      </div>
    </section>
  );
}
