'use client';

import { useEffect, useState } from 'react';

type Theme = 'noir' | 'hero';

// Client-only theme switch. Persists in localStorage, mirrors to <html data-theme>
// so both CSS and the SpiderCanvas can react.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('noir');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && window.localStorage.getItem('crawly-theme')) as Theme | null;
    if (saved === 'noir' || saved === 'hero') setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { window.localStorage.setItem('crawly-theme', theme); } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent('crawly:theme', { detail: { theme } }));
  }, [theme]);

  return (
    <div className="seg" id="themeSeg" role="group" aria-label="Theme">
      <button
        type="button"
        data-theme="noir"
        className={theme === 'noir' ? 'on' : ''}
        aria-pressed={theme === 'noir'}
        onClick={() => setTheme('noir')}
      >
        NOIR
      </button>
      <button
        type="button"
        data-theme="hero"
        className={theme === 'hero' ? 'on' : ''}
        aria-pressed={theme === 'hero'}
        onClick={() => setTheme('hero')}
      >
        HERO
      </button>
    </div>
  );
}
