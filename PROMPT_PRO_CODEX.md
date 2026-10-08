# PROMPT PRO CODEX / AI GENERÁTOR — Hotel CHODOV ASC, Praha web

Úkol: **rovnou vygeneruj a otestuj** kompletní webového turistického průvodce Hotel CHODOV ASC z dodaného ZIP balíčku, a pokud projdou níže uvedené produkční brány, bezpečně jej nasadit na produkční server Kájovo pod samostatnou již DNS nasměrovanou doménou. Nepřipravuj pouze nový dlouhý prompt či alternativní SSOT; vytvoř skutečnou fungující aplikaci, obsah a testy. Úkol je pokračováním existujícího prototypu, nikoliv důvodem přepisovat další systémy.

## Absolutní zdroj pravdy
1. `SPECIFIKACE_MASTER_v1.4.md` — konečná autorita pro produkt i architekturu.
2. `podklady_v1.3/places.cs.json`, `hotel.json`, `routes.cs.json`, `health.cs.json` — konkrétní data.
3. `podklady_v1.3/ZADANI_A_OBSAH_v1.3.md` — rozsáhlý obsah, popisy, ceny, otevírací doby, zdroje.
4. `assets/logo-hotel-chodov-asc-original.png` — skutečné oficiální hotelové logo, a `assets/LOGO_ZDROJ.json` pro původ.
5. `podklady_v1.3/media-candidates.json` + `foto_licence.csv` — pouze kandidátní fotky, ověř jejich práva.
6. `vychozi_prototyp_v1.3/` — existující fungující ukázka navigačních a zdravotních obrazovek, ne finální produkt.
7. `specifikace_historie/` — historický kontext, v rozporu s v1.4 vždy prohrává.

## Nevyjednatelné vlastnosti
- Pouze veřejný statický web (HTML/CSS/JS či statický React build). Žádné účty, přihlášení, administrace, CMS, redakční backend, cookies požadující souhlas pro základní funkce, uživatelské profily ani DB pro POI. Obsah pouze z repozitáře.
- Bohatý obsah každé z 29 lokalit: fotografie, detailní popisy, skutečné oficiální URL, ceny a otevírací doby s datem ověření, přibližná návštěva, GPS s kvalitou bodu; pět výletů. Všechny tři jazykové verze CZ/EN/DE v hotovém vydání.
- MapLibre + vlastní licencovaný OSM/PMTiles podklad; GPS a pěší instrukce ve webu; vlastní Valhalla router izolovaně na serveru. Tato malá dynamická infrastruktura NESMÍ vytvářet obecný administrační backend a nesmí sloužit veřejně jako neomezené API.
- Přepočet po odchýlení; jazykově správné hlasové instrukce Web Speech; Screen Wake Lock jen při aktivní navigaci; bezpečný fallback; nepravdivě neslibuj hlas při zamčeném iPhonu.
- PID spojení = oficiální IDOS PID odkaz, jízdenky = oficiální PID Lítačka. V žádném případě nevyráběj falešné vyhledávání spojů či platební bránu.
- Samostatná zdravotní karta s FTN, 155/112, dospělí/děti/zuby, 15 symptomovými kartami a tiskem A4, zobrazí správně jazyk hosta a českou větu pro lékaře; žádné ukládání zdravotních údajů.
- Branding skutečným PNG logem, responzivní mobile-first, kontrast, přístupnost, fotografie právně čisté, OSM atribuce.

## Práce — proveď bez dalšího vyjednávání o detailech, které lze zjistit
**Fáze A: Inventura a preflight (READ-ONLY).** Prohlédni ZIP, validuj JSON, zdroje, stávající prototyp a otevřené licence. Na produkci zjisti (bez změn) server, Nginx konfiguraci, docker projekty/porty, rozdělení diskového prostoru a monitoring. Nalezni NOVÝ jednoznačný FQDN, o kterém uživatel říká, že DNS je nasměrován, podle důvěryhodných nasazovacích podkladů / DNS. Pokud není možné jediné jméno ověřit, vyžádej ho a označ nasazení BLOCKED; sám ho nevymýšlej. Ověř DNS A/AAAA a kolize s existujícími virtuálními hosty. Stroj byl 8.10. zjištěn cca 4 vCPU / 8GB RAM / 88% využití / 18.6GB volno; znovu změř. Přípravu Valhalla map dělej primárně mimo něj. Nesahej na jiné aplikace (zejména hotel.hcasc.cz, dagmar.hcasc.cz, HA, GPT/MCP/mail ani stávající Docker projekty).

