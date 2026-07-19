import Link from 'next/link';
import type { Article } from '@/lib/articles';
import { SITE } from '@/lib/site';

type Props = {
  article: Article;
  children: React.ReactNode;
  toc?: { id: string; label: string }[];
};

// Shared shell for every article page: breadcrumbs, header, prose body, TOC,
// and a shared footer with related links. Article pages stay focused on their
// JSX content.
export function ArticleLayout({ article, children, toc }: Props) {
  return (
    <article className="max-w-[820px] mx-auto px-5 pt-10 pb-16" itemScope itemType="https://schema.org/TechArticle">
      <nav aria-label="Breadcrumb" className="text-sm text-neutral-600 mb-6">
        <ol className="flex flex-wrap gap-2 list-none p-0 m-0">
          <li><Link href="/" className="underline hover:no-underline">Home</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/articles" className="underline hover:no-underline">Articles</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-800" aria-current="page">{article.title}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mb-3">
          <span className="chip">{article.section.toUpperCase()}</span>
          <time dateTime={article.publishedAt} itemProp="datePublished">
            Published {formatDate(article.publishedAt)}
          </time>
          <meta itemProp="dateModified" content={article.modifiedAt} />
          <span aria-hidden>·</span>
          <span>{article.readMinutes} min read</span>
          <span aria-hidden>·</span>
          <span itemProp="author" itemScope itemType="https://schema.org/Person">
            By <a href={SITE.author.url} rel="noreferrer" className="underline hover:no-underline" itemProp="url">
              <span itemProp="name">{SITE.author.name}</span>
            </a>
          </span>
        </div>
        <h1 className="font-bang tracking-[2px] text-[clamp(34px,4.6vw,52px)] leading-[1.02] my-2" itemProp="headline">
          {article.title}
        </h1>
        <p className="text-[17px] text-neutral-700 mt-4 max-w-prose" itemProp="description">
          {article.description}
        </p>
      </header>

      {toc && toc.length > 0 && (
        <aside aria-label="Table of contents" className="crd mb-8">
          <div className="font-bang tracking-wider text-lg mb-2">ON THIS PAGE</div>
          <ol className="list-decimal pl-5 text-[14.5px] leading-6 text-neutral-800 space-y-1 m-0">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="underline hover:no-underline">{t.label}</a>
              </li>
            ))}
          </ol>
        </aside>
      )}

      <div
        className="article-prose max-w-none"
        itemProp="articleBody"
      >
        {children}
      </div>

      <footer className="mt-12 border-t-[3px] border-ink pt-6">
        <p className="text-sm text-neutral-700 mb-4">
          Enjoyed this? Crawly is a free, open-source Chrome extension that
          records and replays UI flows on React and Next.js apps. Written with
          the ideas from articles like this in mind.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/#install" className="btn mini primary">INSTALL CRAWLY</Link>
          <Link href="/articles" className="btn mini">MORE ARTICLES</Link>
          <a href={SITE.githubUrl} className="btn mini" target="_blank" rel="noreferrer">STAR ON GITHUB</a>
        </div>
      </footer>
    </article>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
