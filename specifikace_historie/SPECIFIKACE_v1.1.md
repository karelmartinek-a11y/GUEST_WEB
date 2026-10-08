# HOTEL CHODOV ASC — INTERAKTIVNÍ PRŮVODCE PRAHOU
## Funkční a technická specifikace v1.1
**Datum:** 8. 10. 2026  
**Stav:** závazné zadání, přiložen vývojový prototyp webového navigačního jádra; nikoli provozně schválená navigace  
**Cíl:** veřejná mobilní webová aplikace hotelu s vlastní interaktivní mapou, turistickým obsahem a skutečnou pěší navigací.

## 1. Produkt a základní rozhodnutí
1. Host otevře web z hotelového QR kódu nebo odkazu. Neinstaluje nic, nepřechází do App Store ani Google Play; aplikace funguje bez přidání na plochu.
2. Mapa, průvodce, výběr míst i pěší navigace fungují uvnitř hotelového webu. Navigaci nepředáváme automaticky aplikacím Google Maps ani Mapy.com.
3. Hotel provozuje vlastní aplikaci, mapový styl, distribuci mapových dlaždic, katalog míst a routovací službu. **Podkladová geografická data nevlastní hotel**: vycházejí z OpenStreetMap a souvisejících zdrojů za podmínek jejich licencí.
4. První verze má být provozně jednoduchá a ověřitelná: pěší navigace, průvodce a redakční správa. AI konverzační průvodce, veřejná doprava a plnohodnotný offline režim nejsou podmínkou spuštění.
5. Primární oblast: Praha, zejména okolí Hotelu CHODOV ASC; turistické cíle v celé Praze. Výchozí souřadnice hotelového vstupu schválí administrátor podle skutečného pěšího vchodu.

## 2. Konkrétní technologie a jejich vlastnictví
| Vrstva | Komponenta | Kdo ji provozuje a k čemu slouží |
|---|---|---|
| Frontend | React + TypeScript, responzivní web | Vlastní hotelový web pro mobil a desktop; bez nativních aplikací |
| Mapa v prohlížeči | MapLibre GL JS | Open-source knihovna pro vizualizaci, vykreslení trasy a pozice |
| Geodata | OpenStreetMap (OSM) | Data ulic, chodníků, pěších cest a objektů; externí otevřená data |
| Vektorový mapový podklad | Protomaps basemap + PMTiles | Vlastní hostovaný soubor dlaždic pro Prahu a nutné okolí, vlastní mapový styl a popisky |
| Výpočet trasy | Valhalla, vlastní instance | Open-source pěší router s posloupností manévrů, českými a dalšími jazykovými instrukcemi |
| Poloha | Browser Geolocation API (`watchPosition`) | GPS/lokační služby telefonu, až po souhlasu hosta; fungování závisí na OS a prohlížeči |
| Hlasové pokyny | Web Speech API (`speechSynthesis`) | Syntéza navigačních vět hlasem dostupným v zařízení; dostupnost konkrétních hlasů se liší |
| Backend API | Node.js + TypeScript (např. Fastify) | Vlastní katalog míst, itineráře, oprávnění, proxy k routování |
| Databáze | PostgreSQL + PostGIS | Souřadnice POI, popisy, překlady, administrace |
| Úložiště fotografií | Vlastní objektové úložiště nebo server | Pouze vlastní nebo řádně licencované fotografie |
| Provoz | HTTPS, reverzní proxy, zálohy | Vlastní nebo smluvně spravovaná infrastruktura |

**Závislosti na třetích stranách:** MapLibre, Protomaps/PMTiles, Valhalla, OpenStreetMap a standardní prohlížečové API. Externí komerční API pro běžný výpočet pěší trasy se v návrhu nevyužívá. Vlastní provoz není beznákladový: vyžaduje server, aktualizace, monitoring a údržbu. Nevyužívat veřejné servery `tile.openstreetmap.org` jako produkční infrastrukturu aplikace.

**Licence:** trvale zobrazovat požadované uvedení autorství, minimálně „© OpenStreetMap contributors“ s odkazem na OSM; ověřit licenční podmínky všech zvolených dat, grafiky, ikon a fotografií včetně případných povinností při publikování odvozených databází.

