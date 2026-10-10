import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import ts from 'typescript';
import {speechChunks} from './speech-chunks.mjs';

const bundled=await build({stdin:{contents:"export {uiDictionaries,languages} from './src/i18n.ts'; export {symptomTranslations} from './src/content/symptoms.ts';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {uiDictionaries,languages,symptomTranslations}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const normalize=s=>s.replace(/\s+/gu,' ').trim();
function strings(value,out){if(typeof value==='number'){out.add(String(value));}else if(typeof value==='string'){const s=normalize(value);if(s&&!/^https?:\/\//.test(s))out.add(s);}else if(value&&typeof value==='object')for(const v of Object.values(value))strings(v,out);}
const common=new Set();
for(const name of ['hotel','restaurants','practical','faith','heritage','health.cs'])strings(JSON.parse(fs.readFileSync(`src/content/${name}.json`)),common);
for(const name of ['restaurants','practical']){const data=JSON.parse(fs.readFileSync(`src/content/${name}.json`));for(const place of data.restaurants||data.services)if(place.streets)common.add(place.streets.join(' → '));}
for(let i=0;i<=36;i++)common.add(String(i));
// Literal place/station names, phone numbers and addresses that are already rendered by the UI.
for(const name of fs.readdirSync('src').filter(n=>n.endsWith('.tsx'))){const source=ts.createSourceFile(name,fs.readFileSync(`src/${name}`,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const walk=node=>{if(ts.isJsxText(node)||ts.isStringLiteral(node))strings(node.text,common);ts.forEachChild(node,walk);};walk(source);}
const extra=JSON.parse(fs.readFileSync('src/content/extra-ui.json'));
fs.mkdirSync('dist/speech',{recursive:true});
for(const [i,{code}]of languages.entries()){
 const values=new Set(common);strings(uiDictionaries[code],values);strings(symptomTranslations[code],values);strings(JSON.parse(fs.readFileSync(`src/content/${code}.json`)),values);
 const days=Array.from({length:7},(_,day)=>new Intl.DateTimeFormat(code,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,4+day))));
 for(const first of days){values.add(first);for(const last of days)values.add(first+'–'+last);}
 for(const place of JSON.parse(fs.readFileSync('src/content/places.cs.json')).places){strings(place.visitDuration,values);strings(place.verifiedOn,values);values.add(place.lat.toFixed(6));values.add(place.lon.toFixed(6));}
 for(const place of JSON.parse(fs.readFileSync('src/content/faith.json')).places)for(const schedule of place.schedule)values.add(schedule.days.map(d=>days[d]).join(' · '));
 for(const row of Object.values(extra))strings(row[i],values);
 for(const station of ['Chodov','Letňany','Nemocnice Motol','Letiště'])values.add(extra.toward[i]+' '+station);
 for(const place of JSON.parse(fs.readFileSync('src/content/faith.json')).places)for(const schedule of place.datedSchedule||[])values.add(new Intl.DateTimeFormat(code,{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${schedule.date}T12:00:00Z`)));
 const chunks={},entries=[];
 for(const text of values){const ids=[];for(const part of speechChunks(text)){const id=createHash('sha256').update(code+'\0'+part).digest('hex');chunks[id]=part;ids.push(id);}entries.push({text,ids});}
 fs.writeFileSync(`dist/speech/${code}.json`,JSON.stringify({language:code,entries,chunks}));
}
console.log('Built approved speech catalogs for all 12 languages.');
