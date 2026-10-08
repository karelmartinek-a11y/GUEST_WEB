import {BusFront,TrainFront,TramFront} from 'lucide-react';
import {te} from './extra-i18n';
import type {Language} from './i18n';
export type TransitMode='bus'|'metro'|'tram'|'trolleybus';
function TrolleyIcon(){return <svg className="transport-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 2h20M9 7l4-5M16 7l4-5"/><rect x="5" y="7" width="14" height="14" rx="3"/><path d="M5 15h14M9 7v8M15 7v8M7 21v2M17 21v2"/><circle cx="8" cy="18" r=".5"/><circle cx="16" cy="18" r=".5"/></svg>;}
export function TransitIcon({mode}:{mode:TransitMode}){
 const Icon=mode==='metro'?TrainFront:mode==='tram'?TramFront:BusFront;
 return mode==='trolleybus'?<TrolleyIcon/>:<Icon className="transport-icon" size={21} aria-hidden="true"/>;
}
export function TransitLine({mode,line,language}:{mode:TransitMode;line:string;language:Language}){
 return <span className={`transit-line ${mode} ${mode==='metro'?line.toLowerCase():''}`} data-mode={mode} aria-label={`${te(language,mode)} ${line}`} title={te(language,mode)}><TransitIcon mode={mode}/><span><small>{te(language,mode)}</small><strong>{line}</strong></span></span>;
}
