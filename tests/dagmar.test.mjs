import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {SpeechTimeline,mouthUnits,languageVoice,REST} from '../src/dagmar/speech.mjs';

test('Dagmar ships a CC0 human, distinct native face shapes and licensed motion',async()=>{
 const evidence=JSON.parse(fs.readFileSync('docs/dagmar-animation-sources.json'));
 const file=fs.readFileSync(evidence.output.path);
 assert.equal(evidence.license,'CC0-1.0');assert.equal(evidence.registrationRequired,false);assert.equal(evidence.paidContentUsed,false);
 assert.equal(evidence.attribution,'MakeHuman Community assets and Mika Suominen facial targets');
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),evidence.output.sha256);
 assert.equal(file.readUInt32LE(0),0x46546c67);assert.equal(file.readUInt32LE(8),file.length);
 const size=file.readUInt32LE(12),model=JSON.parse(file.subarray(20,20+size)),binary=file.subarray(28+size);
 assert.deepEqual(model.animations.map(a=>a.name).sort(),['idle','present','talk','walk']);
 assert(!model.buffers.some(b=>b.uri));assert(!model.images.some(i=>i.uri));
 assert(model.asset.copyright.includes(evidence.attribution));
 for(const name of ['Dagmar-body.body','Dagmar-body.lips','Dagmar-eyes','Dagmar-body.teeth_base']){
  const material=model.materials.find(m=>m.name===name);assert(material,name);
  assert.equal(material.alphaMode||'OPAQUE','OPAQUE',name+' must occlude surfaces behind it');
 }
 for(const name of ['Dagmar-body.long01','Dagmar-body.eyebrow001','Dagmar-body.eyelashes01'])
  assert.equal(model.materials.find(m=>m.name===name)?.alphaMode,'MASK',name+' must retain strand alpha and depth writes');
 await MeshoptDecoder.ready;
 const decoded=new Map();
 const values=id=>{
  const a=model.accessors[id],v=model.bufferViews[a.bufferView],width={SCALAR:1,VEC3:3,VEC4:4}[a.type],result=[];assert(width);
  const compression=v.extensions?.EXT_meshopt_compression;
  let data=binary,offset=v.byteOffset||0;
  if(compression){
   if(!decoded.has(a.bufferView)){
    const dest=new Uint8Array(compression.count*compression.byteStride);
    MeshoptDecoder.decodeGltfBuffer(dest,compression.count,compression.byteStride,binary.subarray(compression.byteOffset,compression.byteOffset+compression.byteLength),compression.mode,compression.filter);
    decoded.set(a.bufferView,Buffer.from(dest));
   }
   data=decoded.get(a.bufferView);offset=0;
  }
  const componentBytes={5120:1,5121:1,5122:2,5123:2,5126:4}[a.componentType];assert(componentBytes);
  for(let n=0;n<a.count;n++)for(let k=0;k<width;k++){
   const i=offset+(a.byteOffset||0)+n*(v.byteStride||width*componentBytes)+k*componentBytes;
   let value=a.componentType===5126?data.readFloatLE(i):a.componentType===5122?data.readInt16LE(i):a.componentType===5123?data.readUInt16LE(i):a.componentType===5120?data.readInt8(i):data.readUInt8(i);
   if(a.normalized)value/=a.componentType===5122?32767:a.componentType===5123?65535:a.componentType===5120?127:255;
   result.push(value);
  }
  return result;
 };
 const headNode=model.nodes.find(n=>n.name==='Dagmar-body');assert(headNode);
 const head=model.meshes[headNode.mesh],names=head.extras.targetNames;
 const poses=['open','round','wide','press','blink','smile','brow'].map(name=>{
  const index=names.indexOf(name);assert(index>=0,name);
  const coordinates=values(head.primitives[0].targets[index].POSITION);
  assert(coordinates.some(v=>Math.abs(v)>.00001),name+' must deform the native face');
  return crypto.createHash('sha256').update(JSON.stringify(coordinates)).digest('hex');
 });
 assert.equal(new Set(poses).size,poses.length);
 const lashes=model.meshes[model.nodes.find(n=>n.name==='Dagmar-eyelashes01').mesh];
 assert(lashes.extras.targetNames.includes('blink'),'eyelashes follow the authored eyelids');
 for(const name of ['walk','talk']) {
  const clip=model.animations.find(a=>a.name===name);
  for(const joint of name==='walk'?['thigh_l','calf_l','foot_l']:['upperarm_l','lowerarm_l']) {
   const channel=clip.channels.find(c=>c.target.path==='rotation'&&model.nodes[c.target.node].name===joint);assert(channel,`${name}/${joint}`);
   const sampler=clip.samplers[channel.sampler],times=values(sampler.input),quaternions=values(sampler.output);
   assert(times.length>20);assert(times.at(-1)>1);assert(times.every((t,i)=>Number.isFinite(t)&&(i===0||t>times[i-1])));
   let movement=0;for(let i=4;i<quaternions.length;i++)movement=Math.max(movement,Math.abs(quaternions[i]-quaternions[i%4]));assert(movement>.01,`${name}/${joint} must really move`);
   for(let i=0;i<quaternions.length;i+=4)assert(Math.abs(Math.hypot(...quaternions.slice(i,i+4))-1)<.002);
  }
 }
});
test('speech waits for actual start, uses distinct lip shapes, reanchors and stops cleanly',()=>{
 const speech=new SpeechTimeline();speech.prepare('máma pije vodu','cs');assert.deepEqual(speech.sample(100),REST);
 speech.begin(100);assert.equal(speech.sample(100).press,1);
 const vowel=speech.sample(100.06);assert(vowel.open>.7);
 speech.boundary(5,105);assert.equal(speech.sample(105).press,1);
 speech.paused=true;assert.deepEqual(speech.sample(110),REST);
 speech.stop();speech.boundary(0,120);assert.deepEqual(speech.sample(120),REST);
});
test('phonetic mouth poses handle native scripts and preserve UTF-16 boundary offsets',()=>{
 for(const [language,text]of [['cs','a e i o u m'],['en','a e i o u m'],['de','ä ö ü m'],['it','a e i o u m'],['pl','a e i o u m'],['nl','a e i o u m'],['fr','à é i o u m'],['es','a e i o u m'],['uk','а е і о у м'],['hi','आ ए इ ओ उ म'],['bn','আ এ ই ও উ ম'],['ko','가 거 고 구 기']]) {
  const units=mouthUnits(text,language);assert(units.length);assert(new Set(units.filter(u=>u.shape.open).map(u=>JSON.stringify(u.shape))).size>=3,language);
  assert(units.every(u=>Object.values(u.shape).every(v=>v>=0&&v<=1)));
 }
 const units=mouthUnits('a🙂m','en');assert.equal(units[2].index,3);
});
test('missing language voice fails closed and an available local voice is preferred',()=>{
 const voices=[{lang:'en-US',name:'English',localService:true},{lang:'cs-CZ',name:'Remote',localService:false},{lang:'cs-CZ',name:'Zuzana',localService:true}];
 assert.equal(languageVoice(voices,'cs').name,'Zuzana');assert.equal(languageVoice(voices,'bn'),null);
});
