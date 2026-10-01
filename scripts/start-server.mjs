// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Universal Cross-Platform Server Start Script (Railway & Local)
// File: scripts/start-server.mjs
// =====================================================================

import { spawn } from 'child_process';
import path from 'path';

const port = process.env.PORT || 3000;
const host = process.env.HOSTNAME || '0.0.0.0';

console.log(`[FSL Server] Launching Next.js on host ${host}, port ${port}...`);

const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(process.execPath, [nextBin, 'start', '-p', String(port), '-H', host], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (err) => {
  console.error('[FSL Server] Failed to start Next.js process:', err);
  process.exit(1);
});

// Forward termination signals to Next.js child process
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
