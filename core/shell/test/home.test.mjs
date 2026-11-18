import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { harness, siteRoot, setupPage, accessibility } from './browser-utils.mjs';
for (const scale of [1,1.3]) test(`empty home follows platform font ${scale}`,()=>harness(async({browser,base,put})=>{
  await put('index.html',await readFile(path.join(siteRoot,'index.html')));
  const {context,page,errors}=await setupPage(browser,{scale});
  try{
    await page.goto(`${base}/index.html`);
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--font-scale')),String(scale));
    assert.deepEqual(await accessibility(page),[]);
    assert.equal(await page.locator('h1').innerText(),'AP2 互動教材');
    assert.equal(await page.locator('p').innerText(),'請由課程平台進入');
    assert.deepEqual(errors,[]);
  }finally{await context.close()}
}));
