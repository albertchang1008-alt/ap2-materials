import assert from 'node:assert/strict';
import { copyFile, cp, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { check } from './check.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const [destination, source = root] = process.argv.slice(2);
assert.ok(destination, 'Usage: node scripts/stage-pages.mjs <new output directory> [source]');
const input = path.resolve(source);
const output = path.resolve(destination);
assert.ok(output !== input && !output.startsWith(input + path.sep), 'Output must be outside the source tree');
const sourceResult = await check(input);
assert.deepEqual(sourceResult.errors, []);
const materials = JSON.parse(await readFile(path.join(input, 'materials.json'), 'utf8'));
await mkdir(output);
for (const file of ['index.html', 'materials.json', 'course-learning.js', 'sdk-version.json']) {
  await copyFile(path.join(input, file), path.join(output, file));
}
const sharedRuntime = [
  'shell/shell.js', 'shell/shell.css',
  'figure/engine.js', 'figure/events.js', 'figure/figure.js', 'figure/level.js', 'figure/style.css',
];
for (const file of sharedRuntime) {
  const target = path.join(output, 'core', file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(input, 'core', file), target);
}
for (const { slug } of materials) {
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  await cp(path.join(input, slug), path.join(output, slug), { recursive: true });
}
const result = await check(output);
assert.deepEqual(result.errors, []);
console.log(`PASS Pages runtime: ${result.files} files, ${result.bytes} bytes`);
