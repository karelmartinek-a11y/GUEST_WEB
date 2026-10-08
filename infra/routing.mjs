import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const ENTRANCES=JSON.parse(fs.readFileSync(resolve(root,'approved-entrances.json'),'utf8')).approved;
export const languages=['cs-CZ','en-GB','en-US','de-DE','it-IT','pl-PL','nl-NL','fr-FR','es-ES','uk-UA','ko-KR','bn-BD','hi-IN'];
export function validateRoute(input,entrances=ENTRANCES,now=Date.now()) {
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('INVALID_REQUEST');
 const {from,destinationId,language}=input;
 if(!from||typeof from.lat!=='number'||typeof from.lon!=='number'||!Number.isFinite(from.lat)||!Number.isFinite(from.lon)||from.lat<49.92||from.lat>50.25||from.lon<14.22||from.lon>14.72)throw new Error('OUTSIDE_REGION');
 if(typeof from.accuracy!=='number'||from.accuracy<0||from.accuracy>50||!Number.isFinite(from.accuracy))throw new Error('GPS_INACCURATE');
 if(typeof from.timestamp!=='number'||Math.abs(now-from.timestamp)>30000)throw new Error('GPS_STALE');
 if(!languages.includes(language))throw new Error('UNSUPPORTED_LANGUAGE');
 if(typeof destinationId!=='string'||!Object.hasOwn(entrances,destinationId))throw new Error('ENTRANCE_NOT_APPROVED');
 const destination=entrances[destinationId];
 if(!destination.physicalEvidence||!destination.approvedAt||!Number.isFinite(destination.lat)||!Number.isFinite(destination.lon))throw new Error('ENTRANCE_NOT_APPROVED');
 const radians=Math.PI/180;
 const deltaLat=(destination.lat-from.lat)*radians,deltaLon=(destination.lon-from.lon)*radians;
 const x=Math.sin(deltaLat/2)**2+Math.cos(from.lat*radians)*Math.cos(destination.lat*radians)*Math.sin(deltaLon/2)**2;
 const distance=12742000*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
 if(distance<5||distance>20000)throw new Error('ROUTE_DISTANCE_LIMIT');
 return {locations:[{lat:from.lat,lon:from.lon},{lat:destination.lat,lon:destination.lon}],costing:'pedestrian',directions_type:'instructions',language,units:'kilometers',costing_options:{pedestrian:{max_distance:20000}},alternates:0};
}
export function createRoutingServer({baseUrl=process.env.VALHALLA_BASE_URL||'',entrances=ENTRANCES,origin='https://guest.hcasc.cz'}={}) {
 if(baseUrl){const upstream=new URL(baseUrl);if(!['127.0.0.1','localhost','valhalla'].includes(upstream.hostname)||upstream.protocol!=='http:')throw Error('Only the isolated own Valhalla is allowed');}
 const counter=new Map();const response=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));};
 const server=http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/healthz'){response(res,200,{ok:true,service:'guest-web-routing',enabled:!!baseUrl,entrances:Object.keys(entrances).length});return;}
  if(req.url!=='/api/route'){response(res,404,{error:'NOT_FOUND'});return;}
  if(req.method!=='POST'){response(res,405,{error:'METHOD_NOT_ALLOWED'});return;}
  if(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json')){response(res,403,{error:'ORIGIN_REQUIRED'});return;}
  const ip=req.headers['x-real-ip']||req.socket.remoteAddress;const now=Date.now();
  for(const [key,entry]of counter)if(now-entry.start>60000)counter.delete(key);
  if(counter.size>10000){response(res,503,{error:'BUSY'});return;}
  const entry=counter.get(ip)||{start:now,count:0};entry.count++;counter.set(ip,entry);
  if(entry.count>10){response(res,429,{error:'RATE_LIMIT'});return;}
  let bytes=0;const chunks=[];
  try{
   for await(const chunk of req){bytes+=chunk.length;if(bytes>2048){response(res,413,{error:'BODY_TOO_LARGE'});return;}chunks.push(chunk);}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{response(res,400,{error:'INVALID_JSON'});return;}
   let route;try{route=validateRoute(input,entrances);}catch(error){response(res,422,{error:error.message});return;}
   if(!baseUrl){response(res,503,{error:'ROUTING_NOT_READY'});return;}
   const upstream=await fetch(new URL('/route',baseUrl),{method:'POST',body:JSON.stringify(route),headers:{'content-type':'application/json'},signal:AbortSignal.timeout(10000)});
   if(!upstream.ok){response(res,502,{error:'ROUTE_UNAVAILABLE'});return;}
   const body=await upstream.text();if(Buffer.byteLength(body)>500000){response(res,502,{error:'ROUTE_TOO_LARGE'});return;}
   const result=JSON.parse(body);if(!result.trip?.legs?.length||result.trip.status!==0){response(res,502,{error:'NO_ROUTE'});return;}
   if(result.trip.language!==route.language){response(res,503,{error:'DIRECTION_LANGUAGE_UNAVAILABLE'});return;}
   response(res,200,result);
  }catch{response(res,502,{error:'ROUTER_UNAVAILABLE'});}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=30;
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createRoutingServer();server.listen(Number(process.env.ROUTER_PORT||18780),'127.0.0.1',()=>console.log('guest-web routing proxy listening on loopback'));
}
