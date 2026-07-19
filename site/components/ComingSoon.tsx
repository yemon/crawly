const SOON = [
  {
    title: 'MCP SERVER',
    body: 'Drive Crawly from Claude or any MCP client. Start runs, read results, and manage your crawls straight from an AI conversation.',
  },
  {
    title: 'AI FULL-SYSTEM TESTING',
    body: 'Describe a flow in plain words. The spider explores your app, builds the crawl itself, runs it end to end, and reports what broke.',
  },
  {
    title: 'CODING AGENT HANDOFF',
    body: 'One command sends your coding agent everything it needs: the failing URL, the exact element, and what changed, ready to jump in and fix.',
  },
];

export function ComingSoon() {
  return (
    <section id="soon" className="max-w-[1120px] mx-auto px-5 py-12">
      <h2 className="font-bang tracking-[2px] text-[40px] mb-5">COMING SOON</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {SOON.map((c) => (
          <article key={c.title} className="crd soon">
            <span className="inline-block font-bang tracking-[1.4px] text-xs bg-ink text-white rounded-full px-2.5 py-0.5 mb-2">
              SOON
            </span>
            <h3 className="font-bang tracking-[1.4px] text-[21px] mb-1.5">{c.title}</h3>
            <p className="text-[13.5px] text-neutral-800 m-0">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
