import {test,expect} from '@playwright/test';

test('floating Dagmar stays in the viewport, drags with mouse/touch, survives navigation and works with keyboard',async({page,context,isMobile})=>{
 await page.goto('/cs/');const figure=page.locator('.dagmar-floating'),stage=page.locator('.dagmar-stage'),toggle=page.locator('.dagmar-toggle');
 await expect(figure).toBeVisible();await expect(figure).toHaveCount(1);
 const before=(await figure.boundingBox())!;
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 await expect.poll(async()=>Math.round((await figure.boundingBox())!.y)).toBe(Math.round(before.y));
 const b=(await stage.boundingBox())!,x=b.x+b.width/2,y=b.y+b.height/2;
 if(isMobile){
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-90,y:y-100}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-90,y-100,{steps:8});await page.mouse.up();}
 await expect.poll(async()=>(await figure.boundingBox())!.x).toBeLessThan(before.x-50);
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 const moved=(await figure.boundingBox())!;
 await page.evaluate(()=>window.scrollTo(0,0));await page.locator('.choice').first().click();await expect(page.locator('.page-top>h1')).toBeVisible();
 await expect(figure).toHaveCount(1);await expect.poll(async()=>Math.round((await figure.boundingBox())!.x)).toBe(Math.round(moved.x));
 await page.locator('.language-select select').first().selectOption('en');await expect.poll(async()=>Math.round((await figure.boundingBox())!.y)).toBe(Math.round(moved.y));
 await stage.focus();await stage.press('ArrowLeft');await expect.poll(async()=>(await figure.boundingBox())!.x).toBeLessThan(moved.x-5);
 await toggle.click();await expect(page.locator('.speech-bubble')).toBeVisible();await page.locator('.dagmar-voice').focus();await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(page.locator('.speech-bubble')).toBeHidden();
 await page.setViewportSize({width:320,height:568});const clamped=(await figure.boundingBox())!;expect(clamped.x).toBeGreaterThanOrEqual(8);expect(clamped.x+clamped.width).toBeLessThanOrEqual(312);expect(clamped.y+clamped.height).toBeLessThanOrEqual(480);
 await toggle.click();const panel=(await page.locator('.speech-bubble').boundingBox())!;expect(panel.x).toBeGreaterThanOrEqual(0);expect(panel.x+panel.width).toBeLessThanOrEqual(320);
 const stored=await page.evaluate(()=>Object.keys(localStorage));expect(stored.every(k=>['guest-language','guest-motion','guest-voice'].includes(k))).toBe(true);
});