## 3. Veřejné obrazovky a informační architektura
- **Úvod:** logo Hotel CHODOV ASC, volba jazyka, vyhledávání a velká tlačítka „Kolem hotelu“, „Památky Prahy“, „Doporučené trasy“, „Mapa“, „Praktické informace“.
- **Mapa:** skutečný mapový podklad; vlastní barevné piny hotelu a zajímavostí, filtry kategorií, tlačítko mé polohy, výběr cíle, zobrazení vybrané trasy.
- **Detail místa:** název, fotografie, krátký popis, praktické informace, aktuálnost informací, přibližná délka návštěvy, souřadnice, tlačítko „Navigovat pěšky“.
- **Trasy:** předpřipravené pěší výlety a okruhy, odhad délky, času a jednotlivé zastávky na mapě.
- **Navigace:** mapa přes většinu displeje, orientovaná trasa, aktuální poloha, příští manévr, vzdálenost k manévru, zbývající čas a vzdálenost, mute/unmute, ukončit a přepočítat.
- **Hotelové informace:** přesná poloha pěšího vchodu, návrat do hotelu, kontakt, vlastní doporučení recepce.
- **Správa (oddělená):** administrační přihlášení, místa, překlady, obrázky, trasy a publikace.

Mobilní navigaci tvořit primárně pro displej držený na výšku. Velká dotyková tlačítka, respektování bezpečných oblastí displeje, kontrastní text, přístupnost z klávesnice a odečítačky. Otevření místa nebo trasy musí fungovat přes sdílený odkaz a QR kód.

## 4. Pěší navigace: závazné funkční chování
### 4.1 Zahájení
1. Host zvolí místo nebo připravený okruh a stiskne „Navigovat pěšky“.
2. Aplikace požádá o souhlas s polohou až v okamžiku, kdy je potřeba. Bez souhlasu umožní plánování trasy od hotelu a zobrazení textových instrukcí, nikoliv živé sledování.
3. Při povolené poloze se jako start použije aktuální pozice; jinak volitelně hotel nebo ručně vybraný bod.
4. Vlastní backend požádá vlastní Valhalla službu o pěší trasu (`costing: pedestrian`) a instrukce v daném jazyce, včetně `cs-CZ`.
5. Vrátí se geometrie trasy, délka, odhad času, dílčí manévry a jejich umístění. UI vykreslí barevnou trasu.

### 4.2 Navigace za chůze
- Poloha se obnovuje prostřednictvím `watchPosition` podle toho, kdy zařízení poskytne nová měření. Neslibovat pevnou GPS frekvenci ani centimetrovou přesnost.
- Vlastní klientská logika přiřazuje věrohodnou GPS polohu k nejbližšímu relevantnímu úseku aktivní trasy („map matching“ / projekce na trasu); zároveň zobrazuje přiznaný rozsah nepřesnosti GPS.
- Při přibližování k manévru se zobrazí český (či jiný lokalizovaný) text „Za přibližně 80 metrů odbočte doleva“; blízko manévru následuje krátký pokyn „Odbočte doleva“. Uvedené vzdálenosti jsou příklady, algoritmus musí zohledňovat rychlost, přesnost a typ křižovatky.
- Volitelný hlas čte pokyny pomocí `speechSynthesis`, s výběrem vhodného hlasu z dostupných hlasů zařízení. Pokud hlas není dostupný nebo je blokován, musí zůstat čitelné textové instrukce.
- Aplikace průběžně aktualizuje zbývající vzdálenost a orientační čas. Uživatel může mapu volně posunout a vrátit sledování polohy jedním tlačítkem.
- Při opuštění trasy se po několika po sobě jdoucích kvalitních měřeních a s tolerancí vůči chybě GPS spustí nový výpočet pěší trasy z aktuální polohy. Předchozí požadavky se zruší / ignorují při zastarání.
- Při dosažení cíle se navigace ukončí a zobrazí „Jste na místě“; pro vícezastávkovou trasu se nabídne další zastávka.
- Směr orientace mapy podle kompasu jen je-li senzor dostatečně spolehlivý; jinak sever nahoře nebo orientace dle úseku trasy. Poloha se nesmí přesouvat na trasu, pokud by tím aplikace předstírala falešnou přesnost.

