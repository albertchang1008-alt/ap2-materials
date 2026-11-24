import { test } from 'node:test';
import assert from 'node:assert/strict';
import { harness, thinIndex, setupPage, accessibility } from './browser-utils.mjs';
const ui={opening:'測試開場',start:'開始',levelTab:'第 {n} 關',passTitle:'第 {n} 關完成',summaryLabel:'這關重點：',nextLevel:'下一關',teachGuide:'測試說明',stateProgress:'已看 {seen}／{total}',statesDone:'看完了',startQuiz:'開始作答',legendRead:'圖例',legendHeading:'圖例',legendFrameTitle:'測試',stateSeen:'已看',stateUnseen:'未看',unseen:'還有 {n} 個',tick:'✓'};
const content={title:'外殼合成測試',slug:'shell-demo',activityId:'shell-demo',ui,opening:{prompt:'合成資料，不含教學內容。'},encouragement:{levelPass:['完成這關了。']},tracking:{nodeIds:['shell-demo-node-L1-p1','shell-demo-node-L2-p1']},levels:[
  {id:'L1',kind:'figure',title:'替身一',summary:'第一關完成',figure:{lesson:'synthetic-lesson',stage:'stage-one'}},
  {id:'L2',kind:'figure',title:'替身二',summary:'第二關完成',figure:{lesson:'synthetic-lesson',stage:'stage-two'}},
  {id:'L3',title:'傳統教學',summary:'返回傳統流程',states:[{id:'p1',btnText:'測試按鈕',caption:'合成說明',nodeId:'shell-demo-node-L3-p1',legendMode:'none'}],questions:[]}
]};
async function fixture(fn,{scale=1}={}){
  await harness(async({base,browser,put})=>{
    await put('demo/index.html',thinIndex({stub:true}));
    await put('demo/lesson-data.js',`window.MaterialShellContent=${JSON.stringify(content)}`);
    const {page,context,errors}=await setupPage(browser,{scale});
    await page.goto(`${base}/demo/index.html`);
    await page.evaluate(()=>{
      const api=window.FigureLevel;window.__calls=[];window.__configs=[];
      window.FigureLevel={
        mount(c,o){__calls.push(['mount',o.stage,o.fontScale]);__configs.push(o);return api.mount(c,o)},
        setFontScale(s){__calls.push(['scale',s]);return api.setFontScale(s)},
        unmount(){__calls.push(['unmount']);return api.unmount()}
      };
    });
    const click=async s=>{await page.locator(s).click({force:true});await page.clock.runFor(400)};
    try{await fn({page,click});assert.deepEqual(errors,[])}finally{await context.close()}
  });
}
test('figure pass gate, IDs, lifecycle, stale callbacks, next figure and classic level',()=>fixture(async({page,click})=>{
  await click('#btn-start');
  assert.equal(await page.locator('[data-state-idx],#btn-start-quiz,#btn-next-level').count(),0);
  assert.equal(await page.locator('#btn-figure-pass').count(),1);
  assert.deepEqual(await accessibility(page),[]);
  assert.deepEqual(await page.evaluate(()=>__configs.map(c=>({lesson:c.lesson,stage:c.stage,prefix:c.trackingPrefix,font:c.fontScale}))),[{lesson:'synthetic-lesson',stage:'stage-one',prefix:'shell-demo',font:1}]);
  await page.evaluate(()=>{App.render();__configs[0].events.hint('1');__configs[0].events.nodeTime('p1',2)});
  assert.equal(await page.evaluate(()=>__calls.filter(c=>c[0]==='mount').length),1,'rerender must not remount');
  await page.clock.runFor(2000);
  await click('#btn-figure-pass');
  assert.equal(await page.evaluate(()=>App.state.phase),'LEVEL_PASS');
  assert.equal(await page.evaluate(()=>__calls.filter(c=>c[0]==='unmount').length),1);
  const n=await page.evaluate(()=>__events.length);
  await page.evaluate(()=>{__configs[0].onPass();__configs[0].onPass();__configs[0].events.answer('1',true)});
  assert.equal(await page.evaluate(()=>__events.length),n,'stale events are ignored');
  assert.equal(await page.locator('#btn-next-level').count(),1);
  await click('#btn-next-level');
  assert.equal(await page.evaluate(()=>App.state.levelIdx),1);
  await page.evaluate(()=>__configs[0].onPass());
  assert.equal(await page.evaluate(()=>App.state.phase),'TEACH','old onPass cannot pass next level');
  await click('#btn-figure-pass');await click('#btn-next-level');
  assert.equal(await page.evaluate(()=>App.state.levelIdx),2);
  assert.equal(await page.locator('[data-state-idx]').count(),1);
  assert.equal(await page.evaluate(()=>__calls.filter(c=>c[0]==='unmount').length),2);
  const events=await page.evaluate(()=>__events);
  for(const e of [
    {type:'explore',args:['shell-demo-node-L1-p1']},
    {type:'hint',args:['shell-demo-level-1-1']},
    {type:'nodeTime',args:['shell-demo-node-L1-p1',2]},
    {type:'answer',args:['shell-demo-level-1-1',true]},
    {type:'explore',args:['shell-demo-node-L2-p1']},
    {type:'answer',args:['shell-demo-level-2-1',true]}
  ]) assert.ok(events.some(row=>JSON.stringify(row)===JSON.stringify(e)),JSON.stringify(e));
  assert.equal(events.filter(e=>e.type==='complete').length,0,'plugin must not complete whole lesson');
}));
test('initial platform xlarge, live storage and CSS scale, never shrink',()=>fixture(async({page,click})=>{
  await click('#btn-start');
  assert.equal(await page.locator('#app-view').getAttribute('data-font-scale'),'1.3');
  assert.deepEqual(await accessibility(page),[]);
  await page.evaluate(()=>{localStorage.setItem('course-font-scale','large');dispatchEvent(new StorageEvent('storage',{key:'course-font-scale'}))});
  await page.clock.runFor(10);
  assert.equal(await page.locator('#app-view').getAttribute('data-font-scale'),'1.15');
  await page.evaluate(()=>document.documentElement.style.setProperty('--font-scale','1.3'));
  await page.clock.runFor(10);
  assert.equal(await page.locator('#app-view').getAttribute('data-font-scale'),'1.3');
  await page.evaluate(()=>{localStorage.setItem('course-font-scale','small');dispatchEvent(new StorageEvent('storage',{key:'course-font-scale'}))});
  await page.clock.runFor(10);
  assert.equal(await page.locator('#app-view').getAttribute('data-font-scale'),'1');
  await page.evaluate(()=>document.documentElement.style.setProperty('--font-scale','0.875'));
  await page.clock.runFor(10);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--font-scale')),'1');
},{scale:1.3}));
test('missing core shows a readable error; skip retains shell progression',()=>fixture(async({page,click})=>{
  await page.evaluate(()=>window.FigureLevel=null);
  await click('#btn-start');
  assert.equal(await page.locator('[role=alert]').count(),1);
  assert.deepEqual(await accessibility(page),[]);
  assert.equal(await page.locator('#btn-next-level').count(),0);
  await click('#btn-skip-figure');
  assert.equal(await page.evaluate(()=>App.state.levelIdx),1);
  assert.equal(await page.locator('[role=alert]').count(),1);
  await page.evaluate(()=>App.setPhase('COMPLETE'));
  assert.equal(await page.evaluate(()=>__events.some(event=>event.type==='complete')),false);
}));
test('metadata failure and mount failure can both be retried',()=>fixture(async({page,click})=>{
  await page.evaluate(()=>{
    const level=App.data.levels[0];
    window.__figure=level.figure;
    level.figure={lesson:'test'};
  });
  await click('#btn-start');
  assert.equal(await page.locator('[role=alert]').count(),1);
  await page.evaluate(()=>{
    App.data.levels[0].figure=__figure;
    window.__mount=FigureLevel.mount;
    FigureLevel.mount=()=>{throw Error('synthetic load error')};
  });
  await click('#btn-retry-figure');
  assert.equal(await page.locator('[role=alert]').count(),1);
  assert.equal(await page.evaluate(()=>__calls.filter(c=>c[0]==='unmount').length),1);
  await page.evaluate(()=>FigureLevel.mount=__mount);
  await click('#btn-retry-figure');
  await click('#btn-figure-pass');
  assert.equal(await page.evaluate(()=>App.state.phase),'LEVEL_PASS');
}));
test('figure IDs use level.id across insertions; findError forwarded only if supported',()=>fixture(async({page,click})=>{
  await page.evaluate(()=>App.data.levels.unshift({id:'L9',states:[]}));
  await page.evaluate(()=>App.startLevel(1));
  await page.evaluate(()=>{
    __configs[0].events.findError('1','choice',{mode:'single',position:1});
    CourseLearning.findError=(...args)=>__events.push({type:'findError',args});
    __configs[0].events.findError('1','choice',{mode:'single',position:1});
  });
  await click('#btn-figure-pass');
  assert.deepEqual(await page.evaluate(()=>__events.filter(e=>['findError','answer'].includes(e.type))),[
    {type:'findError',args:['shell-demo-level-1-1','choice',{mode:'single',position:1}]},
    {type:'answer',args:['shell-demo-level-1-1',true]}
  ]);
}));
test('unmount on leaving, old core callbacks cannot pass revisited level',()=>fixture(async({page,click})=>{
  await click('#btn-start');
  await page.evaluate(()=>App.setPhase('OPENING'));
  assert.equal(await page.evaluate(()=>__calls.filter(c=>c[0]==='unmount').length),1);
  await click('#btn-start');
  await page.evaluate(()=>__configs[0].onPass());
  assert.equal(await page.evaluate(()=>App.state.phase),'TEACH');
  await click('#btn-figure-pass');
  assert.equal(await page.evaluate(()=>App.state.phase),'LEVEL_PASS');
}));

