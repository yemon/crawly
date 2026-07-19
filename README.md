# Crawly

A comic little spider that lives in your browser and replays your UI tests. Record clicks, typing, and mouse moves on your React or Next.js app, then let the spider act them out: it crawls to each field, types character by character, clicks buttons, and celebrates with a big **KPOW** when everything passes. When the UI changed since you recorded, it panics in style.

Website: <https://crawly.site>

- Free and open source — [Apache 2.0](LICENSE)
- Zero network traffic — recordings live in your extension storage
- Manifest V3 Chrome extension, no build step

## Repository layout

```
crawly/
├─ extension/     # the Chrome extension (load this unpacked)
│  ├─ manifest.json
│  ├─ bg.js
│  ├─ content/crawly.js
│  ├─ popup/
│  ├─ fonts/
│  └─ icons/
├─ demo/          # local form playground with chaos buttons
├─ site/          # crawly.site — Next.js SSR marketing site
├─ scripts/       # packaging helper (zips extension/ for Chrome Web Store)
├─ .github/       # issue/PR templates and CI
├─ LICENSE
├─ NOTICE
├─ CHANGELOG.md
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
└─ SECURITY.md
```

The extension, the demo, and the marketing site are independent — you can
work on any one without installing anything for the others.

## Install (unpacked, for development)

1. Open Chrome and go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick the [`extension/`](extension/) folder
4. Pin Crawly to the toolbar. Done.

Works in any Chromium-based browser that supports Manifest V3 (Chrome, Edge, Brave, Arc, Opera).

## Quick start with the demo

1. Serve the demo folder on localhost, for example:
   ```
   cd demo && python3 -m http.server 3000
   ```
2. Open <http://localhost:3000>
3. Click the Crawly icon, hit **RECORD A CRAWL**, then fill the form and press *Sign me up*
4. Open the popup again, name it, **STOP & SAVE**
5. Reload the page, open the popup, press **RUN**. Enjoy.
6. Use the **Chaos controls** on the demo page to disable, remove, or rename the submit button, then run again to see failure mode.

## What gets recorded

Clicks (buttons, links, checkboxes, radios, anything clickable), text typed into inputs and textareas, select choices, and coarse mouse movement waypoints. Each automation is saved with the origin and path it was recorded on.

## Replay behavior

The spider drops in on a silk thread (**THWIP!**), then walks to each target. Long hops use the web-zip move. Text is typed character by character with a 25 ms delay per character, using native value setters plus real `input` events, which is exactly what React controlled components need. Clicks are pounces: the spider leaps into the air, lands right on the element, and the impact fires a full `pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click` sequence, then it hops back off so you can see the result. While roaming or recording it also pounces on whatever you click nearby.

Comic language the spider speaks:

| Sound   | Meaning                                  |
|---------|------------------------------------------|
| THWIP!  | Web fired (drop-in, zip, leaving)        |
| WHOOSH! | Spider arrives to start a run            |
| BANG!   | A recorded click was replayed            |
| OMG!    | Something changed: missing or disabled   |
| BOOM!   | The run failed                           |
| KPOW!   | All steps passed (also: consent granted) |

## Consent per domain

On `localhost` and `127.0.0.1` (any port) the spider works right away. On every other domain, Crawly asks once with a comic consent panel before recording or replaying anything. You can revoke a domain any time from the popup. Nothing ever leaves your browser; recordings live in extension storage only.

## Enable, disable, organize

The popup lists crawls saved for the current site with a switch to enable or disable each one, plus **RUN**, **AUTO**, **EXPORT**, **RENAME**, and **DELETE**. Crawls from other sites show under "Elsewhere". Disabled crawls will not run.

## Multi-page crawls

Recording keeps going across full page loads within the same origin: navigate, reload, submit a form that redirects, the REC chip follows you and a `nav` step is stamped into the crawl at each landing. Replay does the same: progress is checkpointed before every step, so when a click navigates away, the spider drops back in on the next page and continues where it left off. Each `nav` step doubles as an assertion: if the app no longer lands on the recorded path, you get an **OMG!** and a **BOOM!** instead of a green run. Runs and recordings stay within one origin; try the demo's "Continue to page two" link to see it in action.

## Auto-run on page load

Flip **AUTO** on a crawl and it will run by itself whenever a matching page loads (same origin, path starts with the recorded path). Two safety rails: it never pops the consent panel by itself, so the domain must already be allowed, and a per-tab brake stops the same crawl from re-triggering within 60 seconds, which prevents loops when the crawl ends by navigating back to the page it started on. Imported crawls always arrive with **AUTO** off.

## Export and import

**EXPORT** on any crawl (or **EXPORT ALL**) downloads a `.crawly.json` file you can commit to a repo or hand to a teammate. **IMPORT** accepts those files, validates them, gives every crawl a fresh id, and strips the auto-run flag for safety. Remember the file contains recorded values in plain text.

## Themes

Two spider suits in the popup header: **NOIR**, the classic black spider, and **HERO**, the red and blue one. You know the one.

## Privacy

- Everything runs locally in your browser. No telemetry, no network requests.
- Recordings are kept in `chrome.storage.local`, scoped to the extension.
- Values (including anything typed into password fields) are stored in plain text. Use test credentials.

## Notes and limits

- Values are stored in plain text in extension storage and in exports, including anything typed into password fields during recording. Use test credentials.
- Runs and recordings survive reloads and navigation within the same origin. Crossing to a different origin ends them.
- Iframes and closed shadow DOM inputs are not recorded.
- Selectors prefer `data-testid`, `id`, `name`, `aria-label`, and `placeholder`, then fall back to a structural path plus button text, so hashed CSS class names in React builds are not a problem.

## Marketing site

The [`site/`](site/) directory contains the source of [crawly.site](https://crawly.site) —
a Next.js 15 App Router project (React 19 + TypeScript + Tailwind) with full
SEO and GEO structured data, static generation, and a dynamically rendered
Open Graph card. See [site/README.md](site/README.md) for the full breakdown.

```bash
npm run site        # starts the Next.js dev server on http://localhost:3000
npm run site:build  # production build
```

## Contributing

Bug reports and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up, style expectations, and the PR flow. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) first.

Found a security issue? See [SECURITY.md](SECURITY.md) — please do not open a public issue.

## License

Crawly is released under the [Apache License, Version 2.0](LICENSE). See [NOTICE](NOTICE) for attribution of bundled third-party assets.
