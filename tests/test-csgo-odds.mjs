import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const out = mkdtempSync(join(tmpdir(), 'csgo-odds-'));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', 'lib/foods.ts', 'lib/case-mechanics.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck']);

try {
  const { foods } = require(join(out, 'foods.js'));
  const { chooseWeightedFood, CSGO_TIER_WEIGHTS } = require(join(out, 'case-mechanics.js'));

  console.log('CS:GO Tier Target Probabilities:');
  console.log('Tier 0 (Quốc dân):', (CSGO_TIER_WEIGHTS[0] * 100).toFixed(2) + '%');
  console.log('Tier 1 (Hiếm):', (CSGO_TIER_WEIGHTS[1] * 100).toFixed(2) + '%');
  console.log('Tier 2 (Cực phẩm):', (CSGO_TIER_WEIGHTS[2] * 100).toFixed(2) + '%');
  console.log('Tier 3 (Tối mật):', (CSGO_TIER_WEIGHTS[3] * 100).toFixed(2) + '%');
  console.log('Tier 4 (★ Đặc biệt):', (CSGO_TIER_WEIGHTS[4] * 100).toFixed(2) + '%');

  const N = 200000;
  const counts = [0, 0, 0, 0, 0];

  for (let i = 0; i < N; i++) {
    const chosen = chooseWeightedFood(foods);
    counts[chosen.rarity]++;
  }

  console.log(`\nSimulation Results (${N.toLocaleString()} spins):`);
  for (let r = 0; r < 5; r++) {
    const pct = (counts[r] / N) * 100;
    const targetPct = CSGO_TIER_WEIGHTS[r] * 100;
    console.log(`Tier ${r}: ${counts[r]} (${pct.toFixed(2)}%) - Target: ${targetPct.toFixed(2)}%`);
  }

  assert.ok(Math.abs(counts[0] / N - CSGO_TIER_WEIGHTS[0]) < 0.01, 'Tier 0 outside expected range');
  assert.ok(Math.abs(counts[1] / N - CSGO_TIER_WEIGHTS[1]) < 0.01, 'Tier 1 outside expected range');
  assert.ok(Math.abs(counts[2] / N - CSGO_TIER_WEIGHTS[2]) < 0.005, 'Tier 2 outside expected range');
  assert.ok(Math.abs(counts[3] / N - CSGO_TIER_WEIGHTS[3]) < 0.003, 'Tier 3 outside expected range');
  assert.ok(Math.abs(counts[4] / N - CSGO_TIER_WEIGHTS[4]) < 0.002, 'Tier 4 outside expected range');

  console.log('\nALL TESTS PASSED: Distribution matches authentic CS:GO case odds!');
} finally {
  rmSync(out, { recursive: true, force: true });
}

