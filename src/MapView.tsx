import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { Protocol } from 'pmtiles';
import { LocateFixed, Hotel, MapPin, Info } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { places, hotel, categories, placeText } from './data';
import { t, type Language, type UiKey } from './i18n';
let registered=false;
function register(){if(registered)return;maplibregl.setWorkerUrl(workerUrl);const protocol=new Protocol();maplibregl.addProtocol('pmtiles',protocol.tile);registered=true;}
function style(language:Language):maplibregl.StyleSpecification {
 const name=['coalesce',['get',`name:${language}`],['get','name']] as maplibregl.ExpressionSpecification;
 return {version:8,glyphs:`${location.origin}/maps/fonts/{fontstack}/{range}.pbf`,sources:{prague:{type:'vector',url:`pmtiles://${location.origin}/maps/prague.pmtiles`,attribution:'<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a> · <a href="https://protomaps.com" target="_blank" rel="noopener noreferrer">Protomaps</a> · Natural Earth'}},layers:[
  {id:'background',type:'background',paint:{'background-color':'#f2f0e8'}},
  {id:'earth',type:'fill',source:'prague','source-layer':'earth',paint:{'fill-color':'#f2f0e8'}},
  {id:'landcover',type:'fill',source:'prague','source-layer':'landcover',paint:{'fill-color':['match',['get','kind'],'forest','#dae2ce','wood','#dae2ce','grassland','#e4e7d7','#eeeddf'],'fill-opacity':.7}},
  {id:'landuse',type:'fill',source:'prague','source-layer':'landuse',paint:{'fill-color':['match',['get','kind'],'park','#d0dfc0','forest','#c9d9bb','nature_reserve','#d1dfc3','cemetery','#d9decc','garden','#d0dfc0','grass','#d8e1c9','#e8e6da'],'fill-opacity':.75}},
  {id:'water',type:'fill',source:'prague','source-layer':'water',paint:{'fill-color':'#a7ccd1'}},
  {id:'buildings',type:'fill',source:'prague','source-layer':'buildings',minzoom:13,paint:{'fill-color':'#dedacf','fill-outline-color':'#ccc8ba'}},
  {id:'road-outline',type:'line',source:'prague','source-layer':'roads',minzoom:9,paint:{'line-color':'#d5d1c5','line-width':['interpolate',['linear'],['zoom'],10,1,14,5,17,15]},layout:{'line-cap':'round','line-join':'round'}},
  {id:'roads',type:'line',source:'prague','source-layer':'roads',paint:{'line-color':['match',['get','kind'],'highway','#f9e4b1','major_road','#faf0d6','path','#ece5d2','minor_road','#fffdfa','#fffdfa'],'line-width':['interpolate',['linear'],['zoom'],10,.5,14,3.5,17,12]},layout:{'line-cap':'round','line-join':'round'}},
  {id:'road-names',type:'symbol',source:'prague','source-layer':'roads',minzoom:14,layout:{'symbol-placement':'line','text-field':name,'text-font':['Noto Sans Regular'],'text-size':12,'text-max-angle':35},paint:{'text-color':'#6e705f','text-halo-color':'#f6f5ee','text-halo-width':1.5}},
  {id:'place-names',type:'symbol',source:'prague','source-layer':'places',layout:{'text-field':name,'text-font':['Noto Sans Regular'],'text-size':['interpolate',['linear'],['zoom'],10,13,15,16],'text-max-width':7},paint:{'text-color':'#496044','text-halo-color':'#f6f5ee','text-halo-width':2}},
 ]};
}
export default function MapView({language,target,onPlace}:{language:Language;target:string|null;onPlace:(id:string)=>void}) {
 const container=useRef<HTMLDivElement>(null);const map=useRef<maplibregl.Map|null>(null);const markers=useRef<maplibregl.Marker[]>([]);const gpsMarker=useRef<maplibregl.Marker|null>(null);
 const [filter,setFilter]=useState('all');const [status,setStatus]=useState('');const [error,setError]=useState(false);const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  register();if(!container.current)return;let destroyed=false;
  const m=new maplibregl.Map({container:container.current,style:style(language),center:[hotel.lon,hotel.lat],zoom:12.3,maxBounds:[[14.22,49.92],[14.72,50.25]],maxZoom:18,minZoom:9,attributionControl:{compact:true},localIdeographFontFamily:'sans-serif'});
  m.addControl(new maplibregl.NavigationControl({showCompass:true}),'top-right');map.current=m;
  m.on('load',()=>{if(!destroyed){setLoaded(true);setError(false);}});
  m.on('error',e=>{if(!destroyed&&!e.error.message.includes('glyph'))setError(true);});
  return()=>{destroyed=true;m.remove();map.current=null;};
 },[]);
 useEffect(()=>{
  const m=map.current;if(!m||!loaded)return;
  markers.current.forEach(marker=>marker.remove());markers.current=[];
  const add=(id:string,lon:number,lat:number,name:string,hotelMarker=false)=>{
   const element=document.createElement('button');element.className=`map-marker ${hotelMarker?'hotel-marker':''}`;element.setAttribute('aria-label',name);
   if(hotelMarker){const image=document.createElement('img');image.src='/media/hotel-chodov-asc.jpg';image.alt='Hotel CHODOV ASC';image.width=96;image.height=64;const label=document.createElement('span');label.textContent='HOTEL CHODOV ASC';element.append(image,label);}else element.textContent='◆';
   const content=document.createElement('div');content.className='map-popup';const title=document.createElement('h3');title.textContent=name;content.append(title);
   if(hotelMarker){const image=document.createElement('img');image.src='/media/hotel-chodov-asc.jpg';image.alt='Hotel CHODOV ASC';image.className='hotel-popup-photo';content.prepend(image);}
   const button=document.createElement('button');button.textContent=t(language,hotelMarker?'hotel':'viewDetails');button.onclick=()=>onPlace(id);content.append(button);
   const popup=new maplibregl.Popup({offset:24,focusAfterOpen:true}).setDOMContent(content);
   const marker=new maplibregl.Marker({element,anchor:hotelMarker?'bottom':'center',offset:hotelMarker?[0,-7]:[0,0]}).setLngLat([lon,lat]).setPopup(popup).addTo(m);markers.current.push(marker);
  };
  add('hotel',hotel.lon,hotel.lat,t(language,'hotelPin'),true);
  places.filter(p=>filter==='all'||p.category===filter).forEach(p=>add(p.id,p.lon,p.lat,placeText(language,p.id).name));
  if(m.getLayer('road-names'))m.setLayoutProperty('road-names','text-field',['coalesce',['get',`name:${language}`],['get','name']]);
  if(m.getLayer('place-names'))m.setLayoutProperty('place-names','text-field',['coalesce',['get',`name:${language}`],['get','name']]);
 },[language,filter,loaded,onPlace]);
 useEffect(()=>{const m=map.current;if(!m||!loaded||!target)return;const p=target==='hotel'?hotel:places.find(p=>p.id===target);if(p)m.flyTo({center:[p.lon,p.lat],zoom:15,essential:false});},[target,loaded]);
 const locate=()=>{
  if(!navigator.geolocation){setStatus(t(language,'gpsUnavailable'));return;}
  if(!window.confirm(t(language,'gpsConsent')))return;
  navigator.geolocation.getCurrentPosition(position=>{
   const {longitude,latitude,accuracy}=position.coords;setStatus(`${t(language,'gpsAccuracy')}: ±${Math.round(accuracy)} m`);
   const m=map.current;if(!m)return;
   if(longitude<14.22||longitude>14.72||latitude<49.92||latitude>50.25){setStatus(t(language,'gpsDenied'));return;}
   gpsMarker.current?.remove();const el=document.createElement('div');el.className='map-marker gps-marker';el.setAttribute('aria-label',t(language,'gps'));
   gpsMarker.current=new maplibregl.Marker({element:el}).setLngLat([longitude,latitude]).addTo(m);m.flyTo({center:[longitude,latitude],zoom:15,essential:false});
  },()=>setStatus(t(language,'gpsDenied')),{enableHighAccuracy:true,timeout:15000,maximumAge:0});
 };
 return <div className="map-page"><div className="map-toolbar"><button className="button" onClick={locate}><LocateFixed size={18}/>{t(language,'gps')}</button><button className="button secondary" onClick={()=>map.current?.flyTo({center:[hotel.lon,hotel.lat],zoom:15,essential:false})}><Hotel size={18}/>{t(language,'returnHotel')}</button></div><div className="filter-chips" aria-label={t(language,'filterMap')}><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')} aria-pressed={filter==='all'}>{t(language,'all')}</button>{categories.map(c=><button key={c} className={filter===c?'active':''} onClick={()=>setFilter(c)} aria-pressed={filter===c}>{t(language,c)}</button>)}</div><div ref={container} className="map-canvas" role="region" aria-label={t(language,'map')}/>{!loaded&&!error&&<p className="map-status">{t(language,'mapLoading')}</p>}{error&&<p className="map-status" role="status">{t(language,'mapError')}</p>}{status&&<p className="map-status" role="status">{status}</p>}<p className="map-status">{t(language,'mapHelp')}</p><p className="notice"><Info size={18}/>{t(language,'walkingUnavailable')}</p></div>;
}
