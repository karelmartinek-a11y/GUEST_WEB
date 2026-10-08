# GUEST_WEB · Dagmar, průvodkyně Prahou

Mobilní průvodce pro hosty Hotelu CHODOV ASC pro **https://guest.hcasc.cz**. Vlastní animovaná Dagmar se psem, filmové galerie, 36 míst, pět výletů, interaktivní mapa, osm restaurací, okolní služby, doprava a taxi, devět náboženských tradic s programy, směr Mekky, SOS a zdravotní karta. Uživatel 9. 10. 2026 schválil veřejné statické vydání a automatický deploy main s vypnutou vlastní živou navigací.

Obsah je v Git repozitáři. Web nemá účty, CMS, databázi hostů, analytiku ani sledovací cookies.

## Spuštění a ověření

Node.js 24 a npm:

```sh
npm ci
npm run dev
```

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Statický výstup je `dist/`. Build vytváří CS/EN/DE/IT/PL/NL/FR/KO/BN/HI/ES/UK URL, canonical/hreflang, sitemap, 404 a manifest commitu. Testy prohlížeče běží na desktopu a mobilním rozměru; simulace nejsou fyzické akceptační testy.

## Obsah a fotografie

- Původní zadání a prototypy jsou zachované. Autorita: `SPECIFIKACE_MASTER_v1.4.md`, doplněná přímými pokyny uživatele o Dagmar, 12 jazycích a bohatých galeriích.
- Katalog, hotel, zdraví a itineráře: `src/content/`. České vstupní JSON mají neměnná ID. Překlady jsou lokální soubory; nic se nepřekládá za běhu.
- 116 fotografií pro 36 míst, 2–5 snímků na místo: `public/media/photos/`. Autor, zdroj, licence, rozměry a SHA-256: `public/media/manifest.json`. API evidence: `docs/media-provenance/`.
- Všech 29 původních ID zůstává zachovaných; sedm dalších památek přidávají dodané turistické letáky. Katalog má 10 míst kolem hotelu a 26 míst v Praze. Přesné zdroje jsou v `docs/tourist-flyer-additions.json`.
- Filtr UNESCO a oficiální nezměněný emblém označují 21 cílů v Historickém centru Prahy a Průhonický park. Jde o dvě části zápisu 616bis, nikoli o 22 samostatných zápisů. Podrobnosti a oficiální zdroj jsou u každého označeného místa.
- Hotelový bod na mapě zobrazuje místní fotografii budovy z dodané knihy pro hosty; fotografie a emblém mají samostatné záznamy původu v `public/media/`. Všechny zobrazené kódy dopravních linek mají ikonu a název druhu dopravy; letištní 59 je trolejbus.
- Oficiální PNG logo je z dodaného balíčku. Dagmar je původní generovaná postava. Viz `LICENSES.md`.
- Vlastní PMTiles mapa Prahy: `public/maps/prague.pmtiles`, OSM/Protomaps, výřez 14.22–14.72 E / 49.92–50.25 N, zoom 0–15. Fonty a mapové knihovny se obsluhují místně.

## Navigace a akceptace

Přesný vstup do hotelu a fyzické chůze nejsou doložené. **Živá pěší navigace je zablokovaná**, nepoužívá orientační středy objektů jako schválené vstupy. Mapa, GPS pro orientaci, katalog, galerie, výlety, PID a zdravotní pomoc jsou samostatně použitelné.

`infra/routing.mjs` je pouze omezený vlastní proxy pro Valhalla, naslouchající na loopbacku. Vyžaduje čerstvou přesnou GPS, schválené ID vstupu, same-origin POST a pedestrian costing; má velikostní a rychlostní limity a neukládá polohu. `src/navigation.mjs` poskytuje trasování, manévry, přepočet po třech dobrých měřeních, lokalizovaný hlas a uvolňovaný Screen Wake Lock. Úplné zapojení do provozu čeká na fyzickou akceptaci. Nepoužívá veřejný demo router.

Samostatné Actions `navigation-data.yml` sestavují Valhalla grafy na GitHubu. Sestavení a syntetické pěší trasy vlastního enginu ve třech jazycích prošly; hash a omezení dokládá `docs/navigation-build-evidence.json`. Produkční stroj nesestavuje mapy. Nasazení routeru vyžaduje přepsání cesty v konfiguraci, samostatné spuštění, ověření všech jazyků navigačních pokynů a přijetí fyzických bran.

Rozlišení automatických a reálných testů je v `ACCEPTANCE.md` a `docs/acceptance-evidence.json`. Plná fyzická akceptace navigace je dosud BLOCKED. Výslovné schválení statického vydání je zaznamenané; produkční brána tento profil povoluje pouze s navigací vypnutou.

## GitHub → produkce

Veřejný repozitář: https://github.com/karelmartinek-a11y/GUEST_WEB

Každý push na `main` spouští validaci obsahu/licencí, typovou kontrolu, audit závislostí, jednotkové a HTTP testy, statický build a Playwright. Deploy používá **tentýž otestovaný artifact** s SHA commitu; neprovádí druhý build na serveru.

Vyhrazený SSH klíč v GitHub Secrets `GUEST_WEB_SSH_KEY` a ověřený serverový klíč `GUEST_WEB_KNOWN_HOSTS`. SSH credential dovoluje pouze `deploy <SHA>`; účet nemá sudo ani oprávnění měnit ostatní projekty. Receiver a SSH konfigurace jsou spravované rootem. Hodnoty klíčů do repozitáře nepatří.

Izolované cesty: `/opt/guest-web/releases/<SHA>/www`, atomický symlink `/opt/guest-web/current`, vlastní vhost `guest.hcasc.cz`, vlastní certifikát. Každé nasazení kontroluje SHA veřejného runtime, hashe ostatních vhostů a jejich dostupnost; při chybě vrací jen vlastní symlink. Access log nového webu je vypnutý. Postup a aktuální důkazy jsou v `DEPLOYMENT_REPORT.md`.

## Změna obsahu

Upravte příslušné soubory `src/content/`, fotografie a jejich evidenci, ověřte web a commitněte na `main`. Překlady EN/DE jsou redakčně upravené; další jazyky mají lokálně vytvořený úplný strojový překlad, ručně upravené důležité ovládání a zdravotní věty. Zbývá rodilá jazyková korektura delších textů, zejména BN/HI/KO. Skript `scripts/translate-content.py` je pouze offline redakční pomůcka, není produkční závislost.

Podrobnosti povinného obsahu z letáků a aktuálních zdrojů jsou v `docs/content-additions.md`. Hotelová sekce obsahuje vlastní místně generovaný QR kód. Produkční job se spouští pouze pro main, po úspěšných kontrolách a s `GUEST_WEB_DEPLOY_ENABLED=true`. Statický profil uživatel schválil; přesné výsledky jeho skutečného nasazení jsou v `DEPLOYMENT_REPORT.md` a veřejném `release.json`.
