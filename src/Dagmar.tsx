import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { Footprints, Hand, Volume2, VolumeX, MessageCircle, X, Move, Accessibility } from 'lucide-react';
import { languages, t, type Language } from './i18n';
import { te } from './extra-i18n';
import { SpeechTimeline, languageVoice } from './dagmar/speech.mjs';
import type { Gesture } from './dagmar/Scene';
import './dagmar/styles.css';
import asset from './dagmar/asset.json';

const Scene=lazy(()=>import('./dagmar/Scene'));
type Props={language:Language;message:string;reduced:boolean;voiceEnabled:boolean;onVoiceChange:(enabled:boolean)=>void;onVoiceError:(unavailable:boolean)=>void;onMotionChange:()=>void};

export function Dagmar({language,message,reduced,voiceEnabled,onVoiceChange,onVoiceError,onMotionChange}:Props) {
 const [ready,setReady]=useState(false),[request,setRequest]=useState<Gesture>({kind:'point',id:0});
 const panelRef=useRef<HTMLDivElement>(null),[panelSize,setPanelSize]=useState(0);
 const floating=useRef<HTMLDivElement>(null),drag=useRef<{id:number;x:number;y:number;left:number;top:number;moved:boolean}|null>(null),suppressClick=useRef(false);
 const [position,setPosition]=useState<{x:number;y:number}|null>(null),[panel,setPanel]=useState(false),[viewport,setViewport]=useState({w:0,h:0});
 const clamp=(x:number,y:number)=>{
  const rect=floating.current?.getBoundingClientRect();const w=rect?.width||128,h=rect?.height||260;
  return {x:Math.min(Math.max(8,x),Math.max(8,innerWidth-w-8)),y:Math.min(Math.max(76,y),Math.max(76,innerHeight-h-88))};
 };
 useEffect(()=>{
  const resize=()=>{const rect=floating.current!.getBoundingClientRect();setViewport({w:innerWidth,h:innerHeight});setPosition(old=>clamp(old?.x??innerWidth-rect.width-16,old?.y??innerHeight-rect.height-96));};
  resize();window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
  return()=>{window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);};
 },[]);
 const startDrag=(event:PointerEvent<HTMLButtonElement>)=>{
  if(event.button!==0||!event.isPrimary)return;
  const rect=floating.current!.getBoundingClientRect();suppressClick.current=false;
  drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,moved:false};event.currentTarget.setPointerCapture(event.pointerId);
 };
 const moveDrag=(event:PointerEvent<HTMLButtonElement>)=>{
  const current=drag.current;if(!current||event.pointerId!==current.id)return;
  const dx=event.clientX-current.x,dy=event.clientY-current.y;
  if(Math.hypot(dx,dy)>5)current.moved=true;
  if(current.moved){suppressClick.current=true;setPosition(clamp(current.left+dx,current.top+dy));}
 };
 const endDrag=(event:PointerEvent<HTMLButtonElement>)=>{if(drag.current?.id===event.pointerId){drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}};
 const keyboardMove=(event:KeyboardEvent<HTMLButtonElement>)=>{
  const directions:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};const d=directions[event.key];if(!d)return;
  event.preventDefault();const rect=floating.current!.getBoundingClientRect(),step=event.shiftKey?30:10;setPosition(clamp(rect.left+d[0]*step,rect.top+d[1]*step));
 };
 useEffect(()=>{
  if(!panel||!panelRef.current)return;
  const element=panelRef.current,measure=()=>setPanelSize(element.getBoundingClientRect().height);measure();
  const observer=new ResizeObserver(measure);observer.observe(element);return()=>observer.disconnect();
 },[panel]);
 const closePanel=()=>{setPanel(false);floating.current?.querySelector<HTMLButtonElement>('.dagmar-toggle')?.focus();};
 const panelWidth=Math.min(350,Math.max(0,viewport.w-24)),panelHeight=Math.min(380,Math.max(160,viewport.h-180));
 const panelStyle={left:Math.max(12,Math.min((position?.x||0)-panelWidth-12,viewport.w-panelWidth-12)),top:Math.max(76,Math.min(viewport.w<600?(position?.y||76)-(panelSize||panelHeight)-12:position?.y||76,viewport.h-(panelSize||panelHeight)-88)),width:panelWidth,maxHeight:panelHeight};
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
 return <div ref={floating} className="dagmar articulated dagmar-floating" style={position?{left:position.x,top:position.y}:undefined}>
  <button type="button" className={`dagmar-stage ${ready&&!reduced?'has-scene':''}`} aria-label={te(language,'dagmarMove')} aria-description={te(language,'dagmarDescription')} aria-expanded={panel} aria-controls="dagmar-panel" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={keyboardMove} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}setPanel(open=>!open);}}>
   <img className="dagmar-fallback" src={asset.poster.url} alt="" width="640" height="960"/>
   {!reduced&&<Suspense fallback={null}><Scene reduced={reduced} request={request} timeline={timeline.current} onReady={setReady}/></Suspense>}
  </button>
  <button type="button" className="dagmar-toggle" onClick={()=>setPanel(open=>!open)} aria-expanded={panel} aria-controls="dagmar-panel" aria-label={te(language,'dagmarPanel')}><Move size={14} aria-hidden="true"/><span>Dagmar</span><MessageCircle size={17} aria-hidden="true"/></button>
  <div ref={panelRef} id="dagmar-panel" role="region" aria-label="Dagmar" className="speech-bubble" hidden={!panel} style={panelStyle} onKeyDown={event=>{if(event.key==='Escape')closePanel();}}><button className="dagmar-panel-close icon-button" aria-label={t(language,'close')} onClick={closePanel}><X size={18}/></button><span className="concierge-label">DAGMAR <span>· {t(language,'concierge')}</span></span><p>{message}</p><span className="speech-spark" aria-hidden="true">✦</span>
   <div className="dagmar-actions">
    <button type="button" onClick={()=>onVoiceChange(!voiceEnabled)} aria-pressed={voiceEnabled} className="dagmar-voice">{voiceEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>{t(language,voiceEnabled?'mute':'sound')}</span></button>
    <button type="button" onClick={()=>{onVoiceChange(false);gesture('walk');}} disabled={reduced||!ready}><Footprints size={17}/><span>{te(language,'dagmarWalk')}</span></button>
    <button type="button" onClick={()=>{onVoiceChange(false);gesture('point');}} disabled={reduced||!ready}><Hand size={17}/><span>{te(language,'dagmarPoint')}</span></button>
    <button type="button" onClick={onMotionChange} aria-pressed={reduced}><Accessibility size={17}/><span>{t(language,reduced?'motion':'reduced')}</span></button>
   </div>
  </div>
 </div>;
}
