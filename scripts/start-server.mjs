// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Universal Cross-Platform Server Start Script (Railway & Local)
// File: scripts/start-server.mjs
// =====================================================================

import { spawn } from 'child_process';

const port = process.env.PORT || 3000;
const host = process.env.HOSTNAME || '0.0.0.0';

console.log(`[FSL Server] Launching Next.js on host ${host}, port ${port}...`);

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['next', 'start', '-p', String(port), '-H', host];

const child = spawn(cmd, args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('error', (err) => {
  console.error('[FSL Server] Failed to start Next.js process:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
