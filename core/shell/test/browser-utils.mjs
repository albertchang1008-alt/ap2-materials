import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
export const shellRoot = fileURLToPath(new URL('../', import.meta.url));
export const siteRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const { chromium } = createRequire(import.meta.url)('playwright');
export const digest = async file => {
  const {createHash} = await import('node:crypto');
  return createHash('sha256').update(await readFile(file)).digest('hex');
};
export function extract(html) {
  const match = html.match(/const DATA = (.*);/);
  if (!match) throw Error('Expected reviewed embedded DATA');
  return JSON.parse(match[1]);
}
export function thinIndex({stub = false} = {}) {
  return `<!doctype html><html lang="zh-TW"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes"><title>AP2</title><link rel="stylesheet" href="../core/shell/shell.css"><script src="../course-learning.js"></script><script defer src="lesson-data.js"></script>${stub ? '<script defer src="../core/shell/test/figure-stub.js"></script>' : ''}<script defer src="../core/shell/shell.js"></script></head><body></body></html>`;
}
export async function harness(fn) {
  const root = await mkdtemp(path.join(tmpdir(),'ap2-shell-'));
  const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
  const server = createServer(async(req,res)=>{
    try {
      const f = path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if (!f.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const bytes = await readFile(f);
      res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(bytes);
    } catch { res.writeHead(404).end(); }
  });
  let browser;
  try {
    await mkdir(path.join(root,'core'),{recursive:true});
    await cp(shellRoot,path.join(root,'core/shell'),{recursive:true});
    await cp(path.join(siteRoot,'course-learning.js'),path.join(root,'course-learning.js'));
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
    browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined});
    const base = `http://127.0.0.1:${server.address().port}`;
    const put = async(f,text)=>{await mkdir(path.dirname(path.join(root,f)),{recursive:true});await writeFile(path.join(root,f),text)};
    await fn({root,base,browser,put});
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
    await rm(root,{recursive:true,force:true});
  }
}
export async function setupPage(browser, {scale=1, reduced=false}={}) {
  const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:reduced?'reduce':'no-preference'});
  await context.route('**/course-learning.js',route=>route.fulfill({contentType:'text/javascript',body:`window.__events=[];window.CourseLearning=Object.fromEntries(['explore','answer','hint','nodeTime','complete'].map(k=>[k,(...args)=>window.__events.push({type:k,args})]));`}));
  await context.addInitScript(({scale})=>{
    localStorage.clear();
    localStorage.setItem('course-font-scale',scale===1.3?'xlarge':'default');
    let seed=17;
    const modulus=2**31-1;
    Math.random=()=>((seed=(seed*16807)%modulus)/modulus);
  },{scale});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text())});
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  return {context,page,errors};
}
export async function accessibility(page) {
  return page.evaluate(()=>{
    const findings=[];
    if(document.documentElement.scrollWidth>innerWidth) findings.push({kind:'overflow',width:document.documentElement.scrollWidth});
    const rgba = s => {const n=s.match(/[\d.]+/g)?.map(Number);return n?.length>=3?[n[0],n[1],n[2],n[3]??1]:[255,255,255,1]};
    const blend=(a,b)=>{const alpha=a[3]+b[3]*(1-a[3]);return [0,1,2].map(i=>alpha?(a[i]*a[3]+b[i]*b[3]*(1-a[3]))/alpha:0).concat(alpha)};
    const pixel=(el,foreground)=>{let c=foreground;for(let p=el;p;p=p.parentElement){const style=getComputedStyle(p);c=blend(c,rgba(style.backgroundColor));c[3]*=Number(style.opacity)}return blend(c,[255,255,255,1])};
    const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const scale=Math.max(1,parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale'))||1);
    for(const e of document.body.querySelectorAll('*')){
      if(!e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||!e.getBoundingClientRect().height)continue;
      const label=[...e.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim();
      if(!label||e.closest('svg,script,style'))continue;
      const s=getComputedStyle(e), size=parseFloat(s.fontSize), line=parseFloat(s.lineHeight), button=!!e.closest('button'), stem=e.classList.contains('title-stem')||e.matches('.ap2-figure .prompt');
      const heading=/^H[1-6]$/.test(e.tagName);
      const minimum=stem?19:heading?21:18;
      const id=e.id||e.className||e.tagName;
      if(size+.1<minimum*scale)findings.push({kind:'font',id,size,minimum:minimum*scale});
      if(!heading&&!button&&line+.1<size*1.6)findings.push({kind:'line-height',id,size,line});
      if(button){const b=e.closest('button');if(b.getBoundingClientRect().height<44)findings.push({kind:'target-height',id,height:b.getBoundingClientRect().height});if(b.scrollWidth>b.clientWidth+1)findings.push({kind:'clipped-button',id});}
      const range=document.createRange();range.selectNodeContents(e);
      for(const r of range.getClientRects())if(r.width&& (r.left < -1 || r.right > innerWidth+1))findings.push({kind:'horizontal-text',id});
      const fg=pixel(e,rgba(s.color)),bg=pixel(e,[0,0,0,0]),a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      if(ratio+0.01<4.5)findings.push({kind:'contrast',id,ratio:Number(ratio.toFixed(2)),color:s.color});
    }
    const buttons=[...document.querySelectorAll('button')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}));
    for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++){
      // A modal intentionally covers the inert page beneath it; compare peers only.
      if(buttons[i].closest('dialog')!==buttons[j].closest('dialog'))continue;
      const a=buttons[i].getBoundingClientRect(),b=buttons[j].getBoundingClientRect();
      if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)findings.push({kind:'overlap',id:buttons[i].id,other:buttons[j].id});
    }
    return findings;
  });
}
