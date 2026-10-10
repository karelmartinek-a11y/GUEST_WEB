import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createSpeechServer,approvedText} from '../infra/speech.mjs';
import {speechChunks} from '../scripts/speech-chunks.mjs';
test('audio chunks preserve text and end on sentence or word boundaries',()=>{
 for(const text of ['Příjemná procházka Prahou. '.repeat(80),'안녕하세요. 편안한 여행을 즐기세요. '.repeat(80),'你好。歡迎來到布拉格。'.repeat(100),'😀 Příjemný pobyt! '.repeat(100)]){
  const parts=speechChunks(text);assert.equal(parts.join(''),text);assert(parts.every(p=>Array.from(p).length<=600));assert(parts.slice(0,-1).every(p=>/[\s.!?。！？।]$/u.test(p)));
 }
});
const id='a'.repeat(64),other='b'.repeat(64),catalog={language:'cs',chunks:{[id]:'Vítejte v Praze.',[other]:'Ráda vám pomohu.'}};
test('speech accepts only catalog IDs in the requested language, never supplied text or private data',()=>{
 assert.equal(approvedText({language:'cs',ids:[id]},catalog),'Vítejte v Praze.');
 for(const input of [{language:'en',ids:[id]},{language:'cs',ids:['../key']},{language:'cs',ids:[id],text:'medical note'},{language:'cs',ids:[]},{language:'cs',ids:[other.repeat(2)]}])assert.throws(()=>approvedText(input,catalog));
 assert.throws(()=>approvedText({language:'cs',ids:Array(41).fill(id)},catalog));
 assert.throws(()=>approvedText({language:'cs',ids:[id]},{language:'cs',chunks:{[id]:'x'.repeat(1001)}}));
});
test('speech caches provider audio, rejects cross-origin requests and persists the daily generation cap across restarts',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'guest-speech-test-')),catalogDir=path.join(dir,'catalog'),cacheDir=path.join(dir,'cache');await fs.mkdir(catalogDir);await fs.writeFile(path.join(catalogDir,'cs.json'),JSON.stringify(catalog));let calls=0;
 const upstream=async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.equal(body.input,'Vítejte v Praze.');assert.equal(body.voice,'marin');assert.equal(body.model,'gpt-4o-mini-tts');return new Response(Buffer.alloc(200,1),{status:200});};
 const options={catalogDir,cacheDir,apiKey:'test-only-not-a-real-key',dailyLimit:20,upstream};
 let server;
 const start=async()=>{server=createSpeechServer(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));return `http://127.0.0.1:${server.address().port}`;};
 const close=()=>new Promise(r=>server.close(r));let base=await start();
 const request=(value,origin='https://guest.hcasc.cz')=>fetch(base+'/api/speech',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(value)});
 try{
  assert.equal((await request({language:'cs',ids:[id]},'https://evil.example')).status,403);
  assert.equal((await request({language:'cs',ids:['c'.repeat(64)]})).status,422);
  assert.equal(calls,0);
  const [a,b]=await Promise.all([request({language:'cs',ids:[id]}),request({language:'cs',ids:[id]})]);assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(calls,1);
  await close();base=await start();assert.equal((await request({language:'cs',ids:[id]})).status,200);assert.equal(calls,1);
  assert.equal((await request({language:'cs',ids:[other]})).status,429);assert.equal(calls,1);
 }finally{await close();await fs.rm(dir,{recursive:true});}
});
