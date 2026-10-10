// Mouth shapes follow the utterance text and actual speech start/word events.
// Browser TTS does not expose audio or phoneme timestamps: within each word,
// durations are estimates, not claimed facial motion capture or exact lip sync.
export const REST = Object.freeze({open:0,round:0,wide:0,press:0});
const shapes = {
 a:{open:.90,round:0,wide:.12,press:0}, e:{open:.38,round:0,wide:.75,press:0},
 i:{open:.21,round:0,wide:.9,press:0}, o:{open:.62,round:.78,wide:0,press:0},
 u:{open:.24,round:1,wide:0,press:0}, closed:{open:0,round:0,wide:0,press:1},
 f:{open:.12,round:0,wide:.22,press:.15}, sh:{open:.24,round:.5,wide:0,press:0},
 l:{open:.30,round:0,wide:.12,press:0}, s:{open:.12,round:0,wide:.48,press:0},
 consonant:{open:.22,round:0,wide:.13,press:0}, rest:REST,
};

/** @param {string} text @param {string} language */
export function mouthUnits(text,language) {
 const chars=Array.from(text.normalize('NFC')),units=[];let offset=0;
 for(let i=0;i<chars.length;i++) {
  const original=chars[i],c=original.toLocaleLowerCase(language),pair=c+(chars[i+1]||'').toLocaleLowerCase(language);
  let key='consonant',weight=.65;
  if(/\s|[.,!?;:—–]/u.test(c)){key='rest';weight=/\s/u.test(c)?.4:1.9;}
  else if(/^[pbmбпмবপমবभपमब]$/u.test(c)){key='closed';weight=.6;}
  else if(/^[fvфвফভफव]$/u.test(c)){key='f';}
  else if(/^[aáàâäãåаअआअাাঅআ]$/u.test(c)){key='a';weight=1.1;}
  else if(/^[eéèêëěэеєएऐএেৈ]$/u.test(c)){key='e';weight=1;}
  else if(/^[iíìîïyýиіїыइईिीইঈিী]$/u.test(c)){key='i';weight=.85;}
  else if(/^[oóòôöõоओऔोৌওো]$/u.test(c)){key='o';weight=1.1;}
  else if(/^[uúùûüůуюऊउुूউঊুূ]$/u.test(c)){key='u';weight=1;}
  else if(/^[sšzžčцсзшщжчषशসশষ]$/u.test(c)||['sh','ch','sz','cz'].includes(pair)){key='sh';}
  else if(/^[lлলल]$/u.test(c)){key='l';}
  // Korean syllables carry the actual vowel, rather than all using one jaw pose.
  const cp=c.codePointAt(0);
  if(cp>=0xac00&&cp<=0xd7a3){const vowel=Math.floor((cp-0xac00)/28)%21;key=[0,1,2,3,4,5,6,7].includes(vowel)?'a':[8,9,10,11,12].includes(vowel)?'o':[13,14,15,16,17,18].includes(vowel)?'u':'i';weight=1.8;}
  if(language==='fr'&&['ou','oi'].includes(pair))key=pair==='ou'?'u':'o';
  if(language==='de'&&pair==='ei')key='a';
  if(pair==='ph')key='f';
  units.push({index:offset,end:offset+original.length,shape:shapes[key],weight});offset+=original.length;
 }
 return units;
}

export class SpeechTimeline {
 active=false;units=[];start=0;cursor=0;duration=.075;paused=false;
 /** @param {string} text @param {string} language */
 prepare(text,language){this.units=mouthUnits(text,language);this.active=false;this.cursor=0;}
 /** @param {number} now */
 begin(now){this.start=now;this.active=true;this.cursor=0;this.paused=false;}
 /** @param {number} charIndex @param {number} now */
 boundary(charIndex,now){if(!this.active)return;const index=this.units.findIndex(u=>u.end>charIndex);if(index>=0){this.cursor=index;this.start=now;}}
 stop(){this.active=false;this.paused=false;}
 /** @param {number} now */
 sample(now){
  if(!this.active||this.paused||!this.units.length)return REST;
  let elapsed=Math.max(0,now-this.start),index=this.cursor;
  while(index<this.units.length&&elapsed>this.units[index].weight*this.duration){elapsed-=this.units[index].weight*this.duration;index++;}
  if(index>=this.units.length)return REST;
  const current=this.units[index],next=this.units[index+1];
  const phase=elapsed/(current.weight*this.duration);
  // Anticipatory coarticulation: blend towards the following lip shape, but
  // preserve the central closure of /p/, /b/ and /m/ instead of a sine-wave jaw.
  const blend=phase>.62?(phase-.62)/.38:0;
  return Object.fromEntries(Object.keys(REST).map(k=>[k,current.shape[k]*(1-blend)+(next?.shape[k]||0)*blend]));
 }
}

/** @param {SpeechSynthesisVoice[]} voices @param {string} language */
export function languageVoice(voices,language){
 const matches=voices.filter(v=>v.lang.toLowerCase().split(/[-_]/)[0]===language);
 // Keep the existing preference for on-device speech. Within that pool,
 // basic voices often precede their downloaded enhanced variants.
 const local=matches.filter(v=>v.localService),pool=local.length?local:matches;
 const female=pool.filter(v=>/female|zuzana|samantha|anna/i.test(v.name));
 const quality=voice=>{
  const name=`${voice.name} ${voice.voiceURI||''}`;
  if(/premium/i.test(name))return 3;
  if(/enhanced|vylepšen|rozšířen/i.test(name))return 2;
  if(/neural|natural/i.test(name))return 1;
  if(/compact/i.test(name))return -1;
  return 0;
 };
 return (female.length?female:pool).reduce((best,voice)=>!best||quality(voice)>quality(best)?voice:best,null);
}