### 4.3 Chyby a režimy náhrady
- GPS vypnutá / odmítnutý souhlas: trasa od hotelu + statické pokyny.
- Nízká přesnost GPS, typicky v historické zástavbě nebo podchodech: upozornit „Poloha je nepřesná“, nepřepočítávat agresivně a nenavigovat podle neověřené polohy.
- Bez spojení se serverem: zobrazit poslední vypočtenou trasu a instrukce, pokud jsou dostupné; neslibovat nové přepočty bez internetu.
- Nepodařilo se sestavit pěší cestu: přiznat chybu, nabídnout návrat na mapu, nikdy nenahradit cestu vzdušnou čarou jako navigovatelnou trasou.
- **Omezení mobilního webu:** spolehlivé živé navádění na pozadí, při zamčeném telefonu nebo při vypnuté obrazovce nelze na iOS/Android webové aplikaci garantovat. První verze garantuje navigaci při aktivně otevřené stránce na podporovaném zařízení, nikoli režim identický s nativní navigační aplikací.


## 4.4 Automatické udržování displeje (závazné rozhodnutí v1.1)
1. Stisk „Spustit navigaci“ v jednom uživatelském gestu zahájí GPS a hlas a vyžádá `navigator.wakeLock.request('screen')`, pokud jej prohlížeč podporuje.
2. Při úspěchu viditelný stav „Displej se udržuje rozsvícený“; při zamítnutí/neschopnosti telefonu viditelné sdělení, žádné předstírání aktivity.
3. Po skrytí stránky nemusí ochrana proti uspání platit; při návratu na viditelnou stránku se aplikace pokusí ochranu znovu získat a aktualizuje GPS polohu.
4. Po ukončení navigace se Wake Lock okamžitě uvolní. Uživatel telefon může zamknout ručně; ochrana tomu nebrání.
5. GPS, hlas a prohlížeč mohou zvýšit spotřebu baterie. Navigace nemá funkci nativní aplikace na pozadí a nesmí ji slibovat.
6. Hlas spouštět v návaznosti na explicitní stisk uživatele; na některých iPhonech/Android telefonech může prohlížeč zvuk přesto blokovat. Vždy existuje textová varianta.

## 4.5 Jednoduché mobilní ovládání (závazné rozhodnutí v1.1)
- Při běžné cestě nejvýše: vybrat cíl → ukázat trasu → spustit navigaci a povolit GPS.
- Zřetelný první pokyn, zbývající čas/délka, hlas zapnout/vypnout, ukončit, zpět do hotelu a moje poloha.
- Ovládací prvky nejméně 44 × 44 CSS px; podporovat čitelnost na telefonu, zvětšení textu, `safe-area` a kontrast.
- Nevyžadovat přihlášení, cookies souhlas pro provoz navigace, instalaci ani registraci hosta.
- Změna jazyka musí přepočítat lokalizované manévry; nikdy nemíchat češtinu s německým hlasem bez upozornění.
- Před produkčním vydáním rozhodnout a schválit skutečné umístění pěšího vchodu hotelu a záchytné body cílů.

## 5. Katalog a průvodce
Kategorie: okolí hotelu, památky, parky, vyhlídky, muzea, rodiny s dětmi, gastronomie (kurátorovaný výběr), sport a volný čas, praktické služby a návrat do hotelu.

Každé místo má: stabilní ID, název, souřadnice vstupu, kategorii, krátký a dlouhý popis podle jazyka, legální obrazové přílohy, zdroj/autorská práva, doporučenou délku návštěvy, případně orientační vstupné a oficiální web, datum posledního ověření, publikováno/nepublikováno. U otevírací doby a cen se zobrazí datum ověření a upozornění na možnost změny. Nepředstírat živé údaje bez aktuálního datového zdroje.

První obsahové balení: nejméně 20 ručně ověřených míst; z toho alespoň 8 v okolí hotelu a alespoň 12 hlavních pražských cílů. Nejméně 3 redakčně sestavené okruhy a samostatná navigace „Zpět do hotelu“. Konečná sada míst se schválí provozovatelem hotelu.

## 6. Jazykové mutace
První vydání: čeština, angličtina, němčina; datový model připravit pro další jazyky (např. polština). Celé rozhraní, katalog i navigační texty musí respektovat aktuální volbu jazyka. Jazyk rozpoznaný v prohlížeči může být výchozí, host jej však může kdykoliv přepnout. Pokud chybí překlad obsahu, zobrazit označený náhradní jazyk. Jazykové instrukce Valhalla se musí výslovně nastavit, nikoliv odhadovat z názvu místa.

