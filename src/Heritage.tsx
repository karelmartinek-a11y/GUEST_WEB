import heritage from './content/heritage.json';
import {te} from './extra-i18n';
import type {Language} from './i18n';
export function heritagePart(id:string){
 if(heritage.historicCentre.includes(id))return 'pragueHeritage' as const;
 if(heritage.pruhonicePark.includes(id))return 'parkHeritage' as const;
 return null;
}
export function HeritageStamp({id,language}:{id:string;language:Language}){
 const part=heritagePart(id);if(!part)return null;
 return <span className="heritage-stamp" aria-label={`UNESCO · ${te(language,'worldHeritage')} · ${te(language,part)}`} title={te(language,part)}><img src="/media/unesco-official.svg" alt="UNESCO World Heritage" width="180" height="136"/><span>{te(language,'worldHeritage')}</span><small>1992</small></span>;
}
export function HeritageDetails({id,language}:{id:string;language:Language}){
 const part=heritagePart(id);if(!part)return null;
 return <aside className="heritage-details"><HeritageStamp id={id} language={language}/><div><h3>{te(language,part)}</h3><p>{te(language,'heritageHint')}</p><a href={heritage.source} target="_blank" rel="noopener noreferrer">{te(language,'heritageSource')} · 616bis ↗</a></div></aside>;
}
