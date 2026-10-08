# HOTEL CHODOV ASC — ZÁVAZNÁ SPECIFIKACE WEBOVÉHO PRŮVODCE v1.4
Datum: 8. října 2026 | Stav: podklad pro generování a bezpečné nasazení, nikoli potvrzený produkční provoz.

## 0. Autorita a rozsah
Tento dokument v1.4 nahrazuje rozporná rozhodnutí předchozích verzí. Historické specifikace v1.0–1.3 jsou přiloženy pro úplnost a dohledatelnost, ale v konfliktu má přednost v1.4; tvrdá fakta katalogu pocházejí z nejnovějších JSON souborů podklady_v1.3. Nezaměňovat historický vývojový prototyp za kompletní produkt.

## 1. Produkt
Veřejný statický web „Hotel CHODOV ASC — Průvodce Prahou“, otevřený QR kódem bez instalace, bez účtu či přihlášení, bez jakékoli administrační sekce, bez CMS a bez uživatelské databáze. Obsah se nemění v provozu: POI, texty, souřadnice, ceny, odkazy, překlady, trasy a média se udržují výlučně v Git repozitáři, z něhož se vytvoří kontrolovaný statický build a release. Žádné administrační formuláře ani ochrana účtů.

### Hlavní rozcestník
- „Kolem hotelu“ — 10 lokalit v okolí, přednostně pěšky.
- „Praha“ — 19 turistických cílů napříč Prahou; pro každou lokalitu detail s fotkami, praktickými informacemi, oficiálním odkazem a GPS.
- „Mapa“ — reálné vektorové mapové podklady, hotel, filtrování pinů, GPS a pěší trasa.
- „Doporučené výlety“ — 5 redakčně připravených tras/okruhů podle dat.
- „MHD PID“ — odkaz na oficiální vyhledání spojení; zvlášť PID Lítačka na koupi jízdenky. Žádná hotelová platební brána.
- „Zdraví a nouze“ — velká tlačítka 155/112, kontakty na Fakultní Thomayerovu nemocnici, individuální pohotovosti, obrázkové symptomy a dvojjazyčné věty česky + jazyk hosta, tisk/PDF A4.
- „Informace o hotelu“ — název, adresa, recepce, kontakt, poloha, trasa zpět do hotelu; nepřidávat dynamickou rezervaci/přihlášení.

## 2. Design, značky a fotografie
Povinně použít skutečné logo Hotel CHODOV ASC z `assets/logo-hotel-chodov-asc-original.png`, přiloženou alternativu lze použít podle kontrastu. Logo nesmí být změněno na pseudo-ikonu „H“, nové AI logo, ani logotyp software Kájovo. Poměr stran a průhlednost zachovat; logo v hlavičce, patičce, na hotelové kartě a zdravotní stránce; favicon odvozený opatrným výřezem z dodaného obrázku (nepředstírat vektorový originál). Zdroj a původ jsou v `assets/LOGO_ZDROJ.json`.
Fotografie turistických míst: `podklady_v1.3/media-candidates.json` a `podklady_v1.3/foto_licence.csv` obsahují KANDIDÁTY, nikoliv schválené fotografie. Každý obrazový soubor nejdřív stáhnout, ověřit licenci ke komerčnímu užití, autora, zdroj, změny, restrikce/atribuci; uložit skutečné obrázky lokálně do repozitáře v rozumné velikosti (WebP/AVIF + fallback), přiložit audit původu, uvést attribution. Pokud nelze právo doložit, fotografii NIKDY nepoužít a označit chybějící v kontrolním protokolu; neobcházet autorská práva přes externí hotlinking.

## 3. Data a souřadnice
Zdroj pravdy: `podklady_v1.3/places.cs.json` (29 POI), `hotel.json`, `routes.cs.json` (5 tras), `health.cs.json`, `ZADANI_A_OBSAH_v1.3.md`. Každé místo má stabilní ID, kategorii, adresu, detailní text, oficiální URL, dostupné info o otevírací době a cenách, datum ověření, lat/lon, kvalitu GPS, poznámku ke vstupu a fotograﬁe. Ceny a otevírací doby nejsou realtime: datum aktualizace a upozornění na změny vždy v UI.
Katalog nepřepisovat domněnkami. Souřadnice mají formát WGS84 {lat,lon}; rozlišit objekt/areál/bezpečný ověřený pěší vstup. Pokud GPS není ověřený vstup, NESMÍ se bod bez kontroly použít jako cíl živé pěší navigace. Lze zobrazit pin pro orientaci, nabídnout ověřený blízký přístup, nebo navigaci zablokovat s vysvětlením. GPS hotelu 50.03996, 14.50541 je doložen jako budova, recepce musí ještě ověřit přesný pěší vstup; nepředstírat opak.

