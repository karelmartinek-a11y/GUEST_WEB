import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { validateRoute,createRoutingServer } from '../infra/routing.mjs';
import { decodePolyline,haversine,lengths,nearestOnRoute,shouldReroute } from '../src/navigation.mjs';
const now=Date.now();
const origin={lat:50.04,lon:14.5,accuracy:12,timestamp:now};
const fixture={gate:{lat:50.05,lon:14.51,approvedAt:'TEST_ONLY',physicalEvidence:'TEST_FIXTURE_NOT_FIELD_EVIDENCE'}};
const request={from:origin,destinationId:'gate',language:'en-US'};
test('routes use only physically approved IDs and pedestrian costing',()=>{
 const route=validateRoute(request,fixture,now);assert.equal(route.costing,'pedestrian');assert.equal(route.language,'en-US');assert.deepEqual(route.locations[1],{lat:50.05,lon:14.51});
 assert.throws(()=>validateRoute({...request,destinationId:'hotel'},fixture,now),/ENTRANCE_NOT_APPROVED/);
 assert.throws(()=>validateRoute({...request,to:{lat:50.05,lon:14.51},destinationId:undefined},fixture,now),/ENTRANCE_NOT_APPROVED/);
 assert.throws(()=>validateRoute(request),/ENTRANCE_NOT_APPROVED/);
});
test('coordinates, quality and freshness fail closed',()=>{
 for(const from of [{...origin,lat:NaN},{...origin,lat:52},{...origin,lon:'14.5'},{...origin,accuracy:51},{...origin,timestamp:now-31000}])assert.throws(()=>validateRoute({...request,from},fixture,now));
 assert.throws(()=>validateRoute({...request,language:'xx'},fixture,now),/UNSUPPORTED_LANGUAGE/);
 assert.throws(()=>createRoutingServer({baseUrl:'https://valhalla1.openstreetmap.de'}),/isolated/);
});
test('geometry and off-route detection require good consecutive fixes',()=>{
 assert.equal(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@',5).length,3);
 assert.throws(()=>decodePolyline('!'));
 const pts=[[14.5,50],[14.5,50.001]];const sums=lengths(pts);assert.ok(haversine(pts[0],pts[1])>100);
 const near=nearestOnRoute([14.5,50.0005],pts,sums);assert.ok(near.distance<1);assert.ok(near.along>50);
 assert.equal(shouldReroute([{distance:70,accuracy:10},{distance:75,accuracy:10}],60000,0),false);
 assert.equal(shouldReroute([{distance:70,accuracy:10},{distance:75,accuracy:10},{distance:80,accuracy:10}],60000,0),true);
 assert.equal(shouldReroute([{distance:70,accuracy:70},{distance:75,accuracy:70},{distance:80,accuracy:70}],60000,0),false);
});
test('HTTP proxy does not accept external origin, bad data, unsafe targets or demo routing',async()=>{
 const server=createRoutingServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.equal((await fetch(url+'/healthz')).status,200);
  assert.equal((await fetch(url+'/api/route')).status,405);
  assert.equal((await fetch(url+'/api/route',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,403);
  const headers={'origin':'https://guest.hcasc.cz','content-type':'application/json'};
  const res=await fetch(url+'/api/route',{method:'POST',headers,body:JSON.stringify({...request,from:{...origin,timestamp:Date.now()}})});
  assert.equal(res.status,422);assert.equal((await res.json()).error,'ENTRANCE_NOT_APPROVED');
  const big=await fetch(url+'/api/route',{method:'POST',headers,body:JSON.stringify({x:'x'.repeat(2200)})});assert.equal(big.status,413);
 }finally{await new Promise(r=>server.close(r));}
});
test('routing never silently returns narration in another language',async()=>{
 let language='en-US';const upstream=http.createServer((req,res)=>{res.setHeader('content-type','application/json');res.end(JSON.stringify({trip:{status:0,language,legs:[{shape:'test-only'}]}}));});
 await new Promise(r=>upstream.listen(0,'127.0.0.1',r));
 const server=createRoutingServer({baseUrl:`http://127.0.0.1:${upstream.address().port}`,entrances:fixture});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const call=()=>fetch(`http://127.0.0.1:${server.address().port}/api/route`,{method:'POST',headers:{origin:'https://guest.hcasc.cz','content-type':'application/json'},body:JSON.stringify({...request,language:'de-DE',from:{...origin,timestamp:Date.now()}})});
 try{const rejected=await call();assert.equal(rejected.status,503);assert.equal((await rejected.json()).error,'DIRECTION_LANGUAGE_UNAVAILABLE');language='de-DE';assert.equal((await call()).status,200);}
 finally{await new Promise(r=>server.close(r));await new Promise(r=>upstream.close(r));}
});
