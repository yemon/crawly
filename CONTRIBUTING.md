# Contributing to Crawly

Thanks for wanting to help the spider get better. This document covers what you
need to know to hack on Crawly and get a pull request merged.

By participating in this project you agree to abide by our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Ground rules

- Be kind. Assume the person on the other side wants the same thing you do.
- Keep changes focused. One purpose per PR.
- Prefer editing existing files to adding new ones.
- Match the surrounding style. Crawly has no build step and no linter config —
  copy the tone of the file you're touching.
- No telemetry, no analytics, no network calls out of the extension. Ever.

## What we're happy to accept

- Bug fixes with a clear repro (a demo page or steps against `demo/` is ideal).
- New selector strategies that help Crawly find elements in more real-world apps.
- Improvements to the recorder or player that keep the "record once, replay
  forever" story working.
- Docs, comments, and typo fixes.
- Accessibility improvements to the popup and consent panels.

## What to check with us first (open an issue)

- Anything that changes the storage schema for `automations` or the export
  format (`.crawly.json`). We need to preserve backwards compatibility for
  people who have crawls saved.
- New permissions in `manifest.json`.
- Anything that would send data over the network.
- Big visual changes to the spider or the popup theme system.

## Development setup

There is no build step. The extension is plain HTML/CSS/JS and loads
directly.

1. Clone the repo.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and pick the [`extension/`](extension/) folder.
5. Serve `demo/` on localhost and point your browser at it:
   ```
   cd demo && python3 -m http.server 3000
   ```
6. Iterate. After editing files under `extension/`, hit the reload button on
   the Crawly card in `chrome://extensions`. For content-script changes you
   also need to reload any target tab.

The recorder and player live in `extension/content/crawly.js`. The popup UI
is under `extension/popup/`. The background service worker is `extension/bg.js`.

## Testing your change

Crawly does not ship an automated test suite. Please cover at least these
manual paths before opening a PR:

- Record a crawl on the demo (`demo/index.html`), stop, save, reload, run it.
  Expect a green KPOW.
- Toggle each **Chaos control** on the demo (disable, hide, rename the submit
  button), run the crawl again, expect an OMG! and BOOM!.
- Try the multi-page flow: click "Continue to page two" while recording,
  interact with page two, stop, run.
- Export, then import back into a clean profile.
- Enable AUTO on a crawl, refresh the page, watch it fire once.
- Test on a non-`localhost` origin to verify the consent panel behaves.

If your change affects visuals, include a before/after screenshot or short
video in the PR.

## Style

- Two-space indent, single quotes for JS strings (matching current code).
- Small helpers over big classes. Look at how `sleep`, `lerp`, `clamp`, and
  friends are defined at the top of `crawly.js`.
- Comments explain *why*, not *what*. Follow the tone already in the file.
- Keep the extension size small. Every kilobyte lives in every user's browser.

## Commit and PR flow

1. Fork and create a branch off `main`.
2. Make your change. Keep commits reasonably small; squash trivia locally.
3. Update [CHANGELOG.md](CHANGELOG.md) under the `Unreleased` section.
4. Open a PR against `main`. Describe *what* and *why*, and include the manual
   test steps you ran.
5. Be ready for review comments. The spider is picky about details.

## Reporting bugs and asking for features

Open a GitHub issue. Use the templates under `.github/ISSUE_TEMPLATE/` — they
prompt for the info that makes bugs actually reproducible.

## License

By contributing you agree that your contributions will be licensed under the
[Apache License 2.0](LICENSE) that covers the project.
