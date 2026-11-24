import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, mkdir, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { check } from '../check.mjs';
const source = fileURLToPath(new URL('../../', import.meta.url));
async function fixture(fn) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ap2-check-'));
  try {
    for (const f of ['course-learning.js','sdk-version.json']) await cp(path.join(source,f),path.join(root,f));
    await writeFile(path.join(root,'materials.json'), '[]');
    const put = async (f,s) => { await mkdir(path.dirname(path.join(root,f)),{recursive:true}); await writeFile(path.join(root,f),s); };
    await fn(root, put);
  } finally { await rm(root,{recursive:true,force:true}); }
}
test('empty site passes',()=>fixture(async r=>assert.deepEqual((await check(r)).errors,[])));
async function material(put) {
  await put('demo/index.html','<script src="../course-learning.js"></script>');
  await put('materials.json',JSON.stringify([{slug:'demo'}]));
}
test('synthetic material passes',()=>fixture(async(r,p)=>{await material(p);assert.deepEqual((await check(r)).errors,[])}));
test('shell interface README allowed',()=>fixture(async(r,p)=>{await p('core/shell/README.md','Interface');assert.deepEqual((await check(r)).errors,[])}));
test('other core docs forbidden',()=>fixture(async(r,p)=>{await p('core/shell/extra.md','');assert.ok((await check(r)).errors.some(x=>x.startsWith('forbidden')))}));
for (const [name, mutate, reason] of [
  ['missing index',async p=>{await p('demo/a.js','');await p('materials.json','[{"slug":"demo"}]')},'index-missing'],
  ['missing SDK reference',p=>p('demo/index.html','<p>test</p>'),'sdk-reference'],
  ['SDK mismatch',p=>p('course-learning.js','changed'),'sdk-version'],
  ['unlisted slug',p=>p('demo/index.html','<script src="../course-learning.js"></script>'),'materials-index'],
  ['missing slug',p=>p('materials.json','[{"slug":"missing"}]'),'materials-index'],
  ['duplicate slug',p=>p('materials.json','[{"slug":"demo"},{"slug":"demo"}]'),'materials-index'],
  ['email',p=>p('a.js',['sample','example.org'].join('@')),'privacy'],
  ['long number',p=>p('a.js',['1234','5678'].join('')),'privacy'],
]) test(name,()=>fixture(async(r,p)=>{await mutate(p);assert.ok((await check(r)).errors.some(x=>x.startsWith(reason)))}));
for (const f of ['extra.md','content.json','教案.js','來源對照.txt','設計說明.txt','自查.txt','正解.js','a.psd','a.ai','a.pdf'])
  test(`forbidden ${f}`,()=>fixture(async(r,p)=>{await p(f,'');assert.ok((await check(r)).errors.some(x=>x.startsWith('forbidden')))}));
test('oversize file',()=>fixture(async(r,p)=>{await p('a.js','x'.repeat(6*1024*1024));assert.ok((await check(r)).errors.some(x=>x.startsWith('file-size')))}));
test('oversize site (same branch, reduced test threshold)',()=>fixture(async r=>assert.ok((await check(r,{totalBytes:1})).errors.includes('site-size'))));
function png(w) { const b=Buffer.alloc(24);Buffer.from('89504e470d0a1a0a','hex').copy(b);b.writeUInt32BE(w,16);return b; }
for (const w of [2400,2401]) test(`PNG width ${w}`,()=>fixture(async(r,p)=>{await material(p);await p('demo/x.png',png(w));await p('demo/figures-attribution.json',JSON.stringify({'x.png':{source:'Synthetic',license:'Test',modified:false}}));assert.equal((await check(r)).errors.some(x=>x.startsWith('image-width')),w>2400)}));
test('JPEG oversize',()=>fixture(async(r,p)=>{await p('x.jpg',Buffer.from([255,216,255,192,0,8,8,0,1,9,97,0]));assert.ok((await check(r)).errors.some(x=>x.startsWith('image-width')))}));
test('malformed raster fails closed',()=>fixture(async(r,p)=>{await p('x.jpg','invalid');assert.ok((await check(r)).errors.some(x=>x.startsWith('image-format')))}));
test('image missing attribution',()=>fixture(async(r,p)=>{await material(p);await p('demo/x.svg','<svg/>');assert.ok((await check(r)).errors.some(x=>x.startsWith('attribution')))}));
for (const field of ['source','license','modified']) test(`attribution missing ${field}`,()=>fixture(async(r,p)=>{await material(p);await p('demo/x.svg','<svg/>');const row={source:'Synthetic',license:'Test',modified:false};delete row[field];await p('demo/figures-attribution.json',JSON.stringify({'x.svg':row}));assert.ok((await check(r)).errors.some(x=>x.startsWith('attribution')))}));
test('symlinks rejected',()=>fixture(async r=>{await symlink('materials.json',path.join(r,'alias'));await assert.rejects(()=>check(r),/symlink/)}));

test('binary PNG payload is excluded but image names are scanned', () => fixture(async (root, put) => {
  const digits = ['1234', '5678'].join('');
  await material(put);
  const bytes = Buffer.concat([png(64), Buffer.from(digits)]);
  const credit = { source: 'Synthetic', license: 'Test', modified: false };
  await put('demo/image.png', bytes);
  await put('demo/figures-attribution.json', JSON.stringify({ 'image.png': credit }));
  assert.deepEqual((await check(root)).errors, []);
  await put(`demo/${digits}.png`, bytes);
  assert.ok((await check(root)).errors.includes(`privacy: demo/${digits}.png`));
}));
test('SVG markup and raster-extension text still trigger privacy', () => fixture(async (root, put) => {
  const digits = ['1234', '5678'].join('');
  await material(put);
  await put('demo/image.svg', `<svg><text>${digits}</text></svg>`);
  await put('demo/fake.webp', digits);
  const errors = (await check(root)).errors;
  assert.ok(errors.includes('privacy: demo/image.svg'));
  assert.ok(errors.includes('privacy: demo/fake.webp'));
}));
for (const file of ['demo/_keys/lesson.js', 'demo/corrections-teacher.json', 'demo/teacher-notes.js',
  'demo/calib/index.html', 'demo/private-tools/review.mjs', 'demo/bank.xlsx', 'demo/D2-L4-corrections.json']) {
  test(`teacher-only file forbidden: ${file}`, () => fixture(async (root, put) => {
    await material(put);
    await put(file, '');
    assert.ok((await check(root)).errors.includes(`forbidden: ${file}`));
  }));
}
