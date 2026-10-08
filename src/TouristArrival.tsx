import {Footprints,ExternalLink} from 'lucide-react';
import {TransitLine,type TransitMode} from './TransitLine';
import {te} from './extra-i18n';
import {t,type Language} from './i18n';
type Stage={mode:TransitMode;line:string;from:string;to:string};
const base:Stage={mode:'bus',line:'126',from:'Brodského',to:'Chodov'};
const metro=(line:string,to:string):Stage=>({mode:'metro',line,from:line==='C'?'Chodov':'Muzeum',to});
const oldTown:Stage[]=[base,metro('C','Muzeum'),metro('A','Staroměstská')];
const lesserTown:Stage[]=[base,metro('C','Muzeum'),metro('A','Malostranská')];
const republic:Stage[]=[base,metro('C','Florenc'),{mode:'metro',line:'B',from:'Florenc',to:'Náměstí Republiky'}];
const journeys:Record<string,Stage[]>={
 'prazsky-hrad':[...lesserTown,{mode:'tram',line:'22',from:'Malostranská',to:'Pražský hrad'}],
 'karluv-most':oldTown,'staromestska-radnice':oldTown,'staromestske-namesti':oldTown,'staromestska-mostecka-vez':oldTown,'josefov':oldTown,'klementinum':oldTown,
 'petrinska-rozhledna':[base,metro('C','I. P. Pavlova'),{mode:'tram',line:'22',from:'I. P. Pavlova',to:'Újezd'}],
 'zoo-praha':[base,metro('C','Nádraží Holešovice'),{mode:'bus',line:'112',from:'Nádraží Holešovice',to:'Zoo Praha – Troja'}],
 'vysehrad':[base,metro('C','Vyšehrad')],
 'narodni-muzeum':[base,metro('C','Muzeum')],'vaclavske-namesti':[base,metro('C','Muzeum')],
 'prasna-brana':republic,'obecni-dum':republic,
 'tancici-dum':[base,metro('C','Florenc'),{mode:'metro',line:'B',from:'Florenc',to:'Karlovo náměstí'}],
 'lennonova-zed':lesserTown,'sv-mikulas-mala-strana':lesserTown,
 'strahovsky-klaster':[...lesserTown,{mode:'tram',line:'22',from:'Malostranská',to:'Pohořelec'}],
 'narodni-divadlo':[base,metro('C','I. P. Pavlova'),{mode:'tram',line:'22',from:'I. P. Pavlova',to:'Národní divadlo'}]
};
export function ArrivalFromHotel({id,language}:{id:string;language:Language}){
 const stages=journeys[id];if(!stages)return null;
 return <section className="tourist-arrival"><h3>{te(language,'arrival')}</h3><p className="walk-to-bus"><Footprints size={19}/>{te(language,'walkingStage')} · Hotel CHODOV ASC → Brodského</p><ol className="transit-steps">{stages.map((s,i)=><li key={i}><TransitLine language={language} mode={s.mode} line={s.line}/><span>{s.from} → {s.to}</span></li>)}</ol><p className="walk-to-bus"><Footprints size={19}/>{te(language,'walkingStage')} → {t(language,'location')}</p><p className="notice">{te(language,'transportNotice')}</p><a className="button secondary" href="https://pid.idos.cz/pid/spojeni/conn.aspx" target="_blank" rel="noopener noreferrer">{t(language,'connections')}<ExternalLink size={16}/></a></section>;
}
