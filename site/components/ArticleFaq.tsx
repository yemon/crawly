// Renders an article's FAQ block. Kept as a component so every article uses
// the same look, and the same shape as the FAQPage JSON-LD that ships with it.

export type FaqQa = { q: string; a: React.ReactNode };

export function ArticleFaq({ qas, id = 'faq' }: { qas: FaqQa[]; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10">
      <h2 id={`${id}-h`} className="font-bang tracking-[1.6px] text-[28px] mb-3">
        Frequently asked questions
      </h2>
      <div className="grid gap-2">
        {qas.map(({ q, a }) => (
          <details key={q} className="crd">
            <summary className="font-bang tracking-wide text-[18px] cursor-pointer list-none">
              {q}
            </summary>
            <div className="mt-2 text-[15px] leading-6 text-neutral-800">{a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
