import { SITE } from '@/lib/site';

export function OpenSource() {
  return (
    <section id="oss" className="max-w-[1120px] mx-auto px-5 py-12">
      <h2 className="font-bang tracking-[2px] text-[40px] mb-5">OPEN SOURCE, APACHE 2.0</h2>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center">
        <div>
          <p className="text-[17px] text-neutral-800 max-w-[520px]">
            Crawly is free and open source under the <b>Apache 2.0 license</b>. Read it, fork it,
            bend it to your team&apos;s will. Bug reports and pull requests are welcome, the spider
            does not bite contributors.
          </p>
          <div className="flex gap-3.5 flex-wrap mt-5">
            <a className="btn" href={SITE.githubUrl} target="_blank" rel="noreferrer">
              GITHUB.COM/YEMON/CRAWLY
            </a>
          </div>
        </div>
        <pre className="codebox" aria-label="Install commands">
          <code>
            <span className="c"># grab the source</span>{'\n'}
            git clone https://github.com/yemon/crawly{'\n'}
            {'\n'}
            <span className="c"># load it unpacked</span>{'\n'}
            chrome://extensions &gt; Developer mode &gt; Load unpacked{'\n'}
            {'\n'}
            <span className="c"># share a crawl with your team</span>{'\n'}
            signup-flow.crawly.json
          </code>
        </pre>
      </div>
    </section>
  );
}
