'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled: the animation is decorative, so we don't
// need it in the server-rendered HTML. Server response stays clean and small
// for search/AI crawlers.
const SpiderCanvas = dynamic(() => import('./SpiderCanvas'), {
  ssr: false,
  loading: () => null,
});

export function SpiderCanvasClient() {
  return <SpiderCanvas />;
}
