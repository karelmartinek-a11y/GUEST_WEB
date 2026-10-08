import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
export const languages=['cs','en','de','it','pl','nl','fr','ko','bn','hi','es','uk'];
export function validateContent(){
 const catalog=JSON.parse(fs.readFileSync('src/content/places.cs.json')).places;
 const routes=JSON.parse(fs.readFileSync('src/content/routes.cs.json')).routes;
 assert.equal(catalog.length,29);assert.equal(routes.length,5);assert.equal(new Set(catalog.map(p=>p.id)).size,29);
 assert.equal(catalog.filter(p=>p.area==='okoli').length,10);assert.equal(catalog.filter(p=>p.area==='praha').length,19);
 for(const route of routes)for(const id of route.stopIds)assert(catalog.some(p=>p.id===id),`Unknown stop ${id}`);
 for(const p of catalog){assert(Number.isFinite(p.lat)&&Number.isFinite(p.lon));assert.equal(new URL(p.officialUrl).protocol,'https:');assert(p.verifiedOn&&p.coordinateSource);}
 const ui=JSON.parse(fs.readFileSync('src/content/ui-translations.json'));
 const keys=Object.keys(JSON.parse(fs.readFileSync('src/content/ui.en.json')));
 for(const language of languages){
  const locale=JSON.parse(fs.readFileSync(`src/content/${language}.json`));
  assert.deepEqual(Object.keys(locale.places).sort(),catalog.map(p=>p.id).sort(),`Missing ${language} place`);
  assert.deepEqual(Object.keys(locale.routes).sort(),routes.map(r=>r.id).sort());
  for(const p of catalog)for(const field of ['name','short','description','tip','hours','admission','coordinateNote'])assert(typeof locale.places[p.id][field]==='string'&&locale.places[p.id][field].trim().length>=3,`${language}/${p.id}/${field}`);
  if(!['cs','en'].includes(language))for(const key of keys)assert(ui[language]?.[key]?.trim(),`Missing UI ${language}/${key}`);
 }
 const manifest=JSON.parse(fs.readFileSync('public/media/manifest.json'));
 assert(manifest.photos.length>=80,'The requested cinematic galleries need abundant photographs');
 for(const p of catalog)assert(manifest.photos.filter(photo=>photo.placeId===p.id).length>=2,`Need gallery for ${p.id}`);
 for(const photo of manifest.photos){
  assert(catalog.some(p=>p.id===photo.placeId));
  assert(/^(CC BY|CC0|Public domain)/i.test(photo.license),`Unapproved photo license ${photo.license}`);
  assert(photo.author&&photo.sourceUrl&&photo.licenseUrl);
  assert(new URL(photo.sourceUrl).hostname==='commons.wikimedia.org');
  assert(!photo.filename.includes('/')&&!photo.filename.includes('..'));
  const bytes=fs.readFileSync(path.join('public/media/photos',photo.filename));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),photo.sha256,`Photo hash ${photo.filename}`);
 }
 const magic=fs.readFileSync('public/maps/prague.pmtiles').subarray(0,8).toString();assert.equal(magic,'PMTiles\u0003');
 const capabilities=JSON.parse(fs.readFileSync('public/capabilities.json'));
 const entrances=JSON.parse(fs.readFileSync('infra/approved-entrances.json'));
 if(capabilities.navigationEnabled){assert(capabilities.approvedEntrances.length>=6);for(const id of capabilities.approvedEntrances)assert(entrances.approved[id]?.physicalEvidence);}
 assert.equal(JSON.parse(fs.readFileSync('src/content/health.cs.json')).symbols.length,15);
 const restaurants=JSON.parse(fs.readFileSync('src/content/restaurants.json')).restaurants;
 assert.equal(restaurants.length,8);assert.equal(new Set(restaurants.map(r=>r.id)).size,8);
 const flyer=JSON.parse(fs.readFileSync('docs/restaurant-flyer-checklist.json'));
 assert.deepEqual(restaurants.map(r=>r.id).sort(),flyer.restaurants.map(r=>r.id).sort(),'Every restaurant from the mandatory flyer must be present');
 for(const expected of flyer.restaurants){
  const actual=restaurants.find(r=>r.id===expected.id);
  assert(actual.name.includes(expected.nameFragment),`Flyer restaurant name ${expected.id}`);
  assert.equal(actual.sourceFlyer,flyer.source);
  for(const field of ['phone','walkingMeters','walkingMinutes','historicalPrices'])assert.equal(actual[field],expected[field],`Mandatory flyer fact ${expected.id}/${field}`);
 }
 for(const r of restaurants){assert(r.address&&r.sourceFlyer&&r.hoursSource);assert.match(r.phone,/^\+420\d{9}$/);assert.equal(new URL(r.officialUrl).protocol,'https:');assert(r.walkingMeters>0&&r.walkingMinutes>0);assert(r.openingHours.length>0);}
 const practical=JSON.parse(fs.readFileSync('src/content/practical.json'));assert.equal(practical.services.length,4);
 const faith=JSON.parse(fs.readFileSync('src/content/faith.json'));assert.equal(faith.places.length,9);
 for(const p of faith.places){assert(p.address&&p.verifiedOn);assert.equal(new URL(p.programme).protocol,'https:');for(const s of p.schedule){assert(s.days.every(d=>d>=1&&d<=7));assert(s.time);}}
 const extra=JSON.parse(fs.readFileSync('src/content/extra-ui.json'));
 for(const [key,values]of Object.entries(extra)){assert.equal(values.length,12,key);assert(values.every(v=>typeof v==='string'&&v.trim()),key);}
 return {places:29,routes:5,languages:languages.length,photos:manifest.photos.length,healthCards:15,restaurants:restaurants.length,faiths:faith.places.length,navigation:capabilities.navigationEnabled};
}
if(process.argv[1]?.endsWith('validate-content.mjs'))console.log(JSON.stringify(validateContent()));
