import { TOURIST_CATALOG, HOTEL_ENTRY } from './data/places.js';
import { decodePolyline, haversine, lengths, nearestOnRoute, metersToText, getNextManeuver } from './logic.js';

const HOTEL = { ...HOTEL_ENTRY, id: 'hotel', cs: 'Hotel CHODOV ASC', en: 'Hotel CHODOV ASC', de: 'Hotel CHODOV ASC', emoji: '⌂' };
// Souřadnice hotelu jsou orientační souřadnice budovy, nikoli ověřený pěší vstup.
// Další body jsou pracovní výběr známých turistických lokalit. Před zveřejněním potvrdit konkrétní pěší vstupy.
const DESTINATIONS = TOURIST_CATALOG.places.map(p => ({ ...p, cs: p.name, en: p.name, de: p.name, emoji: p.area === 'okoli' ? '●' : '◆' }));
// Don't route visitors straight into a forest/lake or an undefined complex of gardens.
const UNSAFE_ROUTE_IDS = new Set(['kunraticky-les', 'hamersky-rybnik', 'zahrady-prazskeho-hradu']);
const LANG = {
  cs: { eyebrow: 'VÍTEJTE V PRAZE', headline: 'Praha na dosah.', lead: 'Objevujte město pěšky. Vyberte si místo a my vám ukážeme cestu.', destinations: 'Kam se vydáme?', selectionHint: 'Vyberte cíl', locate: '◎ Moje poloha', backHotel: '⌂ Zpět do hotelu', plan: 'Ukázat trasu', start: '▶ Spustit navigaci', next: 'DALŠÍ POKYN', voiceOn: '🔊 Hlas zapnutý', voiceOff: '🔇 Hlas vypnutý', stop: 'Ukončit', privacy: 'Poloha se používá jen se souhlasem a neukládá se jako historie pohybu.', background: 'Hlasové navádění vyžaduje otevřený web. Při zamčení telefonu se může zastavit.', pick: 'Vyberte cíl a zobrazte pěší trasu.', hotelStart: 'Plánováno od hotelu. Pro navigaci z aktuální polohy spusťte GPS.', meters: 'Délka', mins: 'Čas chůze', calculating: 'Počítám pěší trasu…', routeReady: 'Pěší trasa připravena.', gpsDenied: 'Poloha nebyla povolena. Trasu lze prohlížet od hotelu.', gpsError: 'Nedaří se určit polohu. Zkontrolujte GPS a oprávnění.', gpsWait: 'Čekám na GPS…', gpsImprecise: 'Nepřesná poloha. Pokyny mohou být opožděné.', wakeOn: '☀️ Displej zůstává rozsvícený, dokud to telefon dovolí.', wakeOff: 'Displej nelze automaticky udržet rozsvícený. Zkontrolujte nastavení telefonu.', wakeNo: 'Tento prohlížeč neumí zabránit zhasnutí displeje.', navActive: 'Navigace je aktivní. Ponechte tento web otevřený.', arrived: 'Jste na místě!', recalculating: 'Odchýlili jste se od trasy. Přepočítávám…', backgroundWarning: 'Web byl skrytý. Po návratu obnovuji polohu; navigace na pozadí není zaručena.', mapFailed: 'Mapu se nepodařilo načíst. Zkontrolujte připojení.', routingFailed: 'Trasu nelze spočítat.', voiceUnavailable: 'Hlasové pokyny nejsou podporovány, zůstává text.', km: 'km', min: 'min' },
  en: { eyebrow: 'WELCOME TO PRAGUE', headline: 'Prague within reach.', lead: 'Explore the city on foot. Choose a place and we will show you the way.', destinations: 'Where to?', selectionHint: 'Choose a destination', locate: '◎ My location', backHotel: '⌂ Back to hotel', plan: 'Show walking route', start: '▶ Start navigation', next: 'NEXT INSTRUCTION', voiceOn: '🔊 Voice on', voiceOff: '🔇 Voice off', stop: 'Stop', privacy: 'Location is used only with permission, without storing location history.', background: 'Voice navigation requires this page to remain open. Locking your phone may interrupt it.', pick: 'Choose a destination and preview the route.', hotelStart: 'Starting from the hotel. Enable GPS for live navigation.', meters: 'Distance', mins: 'Walking time', calculating: 'Calculating walking route…', routeReady: 'Walking route ready.', gpsDenied: 'Location access denied. View directions from hotel instead.', gpsError: 'Cannot determine location. Check GPS and permissions.', gpsWait: 'Waiting for GPS…', gpsImprecise: 'Location is imprecise. Directions may be delayed.', wakeOn: '☀️ Screen stays awake while your device permits it.', wakeOff: 'Cannot keep screen awake. Check phone settings.', wakeNo: 'This browser cannot keep the screen awake.', navActive: 'Navigation running. Keep this page open.', arrived: 'You have arrived!', recalculating: 'Off route. Recalculating…', backgroundWarning: 'Page was hidden. Updating location; background navigation is not guaranteed.', mapFailed: 'Map could not be loaded. Check the connection.', routingFailed: 'Route could not be calculated.', voiceUnavailable: 'Voice not supported; text instructions remain.', km: 'km', min: 'min' },
  de: { eyebrow: 'WILLKOMMEN IN PRAG', headline: 'Prag ganz nah.', lead: 'Entdecken Sie die Stadt zu Fuß. Wählen Sie ein Ziel, wir zeigen Ihnen den Weg.', destinations: 'Wohin geht es?', selectionHint: 'Ziel auswählen', locate: '◎ Mein Standort', backHotel: '⌂ Zurück zum Hotel', plan: 'Fußweg anzeigen', start: '▶ Navigation starten', next: 'NÄCHSTER HINWEIS', voiceOn: '🔊 Stimme an', voiceOff: '🔇 Stimme aus', stop: 'Beenden', privacy: 'Der Standort wird nur mit Erlaubnis genutzt. Es wird kein Bewegungsprofil gespeichert.', background: 'Die Sprachnavigation erfordert eine geöffnete Webseite. Eine Bildschirmsperre kann sie unterbrechen.', pick: 'Wählen Sie ein Ziel und lassen Sie sich den Fußweg zeigen.', hotelStart: 'Start am Hotel. Für Live-Navigation GPS einschalten.', meters: 'Strecke', mins: 'Gehzeit', calculating: 'Fußweg wird berechnet…', routeReady: 'Fußweg bereit.', gpsDenied: 'Standort verweigert. Der Weg kann ab Hotel angezeigt werden.', gpsError: 'Standort nicht verfügbar. GPS und Berechtigungen prüfen.', gpsWait: 'Warte auf GPS…', gpsImprecise: 'Ungenauer Standort. Hinweise können verzögert sein.', wakeOn: '☀️ Display bleibt an, soweit das Gerät es erlaubt.', wakeOff: 'Display kann nicht wachgehalten werden. Bitte Einstellungen prüfen.', wakeNo: 'Dieser Browser kann das Display nicht wachhalten.', navActive: 'Navigation aktiv. Bitte diese Webseite geöffnet lassen.', arrived: 'Sie sind am Ziel!', recalculating: 'Route verlassen. Neuberechnung…', backgroundWarning: 'Webseite war im Hintergrund. Standort wird aktualisiert; Hintergrundnavigation nicht garantiert.', mapFailed: 'Karte konnte nicht geladen werden.', routingFailed: 'Route konnte nicht berechnet werden.', voiceUnavailable: 'Sprachausgabe nicht unterstützt; Text bleibt verfügbar.', km: 'km', min: 'Min.' }
};
const $ = id => document.getElementById(id);
let language = ['cs', 'en', 'de'].includes(navigator.language.slice(0, 2)) ? navigator.language.slice(0, 2) : 'en';
const tr = key => LANG[language][key] || key;
let selected = DESTINATIONS[0];
let map = null, currentMarker = null, markerById = new Map();
let position = null, accuracy = Infinity, route = null, navigating = false, watchId = null;
let voiceEnabled = true, wakeLock = null, lastSpoken = '', offRouteSamples = 0, rerouteAt = 0, routeGeneration = 0;
function setStatus(message, isError = false) { $('status').textContent = message; $('status').classList.toggle('error', isError); }
function locationPoint(p) { return [p.lon, p.lat]; }
function title(p) { return p[language] || p.cs; }
function langCode() { return ({ cs: 'cs-CZ', en: 'en-US', de: 'de-DE' })[language]; }
function updateLabels() {
  document.documentElement.lang = language; $('language').value = language;
  document.querySelectorAll('[data-t]').forEach(el => { const key = el.dataset.t; el.textContent = tr(key); });
  $('toggleVoice').textContent = tr(voiceEnabled ? 'voiceOn' : 'voiceOff');
  $('destinationName').textContent = title(selected);
  if (!route) $('routeSummary').textContent = tr('pick');
  renderPlaces();
  renderDetail();
  if (route) showSummary();
}
function renderPlaces() {
  $('places').replaceChildren();
  const query = ($('searchPlace')?.value || '').trim().toLocaleLowerCase();
  const category = $('categoryFilter')?.value || 'all';
  for (const p of DESTINATIONS.filter(p => (!query || p.name.toLocaleLowerCase().includes(query)) && (category === 'all' || p.area === category))) {
    const btn = document.createElement('button'); btn.className = `place${selected.id === p.id ? ' active' : ''}`;
    btn.type = 'button'; btn.setAttribute('aria-pressed', String(selected.id === p.id));
    const sym = document.createElement('span'); sym.className = 'emoji'; sym.textContent = p.emoji;
    const text = document.createElement('strong'); text.textContent = title(p);
    const label = document.createElement('small'); label.textContent = p.id === 'hotel' ? 'Hotel' : 'Praha';
    btn.append(sym, text, label);
    btn.addEventListener('click', () => choose(p)); $('places').append(btn);
  }
}
function renderDetail() {
  const root = $('placeDetail'); if (!root) return;
  const p = selected;
  if (p.id === 'hotel') {
    root.replaceChildren();
    const t = document.createElement('p'); t.textContent = 'Hotel CHODOV ASC · Mírového hnutí 2137/7 · +420 608 877 424'; root.append(t);
    return;
  }
  root.replaceChildren();
  const add = (tag,text,klass) => { const x = document.createElement(tag); x.textContent = text; if (klass) x.className=klass; root.append(x); return x; };
  add('h3',p.name);add('p', p.short);
  add('p',p.description);
  add('p','Otevírací doba: '+p.hours);
  add('p','Vstupné: '+p.admission);
  add('p','GPS: '+p.lat.toFixed(6)+', '+p.lon.toFixed(6)+' — '+p.coordinateNote,'smallnote');
  const links=document.createElement('div');links.className='poi-links';
  const off=document.createElement('a');off.href=p.officialUrl;off.rel='noopener noreferrer';off.target='_blank';off.textContent='Oficiální stránky ↗';links.append(off);
  const pid=document.createElement('a');pid.href='https://pid.idos.cz/pid/spojeni/conn.aspx';pid.rel='noopener noreferrer';pid.target='_blank';pid.textContent='Spojení PID ↗';links.append(pid);
  root.append(links);
  add('p','Otevírací doby a vstupné mohou být změněny. Ověřeno v podkladech k 8. 10. 2026.','smallnote');
  if(p.needsEntranceCoordinatesVerification) add('p','GPS označuje objekt nebo oblast, nikoli potvrzený vstup. Před ostrou pěší navigací ověřit bod vstupu.','smallnote');
}
function choose(p) {
  if (navigating) stopNavigation();
  selected = p; clearRoute(); updateLabels();
  $('plan').disabled = UNSAFE_ROUTE_IDS.has(p.id);
  if (UNSAFE_ROUTE_IDS.has(p.id)) setStatus('Pěší vstup do tohoto areálu ještě nebyl ověřen.');
  map?.flyTo({ center: locationPoint(p), zoom: 13, essential: true });
}
function clearRoute() {
  routeGeneration++; route = null; $('start').disabled = true; $('navDetails').hidden = true;
  if (map?.getSource('route')) map.getSource('route').setData({ type: 'FeatureCollection', features: [] });
}
function setupMap() {
  if (!window.maplibregl) { setStatus(tr('mapFailed'), true); return; }
  map = new maplibregl.Map({ container: 'map', style: 'https://tiles.openfreemap.org/styles/liberty', center: [14.45, 50.078], zoom: 10.7, attributionControl: false });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.on('load', () => {
    map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({ id: 'route-outline', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fefefe', 'line-width': 10 } });
    map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#007c9e', 'line-width': 6 } });
    const pips = [HOTEL, ...DESTINATIONS];
    for (const p of pips) {
      const root = document.createElement('button');
      root.className = 'pin'; root.type = 'button'; root.title = title(p);
      root.textContent = p.id === 'hotel' ? 'H' : '●';
      Object.assign(root.style, { color: '#fff', background: p.id === 'hotel' ? '#0d2b3c' : '#007c9e', border: '2px solid white', borderRadius: '50%', width: '30px', height: '30px', boxShadow: '0 2px 10px #1a334c44', cursor: 'pointer' });
      root.onclick = () => choose(p);
      markerById.set(p.id, new maplibregl.Marker({ element: root }).setLngLat(locationPoint(p)).addTo(map));
    }
  });
  map.on('error', () => { if (!map.loaded() && !map.isStyleLoaded()) setStatus(tr('mapFailed'), true); });
}
function showSummary() {
  if (!route) return;
  $('routeSummary').textContent = `${tr('meters')}: ${metersToText(route.summary.length * 1000, language)} · ${tr('mins')}: ${Math.round(route.summary.time / 60)} ${tr('min')}`;
}
function drawRoute(points) {
  if (!map?.getSource('route')) return;
  map.getSource('route').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: points } }] });
  const bounds = points.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(points[0], points[0]));
  map.fitBounds(bounds, { padding: 45, maxZoom: 16, duration: 800 });
}
async function planRoute(from = position ? { lat: position[1], lon: position[0] } : { lat: HOTEL.lat, lon: HOTEL.lon }, { silent = false } = {}) {
  if (UNSAFE_ROUTE_IDS.has(selected.id)) { setStatus('Není potvrzen bezpečný pěší vstup do areálu.'); return false; }
  const generation = ++routeGeneration;
  $('start').disabled = true;
  if (!silent) setStatus(tr('calculating'));
  try {
    const response = await fetch('/api/route', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ from, to: { lat: selected.lat, lon: selected.lon }, language: langCode() }) });
    const result = await response.json();
    if (generation !== routeGeneration) return false;
    if (!response.ok) throw new Error(result.error || tr('routingFailed'));
    const points = decodePolyline(result.shape);
    if (!Number.isFinite(result.summary?.length) || !Number.isFinite(result.summary?.time)) throw new Error(tr('routingFailed'));
    route = { ...result, points, cumulative: lengths(points) };
    drawRoute(points); showSummary(); $('start').disabled = navigating;
    if (!silent) setStatus(tr('routeReady') + (position ? '' : ` ${tr('hotelStart')}`));
    return true;
  } catch (e) { if (generation === routeGeneration) setStatus(e.message || tr('routingFailed'), true); return false; }
}
function updateMarker() {
  if (!map || !position) return;
  if (!currentMarker) {
    const dot = document.createElement('span');
    Object.assign(dot.style, { display: 'block', width: '19px', height: '19px', background: '#1476d7', border: '4px solid white', borderRadius: '50%', boxShadow: '0 0 0 6px #1476d725,0 2px 6px #2343' });
    currentMarker = new maplibregl.Marker({ element: dot }).setLngLat(position).addTo(map);
  } else currentMarker.setLngLat(position);
}
function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = langCode(); utterance.rate = 0.98;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase()) || voices.find(v => v.lang.slice(0, 2) === language);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
async function acquireWakeLock() {
  if (!navigating || document.visibilityState !== 'visible') return;
  if (!('wakeLock' in navigator)) { $('wakeStatus').textContent = tr('wakeNo'); return; }
  if (wakeLock && !wakeLock.released) return;
  try {
    const sentinel = await navigator.wakeLock.request('screen');
    if (!navigating) { await sentinel.release(); return; }
    wakeLock = sentinel; $('wakeStatus').textContent = tr('wakeOn');
    sentinel.addEventListener('release', () => { if (wakeLock === sentinel) { wakeLock = null; if (navigating) $('wakeStatus').textContent = tr('wakeOff'); } });
  } catch { $('wakeStatus').textContent = tr('wakeOff'); }
}
async function releaseWakeLock() { if (wakeLock) { const active = wakeLock; wakeLock = null; await active.release().catch(() => {}); } $('wakeStatus').textContent = ''; }
function onLocation(p) {
  position = [p.coords.longitude, p.coords.latitude]; accuracy = p.coords.accuracy; updateMarker();
  if (!navigating || !route) return;
  const match = nearestOnRoute(position, route.points, route.cumulative);
  if (!match) return;
  if (accuracy > 70) { setStatus(tr('gpsImprecise')); return; }
  if (match.distance > Math.max(45, accuracy * 1.5)) offRouteSamples++;
  else offRouteSamples = 0;
  if (offRouteSamples >= 3 && Date.now() - rerouteAt > 30_000) {
    offRouteSamples = 0; rerouteAt = Date.now(); setStatus(tr('recalculating'));
    planRoute({ lat: position[1], lon: position[0] }, { silent: true }).then(ok => { if (ok) setStatus(tr('navActive')); });
    return;
  }
  if (match.distance > Math.max(45, accuracy * 1.5)) return;
  const remaining = route.cumulative.at(-1) - match.along;
  if (remaining < Math.max(20, accuracy) && haversine(position, locationPoint(selected)) < Math.max(25, accuracy)) {
    speak(tr('arrived')); stopNavigation({ keepStatus: true }); setStatus(tr('arrived')); return;
  }
  const m = getNextManeuver(route.maneuvers, match.along, route.cumulative);
  if (m) {
    $('nextInstruction').textContent = m.instruction;
    $('nextDistance').textContent = metersToText(m.distance, language);
    const promptId = `${routeGeneration}:${m.index}`;
    if (m.distance < 90 && lastSpoken !== promptId) { speak(m.instruction); lastSpoken = promptId; }
  } else { $('nextInstruction').textContent = tr('arrived'); $('nextDistance').textContent = metersToText(remaining, language); }
}
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error(tr('gpsError')));
    navigator.geolocation.getCurrentPosition(p => { onLocation(p); resolve(p); }, reject, { enableHighAccuracy: true, timeout: 14000, maximumAge: 3000 });
  });
}
function onGeoError(err) { setStatus(err?.code === 1 ? tr('gpsDenied') : tr('gpsError'), true); }
async function startNavigation() {
  if (navigating) return;
  setStatus(tr('gpsWait'));
  if (voiceEnabled) speak(tr('gpsWait')); // prvotní hlasový výstup přímo po kliknutí
  try { await getLocation(); } catch (e) { onGeoError(e); return; }
  if (!position) { setStatus(tr('gpsError'), true); return; }
  // Vynucení aktuální trasy od skutečné GPS, i pokud náhled začal u hotelu.
  const ok = await planRoute({ lat: position[1], lon: position[0] }, { silent: true });
  if (!ok) return;
  navigating = true; lastSpoken = ''; offRouteSamples = 0;
  $('navDetails').hidden = false; $('start').disabled = true; $('plan').disabled = true;
  $('nextInstruction').textContent = route.maneuvers.find(m => m.begin_shape_index > 0)?.instruction || '—';
  $('nextDistance').textContent = '';
  // Hlas v prohlížeči může vyžadovat přímé uživatelské gesto; neslibovat na všech telefonech.
  if (voiceEnabled) speak(tr('navActive'));
  acquireWakeLock();
  watchId = navigator.geolocation.watchPosition(onLocation, onGeoError, { enableHighAccuracy: true, maximumAge: 2000, timeout: 18000 });
  setStatus(tr('navActive'));
  onLocation({ coords: { longitude: position[0], latitude: position[1], accuracy } });
}
function stopNavigation({ keepStatus = false } = {}) {
  navigating = false; routeGeneration++;
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null; $('navDetails').hidden = true; $('plan').disabled = false; $('start').disabled = !route;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  releaseWakeLock();
  if (!keepStatus) setStatus(tr('routeReady'));
}
$('language').addEventListener('change', async e => {
  language = e.target.value;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (navigating) stopNavigation();
  const hadRoute = Boolean(route); clearRoute(); updateLabels();
  if (hadRoute) await planRoute();
});
$('searchPlace')?.addEventListener('input', renderPlaces);
$('categoryFilter')?.addEventListener('change', renderPlaces);
$('plan').addEventListener('click', () => planRoute());
$('start').addEventListener('click', startNavigation);
$('stop').addEventListener('click', () => stopNavigation());
$('hotel').addEventListener('click', () => choose(HOTEL));
$('toggleVoice').addEventListener('click', () => { voiceEnabled = !voiceEnabled; $('toggleVoice').textContent = tr(voiceEnabled ? 'voiceOn' : 'voiceOff'); if (!voiceEnabled && 'speechSynthesis' in window) speechSynthesis.cancel(); else if (voiceEnabled) speak(tr('navActive')); });
$('locate').addEventListener('click', async () => {
  setStatus(tr('gpsWait'));
  try { await getLocation(); map?.flyTo({ center: position, zoom: 16, essential: true }); setStatus(tr('routeReady')); }
  catch (e) { onGeoError(e); }
});
document.addEventListener('visibilitychange', () => {
  if (!navigating) return;
  if (document.visibilityState === 'visible') {
    acquireWakeLock(); getLocation().catch(onGeoError);
    setStatus(tr('backgroundWarning'));
  } else { $('wakeStatus').textContent = tr('wakeOff'); }
});
window.addEventListener('pagehide', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); releaseWakeLock(); });
updateLabels(); setupMap();
