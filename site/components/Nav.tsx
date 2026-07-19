import Link from 'next/link';
import { SITE } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';

export function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center gap-4 px-5 py-3 bg-paper border-b-[3px] border-ink"
      aria-label="Primary"
    >
      <Link href="/" aria-label={`${SITE.name} home`} className="flex items-center gap-1.5 text-[30px] leading-none no-underline text-ink font-bang">
        <span id="logoPerch" aria-hidden className="inline-block w-[34px] h-[30px]" />
        {SITE.name.toUpperCase()}
      </Link>
      <ul className="hidden sm:flex gap-4 ml-2 list-none p-0 m-0">
        <li><Link href="/#demo" className="text-ink no-underline font-semibold text-sm hover:underline">Demo</Link></li>
        <li><Link href="/#features" className="text-ink no-underline font-semibold text-sm hover:underline">Features</Link></li>
        <li><Link href="/articles" className="text-ink no-underline font-semibold text-sm hover:underline">Articles</Link></li>
        <li><Link href="/#faq" className="text-ink no-underline font-semibold text-sm hover:underline">FAQ</Link></li>
        <li><Link href="/#soon" className="text-ink no-underline font-semibold text-sm hover:underline">Coming soon</Link></li>
        <li><Link href="/#oss" className="text-ink no-underline font-semibold text-sm hover:underline">Open source</Link></li>
      </ul>
      <div className="flex-1" />
      <ThemeToggle />
      <a
        className="btn mini primary"
        href={SITE.chromeStoreUrl || SITE.githubUrl}
        rel={SITE.chromeStoreUrl ? undefined : 'noreferrer'}
        target={SITE.chromeStoreUrl ? undefined : '_blank'}
        title={SITE.chromeStoreUrl ? 'Install from Chrome Web Store' : 'Chrome Web Store link coming soon — install unpacked from GitHub'}
      >
        INSTALL
      </a>
    </nav>
  );
}
