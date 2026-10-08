import {test,expect}from '@playwright/test';
import flyer from '../docs/restaurant-flyer-checklist.json' with {type:'json'};
const langs=['cs','en','de','it','pl','nl','fr','ko','bn','hi','es','uk'];
for(const lang of langs)test(`complete localized catalog and health in ${lang}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/${lang}/prague/`);await expect(page.locator('.place-card')).toHaveCount(26);
 await expect(page.locator('html')).toHaveAttribute('lang',lang);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);expect(overflow).toBe(false);
 await page.locator('.place-card').first().click();await expect(page.locator('dialog[open] .detail-content')).toBeVisible();
 await expect(page.locator('dialog[open] .cinema img')).toHaveCount(1);
 await page.locator('.dialog-close').click();
 await page.goto(`/${lang}/health/`);await expect(page.locator('.symptom')).toHaveCount(15);
 await expect(page.locator('a[href="tel:155"]')).toBeVisible();await expect(page.locator('a[href="tel:112"]')).toBeVisible();
 for(const number of ['158','150','156'])await expect(page.locator(`a[href="tel:${number}"]`)).toBeVisible();
 await page.locator('.medical-notes input').first().fill('Today at 08:00');
 await page.locator('select').selectOption(lang==='en'?'de':'en');
 await expect(page.locator('.medical-notes input').first()).toHaveValue('Today at 08:00');
 await page.locator('select').selectOption(lang);
 await page.locator('.symptom').first().click();await expect(page.locator('.symptom').first()).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/health|symptom|gps|location/i.test(k)))).toEqual([]);
 await page.goto(`/${lang}/restaurants/`);await expect(page.locator('.restaurant-card')).toHaveCount(8);
 for(const r of flyer.restaurants){
  const card=page.locator('.restaurant-card').filter({has:page.getByRole('heading',{name:new RegExp(r.nameFragment.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))})});
  await expect(card).toContainText(`${r.walkingMinutes} min`);
  await card.locator('.restaurant-summary').click();
  await expect(card.locator('.restaurant-detail a[href^="tel:"]')).toHaveAttribute('href',`tel:${r.phone}`);
  await expect(card.locator('a[href*="travelmode=walking"]')).toHaveAttribute('href',/origin=.+&destination=.+&travelmode=walking/);
 }
 await expect(page.locator('.restaurant-detail')).toContainText('Hvězdoslavova');
 await page.goto(`/${lang}/faith/`);await expect(page.locator('.faith-card')).toHaveCount(9);
 await expect(page.locator('.qibla-bearing')).toContainText('°');
 await page.locator('input[type=range]').fill('45');await expect(page.locator('.compass-disc')).toHaveCSS('transform',/matrix/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 expect(errors).toEqual([]);
});
test('language changes preserve symptom selection and selected place',async({page})=>{
 await page.goto('/cs/health/');await page.locator('.symptom').nth(3).click();await page.locator('select').selectOption('de');
 await expect(page.locator('.symptom').nth(3)).toHaveAttribute('aria-pressed','true');await expect(page.locator('.symptom').nth(3)).toContainText('Zahnschmerzen');
 await page.goto('/cs/prague/?place=karluv-most');await expect(page.locator('dialog[open]')).toBeVisible();
 await page.locator('dialog[open] select').selectOption('en');await expect(page.locator('.detail-hero-copy')).toContainText('Charles Bridge');await expect(page).toHaveURL(/\/en\/prague\/\?place=karluv-most/);
 await page.keyboard.press('Escape');await page.locator('.place-card').filter({has:page.getByRole('heading',{name:'Charles Bridge',exact:true})}).click();await expect(page.locator('.detail-hero-copy')).toContainText('Charles Bridge');
});
test('search, filters, empty state and reset operate',async({page})=>{
 await page.goto('/cs/nearby/');await expect(page.locator('.place-card')).toHaveCount(10);
 await page.locator('input[type=search]').fill('tvrz');await expect(page.locator('.place-card')).toHaveCount(1);
 await page.locator('input[type=search]').fill('zzzzzz');await expect(page.locator('.empty-state')).toBeVisible();
 await page.locator('.empty-state button').click();await expect(page.locator('.place-card')).toHaveCount(10);
 await page.locator('.filter-chips button').filter({hasText:'Příroda'}).click();await expect(page.locator('.place-card')).toHaveCount(5);
});
test('five itineraries use real catalog stops and official transit links',async({page})=>{
 await page.goto('/en/trips/');await expect(page.locator('.trip-card')).toHaveCount(5);await page.locator('.trip-card').nth(2).click();await expect(page.locator('.itinerary li')).toHaveCount(5);
 await page.goto('/en/transport/');await expect(page.locator('a[href="https://pid.idos.cz/pid/spojeni/conn.aspx"]').first()).toBeVisible();await expect(page.locator('a[href="https://app.pidlitacka.cz/"]')).toBeVisible();
 await expect(page.locator('.local-card')).toHaveCount(4);await expect(page.locator('.transit-steps')).toHaveCount(3);
 await expect(page.locator('.taxi-choices a[target="_blank"]')).toHaveCount(3);
 await expect(page.locator('a[href="tel:+420222333222"]')).toBeVisible();
 for(const line of await page.locator('.transit-line').all())await expect(line.locator('.transport-icon')).toBeVisible();
 await expect(page.locator('.transit-line[data-mode="trolleybus"]')).toContainText('59');
});
test('map loads own PMTiles without external tile or tracking traffic',async({page,baseURL})=>{
 const origin=new URL(baseURL!).origin;
 const remote:string[]=[];page.on('request',r=>{if(!r.url().startsWith('blob:')&&!r.url().startsWith('data:')&&new URL(r.url()).origin!==origin)remote.push(r.url());});
 await page.goto('/en/map/');await expect(page.locator('.map-marker')).toHaveCount(37,{timeout:20000});
 await expect(page.locator('.map-canvas canvas')).toBeVisible();expect(remote).toEqual([]);
 await expect(page.locator('.hotel-marker img')).toHaveAttribute('src','/media/hotel-chodov-asc.jpg');
 expect(await page.locator('.hotel-marker img').evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
 await page.locator('.hotel-marker').click();await expect(page.locator('.hotel-popup-photo')).toBeVisible();
 await page.locator('.map-popup button').click();await expect(page).toHaveURL(/\/en\/hotel\//);
});
test('UNESCO filter, official emblem and transport-mode icons use the actual inscription scope',async({page})=>{
 await page.goto('/cs/prague/');await page.locator('.filter-chips button').filter({hasText:'UNESCO'}).click();
 await expect(page.locator('.place-card')).toHaveCount(21);await expect(page.locator('.place-card .heritage-stamp img')).toHaveCount(21);
 await page.goto('/cs/prague/?place=prasna-brana');await expect(page.locator('dialog[open] .heritage-details')).toContainText('Historického centra Prahy');
 await expect(page.locator('dialog[open] .heritage-details a')).toHaveAttribute('href','https://whc.unesco.org/en/list/616/');
 await expect(page.locator('dialog[open] .tourist-arrival .transit-line[data-mode="bus"]')).toContainText('126');
 await expect(page.locator('dialog[open] .tourist-arrival .transit-line[data-mode="metro"]')).toHaveCount(2);
 await page.goto('/cs/prague/?place=prazsky-hrad');await expect(page.locator('dialog[open] .tourist-arrival .transit-line[data-mode="tram"]')).toContainText('22');
 await page.goto('/cs/prague/?place=zoo-praha');await expect(page.locator('dialog[open] .heritage-stamp')).toHaveCount(0);
 await page.goto('/cs/nearby/');await page.locator('.filter-chips button').filter({hasText:'UNESCO'}).click();await expect(page.locator('.place-card')).toHaveCount(1);
 await page.locator('.place-card').click();await expect(page.locator('dialog[open] .heritage-details')).toContainText('Průhonický park');
});
test('home presentation has licensed images and honours reduced motion',async({page})=>{
 const response=await page.request.get('/release.json');expect(response.ok()).toBe(true);const release=await response.json();
 expect(release.repository).toBe('karelmartinek-a11y/GUEST_WEB');expect(release.places).toBe(36);expect(release.languages).toBe(12);expect(release.navigationEnabled).toBe(false);
 if(process.env.GITHUB_SHA)expect(release.sha).toBe(process.env.GITHUB_SHA);
 await page.goto('/cs/');await expect(page.locator('.hero-copy h1')).toBeVisible();await expect(page.locator('.choices .choice')).toHaveCount(9);
 await expect(page.locator('.cinema-image')).toHaveAttribute('src',/\/media\/photos\//);
 const animation=await page.locator('.dagmar-stage img').evaluate(el=>getComputedStyle(el).animationName);expect(animation).toBe('none');
 await page.screenshot({path:`artifacts/home-${test.info().project.name}.png`,fullPage:true});
});
