# Changelog

All notable changes to Crawly will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.3.0] - 2025

Initial public open source release under the Apache 2.0 license.

### Added

- Record clicks, typed values, select choices, and mouse waypoints on any
  webpage; replay them with a spider that walks to each target.
- Per-origin consent gate for every non-`localhost` domain, with a comic
  consent panel and a revoke button in the popup.
- Multi-page crawls that survive same-origin navigation, with `nav` steps
  acting as assertions on the landing path.
- Auto-run on page load, with a per-tab 60 s brake to prevent loops.
- Import and export of crawls as `.crawly.json` files, with schema validation
  and safety scrubbing of the auto-run flag on import.
- NOIR and HERO themes for the spider.
- Local demo page under `demo/` with chaos controls to simulate app changes.
