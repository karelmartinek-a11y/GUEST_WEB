import {useEffect,useRef,useState} from 'react';
import type {Language} from '../i18n';
import {SpeechTimeline} from './speech.mjs';

type Catalog={language:string;entries:{text:string;ids:string[]}[];chunks:Record<string,string>};
export const normalize=(text:string)=>text.replace(/\s+/gu,' ').trim();
export function pageParts(catalog:Catalog,message:string){
 const dialog=document.querySelector<HTMLDialogElement>('dialog[open]');
 const root=dialog||document.querySelector('main');const texts=dialog?[]:[message];
 if(root){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){const el=node.parentElement;if(!el||el.closest('script,style,select,input,textarea,[hidden],[aria-hidden="true"],.sr-only,.print-card,.medical-notes,.selection-bar,.maplibregl-control-container,.maplibregl-canvas-container,.photo-credit,.credits-details,.reader-controls')||!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')continue;const text=normalize(node.textContent||'');if(text)texts.push(text);}
 }
 const ids:string[]=[];const seen=new Set<string>();
 for(const value of texts){const text=normalize(value);const entry=catalog.entries.find(e=>e.text===text);if(entry)for(const id of entry.ids)if(!seen.has(id)){ids.push(id);seen.add(id);}}
 const groups:{ids:string[];text:string}[]=[];for(const id of ids){const text=catalog.chunks[id],last=groups.at(-1);if(last&&Array.from(last.text+'\n'+text).length<=1000&&last.ids.length<40){last.ids.push(id);last.text+='\n'+text;}else groups.push({ids:[id],text});}return groups;
}

export function useCloudReader(language:Language,message:string,enabled:boolean,context:string,timeline:SpeechTimeline,onError:(value:boolean)=>void){
 const [catalog,setCatalog]=useState<Catalog|null>(null),[available,setAvailable]=useState<boolean|null>(null),[status,setStatus]=useState<'idle'|'loading'|'playing'|'paused'|'error'>('idle'),[replay,setReplay]=useState(0);
 const audio=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>{let disposed=false;setAvailable(null);setCatalog(null);fetch(`/speech/${language}.json`).then(r=>{if(!r.ok)throw Error();return r.json();}).then(value=>{if(!disposed){setCatalog(value);setAvailable(true);}}).catch(()=>{if(!disposed)setAvailable(false);});return()=>{disposed=true;};},[language]);
 useEffect(()=>{
  if(!enabled||!catalog){setStatus('idle');return;}
  let disposed=false,url='',index=0;const controller=new AbortController(),player=new Audio();audio.current=player;player.preload='auto';
  let groups:ReturnType<typeof pageParts>=[];setStatus('loading');onError(false);
  const blobs=new Map<number,Promise<Blob>>();
  const load=(i:number)=>{if(!blobs.has(i))blobs.set(i,fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,ids:groups[i].ids}),signal:controller.signal}).then(r=>{if(!r.ok)throw Error('VOICE_UNAVAILABLE');return r.blob();}));return blobs.get(i)!;};
  const next=async()=>{
   if(disposed)return;if(index>=groups.length){setStatus('idle');timeline.stop();return;}
   setStatus('loading');timeline.stop();
   try{const blob=await load(index);if(disposed)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);player.src=url;timeline.prepare(groups[index].text,language);try{if(document.hidden)setStatus('paused');else await player.play();}catch{if(!disposed)setStatus('paused');}
    if(index+1<groups.length)load(index+1).catch(()=>{});
   }catch{if(!disposed){setStatus('error');onError(true);timeline.stop();}}
  };
  player.onplay=()=>{if(disposed)return;setStatus('playing');timeline.begin(performance.now()/1000);};
  player.onpause=()=>{timeline.paused=true;};
  player.ontimeupdate=()=>{if(!disposed&&player.duration>0&&groups[index]){timeline.paused=player.paused;timeline.boundary(Math.floor(groups[index].text.length*player.currentTime/player.duration),performance.now()/1000);}};
  player.onended=()=>{index++;void next();};player.onerror=()=>{if(!disposed){setStatus('error');onError(true);timeline.stop();}};
  const hidden=()=>{if(document.hidden){player.pause();setStatus('paused');}};document.addEventListener('visibilitychange',hidden);
  const start=setTimeout(()=>{groups=pageParts(catalog,message);void next();},0);
  return()=>{disposed=true;clearTimeout(start);controller.abort();player.pause();player.removeAttribute('src');player.load();audio.current=null;if(url)URL.revokeObjectURL(url);document.removeEventListener('visibilitychange',hidden);timeline.stop();};
 },[catalog,language,message,enabled,context,replay,timeline,onError]);
 const toggle=()=>{const player=audio.current;if(!player)return;if(player.paused){player.play().catch(()=>{setStatus('error');onError(true);});}else{player.pause();setStatus('paused');}};
 useEffect(()=>{window.dispatchEvent(new CustomEvent('guest-reader-status',{detail:status}));},[status]);
 return {available,status,toggle,restart:()=>setReplay(n=>n+1)};
}
