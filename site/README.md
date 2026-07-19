# crawly.site (Next.js)

The marketing site for [Crawly](https://crawly.site) — a server-rendered Next.js
app built for maximum SEO and GEO (generative engine optimization) coverage.

## Stack

- Next.js 15 (App Router, React 19, TypeScript, `force-static` home)
- Tailwind CSS 3.4
- Zero external network dependencies at runtime (font shipped locally)

## Run it

```bash
cd site
npm install
npm run dev       # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## SEO / GEO surface area

Everything below ships out of the box:

- **Metadata**: title template, description, canonical, Open Graph, Twitter Card, icons, web manifest, robots directives, referrer policy. Configured centrally in [`app/layout.tsx`](app/layout.tsx) and driven from [`lib/site.ts`](lib/site.ts).
- **JSON-LD structured data** in [`lib/structured-data.ts`](lib/structured-data.ts):
  - `SoftwareApplication` (with `DeveloperApplication` subcategory) — the primary schema for a Chrome extension.
  - `Organization`, `Person` (author), `WebSite` — entity graph for cross-referencing.
  - `FAQPage` — matched 1:1 with the visible FAQ section.
  - `HowTo` — matched 1:1 with the install steps.
  - `BreadcrumbList` — helps engines understand section anchors.
  - All emitted as one `@graph` for consistency.
- **Sitemap** at `/sitemap.xml`, [`app/sitemap.ts`](app/sitemap.ts).
- **Robots** at `/robots.txt`, [`app/robots.ts`](app/robots.ts) — explicitly welcomes GPTBot, PerplexityBot, ClaudeBot, Google-Extended, CCBot, and friends.
- **OG image** rendered dynamically at `/opengraph-image` via `next/og` — see [`app/opengraph-image.tsx`](app/opengraph-image.tsx). 1200×630, no external font deps.
- **Favicon** and Apple touch icon generated dynamically — [`app/icon.tsx`](app/icon.tsx), [`app/apple-icon.tsx`](app/apple-icon.tsx).
- **Web manifest** at `/manifest.webmanifest` via [`app/manifest.ts`](app/manifest.ts).
- **`llms.txt`** at `/llms.txt` — a plain-text summary tuned for AI answer engines (Perplexity, Claude, ChatGPT search, Google AI Overviews). See [`public/llms.txt`](public/llms.txt).
- **`humans.txt`** and **`.well-known/security.txt`** — standard discoverability files.
- **Semantic HTML**: `<nav aria-label>`, `<main>`, `<section id>` for every top-level topic, `<h1>` → `<h2>` → `<h3>` hierarchy, `<article>` for cards, `<dfn>` for the primary entity.
- **Skip-to-content link** for accessibility and keyboard nav.
- **Static generation** (`export const dynamic = 'force-static'`) — home is HTML at build time; the animated spider is a client-only enhancement loaded via `dynamic(..., { ssr: false })` so bots see clean SSR HTML.

## GEO-specific content patterns

These sections are structured for direct lifting by AI answer engines:

- **Hero lead paragraph** starts with a `<dfn>Crawly</dfn> is …` sentence — a canonical definitional statement.
- **FAQ** section: `<details>` per question with an `<h2>`-anchored heading, mirrored by `FAQPage` JSON-LD.
- **Articles** at `/articles/<slug>`: full-length editorial pieces, each with `TechArticle` + `BreadcrumbList` + `FAQPage` JSON-LD, canonical link, Article Open Graph tags, and an in-page table of contents. Engines lift comparison tables and Q&A from these verbatim for "X vs Y" queries.
- **HowTo** section: numbered `<ol>` mirrored by `HowTo` JSON-LD.
- **`llms.txt`** contains a Markdown table + Q&A summary aimed at bots that read the plain-text version instead of the HTML.

## After you deploy

1. Add search-engine verification tokens in [`app/layout.tsx`](app/layout.tsx) `metadata.verification` and submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
2. Keep `SITE.chromeStoreUrl` in [`lib/site.ts`](lib/site.ts) pointing at the live Chrome Web Store listing — the Install buttons, HowTo copy, and JSON-LD all read from it.
3. Point the `crawly.site` domain at your host (Vercel is the easiest fit given `next/og` runs on the edge).

## Project layout

```
site/
├─ app/
│  ├─ layout.tsx           # metadata + global JSON-LD + font
│  ├─ page.tsx             # homepage composition + per-page JSON-LD
│  ├─ globals.css          # Tailwind + comic-book design tokens
│  ├─ sitemap.ts           # /sitemap.xml
│  ├─ robots.ts            # /robots.txt (AI bots explicitly allowed)
│  ├─ manifest.ts          # /manifest.webmanifest
│  ├─ icon.tsx             # dynamic favicon
│  ├─ apple-icon.tsx       # dynamic Apple touch icon
│  └─ opengraph-image.tsx  # dynamic OG card
├─ components/
│  ├─ Nav.tsx              # sticky nav + theme toggle
│  ├─ Hero.tsx             # h1 + demo stage (IDs consumed by SpiderCanvas)
│  ├─ Features.tsx         # feature grid
│  ├─ HowTo.tsx            # numbered install steps
│  ├─ Faq.tsx              # accordion FAQ
│  ├─ ComingSoon.tsx       # roadmap
│  ├─ OpenSource.tsx       # OSS callout + code sample
│  ├─ Footer.tsx           # footer
│  ├─ ThemeToggle.tsx      # client theme toggle
│  ├─ JsonLd.tsx           # renders a JSON-LD <script>
│  ├─ SpiderCanvas.tsx     # the animated spider (client only)
│  └─ SpiderCanvasClient.tsx  # dynamic import wrapper
├─ lib/
│  ├─ site.ts              # central site constants (name, url, keywords…)
│  └─ structured-data.ts   # every JSON-LD object in one place
└─ public/
   ├─ fonts/bangers.woff2  # local font (no external CDN)
   ├─ icons/               # PNG icons for manifest
   ├─ llms.txt             # AI-answer-engine summary
   ├─ humans.txt
   └─ .well-known/security.txt
```

## License

Apache 2.0. See the root [LICENSE](../LICENSE).
