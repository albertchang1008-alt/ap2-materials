import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const IMAGES = /\.(svg|webp|png|jpe?g|gif|avif)$/i;
const PRIVATE_PATH = /(?:^|\/)(?:\.local-review|_keys|calib|calibration|private-preview|private-tools|校正圖|私有工具)(?:[./]|$)|(?:^|\/)(?:[^/]+[-_])?(?:answer[-_]?keys?|teacher[-_]?notes?|corrections|teacher_review_by_figure)(?:[-_][^/.]+)?\.[^/]+$|\.(xlsx?|xlsm|ods)$/i;
const EMAIL = /[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,253}\.[A-Z]{2,}/i;
const LONG_NUMBER = /(?<![A-Za-z0-9])\d{8,}(?![A-Za-z0-9])/;
const DOCS = new Set(['README.md', 'ATTRIBUTION.md', 'core/README.md', 'core/shell/README.md']);
const hash = b => createHash('sha256').update(b).digest('hex');
async function walk(root, base = '') {
  const out = [];
  for (const e of await readdir(path.join(root, base), { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(e.name)) continue;
    const name = path.posix.join(base, e.name);
    if (e.isSymbolicLink()) throw new Error(`symlink forbidden: ${name}`);
    if (e.isDirectory()) out.push(...await walk(root, name));
    else out.push(name);
  }
  return out;
}
function width(bytes, ext) {
  if (ext === '.png') {
    if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error('invalid PNG');
    return bytes.readUInt32BE(16);
  }
  if (bytes[0] !== 255 || bytes[1] !== 216) throw Error('invalid JPEG');
  let i = 2;
  while (i + 4 < bytes.length) {
    if (bytes[i++] !== 255) continue;
    const tag = bytes[i++];
    if (tag === 255) { i--; continue; }
    if ([216, 217, 1].includes(tag) || tag >= 208 && tag <= 215) continue;
    const size = bytes.readUInt16BE(i);
    if (size < 2 || i + size > bytes.length) break;
    if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(tag)) return bytes.readUInt16BE(i + 5);
    i += size;
  }
  throw Error('JPEG dimensions missing');
}
function isBinaryImage(bytes, ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return bytes[0] === 0xff && bytes[1] === 0xd8;
    case '.png':
      return bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
    case '.gif':
      return ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6));
    case '.webp':
      return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    case '.avif':
      return bytes.toString('ascii', 4, 8) === 'ftyp' && ['avif', 'avis'].includes(bytes.toString('ascii', 8, 12));
    default:
      return false;
  }
}
export async function check(root = ROOT, limits = {}) {
  const errors = [], fail = s => errors.push(s);
  const files = await walk(root);
  let total = 0;
  for (const f of files) {
    const b = await readFile(path.join(root, f));
    total += (await stat(path.join(root, f))).size;
    if (b.length > (limits.fileBytes ?? 5 * 1000 * 1000)) fail(`file-size: ${f}`);
    const ext = path.extname(f).toLowerCase();
    if (PRIVATE_PATH.test(f) || (ext === '.md' && !DOCS.has(f)) || /(^|\/)content\.json$/i.test(f) || /教案|來源對照|設計說明|自查|正解/.test(f) || /\.(psd|ai|pdf)$/i.test(f)) fail(`forbidden: ${f}`);
    if (/\.(png|jpe?g)$/i.test(f)) {
      try { if (width(b, ext) > 2400) fail(`image-width: ${f}`); }
      catch (e) { fail(`image-format: ${f}: ${e.message}`); }
    }
    // Scan names for every file. Binary pixels and metadata are not text payloads.
    const text = isBinaryImage(b, ext) ? f : f + '\n' + b.toString('utf8');
    if (EMAIL.test(text) || LONG_NUMBER.test(text)) fail(`privacy: ${f}`);
  }
  if (total > (limits.totalBytes ?? 800 * 1000 * 1000)) fail('site-size');
  try {
    const sdk = await readFile(path.join(root, 'course-learning.js'));
    const v = JSON.parse(await readFile(path.join(root, 'sdk-version.json')));
    if (v.sha256 !== hash(sdk) || v.version !== `sha256:${hash(sdk)}`) fail('sdk-version');
  } catch { fail('sdk-version: missing or malformed'); }
  const dirs = (await readdir(root, {withFileTypes:true})).filter(e => e.isDirectory() && !['.git','node_modules','core','scripts','.github'].includes(e.name)).map(e => e.name);
  for (const dir of dirs) {
    try {
      const html = await readFile(path.join(root, dir, 'index.html'), 'utf8');
      if (!/<script\b[^>]*\bsrc\s*=\s*["']\.\.\/course-learning\.js["'][^>]*>/i.test(html)) fail(`sdk-reference: ${dir}`);
    } catch { fail(`index-missing: ${dir}`); }
    const images = files.filter(f => f.startsWith(`${dir}/`) && IMAGES.test(f));
    if (images.length) {
      try {
        const a = JSON.parse(await readFile(path.join(root, dir, 'figures-attribution.json')));
        for (const f of images) {
          const row = a[f.slice(dir.length + 1)];
          if (!row || typeof row.source !== 'string' || !row.source.trim() || typeof row.license !== 'string' || !row.license.trim() || !('modified' in row) || !(row.modified === false || typeof row.modified === 'string' && row.modified.trim())) fail(`attribution: ${f}`);
        }
      } catch { fail(`attribution: ${dir}`); }
    }
  }
  try {
    const rows = JSON.parse(await readFile(path.join(root, 'materials.json')));
    if (!Array.isArray(rows)) throw Error('not array');
    const slugs = rows.map(x => x.slug);
    if (new Set(slugs).size !== slugs.length || slugs.some(s => !dirs.includes(s)) || dirs.some(s => !slugs.includes(s))) fail('materials-index');
  } catch { fail('materials-index: missing or malformed'); }
  return { errors, files: files.length, bytes: total };
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const r = await check(process.argv[2] ? path.resolve(process.argv[2]) : ROOT);
    r.errors.forEach(e => console.error(`FAIL ${e}`));
    console.log(`${r.errors.length ? 'FAIL' : 'PASS'} site: ${r.files} files, ${r.bytes} bytes, ${r.errors.length} errors`);
    process.exitCode = r.errors.length ? 1 : 0;
  } catch (e) { console.error(`FAIL ${e.message}`); process.exitCode = 1; }
}
