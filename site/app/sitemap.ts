import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { ARTICLES } from '@/lib/articles';

// Add new routes here as the site grows. Section anchors are listed so search
// engines and answer engines can pick specific sub-topics.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: absoluteUrl('/articles'), lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/privacy'), lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/#demo'), lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/#features'), lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/#install'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/#faq'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/#oss'), lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: absoluteUrl(`/articles/${a.slug}`),
    lastModified: new Date(a.modifiedAt + 'T00:00:00Z'),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  return [...staticEntries, ...articleEntries];
}