## 4. Jazyk
Plný frontend CS/EN/DE včetně turistických textů, ovládání, navigace, zdravotní stránky, metadat a správného čtení TTS; přepnutí jazyka kdykoli bez ztráty stavu. České vstupní popisy a věty se zachovají významově, nic nevymýšlet. Jazyková varianta v URL a SEO/hreflang podle zvolené architektury. Pokud překlad chybí, release není dokončen; žádný tichý mix jazyků.

## 5. Mapa a pěší navigace
Frontend MapLibre GL JS; OSM geodata, Protomaps basemap + PMTiles hostované hotelovým projektem (nikoli veřejný OSM tile server, ne veřejné demo). Samostatná vlastní routovací služba Valhalla v izolovaném kontejneru/backendu s velmi omezeným veřejným API, jen `pedestrian`, s instrukcemi CS/EN/DE; nevytvářet běžnou databázi/uživatelské účty. Mapový web a katalog jsou statické soubory, routování je jediná dynamická technická služba, nezbytná pro trasu z aktuální polohy a přepočet.
Geolocation API po výslovném souhlasu, přesnost signálu viditelná; lokální map matching/manévry a přepočet až po ověřeném odklonu. Web Speech API po stisku uživatele. Screen Wake Lock pro možnost udržet rozsvícenou obrazovku, zobrazit stav i při selhání a uvolnit při ukončení. Nezaručovat provoz hlasu ani GPS při zamknutém zařízení nebo skrytém webu. Návrat po probuzení obnoví polohu a podle potřeby trasu. Může být volba nemluvit a používat textové pokyny. V nouzi nenavádět pěšky jako náhrada volání 155/112. Žádné fiktivní pěší trasy vzdušnou čarou.

## 6. PID doprava
Vyhledání aktuálního spojení otevřít na `https://pid.idos.cz/pid/spojeni/conn.aspx` (nepředstírat integrované vyhledávání API); druhé tlačítko `https://app.pidlitacka.cz/` pro koupě jízdenky v oficiální Lítačce. Zakázáno tvrdit, že hotel prodává jízdenky. Externí odkazy otevírat bezpečně `rel=noopener noreferrer`, přidej informaci o pásmech dle cíle. Volitelně odkázat na `https://pid.cz/` pro tarif.

## 7. Zdraví a urgence
Informace vychází z `health.cs.json`, zdravotní podstránky vývojového prototypu a historické hotelové koncepce letáku. Čísla 155 a 112 musí být okamžitě viditelná, klikatelná (`tel:`). Uvést adresu FTN Vídeňská 800, Praha 4–Krč, ústřednu, pohotovost dospělí, děti, zuby, odlišné kontakty/časy, ověřené zdroje, datum kontroly. „Nejbližší nemocnice“ neznamená automaticky nejbližší OTEVŘENOU specializovanou službu; nepřidávat neověřené tvrzení. Přidat dvojjazyčné karty 15 symptomů, výběr stížností a zdravotní kartu pro tisk A4; zdravotní údaje neukládat na server, do localStorage nebo analytiky. U vážných potíží volat záchrannou službu; žádné nevhodné medicínské rady. Trasa k FTN AUTEM otevřít externí mapovou službou jen na výslovné kliknutí; pěší turistická navigace není ambulance.