test('cross-origin platform preference applies before mount and updates without remount',()=>harness(async({base,browser,put})=>{
  await put('demo/index.html',thinIndex({stub:true}));
  await put('demo/lesson-data.js',`window.MaterialShellContent=${JSON.stringify(content)}`);
  await put('platform.html',`<iframe src="${base}/demo/index.html"></iframe>`);
  const {page,context}=await setupPage(browser);
  try {
    await page.goto(`${base.replace('127.0.0.1','localhost')}/platform.html`);
    const frame=page.frames()[1];
    await frame.waitForSelector('#btn-start');
    const post=scale=>page.evaluate(({scale,base})=>document.querySelector('iframe').contentWindow
      .postMessage({type:'course-font-scale',scale},base),{scale,base});
    await post('xlarge');
    await frame.locator('html[style*="1.3"]').waitFor({state:'attached'});
    await frame.click('#btn-start',{force:true});
    assert.equal(await frame.locator('#app-view').getAttribute('data-font-scale'),'1.3');
    await post('large');
    await frame.locator('#app-view[data-font-scale="1.15"]').waitFor({state:'attached'});
    await post(1000);
    await frame.evaluate(()=>window.postMessage({type:'course-font-scale',scale:'small'},location.origin));
    await frame.evaluate(()=>new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=resolve;channel.port2.postMessage('flush')}));
    assert.equal(await frame.locator('#app-view').getAttribute('data-font-scale'),'1.15');
  } finally { await context.close(); }
}));

