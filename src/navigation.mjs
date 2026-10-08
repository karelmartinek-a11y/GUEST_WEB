import { decodePolyline, haversine, lengths, nearestOnRoute, getNextManeuver } from '../vychozi_prototyp_v1.3/public/logic.js';
export { decodePolyline, haversine, lengths, nearestOnRoute, getNextManeuver };
export function shouldReroute(fixes,now,lastReroute=0){
 return now-lastReroute>30000&&fixes.length>=3&&fixes.slice(-3).every(p=>p.accuracy<=35&&p.distance>Math.max(45,p.accuracy*2));
}
export class WalkingNavigation {
 constructor({language,onState,onGeometry,fetcher=fetch,geolocation=navigator.geolocation,speech=window.speechSynthesis,wake=navigator.wakeLock}){
  Object.assign(this,{language,onState,onGeometry,fetcher,geolocation,speech,wake});this.active=false;this.fixes=[];this.lastReroute=0;this.lastSpoken=-1;this.abort=null;this.sentinel=null;this.watcher=null;
  this.visibility=()=>{if(!this.active)return;if(document.visibilityState==='visible'){this.acquireWake();this.lastReroute=0;}else{this.releaseWake();this.speech?.cancel();}};
 }
 async start(destinationId){
  const capabilities=await this.fetcher('/capabilities.json').then(r=>r.json());
  if(!capabilities.navigationEnabled||!capabilities.approvedEntrances.includes(destinationId))throw Error('ENTRANCE_NOT_APPROVED');
  this.stop();this.destinationId=destinationId;this.active=true;document.addEventListener('visibilitychange',this.visibility);
  this.watcher=this.geolocation.watchPosition(p=>this.onPosition(p),()=>this.onState({status:'gps-error'}),{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  await this.acquireWake();
 }
 async acquireWake(){try{if(!this.active||document.visibilityState!=='visible'||this.sentinel)return;this.sentinel=await this.wake?.request('screen');if(!this.active){this.releaseWake();return;}this.onState({wake:!!this.sentinel});this.sentinel?.addEventListener('release',()=>{this.sentinel=null;this.onState({wake:false});});}catch{this.onState({wake:false});}}
 releaseWake(){const sentinel=this.sentinel;this.sentinel=null;sentinel?.release().catch(()=>{});}
 async onPosition(position){
  if(!this.active)return;const {longitude,latitude,accuracy}=position.coords;this.lastPosition=position;this.onState({accuracy});if(accuracy>50){this.onState({status:'gps-inaccurate'});return;}
  if(!this.points){await this.route(position);return;}
  const projected=nearestOnRoute([longitude,latitude],this.points,this.cumulative);if(!projected)return;
  this.fixes.push({accuracy,distance:projected.distance});this.fixes=this.fixes.slice(-3);
  if(shouldReroute(this.fixes,Date.now(),this.lastReroute)){await this.route(position);return;}
  const maneuver=getNextManeuver(this.maneuvers,projected.along,this.cumulative);this.onState({status:'active',maneuver,position:[longitude,latitude]});
  if(maneuver&&maneuver.index!==this.lastSpoken&&maneuver.distance<60){this.lastSpoken=maneuver.index;this.speak(maneuver.instruction);}
  if(haversine([longitude,latitude],this.points.at(-1))<20){this.onState({status:'arrived'});this.stop();}
 }
 async route(position){
  if(this.routing)return;this.routing=true;this.abort?.abort();this.abort=new AbortController();this.onState({status:'routing'});
  try{
   const res=await this.fetcher('/api/route',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({from:{lat:position.coords.latitude,lon:position.coords.longitude,accuracy:position.coords.accuracy,timestamp:position.timestamp},destinationId:this.destinationId,language:this.language}),signal:this.abort.signal});
   if(!res.ok)throw Error('ROUTE_UNAVAILABLE');const json=await res.json();if(!this.active)return;
   const leg=json.trip.legs[0];this.points=decodePolyline(leg.shape,6);this.cumulative=lengths(this.points);this.maneuvers=leg.maneuvers;this.lastReroute=Date.now();this.fixes=[];this.lastSpoken=-1;this.onGeometry(this.points);this.onState({status:'active',distance:json.trip.summary.length,time:json.trip.summary.time});
  }catch(error){if(error.name!=='AbortError')this.onState({status:'route-error'});}finally{this.routing=false;}
 }
 speak(text){if(!this.voiceEnabled||!this.speech)return;const voices=this.speech.getVoices();const voice=voices.find(v=>v.lang.startsWith(this.language.split('-')[0]));if(!voice){this.onState({status:'voice-unavailable'});return;}const utterance=new SpeechSynthesisUtterance(text);utterance.lang=this.language;utterance.voice=voice;this.speech.cancel();this.speech.speak(utterance);}
 async setLanguage(language){this.language=language;this.speech?.cancel();this.lastSpoken=-1;if(this.active&&this.lastPosition)await this.route(this.lastPosition);}
 stop(){this.active=false;if(this.watcher!==null)this.geolocation?.clearWatch(this.watcher);this.watcher=null;this.abort?.abort();this.speech?.cancel();this.releaseWake();document.removeEventListener('visibilitychange',this.visibility);this.points=null;this.maneuvers=[];this.fixes=[];}
}