## 8. Provoz: produkční stroj „Kájovo“ (jen nové izolované nasazení)
Read-only inventura 8.10.2026 ukázala Ubuntu 24.04.5 LTS, 4 vCPU, cca 8 GiB RAM a cca 18.6 GB volného místa na root FS (obsazenost 88 %), běžící host-level Nginx a více existujících webů + Docker projekty. V provozu jsou například `hotel.hcasc.cz`, `dagmar.hcasc.cz`, `gpt.hcasc.cz`, `ha.hcasc.cz`, `mail.hcasc.cz` a samostatný MCP endpoint. Toto **NEJSOU** automaticky domény nového průvodce a žádná z nich se nesmí přepsat. Serverová kontrola byla pouze read-only; nic se ještě nenasazovalo.
Uživatel uvádí, že DNS pro NOVOU adresu již směruje na server. Konkrétní FQDN ale v konverzaci uveden nebyl a v aktivních Nginx vhostech nebyla jednoznačná nová doména rozpoznána. Před nasazením musí agent dohledat KONKRÉTNÍ a JEDNOZNAČNÝ FQDN ze schváleného repozitáře/configu nebo jej vyžádat; nesmí hádat. Ověřit veřejné A/AAAA záznamy a shodu s produkčním strojem, certifikát, kolize v host Nginx.
Vytvořit pouze nový izolovaný statický web root/release dir, vlastní unprivileged user či isolated container, vlastní namespace/port pouze na 127.0.0.1, vlastní vhost a TLS certifikát podle existujícího bezpečného patternu. Nevkládat znovu `map`/global statements do konfliktu se stávajícím Nginx, nepřepisovat `/etc/nginx/nginx.conf`, nepřepisovat žádné stávající vhosty, služby, porty ani certifikáty. Pro routovací službu použít limit CPU/RAM/disk a preflight capacity. Valhalla preprocessing mapových dat dělat ideálně mimo produkční server; do produkce dodat hotová data Praha + nutný přilehlý region, zdroj s licencí. Nenechávat neomezené buildy na stroji s 88 % využitím disku. Zabezpečit logování bez poloh, omezení veřejného routingu, CSP, rate limit, HTTPS. Pro statické části vysoká cache jen pro hashované assety, index a katalog kratší. Kontrolovaný atomický release symlink a okamžitý rollback jen nového webu. Neměnit ostatní hostované aplikace. Vytvořit audit režim dry-run + preflight, plán návratu, monitoring vlastní služby a diskové kvóty.

## 9. Nasazovací workflow Git -> Build -> Release
Git repozitář je jediným zdrojem změn turistického obsahu. V CI / na build stroji proveď validaci JSON schématu, vazeb ID a obrázků, lint/test/security, statický build, evidence licencí a kontrolu verzí. Nepovolit ruční editaci produkčních HTML/JSON mimo Git. Před deployem musí projít link checks, souřadnice vstupů, TTS a GPS na reálných telefonech, ověření vlastních mapových podkladů a Valhalla. Použít trvalé HTTPS na schváleném FQDN a dostupnost přes hotelový QR kód. Release podle SHA commitu; v případě chyby rollback pouze tohoto projektu. Nezapojovat automatické produkční kroky dřív, než jsou splněny kritické brány a známa doména.

## 10. Ověřovací scénáře / akceptace
- Bez instalace a bez účtu funguje úvod, přepínání CS EN DE, 29 POI, 5 itinerářů, zdravotní karta, PID a QR deep links na iPhone/Android i desktopu.
- V každé sekci jsou doslovně funkční data, nikoli „Lorem ipsum“/falešné ceny/trasy/pozemky; UI žádné překryvy a přístupná tlačítka min 44×44 CSS px.
- 29/29 míst a hotel mají lat/lon a provenance; u nepřesných vstupů bezpečné vysvětlení a blokace živého navigování, dokud nejsou ověřeny. Před označením hotovo musí být ověřeny skutečné pěší vstupy alespoň hotelu a 5 testovacích cílů.
- 5 fyzických testů pěších tras na každé platformě (iPhone Safari a Android Chrome) včetně manévru, odklonu, ztráty GPS, odmítnutí polohy, návratu po uspání a stavu Wake Lock / TTS. Úspěch jen s reálným záznamem; neprohlašovat z fake testů.
- Žádná nevypořádaná licence publikovaného obrázku; fotokredity a OSM attribution viditelné.
- Zdravotní karta 155/112, FTN, jazyk + česká věta, symptomové piktogramy a bezchybné A4 print.
- `https` pod novým jednoznačně schváleným FQDN; Nginx+TLS kontrola, test hlaviček, nezměněná dostupnost a konfigurace ostatních vhostů a MCP.
- Běžné `npm test` prototypu nestačí na akceptaci; chybějící data či infrastruktura = explicitně BLOCKED, nikoli PASS.

## 11. Oddělení hotových dat a neověřených požadavků
Již připraveno: 29 českých kurátorovaných míst, 5 návrhů tras, 29 souřadnic, souřadnice hotelové budovy, odkazy PID a Lítačka, zdravotní karta EN/DE→CS, kandidátní fotografie, autentické logo (tento ZIP), prototyp navigačního jádra.
Neprokázáno v této dodávce: originální fotografie schválené pro zveřejnění, všechny tři jazykové překlady všech detailů, všechny fyzické pěší vstupy, schválený FQDN, produkční PMTiles/Valhalla, reálné testy na telefonech a certifikované produkční nasazení. Tyto body musí generátor vyřešit nebo označit jako blocker. Neprohlašovat hotové něco, co nebylo reálně provedeno.
