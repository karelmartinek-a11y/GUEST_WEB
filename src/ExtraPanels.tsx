import { useState, type ReactNode } from 'react';
import { Utensils, Footprints, Phone, ExternalLink, MapPin, TrainFront, Compass, ShoppingBag, Pill, Fuel, Bus, HeartHandshake } from 'lucide-react';
import { t, type Language } from './i18n';
import { te, type ExtraKey } from './extra-i18n';
import restaurantData from './content/restaurants.json';
import practical from './content/practical.json';
import faithData from './content/faith.json';
import { hotel } from './data';
import { bearing, kaaba } from './qibla.mjs';
import {TransitLine} from './TransitLine';

function Link({href,children,primary=false}:{href:string;children:ReactNode;primary?:boolean}) {
 return <a href={href} target="_blank" rel="noopener noreferrer" className={`button ${primary?'':'secondary'}`}>{children}<ExternalLink size={16}/></a>;
}
const routeUrl=(address:string,mode='walking')=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(hotel.address)}&destination=${encodeURIComponent(address)}&travelmode=${mode}`;
function weekday(language:Language, day:number) {
 return new Intl.DateTimeFormat(language,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,4+day)));
}
function Hours({language,hours}:{language:Language;hours:(string|number|null)[][]}) {
 return <ul className="opening-hours">{hours.map(([first,last,time],i)=><li key={i}><span>{weekday(language,Number(first))}{first!==last?`–${weekday(language,Number(last))}`:''}</span><strong>{time||te(language,'closed')}</strong></li>)}</ul>;
}
export function LocalServices({language}:{language:Language}) {
 const icons={pharmacy:Pill,supermarket:ShoppingBag,petrol:Fuel,busStop:Bus};
 return <section className="local-services"><div className="section-heading"><h2>{te(language,'localServices')}</h2></div><div className="service-grid">{practical.services.map(s=>{
 const Icon=icons[s.id as keyof typeof icons];
 return <article className="service-card local-card" key={s.id}><span className="service-icon"><Icon size={27}/></span><span className="eyebrow dark">{te(language,s.id as ExtraKey)}</span><h3>{s.name}</h3><p>{s.address}</p><span className="walk-badge"><Footprints size={16}/>≈ {s.walkingMeters} m · {s.walkingMinutes} min</span><p className="street-route">{te(language,'walkingVia')}<br/><strong>{s.streets.join(' → ')}</strong></p>{s.id==='busStop'&&<p>{te(language,'busWalk')}</p>}{s.id==='petrol'&&<p>{te(language,'nonstopHelp')}</p>}<Hours language={language} hours={s.openingHours}/><div className="button-row"><Link href={routeUrl(s.address)}>{te(language,'directions')}</Link><Link href={s.officialUrl}>{t(language,'official')}</Link>{s.phone&&<a className="text-button" href={`tel:${s.phone}`}><Phone size={16}/>{s.phone}</a>}</div><small className="metadata">{t(language,'updated')}: {s.verifiedOn}</small></article>;
 })}</div><p className="notice"><Footprints size={18}/>{te(language,'walkingEstimate')}</p></section>;
}
export function Restaurants({language}:{language:Language}) {
 const [open,setOpen]=useState<string|null>(null);
 return <><p className="section-intro">{te(language,'restaurantHint')}</p><div className="restaurant-list">{restaurantData.restaurants.map((r,i)=><article className={`restaurant-card ${open===r.id?'expanded':''}`} key={r.id}>
  <button className="restaurant-summary" onClick={()=>setOpen(open===r.id?null:r.id)} aria-expanded={open===r.id} aria-controls={`restaurant-${r.id}`}><span className="restaurant-number">0{i+1}</span><span><small>{te(language,r.cuisine==='czech-history'?'czech':r.cuisine as ExtraKey)}</small><h2>{r.name}</h2><span className="restaurant-address">{r.address}</span></span><span className="restaurant-distance"><Footprints size={19}/>{r.walkingMinutes} min<small>≈ {r.walkingMeters} m</small><span aria-hidden="true">{open===r.id?'−':'+'}</span></span></button>
  {open===r.id&&<div className="restaurant-detail" id={`restaurant-${r.id}`}><div><h3>{t(language,'hours')}</h3><Hours language={language} hours={r.openingHours}/><p className="metadata">{t(language,'updated')}: {r.verifiedOn}</p></div><div><h3>{te(language,'walkingVia')}</h3><p className="street-route">{r.streets.join(' → ')}</p>{r.note&&<p className="notice">{te(language,r.note==='inside'?'inside':'sideEntrance')}</p>}<small>{te(language,'historicalPrices')}: {r.historicalPrices}</small></div><div className="button-row"><Link href={routeUrl(r.address)} primary>{te(language,'directions')}</Link><Link href={r.officialUrl}>{te(language,'menu')}</Link><a className="button secondary" href={`tel:${r.phone}`}><Phone size={17}/>{r.phone}</a></div></div>}
 </article>)}</div><p className="notice"><Utensils size={18}/>{te(language,'walkingEstimate')} {t(language,'changeNotice')}</p></>;
}
export function Transport({language}:{language:Language}) {
 const towards=(station:string)=>`${te(language,'toward')} ${station}`;
 const line=(mode:'bus'|'metro'|'tram'|'trolleybus',number:string)=><TransitLine mode={mode} line={number} language={language}/>;
 const first=<li>{line('bus','126')} Brodského → Chodov <small>{towards('Chodov')}</small></li>;
 const journeys=[
  {key:'centre' as const,steps:<>{first}<li>{line('metro','C')} Chodov → Muzeum <small>{towards('Letňany')}</small></li><li>{line('metro','A')} Muzeum → Staroměstská <small>{towards('Nemocnice Motol')}</small></li></>},
  {key:'station' as const,steps:<>{first}<li>{line('metro','C')} Chodov → Hlavní nádraží <small>{towards('Letňany')}</small></li></>},
  {key:'airport' as const,steps:<>{first}<li>{line('metro','C')} Chodov → Muzeum <small>{towards('Letňany')}</small></li><li>{line('metro','A')} Muzeum → Nádraží Veleslavín <small>{towards('Nemocnice Motol')}</small></li><li>{line('trolleybus','59')} Nádraží Veleslavín → Terminál 1 / Terminál 2 <small>{towards('Letiště')}</small></li></>}
 ];
 return <><LocalServices language={language}/><div className="transport-itineraries">{journeys.map(j=><article className="service-card" key={j.key}><span className="service-icon"><TrainFront size={30}/></span><h2>{te(language,j.key)}</h2><ol className="transit-steps">{j.steps}</ol><Link href={practical.transit.planner} primary>{t(language,'connections')}</Link>{j.key==='airport'&&<Link href={practical.transit.airport}>{t(language,'official')}</Link>}</article>)}</div><p className="notice">{te(language,'transportNotice')}</p><div className="service-grid"><section className="service-card"><h2>{te(language,'ticketPlaces')}</h2><p>{te(language,'ticketHelp')}</p><div className="button-row"><Link href={practical.transit.tickets} primary>{t(language,'tickets')}</Link><Link href={practical.transit.ticketPlaces}>{te(language,'ticketPlaces')}</Link><Link href={practical.transit.ticketInstructions}>{t(language,'official')}</Link></div></section><section className="service-card"><h2>{te(language,'taxis')}</h2><div className="taxi-choices">{practical.transit.taxi.map(taxi=><div key={taxi.name}><Link href={taxi.url} primary>{taxi.name}</Link>{'phone'in taxi&&<a className="text-button" href={`tel:${taxi.phone}`}><Phone size={17}/>{taxi.phone}</a>}</div>)}</div><p>{hotel.address}</p></section><section className="service-card"><h2>{t(language,'tariff')}</h2><p>{t(language,'zones')}</p><Link href="https://pid.cz/jizdne-a-tarif/">{t(language,'tariff')}</Link></section></div></>;
}
export function Faith({language}:{language:Language}) {
 const [filter,setFilter]=useState('all');const [rotation,setRotation]=useState(0);
 const angle=bearing(hotel,kaaba);const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Prague'});
 return <><section className="qibla-card"><div><span className="eyebrow dark">QIBLA · HOTEL CHODOV ASC</span><h2>{te(language,'qibla')}</h2><p className="qibla-bearing">{new Intl.NumberFormat(language,{maximumFractionDigits:1}).format(angle)}°</p><p>{te(language,'qiblaHint')}</p><label className="compass-range">{te(language,'rotation')} · {rotation}°<input type="range" min="-180" max="180" value={rotation} onChange={e=>setRotation(Number(e.target.value))}/></label></div><div className="qibla-diagram" role="img" aria-label={`${te(language,'qibla')}: ${angle.toFixed(1)}°; ${te(language,'north')}`}><div className="compass-disc" style={{transform:`rotate(${rotation}deg)`}}><span className="compass-north">N<small>{te(language,'north')}</small></span><span className="compass-east">E</span><span className="compass-south">S</span><span className="compass-west">W</span><div className="qibla-arrow" style={{transform:`rotate(${angle}deg)`}}/><span className="compass-centre"/></div><Compass size={20} className="compass-symbol"/></div></section>
 <p className="notice"><HeartHandshake size={20}/>{te(language,'worshipNotice')}</p><div className="filter-chips"><button onClick={()=>setFilter('all')} className={filter==='all'?'active':''} aria-pressed={filter==='all'}>{t(language,'all')}</button>{faithData.places.map(p=><button key={p.id} onClick={()=>setFilter(p.id)} className={filter===p.id?'active':''} aria-pressed={filter===p.id}>{te(language,p.id as ExtraKey)}</button>)}</div>
 <div className="faith-grid">{faithData.places.filter(p=>filter==='all'||filter===p.id).map(p=><article className="service-card faith-card" key={p.id}><span className="eyebrow dark">{te(language,p.id as ExtraKey)}</span><h2>{p.name}</h2><p><MapPin size={16}/> {p.address}</p><ul className="worship-hours">{p.schedule.map((s,i)=><li key={i}><strong>{s.days.map(d=>weekday(language,d)).join(' · ')}</strong><span>{s.time}</span></li>)}{'datedSchedule'in p&&p.datedSchedule?.filter(s=>s.date>=today).map(s=><li key={s.date}><strong>{new Intl.DateTimeFormat(language,{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${s.date}T12:00:00Z`))}</strong><span>{s.time}</span></li>)}</ul>{p.id==='jewish'&&<p>{te(language,'shabbat')}</p>}{'arrangeVisit'in p&&p.arrangeVisit&&<p>{te(language,'registration')}</p>}<div className="button-row"><Link href={p.programme} primary>{te(language,'programme')}</Link><Link href={routeUrl(p.address,'transit')}>{t(language,'showMap')}</Link>{p.phone&&<a className="text-button" href={`tel:${p.phone}`}><Phone size={16}/>{p.phone}</a>}</div>{p.verifiedOn&&<small className="metadata">{t(language,'updated')}: {p.verifiedOn}</small>}</article>)}</div><section className="other-faith"><p>{te(language,'otherFaith')}</p><a className="button" href="tel:+420608877424"><Phone size={18}/>{t(language,'contact')}</a></section></>;
}
