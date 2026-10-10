# Akceptace GUEST_WEB

Datum: 9. 10. 2026. Všechny výsledky se vztahují pouze k výslovně uvedené vrstvě. Automatické testy nejsou chůzí s fyzickým telefonem.

| Oblast | Stav | Důkaz / omezení |
|---|---|---|
| Úplný původní obsah a rozšíření, 36 míst / 10 kolem hotelu / 26 Praha | Implementováno | Všech 29 původních ID zachováno, sedm doplnění z turistických letáků |
| Pět výletů | Implementováno | Reálná doporučená zastavení; bez smyšlených vzdáleností |
| Filmové galerie | Implementováno | 116 místních fotografií, 2–5 na místo; manifest, SHA-256 |
| UNESCO a dopravní ikony | Implementováno | Oficiální nezměněný emblém, filtr 21 cílů Historického centra + Průhonický park; bus/metro/tram/trolejbus |
| Autentické logo a asistentka | Implementováno | Dodané PNG; uživatelem schválená žena Microsoft Rocketbox Female_Adult_01, MIT |
| Kloubová 3D asistentka Dagmar | PASS lokálně | Schválená blond žena v růžové košili a džínách, Microsoft Rocketbox MIT bez registrace; nativní váhy, kostra, klidné postoje, otevřená dlaň, chůze na tlačítko. Licence a hashe `docs/dagmar-animation-sources.json`; 14 testů, 46 UI kontrol a skutečná vizuální kontrola v `docs/dagmar-rocketbox-verification-2026-10-10.json`. Předchozí automatické hodnocení MakeHuman nevystihovalo nevhodný postoj a uživatel jej odmítl. |
| Hlas a mimika Dagmar | PASS automaticky, fyzicky neověřeno | Události TTS a všech 12 jazyků ověřené simulací; rty uvnitř slov mají odhadnuté časování. Skutečné hlasy a zvuk na iPhone/Android dosud nedoložené; žádný náhradní cizí jazyk |
| Plovoucí a přesouvatelná Dagmar | PASS automaticky a vizuálně | Jediná pevná postava nad stránkou, přetažení myší/prstem, šipky na klávesnici, pozice v paměti během navigace/jazyka, ohraničení viewportem, rozbalovací ovládání a návrat fokusu |
| Omezení pohybu Dagmar | PASS lokálně | Systémové i ruční omezení používá statický render stejné Dagmar bez stažení 3D modelu. Mimo obrazovku se renderování pozastavuje |
| 12 jazyků ovládání a obsahu | Implementováno | Redakční CS/EN/DE, další jazyky offline přeložené; rodilá korektura zbývá |
| 15 dvojjazyčných symptomů, 155/112, FTN | Implementováno | Aktuální oficiální FTN ověření, ručně vytvořené symptomové překlady |
| A4 tisk / PDF | Implementováno | 12 PDF důkazů, každý 1 strana A4; vizuální kontrola včetně bengálštiny |
| Povinné letáky a okolní služby | Implementováno | Osm restaurací, lékárna, Albert, nonstop OMV, Brodského |
| Doprava a taxi | Implementováno | Centrum, hlavní nádraží, letiště; PID, Bolt/Uber/AAA |
| Víra a modlitba | Implementováno | Devět tradic, aktuální programy, datované židovské termíny, vypočtená qibla 135,9° |
| SOS čísla | PASS lokálně | 112/155/158/150/156, všechny jazyky, tel prokliky |
| Vlastní OSM / PMTiles / MapLibre | Implementováno | Pražský výřez, hotelový fotografický bod s proklikem, žádné externí dlaždice v prohlížeči |
| Vlastní Valhalla | PASS v CI, synteticky | Vlastní graf a engine 3.6.3, CS/EN/DE pěší trasy; `docs/navigation-build-evidence.json`; produkční runtime není aktivovaný |
| Živá navigace | BLOCKED | Nenastavena jako dostupná; orientační body nejsou schválené pěší vstupy |
| Hotelový pěší vstup + pět cílových vstupů | BLOCKED | Recepce / fyzické ověření nedoloženo |
| Pět chůzí na iPhone Safari | BLOCKED | Nelze nahradit simulací; žádný záznam nedoložen |
| Pět chůzí na Android Chrome | BLOCKED | Nelze nahradit simulací; žádný záznam nedoložen |
| FQDN a DNS | PASS | Uživatel schválil guest.hcasc.cz; A/AAAA odpovídají stroji |
| Lokální typy, unit/HTTP, e2e, security audit | PASS lokálně | Typy, obsah, 14 unit/HTTP testů, všech 44 e2e desktop/mobil Chromium; audit uzamčených závislostí 0 vulnerabilities |
| Omezené statické vydání | Schváleno uživatelem | 9. 10. 2026: „potvrzuji“, explicitně pro statický web a automatický deploy main s vypnutou živou navigací |
| HTTPS a produkční statický deploy | PASS v produkci | CI/deploy 37861768418, stejné veřejné SHA, vlastní platný certifikát, automatická obnova |
| Veřejné rozhraní a statické soubory | PASS v produkci | 36 prohlížečových průchodů, 120 jazykových cest, 116 JPEG, PMTiles 206, MIME workeru, 404, CSP a hash hotelu/emblému |
| Ostatní weby a služby | PASS před/po | Šest starších vhostů, původní certifikáty, HTTP stavy a pět služeb beze změny; `docs/production-preservation-2026-10-09.json` |

**FULL NAVIGATION ACCEPTANCE: BLOCKED. STATIC PRODUCTION: DEPLOYED AND VERIFIED.** Uživatel výslovně schválil statickou verzi a automatické nasazování dalších commitů na main při vypnuté živé navigaci. Toto rozhodnutí nenahrazuje fyzickou akceptaci navigace.

## Doplnění fyzické akceptace

Pro každou platformu doložit pět konkrétních tras, datum, zařízení/prohlížeč, skutečný vstup a výsledky: přesná/nepřesná GPS, odmítnutí polohy, odbočky, manévry, odklon a přepočet, návrat po uspání, hlas ve zvoleném jazyce, Wake Lock a ukončení. Záznamy uložit do samostatných artefaktů bez osobních poloh hostů a odkázat z `docs/acceptance-evidence.json`.
# Hlas OpenAI — 10. 10. 2026

Nová výslovně požadovaná hlasová služba je oddělená od pěší navigace. Čtení celé aktuální stránky / otevřeného detailu, pauza, pokračování, zastavení, přepnutí jazyka a odmítnutí libovolného textu jsou pokryté automatizovanými testy. Skutečné OpenAI generování MP3 uspělo pro CS/EN/DE/IT/PL/NL/FR/KO/BN/HI/ES/UK; česká ukázka byla předložena uživateli. Úspěšný API výstup sám nedokládá přirozenost ani správnost každého jazyka. Rodilý poslech, reálné iPhone/Android přehrávání a fonémově přesný pohyb úst zůstávají NEOVĚŘENO. Veškeré fyzické brány navigace zůstávají BLOCKED.
