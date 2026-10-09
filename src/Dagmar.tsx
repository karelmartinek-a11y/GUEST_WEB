import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Footprints, Hand, Volume2, VolumeX } from 'lucide-react';
import { languages, t, type Language } from './i18n';
import { te } from './extra-i18n';
import { SpeechTimeline, languageVoice } from './dagmar/speech.mjs';
import type { Gesture } from './dagmar/Scene';
import './dagmar/styles.css';

const Scene=lazy(()=>import('./dagmar/Scene'));
type Props={language:Language;message:string;busy?:boolean;small?:boolean;reduced:boolean;voiceEnabled:boolean;onVoiceChange:(enabled:boolean)=>void;onVoiceError:(unavailable:boolean)=>void};

export function Dagmar({language,message,busy=false,small=false,reduced,voiceEnabled,onVoiceChange,onVoiceError}:Props) {
 const [ready,setReady]=useState(false),[request,setRequest]=useState<Gesture>({kind:'point',id:0});
 const timeline=useRef(new SpeechTimeline()),utterance=useRef<SpeechSynthesisUtterance|null>(null);
 useEffect(()=>{if(reduced)setReady(false);},[reduced]);
 useEffect(()=>{
  const motion=timeline.current;let disposed=false,waiting:ReturnType<typeof setTimeout>|undefined;
  motion.prepare(message,language);
  const synth='speechSynthesis'in window?window.speechSynthesis:null;
  const stop=()=>{utterance.current=null;motion.stop();synth?.cancel();};
  const speak=()=>{
   if(disposed||!voiceEnabled||document.hidden||!synth||utterance.current)return;
   const voice=languageVoice(synth.getVoices(),language);
   if(!voice){onVoiceError(true);return;}
   const value=new SpeechSynthesisUtterance(message);value.lang=languages.find(l=>l.code===language)!.speech;value.voice=voice;value.rate=.92;
   utterance.current=value;onVoiceError(false);
   value.onstart=()=>{if(utterance.current===value)motion.begin(performance.now()/1000);};
   value.onboundary=event=>{if(utterance.current===value)motion.boundary(event.charIndex,performance.now()/1000);};
   value.onpause=()=>{if(utterance.current===value)motion.paused=true;};
   value.onresume=()=>{if(utterance.current===value){motion.paused=false;motion.boundary(motion.units[motion.cursor]?.index||0,performance.now()/1000);}};
   value.onend=()=>{if(utterance.current===value){utterance.current=null;motion.stop();}};
   value.onerror=event=>{if(utterance.current===value){utterance.current=null;motion.stop();if(!['canceled','interrupted'].includes(event.error))onVoiceError(true);}};
   synth.speak(value);
  };
  const voicesChanged=()=>{if(waiting)clearTimeout(waiting);speak();};
  const hide=()=>{if(document.hidden)stop();};
  if(voiceEnabled) {
   if(!synth)onVoiceError(true);
   else if(synth.getVoices().length)speak();
   else{waiting=setTimeout(speak,900);synth.addEventListener('voiceschanged',voicesChanged);}
  }
  document.addEventListener('visibilitychange',hide);
  return()=>{disposed=true;if(waiting)clearTimeout(waiting);synth?.removeEventListener('voiceschanged',voicesChanged);document.removeEventListener('visibilitychange',hide);stop();};
 },[language,message,voiceEnabled,onVoiceError]);
 const gesture=(kind:Gesture['kind'])=>setRequest(r=>({kind,id:r.id+1}));
 useEffect(()=>{if(busy)gesture('point');},[busy]);
 return <div className={`dagmar articulated ${small?'small':''}`}>
  <div className={`dagmar-stage ${ready&&!reduced?'has-scene':''}`} role="img" aria-label={te(language,'dagmarDescription')}>
   <img className="dagmar-fallback" src="/media/dagmar.webp" alt="" width="640" height="960"/>
   {!reduced&&<Suspense fallback={null}><Scene reduced={reduced} request={request} timeline={timeline.current} onReady={setReady}/></Suspense>}
  </div>
  <div className="speech-bubble"><span className="concierge-label">DAGMAR <span>· {t(language,'concierge')}</span></span><p>{message}</p><span className="speech-spark" aria-hidden="true">✦</span>
   <div className="dagmar-actions">
    <button type="button" onClick={()=>onVoiceChange(!voiceEnabled)} aria-pressed={voiceEnabled} className="dagmar-voice">{voiceEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>{t(language,voiceEnabled?'mute':'sound')}</span></button>
    <button type="button" onClick={()=>{onVoiceChange(false);gesture('walk');}} disabled={reduced||!ready}><Footprints size={17}/><span>{te(language,'dagmarWalk')}</span></button>
    <button type="button" onClick={()=>{onVoiceChange(false);gesture('point');}} disabled={reduced||!ready}><Hand size={17}/><span>{te(language,'dagmarPoint')}</span></button>
   </div>
  </div>
 </div>;
}
