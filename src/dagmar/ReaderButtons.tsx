import {useEffect,useState} from 'react';
import {Volume2,Pause,Play,Square} from 'lucide-react';
import {readerText} from './reader-ui';
import {t,type Language} from '../i18n';
export function ReaderButtons({language}:{language:Language}){
 const [status,setStatus]=useState('idle');
 useEffect(()=>{const change=(e:Event)=>setStatus((e as CustomEvent<string>).detail);window.addEventListener('guest-reader-status',change);return()=>window.removeEventListener('guest-reader-status',change);},[]);
 const command=(detail:string)=>window.dispatchEvent(new CustomEvent('guest-reader-command',{detail}));
 return <div className="reader-controls"><button className="button secondary" onClick={()=>command('start')}><Volume2 size={17}/>{readerText(language,0)}</button>{['playing','paused'].includes(status)&&<button className="button secondary" onClick={()=>command('toggle')}>{status==='playing'?<Pause size={17}/>:<Play size={17}/>}<span>{readerText(language,status==='playing'?1:2)}</span></button>}{['playing','paused','loading'].includes(status)&&<button className="button secondary" onClick={()=>command('stop')}><Square size={16}/>{t(language,'mute')}</button>}<p role="status">{readerText(language,status==='loading'?3:status==='error'?5:4)}</p></div>;
}