test('published display-prefs supplies font size to an opaque-origin lesson', () =>
  harness(async ({ base, browser, put }) => {
    await put('demo/index.html', thinIndex({ stub: true }));
    await put('demo/lesson-data.js', `window.MaterialShellContent = ${JSON.stringify(content)};`);
    await put('platform.html', '<iframe sandbox="allow-scripts" src="/demo/index.html"></iframe>');
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    try {
      await page.goto(`${base}/platform.html`);
      const frame = await page.locator('iframe').elementHandle().then(el => el.contentFrame());
      await frame.locator('#btn-start').waitFor();
      assert.equal(await frame.evaluate(() => self.origin), 'null');
      const post = (version, scale) => page.evaluate(({ version, scale }) => {
        document.querySelector('iframe').contentWindow.postMessage({
          type: 'display-prefs', protocolVersion: version, fontScale: scale,
        }, '*');
      }, { version, scale });
      await post(1, 1.3);
      await frame.locator('html[style*="1.3"]').waitFor({ state: 'attached' });
      await frame.locator('#btn-start').click();
      assert.equal(await frame.locator('#app-view').getAttribute('data-font-scale'), '1.3');
      await post(1, 1.15);
      await frame.locator('#app-view[data-font-scale="1.15"]').waitFor({ state: 'attached' });
      await post(2, 1.3);
      await frame.evaluate(() => new Promise(resolve => {
        const channel = new MessageChannel();
        channel.port1.onmessage = resolve;
        channel.port2.postMessage('flush');
      }));
      assert.equal(await frame.locator('#app-view').getAttribute('data-font-scale'), '1.15');
    } finally {
      await page.close();
    }
  }));
