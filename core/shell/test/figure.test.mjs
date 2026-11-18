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
test('missing figure core fails closed',()=>fixture(async({page,click})=>{
  await page.evaluate(()=>window.FigureLevel=null);
  // Suppress only this intentionally triggered browser error and inspect it explicitly.
  const result=await page.evaluate(()=>{try{App.startLevel(0);return ''}catch(e){return e.message}});
  assert.match(result,/FigureLevel/);
  assert.equal(await page.locator('#btn-next-level').count(),0);
}));
test('missing figure metadata and core mount exceptions fail closed',()=>fixture(async({page,click})=>{
  const result=await page.evaluate(()=>{
    const level=App.data.levels[0],keep=level.figure;
    level.figure={lesson:'test'};
    let metadata='';try{App.startLevel(0)}catch(e){metadata=e.message}
    level.figure=keep;
    window.FigureLevel.mount=()=>{throw Error('synthetic load error')};
    let loading='';try{App.startLevel(0)}catch(e){loading=e.message}
    return {metadata,loading,unmounts:__calls.filter(c=>c[0]==='unmount').length};
  });
  assert.match(result.metadata,/figure.lesson and figure.stage/);
  assert.equal(result.loading,'synthetic load error');
  assert.equal(result.unmounts,1);
  assert.equal(await page.locator('#btn-next-level').count(),0);
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
