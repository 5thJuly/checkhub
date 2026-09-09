import assert from 'node:assert/strict';
import fs from 'node:fs';

const pageSource = fs.readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const i18nSource = fs.readFileSync(new URL('../lib/i18n.ts', import.meta.url), 'utf8');

assert.ok(!pageSource.includes('const [budget,'), 'Budget state should be removed from the main page');
assert.ok(!i18nSource.includes("spend: '"), 'Budget-related UI strings should be removed from translations');

console.log('PASS: no budget flow remains');
