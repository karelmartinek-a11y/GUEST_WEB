# Hotel CHODOV ASC – Webový průvodce Prahou (první spustitelný prototyp)

**Stav:** vývojový prototyp, nikoli nasazená ani provozně schválená navigace.
**Použití pro hosty:** až po dokončení vlastní mapové a routovací infrastruktury, bezpečnostních kontrol a fyzických testů navigace.

## Spuštění

Požadavek: **Node.js 20 nebo novější**, bez instalace npm balíčků.

```bash
cd hotel-chodov-pruvodce-web
DEMO_ROUTING=1 npm start
```

V prohlížeči otevřít `http://localhost:8787`. Lokální `localhost` umožňuje v běžném prohlížeči ověřit GPS a Screen Wake Lock, ale mobilní telefon musí testovat veřejně důvěryhodný **HTTPS** server. Pro běžný start bez DEMO_ROUTING routovací API vrátí 503, dokud není zapojen vlastní server.

Pro test s vlastním routovacím enginem Valhalla:

```bash
VALHALLA_BASE_URL=http://127.0.0.1:8002 npm start
```

`DEMO_ROUTING=1` používá **veřejný FOSSGIS demo server** pouze pro vývoj: `valhalla1.openstreetmap.de`. Podléhá fair use/rate-limitům a není určen pro komerční produkci. Server odesílá souřadnice cesty externímu poskytovateli. Při produkčním provozu nasadit vlastní Valhalla, nemít DEMO_ROUTING=1.

Mapový prototyp momentálně používá styly a dlaždice **OpenFreeMap** a knihovnu MapLibre z **unpkg CDN**. Jde o **vývojovou závislost**, nikoli splnění cíle vlastního hostingu. Před nasazením přepnout na hotelový styl + lokální PMTiles, a všechny statické knihovny servírovat z vlastního hostingu s bezpečnostní hlavičkou CSP.

## První dostupné chování

- Mobilní web, žádný obchod s aplikacemi ani povinná instalace.
- Praha na mapě, pět demonstračních turistických cílů a návrat do hotelu.
- Plánování pěší trasy z hotelu, nebo z GPS pokud již byla udělena.
- Backendový proxy endpoint `POST /api/route` pro Valhalla pěší trasování; serverový rate-limit.
- Geolokace `watchPosition`, pohybující se GPS bod, vzdálenost k dalšímu manévru, hlas Web Speech API, ČJ/AJ/NJ.
- Screen Wake Lock po zahájení navigace, pokus o opětovné získání po návratu do viditelné stránky a uvolnění při ukončení.
- Přepočet po třech kvalitních měřeních mimo trasu s ochranným intervalem.
- Stavové zprávy při odmítnutí polohy, nepřesném GPS a nemožnosti hlasu/wakelocku.

## Zásadní omezení

- Web nedokáže garantovat navigaci na pozadí ani při uzamčeném displeji.
- Screen Wake Lock je požadavek, nikoli bezpodmínečná garance; může být odmítnut nebo zrušen.
- Navigace není fyzicky otestována v pražských ulicích, přesnost a správnost konkrétních manévrů nejsou ověřené.
- Souřadnice hotelu představují orientační polohu budovy (`50.03996, 14.50541`), nikoliv ověřený pěší vchod. U všech pěti cílů musí redaktor ověřit umístění vhodného pěšího vstupu.
- Místa/katalog jsou pouze počáteční výběr, nikoli kompletních 20 míst/3 itineráře/admin rozhraní ze specifikace.
- Chybí produkční vlastní mapové podklady, infrastruktura Valhalla, plná bezpečnostní revize, provozní monitoring, redakční administrace a fotografie.
- Hlas Web Speech API může být závislý na lokálních hlasech a nastavení prohlížeče; nelze garantovat požadovaný hlas v každém mobilu.

## Testy

```bash
npm test
```

Obsahuje automatické testy validace tras, geometrie polyline, projekce na trasu, metrických vzdáleností a základních HTTP API kontrol. Úspěšný unit test neznamená hotovou navigaci.

## Povinné dokončení před publikováním QR pro hosty

1. Vlastní mapový server s PMTiles a lokálními statickými závislostmi, potřebné licence a atribuce.
2. Vlastní Valhalla pro Prahu a relevantní okolí, aktuální OSM data.
3. Potvrzení souřadnic skutečného **pěšího vchodu** hotelu a turistických vstupů.
4. Testy iPhone Safari + Android Chrome: GPS, hlas, Wake Lock, odbočky, nedostupnost signálu, přepočty, odchod/vrácení do prohlížeče, i při vypnuté obrazovce dle omezení platformy.
5. Admin katalog + překlady turistických informací, bezpečnostní a výkonový audit; HTTPS, CSP, provozní zálohy a monitoring.

## Architektura

Mobilní prohlížeč → Node hotelové API → vlastní Valhalla.
Mobilní prohlížeč → vlastní PMTiles mapový hosting (po produkčním přepnutí).
Polohové informace zůstávají v prohlížeči, kromě souřadnic pro samotný výpočet nové trasy na routovacím serveru; tento server nesmí polohová data dlouhodobě logovat.
