# Security Policy

Thanks for helping keep Crawly and the people who use it safe.

## Supported versions

Crawly ships as a single Chrome extension. Only the latest published version
receives security fixes. The current version is tracked in
[`extension/manifest.json`](extension/manifest.json).

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Report vulnerabilities privately by using GitHub's private vulnerability
reporting on this repo:

- Go to the repo's **Security** tab → **Report a vulnerability**.

If that is unavailable, open a minimal public issue asking to be contacted
privately and we will follow up through a private channel. Do not include
proof-of-concept details in the public issue.

We aim to acknowledge new reports within 5 business days and to ship a fix or
mitigation within 30 days when the issue is confirmed. Please give us
reasonable time to fix the problem before public disclosure.

## Scope

In scope:

- Anything that lets a webpage read, modify, or exfiltrate recordings out of
  extension storage.
- Anything that bypasses the per-origin consent gate.
- Anything that lets a page cause the extension to auto-run against origins
  the user has not allowed.
- Injection of untrusted markup into the popup or the in-page shadow UI.

Out of scope:

- Recorded values are stored in plain text in `chrome.storage.local` and in
  `.crawly.json` exports, including anything typed into password fields
  during recording. This is a documented limit; use test credentials. See
  [README.md](README.md#privacy).
- Attacks that require the attacker to already have write access to the user's
  local Chrome profile.
- Vulnerabilities in Chrome itself. Report those to the Chrome team.

## Nice-to-have in a report

- A short description of the issue and the impact.
- Steps to reproduce, ideally against `demo/`.
- The extension version from `manifest.json`.
- Your browser, OS, and Chromium build (from `chrome://version`).

Thanks!