## 7. Administrace
- Přihlášení pouze oprávněných pracovníků, role administrátor/editor.
- CRUD turistických míst, pořadí kategorií, fotografie, více jazyků, vlastní hotelové tipy.
- Editor doporučených tras se zadanými zastávkami, náhledem vypočtené pěší trasy a kontrolou smysluplného pořadí.
- Rozpracovaný a publikovaný stav, kontrola povinných polí, audit změn a možnost vrácení předchozí verze obsahu.
- Automatická kontrola neplatných odkazů a upozornění na zastaralé údaje; žádné nekontrolované automatické publikování AI generovaných popisů.
- Správa licence fotografií a povinných atribucí.

## 8. Logická architektura a základní API
```text
Hostův telefon (mobilní web + MapLibre + GPS + Web Speech + Screen Wake Lock)
         |                \
         | HTTPS           \ mapové PMTiles / vlastní styl
         v                  v
Hotelové API ------- Vlastní mapový hosting
  |      |
  |      +---- Valhalla (pěší routování + manévry)
  |
  +---- PostgreSQL/PostGIS (POI, překlady, trasy, role)
  +---- Média (licencované fotografie)
```

Navržené endpointy (verzované):
- `GET /api/v1/places?bbox=&category=&lang=` — publikovaná místa.
- `GET /api/v1/places/{id}?lang=` — detail místa a souřadnice vstupu.
- `GET /api/v1/itineraries?lang=` a `GET /api/v1/itineraries/{id}` — doporučené okruhy.
- `POST /api/v1/routes/pedestrian` — validované souřadnice startu, cíle a zastávek; výsledek normalizovaný na vlastní formát trasy, manévrů a jazyků.
- `GET /api/v1/config/public` — schválené souřadnice hotelového vstupu, dostupné jazyky a veřejné parametry.
- `POST /api/v1/admin/...` — pouze autentizované operace s kontrolou role a auditem.

Datové entity alespoň: `Place`, `PlaceTranslation`, `PlaceMedia`, `Category`, `Itinerary`, `ItineraryStop`, `AppSettings`, `AdminUser`, `ContentRevision`. Ukládat souřadnice v jasně definovaném referenčním systému WGS84; kontrolovat pořadí lat/lon v API. Trasy pro samotné hosty nejsou trvale ukládány bez samostatného důvodu a souhlasu.

## 9. Soukromí, bezpečnost a provoz
- HTTPS povinně; geolokace výhradně po informovaném povolení uživatele.
- Žádný účet hosta, žádné povinné cookies pro samotné používání průvodce; minimalizovat analytiku a případné souhlasy.
- GPS polohy neposílat analytickým službám; routovací server dostane nezbytné souřadnice pro výpočet, bez jejich dlouhodobého ukládání. Výchozí provozní logy nesmí obsahovat přesnou historii pohybu.
- Oddělení veřejného a administračního API; autentizace, role, rate limiting, validace vstupů, ochrana proti XSS/CSRF dle mechanismu přihlášení, CSP a zálohování databáze.
- Routovací API nezveřejňovat jako neomezenou veřejnou službu; řídit limity a zátěž.
- Verze mapových dat a Valhalla grafu pravidelně aktualizovat koordinovaně; starou ověřenou verzi uchovat pro rollback. Definovat automatické health checky, zálohy a obnovu.
- Všechny třetí strany a licence vést ve stručném registru závislostí s verzí a způsobem aktualizace.

## 10. Měřitelná akceptační kritéria
Za hotovou první verzi lze aplikaci považovat teprve po těchto kontrolách:
1. Na reálném iPhonu v Safari a Androidu v Chrome lze otevřít QR kód, změnit jazyk, procházet POI a otevřít mapu bez instalace.
2. Uživatel s uděleným souhlasem vidí průběžně aktualizovanou polohu včetně indikace její nejistoty.
3. Aplikace umí spočítat pěší trasu z hotelu k nejméně pěti vybraným cílům a z aktuální polohy zpět k hotelu.
4. Minimálně pět skutečně projitých zkušebních tras (včetně odboček a jedné úmyslné odchylky) prokáže správné pořadí manévrů, hlasové/textové pokyny a smysluplný přepočet. Provedou se na iOS i Androidu; testovací zápisy obsahují skutečné výsledky.
5. Česká, anglická a německá varianta mají použitelný textový režim; dostupnost hlasů se testuje na cílových zařízeních. Pokud zařízení daný hlas nepodporuje, aplikace to nezatají.
6. Odmítnutí polohy a výpadek internetu nezpůsobí pád aplikace a vyvolají popsaný náhradní režim.
7. 20 publikovaných míst a 3 okruhy obsahují ověřené souřadnice, relevantní popisy a práva k fotografiím.
8. Žádná část mobilního rozhraní nepřekrývá text nebo základní ovládání; ověřit běžné velikosti displejů, zvětšení textu a orientaci na výšku.
9. Na mapě je viditelná správná atribuce zdroje dat; klient používá vlastní hosting mapových dlaždic a routování, nikoli nedohodnutá produkční API třetích stran.
10. Backend testy, bezpečnostní kontrola, obnovení zálohy a scénář rollbacku projdou; zveřejnění závisí na průchodu všech kritických testů. Neoznačovat nic za splněné bez důkazu.

