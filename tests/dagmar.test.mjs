import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {SpeechTimeline,mouthUnits,languageVoice,REST} from '../src/dagmar/speech.mjs';

test('Dagmar ships only audited CC0 source data and working skeletal motion tracks',()=>{
 const evidence=JSON.parse(fs.readFileSync('docs/dagmar-animation-sources.json'));
 const file=fs.readFileSync(evidence.output.path);
 assert.equal(evidence.license,'CC0-1.0');assert.equal(evidence.registrationRequired,false);assert.equal(evidence.paidContentUsed,false);
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),evidence.output.sha256);
 assert.equal(file.readUInt32LE(0),0x46546c67);assert.equal(file.readUInt32LE(8),file.length);
 const size=file.readUInt32LE(12),model=JSON.parse(file.subarray(20,20+size)),binary=file.subarray(28+size);
 assert.deepEqual(model.animations.map(a=>a.name).sort(),['idle','present','talk','walk']);
 assert(!model.buffers.some(b=>b.uri));assert(!model.images.some(i=>i.uri));
 const values=id=>{const a=model.accessors[id],v=model.bufferViews[a.bufferView],width={SCALAR:1,VEC3:3,VEC4:4}[a.type],result=[];assert(width);for(let n=0;n<a.count;n++)for(let k=0;k<width;k++)result.push(binary.readFloatLE((v.byteOffset||0)+(a.byteOffset||0)+n*(v.byteStride||width*4)+k*4));return result;};
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
