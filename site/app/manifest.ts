import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.shortDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: SITE.themeColor,
    icons: [
      { src: '/icons/icon32.png', sizes: '32x32', type: 'image/png' },
      { src: '/icons/icon48.png', sizes: '48x48', type: 'image/png' },
      { src: '/icons/icon128.png', sizes: '128x128', type: 'image/png' },
    ],
  };
}
