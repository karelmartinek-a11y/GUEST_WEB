import http from 'node:http';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const locales={cs:'Czech',en:'English',de:'German',it:'Italian',pl:'Polish',nl:'Dutch',fr:'French',ko:'Korean',bn:'Bengali',hi:'Hindi',es:'Spanish',uk:'Ukrainian'};
export function approvedText(input,catalog){
 if(!input||Object.keys(input).some(k=>!['language','ids'].includes(k))||input.language!==catalog.language||!Object.hasOwn(locales,input.language)||!Array.isArray(input.ids)||!input.ids.length||input.ids.length>40)throw Error('INVALID_REQUEST');
 const parts=input.ids.map(id=>{if(typeof id!=='string'||!/^[a-f0-9]{64}$/.test(id)||!Object.hasOwn(catalog.chunks,id))throw Error('UNKNOWN_TEXT');return catalog.chunks[id];});
 const text=parts.join('\n');if(Array.from(text).length>1000)throw Error('TEXT_TOO_LONG');return text;
}
export function createSpeechServer({catalogDir=process.env.SPEECH_CATALOG_DIR||'/opt/guest-web/current/www/speech',cacheDir=process.env.SPEECH_CACHE_DIR||'/var/lib/guest-web/speech',apiKey=process.env.OPENAI_API_KEY,model=process.env.SPEECH_MODEL||'gpt-4o-mini-tts',voice=process.env.SPEECH_VOICE||'marin',dailyLimit=Number(process.env.SPEECH_DAILY_CHARACTERS||120000),maxCacheBytes=512*1024*1024,upstream=fetch,origin='https://guest.hcasc.cz'}={}){
 if(!Number.isFinite(dailyLimit)||dailyLimit<=0)throw Error('INVALID_DAILY_LIMIT');
 const inflight=new Map(),rates=new Map();let used=0,day='',cacheBytes=0;
 const initialization=fs.mkdir(cacheDir,{recursive:true}).then(async()=>{for(const name of await fs.readdir(cacheDir))if(name.endsWith('.mp3'))cacheBytes+=(await fs.stat(resolve(cacheDir,name))).size;try{const quota=JSON.parse(await fs.readFile(resolve(cacheDir,'quota.json'),'utf8'));if(typeof quota.day!=='string'||!Number.isFinite(quota.used)||quota.used<0)throw Error('INVALID_QUOTA');day=quota.day;used=quota.used;}catch(error){if(error.code!=='ENOENT')throw error;}});
 let queue=Promise.resolve();
 const json=(res,status,error)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error}));};
 const server=http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/healthz'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,service:'guest-web-speech',configured:!!apiKey,model,voice}));return;}
  if(req.url!=='/api/speech'||req.method!=='POST'){json(res,404,'NOT_FOUND');return;}
  if(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json')){json(res,403,'ORIGIN_REQUIRED');return;}
  const now=Date.now(),ip=String(req.headers['x-real-ip']||req.socket.remoteAddress);
  for(const [key,value]of rates)if(now-value.start>60000)rates.delete(key);
  if(rates.size>10000){json(res,503,'BUSY');return;}
  const rate=rates.get(ip)||{start:now,count:0};rates.set(ip,rate);if(++rate.count>90){json(res,429,'RATE_LIMIT');return;}
  try{
   let size=0;const parts=[];for await(const part of req){size+=part.length;if(size>10000){json(res,413,'BODY_TOO_LARGE');return;}parts.push(part);}
   let input,text;try{input=JSON.parse(Buffer.concat(parts).toString());if(!Object.hasOwn(locales,input.language))throw Error();const catalog=JSON.parse(await fs.readFile(resolve(catalogDir,input.language+'.json'),'utf8'));text=approvedText(input,catalog);}catch{json(res,422,'UNAPPROVED_TEXT');return;}
   await initialization;
   const id=createHash('sha256').update(JSON.stringify([model,voice,input.language,text])).digest('hex'),path=resolve(cacheDir,id+'.mp3');
   let audio;try{audio=await fs.readFile(path);}catch{
    if(!apiKey){json(res,503,'VOICE_NOT_CONFIGURED');return;}
    if(!inflight.has(id)){
     if(inflight.size>=2||cacheBytes>=maxCacheBytes){json(res,503,'BUSY');return;}
     const chars=Array.from(text).length;
     const generate=(async()=>{
      // Reserve and persist before contacting the provider; restart cannot reset today's budget.
      const reserve=queue.then(async()=>{const today=new Date().toISOString().slice(0,10);if(day!==today){day=today;used=0;}if(used+chars>dailyLimit)throw Error('DAILY_LIMIT');used+=chars;await fs.writeFile(resolve(cacheDir,'quota.json.tmp'),JSON.stringify({day,used}),{mode:0o600});await fs.rename(resolve(cacheDir,'quota.json.tmp'),resolve(cacheDir,'quota.json'));});queue=reserve.catch(()=>{});await reserve;
      const result=await upstream('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model,voice,input:text,response_format:'mp3',instructions:`Read the text exactly in ${locales[input.language]}. You are Dagmar, a warm, friendly female hotel concierge. Speak naturally with a gentle smile, relaxed conversational phrasing and clear pronunciation. Do not add, translate or omit words. No exaggerated enthusiasm.`}),signal:AbortSignal.timeout(90000)});
      if(!result.ok)throw Error('PROVIDER_UNAVAILABLE');const data=Buffer.from(await result.arrayBuffer());if(data.length<100||data.length>4*1024*1024)throw Error('INVALID_AUDIO');
      if(cacheBytes+data.length>maxCacheBytes)throw Error('CACHE_FULL');cacheBytes+=data.length;await fs.writeFile(path+'.tmp',data,{mode:0o600});await fs.rename(path+'.tmp',path);return data;
     })().finally(()=>inflight.delete(id));inflight.set(id,generate);
    }
    audio=await inflight.get(id);
   }
   res.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':audio.length,'Cache-Control':'private, max-age=86400','X-Content-Type-Options':'nosniff'});res.end(audio);
  }catch(error){json(res,error.message==='DAILY_LIMIT'?429:503,error.message==='DAILY_LIMIT'?'DAILY_LIMIT':'VOICE_UNAVAILABLE');}
 });
 server.requestTimeout=100000;server.headersTimeout=10000;server.maxHeadersCount=30;return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))createSpeechServer().listen(Number(process.env.SPEECH_PORT||18781),'127.0.0.1');
