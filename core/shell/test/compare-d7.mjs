// Local-only differential replay. Inputs and answer keys never enter this repository.
import assert from 'node:assert/strict';
import { readFile, cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { harness, extract, thinIndex, setupPage, accessibility, digest, shellRoot } from './browser-utils.mjs';
const args=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,all)=>i%2?a:[...a,[v.replace(/^--/,''),all[i+1]]],[]));
if(!args.source||!args.out)throw Error('Usage: node core/shell/test/compare-d7.mjs --source <D7 directory> --out <external evidence directory>');
const source=path.resolve(args.source),out=path.resolve(args.out);
const html=await readFile(path.join(source,'index.html'),'utf8'),data=extract(html);
const sharedJS=await readFile(path.join(shellRoot,'shell.js'),'utf8');
const sharedCSS=await readFile(path.join(shellRoot,'shell.css'),'utf8');
const baselineJS=html.slice(html.indexOf('    // Global SDK Fallback'),html.indexOf("    window.addEventListener('DOMContentLoaded'")).trim();
const normalized=s=>s.split('\n').map(line=>line.trimEnd()).join('\n').trim();
assert.ok(normalized(sharedJS).includes(normalized(baselineJS)),'reviewed state-machine body must remain identical except trailing whitespace');
assert.equal(normalized(sharedCSS.split('/* Readability-only')[0]),normalized(html.match(/<style>([\s\S]*?)<\/style>/)[1]),'reviewed CSS remains intact before readability overrides except trailing whitespace');
await mkdir(out,{recursive:true});
async function replay(browser,url,scale,name){
  const {context,page,errors}=await setupPage(browser,{scale,reduced:scale>1});
  const trace=[],reading=[],questions=[],covered=new Set();
  let wrongLevel=false,hint=false,wrongFoundation=false,wrongCase=false,timeout=false,screenshot=false;
  await page.goto(url);
  // The old engine has no platform font listener. Apply the same final scale for comparison.
  await page.evaluate(scale=>document.documentElement.style.setProperty('--font-scale',String(scale)),scale);
  await page.clock.runFor(400);
  const record=async action=>{
    const snapshot=await page.evaluate(()=>({text:document.body.innerText.replace(/\s+/g,' ').trim(),phase:App.state.phase,level:App.state.levelIdx,question:App.state.questionIdx,assStage:App.state.assStage,assIdx:App.state.assIdx,ending:App.state.endingStepIdx,tf:App.state.tfIdx}));
    trace.push({action,...snapshot});
    const f=await accessibility(page);if(f.length)reading.push({step:trace.length,phase:snapshot.phase,findings:f});
    covered.add(snapshot.phase);
  };
  const click=async selector=>{
    assert.equal(await page.locator(selector).count(),1,`missing ${selector}`);
    await page.locator(selector).click({force:true});
    await page.clock.runFor(400);
    await record(`click ${selector}`);
  };
  const wait=async ms=>{await page.clock.runFor(ms);await record(`wait ${ms}`)};
  await record('initial');
  for(let step=0;step<500;step++){
    const s=await page.evaluate(()=>{
      const a=App.state,d=App.data;
      const q=a.phase==='QUIZ'?d.levels[a.levelIdx].questions[a.questionIdx]:a.phase==='ENDING'?d.ending.steps[a.endingStepIdx]:a.phase==='TRUEFALSE'?d.truefalse[a.tfIdx]:a.phase==='ASSESSMENT'?d.assessment[a.assStage][a.assIdx]:null;
      return {phase:a.phase,level:a.levelIdx,state:a.stateIdx,question:a.questionIdx,assStage:a.assStage,assIdx:a.assIdx,q,seen:[...a.seenStates],states:d.levels[a.levelIdx]?.states?.length||0,locked:a.quizAnswerLocked,feedback:a.feedback?.type,msg:document.getElementById('msg-dialog').open,legend:document.getElementById('legend-dialog').open};
    });
    if(s.msg){await click('#btn-msg-confirm');continue}
    if(s.phase==='COMPLETE')break;
    if(s.phase==='OPENING'){await click('#btn-start');continue}
    if(s.phase==='TEACH'){
      if(s.legend){await wait(7000);await click('#btn-legend-confirm');continue}
      const req=page.locator('#btn-open-legend.gate-target-ring');
      if(await req.count()){await click('#btn-open-legend');continue}
      if(!s.seen.includes(s.state)){await wait(7000);continue}
      const unseen=Array.from({length:s.states},(_,i)=>i).find(i=>!s.seen.includes(i));
      if(unseen!==undefined){await click(`[data-state-idx="${unseen}"]`);continue}
      if(name==='new'&&!screenshot){await page.screenshot({path:path.join(out,`d7-390-${scale===1?'default':'xlarge'}.png`),fullPage:true});screenshot=true}
      await click('#btn-start-quiz');continue;
    }
    if(s.phase==='LEVEL_PASS'){await click('#btn-next-level');continue}
    if(s.phase==='QUIZ'){
      if(s.locked&&s.feedback==='wrong'){
        await wait(7000);
        if(!hint){await click('#btn-hint');hint=true}
        await click('#btn-retry');continue;
      }
      if(s.locked){await click('#btn-next-q');continue}
      const q=s.q;
      assert.equal(q.template,'choice','D7 fixture changed: expected choice questions');
      const id=wrongLevel?q.answer:q.options.find(o=>o.id!==q.answer).id;
      if(!wrongLevel)wrongLevel=true;
      questions.push(q.id);
      await click(`[data-opt-id="${id}"]`);await click('#btn-submit-choice');continue;
    }
    if(s.phase==='ENDING'){
      if(!s.q){await click('#btn-to-tf');continue}
      if(s.locked){await click('#btn-next-ending');continue}
      questions.push(s.q.id);await click(`[data-end-opt="${s.q.answer}"]`);await click('#btn-submit-ending');continue;
    }
    if(s.phase==='TRUEFALSE'){
      if(!s.q){await click('#btn-start-ass');continue}
      if(s.locked){await click('#btn-next-tf');continue}
      questions.push(s.q.id);await click(`[data-tf-val="${s.q.answer}"]`);await click('#btn-submit-tf');continue;
    }
    if(s.phase==='ASSESSMENT'){
      if(s.assStage==='foundation'&&s.assIdx===1&&!timeout){await wait((s.q.timeLimit+1)*1000);timeout=true;continue}
      let id=s.q.answer;
      if(s.assStage==='foundation'&&s.assIdx===0&&!wrongFoundation){id=s.q.options.find(o=>o.id!==id).id;wrongFoundation=true}
      if(s.assStage==='case'&&s.assIdx===1&&!wrongCase){id=s.q.options.find(o=>o.id!==id).id;wrongCase=true}
      questions.push(s.q.id);await click(`[data-ass-opt="${id}"]`);await click('#btn-submit-ass');continue;
    }
    throw Error(`unhandled phase ${s.phase}`);
  }
  const events=await page.evaluate(()=>window.__events);
  assert.equal(events.filter(e=>e.type==='complete').length,1,'complete exactly once');
  assert.ok(wrongLevel&&hint&&wrongFoundation&&wrongCase&&timeout,'retry paths covered');
  assert.equal(errors.length,0,JSON.stringify(errors));
  const result={trace,questions,events,reading,covered:[...covered],errors};
  await context.close();return result;
}
const results=[];
await harness(async({root,base,browser,put})=>{
  await cp(source,path.join(root,'original'),{recursive:true,filter:f=>!path.basename(f).startsWith('.')});
  await mkdir(path.join(root,'new'),{recursive:true});
  await cp(path.join(source,'figures'),path.join(root,'new/figures'),{recursive:true});
  await put('new/lesson-data.js',`window.MaterialShellContent=${JSON.stringify(data)};document.title=window.MaterialShellContent.title;`);
  await put('new/index.html',thinIndex());
  for(const scale of [1,1.3]){
    const old=await replay(browser,`${base}/original/index.html`,scale,'original');
    const fresh=await replay(browser,`${base}/new/index.html`,scale,'new');
    const differences=[];
    for(const key of ['trace','questions','events']){
      try{assert.deepEqual(fresh[key],old[key])}catch{differences.push(key)}
    }
    await writeFile(path.join(out,`replay-${scale}.json`),JSON.stringify({old,fresh,differences},null,2));
    const row={scale,steps:fresh.trace.length,events:Object.fromEntries(['explore','answer','hint','nodeTime','complete'].map(k=>[k,fresh.events.filter(e=>e.type===k).length])),differences,readingFindings:fresh.reading.reduce((a,r)=>a+r.findings.length,0),baselineReadingFindings:old.reading.reduce((a,r)=>a+r.findings.length,0)};
    results.push(row);console.log(JSON.stringify(row));
  }
});
await writeFile(path.join(out,'comparison-summary.json'),JSON.stringify({sourceSha256:await digest(path.join(source,'index.html')),stateMachineBody:'identical after trailing-whitespace normalization',cssBaseline:'identical after trailing-whitespace normalization; readability overrides appended',results},null,2));
assert.ok(results.every(r=>r.differences.length===0),'D7 visible text/question order/event sequences differ; inspect external replay files');
assert.ok(results.every(r=>r.readingFindings===0),'New shell readability FAIL; inspect external replay files');
console.log('PASS D7 differential replay and readability');
