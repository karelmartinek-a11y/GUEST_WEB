# Akceptace GUEST_WEB

Datum: 9. 10. 2026. Všechny výsledky se vztahují pouze k výslovně uvedené vrstvě. Automatické testy nejsou chůzí s fyzickým telefonem.

| Oblast | Stav | Důkaz / omezení |
|---|---|---|
| Úplný původní obsah a rozšíření, 36 míst / 10 kolem hotelu / 26 Praha | Implementováno | Všech 29 původních ID zachováno, sedm doplnění z turistických letáků |
| Pět výletů | Implementováno | Reálná doporučená zastavení; bez smyšlených vzdáleností |
| Filmové galerie | Implementováno | 116 místních fotografií, 2–5 na místo; manifest, SHA-256 |
| UNESCO a dopravní ikony | Implementováno | Oficiální nezměněný emblém, filtr 21 cílů Historického centra + Průhonický park; bus/metro/tram/trolejbus |
| Autentické logo a původní Dagmar | Implementováno | Dodané PNG + nový obrázek; žádná kopie seriálové postavy |
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
| Lokální typy, unit/HTTP, e2e, security audit | PASS lokálně | Typy, obsah, 10 unit/HTTP testů, všech 36 e2e desktop/mobil Chromium; audit uzamčených závislostí 0 vulnerabilities |
| HTTPS a produkční deploy | BLOCKED | V1.4 plná brána není splněná; omezené statické vydání vyžaduje rozhodnutí uživatele |
| Ostatní weby a služby | PASS preflight | Dostupnost a konfigurace zdokumentovány; nic změněno |

**FULL PRODUCTION: BLOCKED.** To neznamená, že se smí bez dalšího zapnout navigace. Statické vydání může být veřejně použitelné při jejím vypnutí, pokud je výslovně schváleno.

## Doplnění fyzické akceptace

Pro každou platformu doložit pět konkrétních tras, datum, zařízení/prohlížeč, skutečný vstup a výsledky: přesná/nepřesná GPS, odmítnutí polohy, odbočky, manévry, odklon a přepočet, návrat po uspání, hlas ve zvoleném jazyce, Wake Lock a ukončení. Záznamy uložit do samostatných artefaktů bez osobních poloh hostů a odkázat z `docs/acceptance-evidence.json`.