## 11. Vývoj po malých uzavřených etapách
**E1 — Mapa:** běžící responzivní web, jedna vlastní mapa Praha, poloha hotelu, mapa z hostovaného PMTiles, autorská atribuce. Přijmout až po zobrazení na iOS/Android.

**E2 — Navigační jádro:** vlastní Valhalla, trasa hotel → jeden konkrétní cíl, geometrie, manévry a české instrukce. Přijmout až po fyzickém projití testovací trasy.

**E3 — Živá navigace:** GPS `watchPosition`, sledování postupu, text/hlas, odchylka a přepočet; test GPS chyb, povolení a výpadku signálu.

**E4 — Turistický obsah:** databáze, administrace, 20 míst, 3 okruhy, fotografie, vícejazyčné překlady.

**E5 — Produkce:** responzivita, výkon, bezpečnost, monitoring, zálohy, QR kódy, publikace a ověření na reálných telefonech.

Každá etapa je samostatně provozuschopná, s jasným akceptačním protokolem. Do další etapy se nepřechází při neuzavřených kritických vadách. Není nutné předem formalizovat stovky drobných kontraktů; stabilní datové formáty se definují jen na skutečných rozhraních mezi hotovými komponentami.

## 12. Záměrně mimo první vydání
- AI chat, automatické generování itinerářů a konverzační doporučování.
- Jízdní řády MHD a komplexní multimodální navigace.
- Garantovaná hlasová navigace při zamčené obrazovce nebo na pozadí iOS webového prohlížeče.
- Garantovaná bezbariérová trasa bez ověřených dat o překážkách.
- Plně offline navigace včetně přepočtu trasy.
- Komerční realtime informace o otevíracích dobách, vstupném a dopravních omezeních bez zajištěného zdroje.

Web bez instalace je závazným rozhodnutím. Nelze slibovat systémem blokovanou navigaci na pozadí; produkt nabídne zřetelné vysvětlení a obnovu po návratu.

## 13. Ověřené technické podklady
- MapLibre GL JS a lokalizace uživatele: https://maplibre.org/maplibre-gl-js/docs/ a https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/
- Valhalla API, pěší routing a `cs-CZ`: https://github.com/valhalla/valhalla/blob/master/docs/docs/api/route/api-reference.md
- Valhalla navigační manévry: https://github.com/valhalla/valhalla-docs/blob/master/turn-by-turn/api-reference.md
- PMTiles + MapLibre: https://docs.protomaps.com/pmtiles/maplibre
- Protomaps basemap ke vlastnímu hostingu: https://docs.protomaps.com/basemaps/downloads
- OSM zásady mapových serverů a atribuce: https://operations.osmfoundation.org/policies/tiles/
- Browser Geolocation: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
- Browser hlasový výstup: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice
- Omezení stránek na pozadí: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

## 14. Implementační stav k 8. 10. 2026
Připraven samostatný spustitelný **vývojový prototyp** (samostatný balíček, bez zásahu do produkce nebo GitHubu). Obsahuje demo mapu, výběr pěti pražských cílů, základní GPS, hlas, Screen Wake Lock, proxy pro Valhalla a 3 jazykové mutace. Automatizované testy ověřují některé čisté navigační funkce a HTTP API. **Nepovažuje se za produkčně hotový web:** mapy a routování se ve vývojové ukázce mohou opírat o externí služby, chybí vlastní mapový hosting, produkční Valhalla, kurátorovaný obsah a reálné fyzické testy na telefonech. Souřadnice hotelu a turistických vstupů musí být ručně ověřeny.

Pro produkční dodávku platí požadavky E1–E5 včetně vlastních mapových dat; demo služby nejsou schváleným produkčním řešením.

Ověřené reference pro rozšíření v1.1:
- https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request
- https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
