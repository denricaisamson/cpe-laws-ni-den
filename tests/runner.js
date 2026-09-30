#!/usr/bin/env node

/**
 * Universal FSL E2E Test Suite Runner
 * 
 * Zero-external-dependency test runner with tier filtering, pattern matching,
 * detailed assertion reporting, and summary analytics.
 * 
 * Usage:
 *   node tests/runner.js
 *   node tests/runner.js --tier=1
 *   node tests/runner.js --tier=2,3
 *   node tests/runner.js --match="Attendance"
 */

import { tier1Tests } from './e2e/tier1-features.test.js';
import { tier2Tests } from './e2e/tier2-boundary.test.js';
import { tier3Tests } from './e2e/tier3-cross-feature.test.js';
import { tier4Tests } from './e2e/tier4-scenarios.test.js';

// ANSI terminal color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Parse CLI arguments
const args = process.argv.slice(2);
let selectedTiers = null; // null means all tiers
let matchPattern = null;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    selectedTiers = arg
      .replace('--tier=', '')
      .split(',')
      .map((t) => Number(t.trim()));
  } else if (arg.startsWith('--match=')) {
    matchPattern = arg.replace('--match=', '').toLowerCase();
  }
}

const suites = [
  { tier: 1, name: 'Tier 1: Feature Coverage (Features 1-18)', tests: tier1Tests },
  { tier: 2, name: 'Tier 2: Boundary & Corner Cases', tests: tier2Tests },
  { tier: 3, name: 'Tier 3: Cross-Feature Combinations', tests: tier3Tests },
  { tier: 4, name: 'Tier 4: Real-World Application Scenarios', tests: tier4Tests },
];

async function run() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM — E2E TEST SUITE   ${colors.reset}`);
  console.log(`${colors.dim}   Derived from ORIGINAL_REQUEST.md & FSL_SPEC.md (Tiers 1-4)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

  let totalRun = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const startTime = Date.now();
  const suiteResults = [];

  for (const suite of suites) {
    if (selectedTiers && !selectedTiers.includes(suite.tier)) {
      continue;
    }

    console.log(`${colors.bold}${colors.yellow}► Running ${suite.name}${colors.reset}`);
    let suitePassed = 0;
    let suiteFailed = 0;
    const suiteStart = Date.now();

    for (const test of suite.tests) {
      if (matchPattern && !test.name.toLowerCase().includes(matchPattern)) {
        continue;
      }

      totalRun++;
      const testStart = Date.now();
      try {
        await test.fn();
        const duration = Date.now() - testStart;
        suitePassed++;
        totalPassed++;
        console.log(`  ${colors.green}✔ PASS${colors.reset} ${colors.white}${test.name}${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`);
      } catch (err) {
        const duration = Date.now() - testStart;
        suiteFailed++;
        totalFailed++;
        console.log(`  ${colors.red}✖ FAIL${colors.reset} ${colors.bold}${colors.red}${test.name}${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`);
        console.log(`     ${colors.red}Error: ${err.message}${colors.reset}`);
        if (err.stack) {
          const lines = err.stack.split('\n').slice(1, 4).map((l) => `     ${colors.dim}${l.trim()}${colors.reset}`).join('\n');
          console.log(lines);
        }
      }
    }

    const suiteDuration = Date.now() - suiteStart;
    suiteResults.push({
      tier: suite.tier,
      name: suite.name,
      passed: suitePassed,
      failed: suiteFailed,
      total: suitePassed + suiteFailed,
      duration: suiteDuration,
    });
    console.log('');
  }

  const totalDuration = Date.now() - startTime;

  // Render Summary Table
  console.log(`${colors.bold}----------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}                         TEST SUITE SUMMARY                           ${colors.reset}`);
  console.log(`${colors.bold}----------------------------------------------------------------------${colors.reset}`);
  console.log(
    `${'Tier / Suite'.padEnd(45)} | ${'Pass'.padStart(5)} | ${'Fail'.padStart(5)} | ${'Total'.padStart(5)} | ${'Time'.padStart(8)}`
  );
  console.log(`${'-'.repeat(45)}-+-------+-------+-------+---------`);

  for (const res of suiteResults) {
    const passStr = `${colors.green}${String(res.passed).padStart(5)}${colors.reset}`;
    const failStr = res.failed > 0 ? `${colors.red}${String(res.failed).padStart(5)}${colors.reset}` : `    0`;
    console.log(
      `${res.name.padEnd(45)} | ${passStr} | ${failStr} | ${String(res.total).padStart(5)} | ${String(res.duration + 'ms').padStart(8)}`
    );
  }

  console.log(`${'-'.repeat(45)}-+-------+-------+-------+---------`);
  const finalPassStr = `${colors.green}${String(totalPassed).padStart(5)}${colors.reset}`;
  const finalFailStr = totalFailed > 0 ? `${colors.red}${String(totalFailed).padStart(5)}${colors.reset}` : `    0`;
  console.log(
    `${'TOTAL'.padEnd(45)} | ${finalPassStr} | ${finalFailStr} | ${String(totalRun).padStart(5)} | ${String(totalDuration + 'ms').padStart(8)}`
  );
  console.log(`${colors.bold}----------------------------------------------------------------------${colors.reset}\n`);

  if (totalFailed === 0 && totalRun > 0) {
    console.log(`${colors.bgGreen}${colors.white}${colors.bold}  SUCCESS: ALL ${totalRun} TESTS PASSED CLEANLY!  ${colors.reset}\n`);
    process.exit(0);
  } else if (totalRun === 0) {
    console.log(`${colors.yellow}WARNING: No tests matched the specified criteria.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.bgRed}${colors.white}${colors.bold}  FAILURE: ${totalFailed} OF ${totalRun} TESTS FAILED.  ${colors.reset}\n`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test runner execution error:', err);
  process.exit(1);
});
