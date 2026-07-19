import Link from 'next/link';
import { SITE } from '@/lib/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-[3px] border-ink mt-8 bg-paper">
      <div className="max-w-[1120px] mx-auto p-5 flex flex-wrap gap-3.5 items-center">
        <span className="font-bang text-[20px] tracking-wider">{SITE.name.toUpperCase()}</span>
        <span className="text-neutral-400">/</span>
        <a href={SITE.url} className="text-ink font-semibold no-underline text-[13.5px] hover:underline">
          {SITE.domain}
        </a>
        <span className="text-neutral-400">/</span>
        <Link href="/articles" className="text-ink font-semibold no-underline text-[13.5px] hover:underline">
          Articles
        </Link>
        <span className="text-neutral-400">/</span>
        <Link href="/privacy" className="text-ink font-semibold no-underline text-[13.5px] hover:underline">
          Privacy
        </Link>
        <span className="text-neutral-400">/</span>
        <a
          href={SITE.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="text-ink font-semibold no-underline text-[13.5px] hover:underline"
        >
          GitHub
        </a>
        <span className="text-neutral-400">/</span>
        <a
          href={SITE.licenseUrl}
          target="_blank"
          rel="noreferrer"
          className="text-ink font-semibold no-underline text-[13.5px] hover:underline"
        >
          Apache 2.0
        </a>
        <a
          href="https://www.upwork.com/freelancers/noorayemon"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-ink font-semibold text-[13.5px] underline underline-offset-[3px] decoration-2 hover:decoration-[3px]"
        >
          Contact me if you have a cool project
        </a>
        <span className="text-neutral-400">/</span>
        <span className="text-[12.5px] text-neutral-600">
          © {year} {SITE.name}.
        </span>
      </div>
    </footer>
  );
}
