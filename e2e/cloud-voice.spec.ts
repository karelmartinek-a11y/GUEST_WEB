import {test,expect} from '@playwright/test';
test('all twelve cloud languages use their own catalog without sending free text',async({page})=>{
 test.setTimeout(90000);
 let request:any;await page.route('**/api/speech',async route=>{request=route.request().postDataJSON();await route.fulfill({status:503,body:'{}'});});
 for(const language of ['cs','en','de','it','pl','nl','fr','ko','bn','hi','es','uk']){
  request=null;const loaded=page.waitForResponse(r=>r.url().endsWith(`/speech/${language}.json`));await page.goto(`/${language}/`);await loaded;
  await page.locator('main>.reader-controls button').first().click();await expect.poll(()=>request?.language).toBe(language);
  expect(Object.keys(request).sort()).toEqual(['ids','language']);expect(request.ids.every((id:string)=>/^[a-f0-9]{64}$/.test(id))).toBe(true);
 }
});
test('cloud reader reads long place content, supports controls and sends only approved IDs',async({page})=>{
 const requests:{language:string;ids:string[]}[]=[];
 await page.addInitScript(()=>{
  class AudioMock{src='';preload='';paused=true;duration=45;currentTime=0;onplay:any;onpause:any;onended:any;ontimeupdate:any;onerror:any;async play(){this.paused=false;this.onplay?.();}pause(){this.paused=true;this.onpause?.();}load(){}removeAttribute(){} }
  Object.defineProperty(window,'Audio',{value:AudioMock});
 });
 await page.route('**/api/speech',async r=>{requests.push(r.request().postDataJSON());await r.fulfill({status:200,contentType:'audio/mpeg',body:Buffer.alloc(200)});});
 await page.goto('/cs/prague/?place=karluv-most');
 const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'Přečíst stránku',exact:true}).click();
 await expect(dialog.getByRole('button',{name:'Pozastavit čtení',exact:true})).toBeVisible();
 await expect.poll(()=>requests.length).toBeGreaterThan(0);
 const catalog=await page.evaluate(()=>fetch('/speech/cs.json').then(r=>r.json()));
 const text=requests.flatMap(r=>r.ids.map(id=>catalog.chunks[id])).join(' ');
 const description=await dialog.locator('.detail-content>p').allTextContents();expect(text).toContain(description[0].trim());
 expect(requests.every(r=>r.language==='cs'&&Object.keys(r).sort().join(',')==='ids,language'&&r.ids.every(id=>/^[a-f0-9]{64}$/.test(id)))).toBe(true);
 await dialog.getByRole('button',{name:'Pozastavit čtení',exact:true}).click();await expect(dialog.getByRole('button',{name:'Pokračovat ve čtení',exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Pokračovat ve čtení',exact:true}).click();await expect(dialog.getByRole('button',{name:'Pozastavit čtení',exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Ztlumit Dagmar',exact:true}).click();await expect(dialog.getByRole('button',{name:'Pozastavit čtení',exact:true})).toHaveCount(0);
});
test('health notes and selections are never included in speech requests',async({page})=>{
 const requests:any[]=[];await page.route('**/api/speech',async r=>{requests.push(r.request().postDataJSON());await r.fulfill({status:503,body:'{}'});});
 await page.goto('/cs/health/');await page.locator('.medical-notes input').first().fill('PRIVATE-SENSITIVE-NOTE');await page.locator('.symptom').first().click();
 await page.locator('main>.reader-controls').getByRole('button',{name:'Přečíst stránku',exact:true}).click();
 await expect.poll(()=>requests.length).toBeGreaterThan(0);expect(JSON.stringify(requests)).not.toContain('PRIVATE');expect(requests.every(r=>Object.keys(r).sort().join(',')==='ids,language')).toBe(true);
 await expect(page.locator('main>.reader-controls')).toContainText('Hlas se nepodařilo načíst');
});
