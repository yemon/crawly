#!/usr/bin/env node
// Package the extension into a zip suitable for uploading to the Chrome Web
// Store or handing to teammates. Zero dependencies: uses the built-in
// child_process to shell out to zip on POSIX or PowerShell on Windows.

import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { platform } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const extDir = join(root, 'extension');
const outDir = join(root, 'dist');

const manifest = JSON.parse(readFileSync(join(extDir, 'manifest.json'), 'utf8'));
const outFile = join(outDir, `crawly-${manifest.version}.zip`);

if (!existsSync(extDir)) {
  console.error(`No ${extDir} directory. Are you in the repo root?`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
if (existsSync(outFile)) rmSync(outFile);

console.log(`Packaging ${extDir} -> ${outFile}`);

if (platform() === 'win32') {
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-Command', `Compress-Archive -Path '${extDir}/*' -DestinationPath '${outFile}' -Force`],
    { stdio: 'inherit' },
  );
} else {
  execFileSync('zip', ['-r', outFile, '.'], { cwd: extDir, stdio: 'inherit' });
}

console.log(`Done: ${outFile}`);
