import {test,expect,type Page}from '@playwright/test';

const langs=['cs','en','de','it','pl','nl','fr','ko','bn','hi','es','uk'];
async function fakeSpeech(page:Page,available=langs) {
 await page.addInitScript(codes=>{
  const state={utterance:null as any,history:[] as any[],cancelled:0};
  (window as any).__dagmarSpeech=state;
  class Utterance{constructor(public text:string){}lang='';rate=1;voice:any=null;onstart:any;onend:any;onerror:any;onboundary:any;onpause:any;onresume:any;}
  class Synth extends EventTarget {
   getVoices(){return codes.map(code=>({lang:code+'-'+code.toUpperCase(),name:'Local '+code,localService:true}));}
   speak(value:any){state.utterance=value;state.history.push(value);}
   cancel(){state.cancelled++;const old=state.utterance;state.utterance=null;old?.onerror?.({error:'canceled'});}
  }
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:Utterance});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:new Synth()});
 },available);
}

test.describe('articulated Dagmar',()=>{
 test.use({reducedMotion:'no-preference'});
 test('local rig renders, body walks both directions, pointing changes the pose and motion can stop',async({page,baseURL})=>{
  // Software WebGL in CI can take seconds per rendered frame.
  test.setTimeout(90000);
  const remote:string[]=[],errors:string[]=[];const origin=new URL(baseURL!).origin;
  page.on('request',r=>{if(!/^(data|blob):/.test(r.url())&&new URL(r.url()).origin!==origin)remote.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('/cs/');
  expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
  await page.locator('.dagmar').scrollIntoViewIfNeeded();
  const scene=page.locator('.dagmar-3d');await expect(scene).toHaveAttribute('data-ready','true',{timeout:20000});await page.locator('.dagmar-toggle').click();await expect(page.locator('.dagmar-canvas')).toBeVisible();
  const firstFrame=Number(await scene.getAttribute('data-frames'));
  await page.getByRole('button',{name:'Projít se',exact:true}).click();await expect(scene).toHaveAttribute('data-phase','walk');
  await expect.poll(async()=>Number(await scene.getAttribute('data-actor-x')),{timeout:30000}).toBeGreaterThan(.2);
  await expect.poll(async()=>Number(await scene.getAttribute('data-actor-x')),{timeout:30000}).toBeLessThan(-.15);
  expect(Number(await scene.getAttribute('data-frames'))).toBeGreaterThan(firstFrame);
  await page.getByRole('button',{name:'Ukázat',exact:true}).click();await expect(scene).toHaveAttribute('data-phase','point');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
  // One visual artifact of the assistant is enough here. Repeated WebGL
  // readbacks and a full-guide capture exhausted the mobile CI budget.
  await page.locator('.dagmar').screenshot({path:`artifacts/dagmar-${test.info().project.name}.png`});
  await page.locator('.speech-bubble').getByRole('button',{name:'Omezit animace',exact:true}).click();await expect(page.locator('.dagmar-3d')).toHaveCount(0);await expect(page.locator('.dagmar-fallback')).toBeVisible();await expect(page.getByRole('button',{name:'Projít se',exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>Object.keys(localStorage).sort())).toEqual(['guest-language','guest-motion']);expect(remote).toEqual([]);expect(errors).toEqual([]);
 });
 test('simulated speech events start mouth movement, reanchor a word and close the mouth on cancellation',async({page})=>{
  test.setTimeout(90000);
  await page.clock.install({time:new Date('2026-10-09T08:00:00Z')});
  await fakeSpeech(page);await page.goto('/cs/');await page.locator('.dagmar').scrollIntoViewIfNeeded();
  const scene=page.locator('.dagmar-3d');await expect(scene).toHaveAttribute('data-ready','true',{timeout:20000});await page.locator('.dagmar-toggle').click();
  await page.locator('.dagmar-voice').click();await expect.poll(()=>page.evaluate(()=>(window as any).__dagmarSpeech.history.length)).toBe(1);
  await expect(scene).toHaveAttribute('data-speaking','false');
  // Pause before starting the simulated voice: GPU work must not consume the
  // short vowel being checked. This does not claim real acoustic synchronization.
  await page.clock.pauseAt(new Date('2026-10-09T09:00:00Z'));
  await page.evaluate(()=>{const s=(window as any).__dagmarSpeech;s.utterance.onstart?.();s.utterance.onboundary?.({charIndex:1});});
  await page.clock.runFor(32);
  await expect(scene).toHaveAttribute('data-speaking','true');await expect.poll(async()=>Number(await scene.getAttribute('data-mouth-open'))).toBeGreaterThan(.5);
  await page.clock.resume();
  await page.locator('.dagmar-voice').click();await expect(scene).toHaveAttribute('data-speaking','false');await expect(scene).toHaveAttribute('data-mouth-open','0.000');
  await page.evaluate(()=>(window as any).__dagmarSpeech.history[0].onstart?.());await expect(scene).toHaveAttribute('data-speaking','false');
  await page.locator('.dagmar-voice').click();await expect.poll(()=>page.evaluate(()=>(window as any).__dagmarSpeech.history.length)).toBe(2);
  await page.evaluate(()=>{const s=(window as any).__dagmarSpeech;s.utterance.onstart?.();s.utterance.onend?.();});await expect(scene).toHaveAttribute('data-speaking','false');
 });
});

test('reduced motion avoids the 3D download and all twelve languages request their own voice',async({page})=>{
 test.setTimeout(90000);await fakeSpeech(page);
 const rigRequests:string[]=[];page.on('request',r=>{if(/\/media\/dagmar\/[^/]+\.glb$/.test(r.url()))rigRequests.push(r.url());});
 for(const language of langs) {
  await page.goto(`/${language}/`);await expect(page.locator('.dagmar-fallback')).toBeVisible();await expect(page.locator('.dagmar-3d')).toHaveCount(0);
  await page.locator('.dagmar-toggle').click();await page.locator('.dagmar-voice').click();await expect.poll(()=>page.evaluate(()=>(window as any).__dagmarSpeech.history.length)).toBe(1);
  const speech=await page.evaluate(()=>{const u=(window as any).__dagmarSpeech.utterance;return {lang:u.lang,text:u.text};});expect(speech.lang.split('-')[0]).toBe(language);expect(speech.text).toBe(await page.locator('.speech-bubble>p').innerText());
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
 }
 expect(rigRequests).toEqual([]);
});
test('unavailable selected voice produces an explicit message without another-language speech',async({page})=>{
 await fakeSpeech(page,['en']);await page.goto('/bn/');await page.locator('.dagmar-toggle').click();await page.locator('.dagmar-voice').click();await expect(page.locator('.voice-status')).toBeVisible();expect(await page.evaluate(()=>(window as any).__dagmarSpeech.history.length)).toBe(0);
});