**Fáze B: Implementace a obsah.** Vytvoř nové izolované Git repo/pracovní složku, obsah z podkladů převezmi v plném rozsahu. Udělej hlavní stránku, Kolem hotelu, Praha, filtry/hledání, detail místa, mapu, 5 okruhů, návrat do hotelu, MHD PID, informace hotel, Zdraví a nouze a 404. Tři úplné jazyky. Připoj pravé logo. Schvalitelné obrázky opatři attribution, ostatní NEPUBLIKUJ; v reportu konkretizuj nevyřešené fotky. Nezaváděj administraci ani DB turistických dat.

**Fáze C: Skutečná mapa/navigace.** Naprogramuj MapLibre, vlastní PMTiles mapové assets a styl, vlastní Valhalla pedestrian routing. Valhalla hostuj samostatně a omez počet výpočtů/rate, vstupy i logy. Z reálné GPS naviguj textem i hlasem; správné pořadí manévrů; udržuj displej pomocí Screen Wake Lock, pouze je-li podporován. V nouzi měň UI na volání, nikoliv pěší navigaci. Nepřipusť neověřené GPS jako validní pěší vstup. Externí stránky MHD/FTN používej jen po kliknutí.

**Fáze D: Testování.** Spusť jednotkové, integrační, e2e, responsivní a bezpečnostní testy; na iPhone Safari i Android Chrome otestuj živé GPS a hlas reálnou chůzí po pěti trasách, odbočky, nepřesnost, odchýlení, displej, uspání, návrat. Ověř obsah, všech 29 POI a hotel, 5 okruhů, 15 zdravotních karet, správné překlady, tlačítka tel:, ceny a datum revize, odkaz PID/Lítačka, foto licence a odkazy; proveď screenshoty klíčových obrazovek a ověř žádné přesahy. Nedělej fiktivní záznamy o fyzickém testování. Pokud není dostupné reálné zařízení, test ponech BLOCKED a nepředstírej produkční schválení.

**Fáze E: Bezpečné nasazení.** Teprve až FQDN, práva k fotkám, správné vstupy, mapy, testy a nezbytná kapacita projdou, nasad do izolovaného projektu. Nasad samostatný Nginx vhost pouze pro schválené FQDN (zachovej vše stávající), platné HTTPS/TLS, access log bez GPS/query stringů, pouze nezbytné hlavičky s `Permissions-Policy: geolocation=(self)` pro novou doménu, CSP přizpůsobená mapám, lokální dataset a atomický rollback. Router na lokálním bound portu / v container network bez externího publikování; static assets cache, index aktualizovatelný. Před/po spusť nginx -t, HTTP smoke, zkontroluj existující vhosty a služby. Pokud kontrola zjistí rozdíl, automaticky vrať JEN svůj nový release. Nikdy nemaž sdílené certifikáty, globální konfigurace, složky či kontejnery ostatních projektů.

**Fáze F: Report.** Uveď přesné soubory/commity, HTTP URL + certifikát (pokud nasazeno), stav každého testu, počet fotek a licencí, licenční evidence, DNS výsledek, reálné serverové vytížení, změny pouze vlastního vhostu, testy obnovy a otevřené blockery. Vytvoř `DEPLOYMENT_REPORT.md`, `ACCEPTANCE.md`, `LICENSES.md`, `CHANGELOG.md`, `README.md`, `.env.example` bez secrets, release script idempotentní a návratový skript jen pro novou službu.

## Pravidla kvality a bezpečnosti
- Nevytvářej nekonečné SSOT/kontraktní cykly; vydávej malé prověřené celky, na chybějícím skutečném zdroji se ZASTAV a napiš konkrétní blocker.
- Nezapisuj secrets do repozitáře a nevypisuj klíče/citlivé údaje do výstupů; žádný nepřímý sběr GPS.
- Neprováděj nevyžádané reorganizace serveru, masivní download OSM dat ani automatické čištění disků.
- **Výstup pro mě:** funkční repo s celým webem, nikoli návrhy, a jasný stav PRODUCTION PASS/BLOCKED včetně důkazů.
