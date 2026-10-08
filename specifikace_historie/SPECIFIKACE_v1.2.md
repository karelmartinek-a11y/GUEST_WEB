# Hotel CHODOV ASC – Statický průvodce Prahou a pěší navigace
**Zadání v1.2 a redakční obsah první verze** | 8. 10. 2026 | podklad pro implementaci v repozitáři

**Autoritativní změna oproti v1.1:** celý katalog je natvrdo v repozitáři; není administrace, účet správce, databáze, přihlašování ani editor přes web. Veřejný obsah je předkompilován při buildu. Beze změn zůstává princip mapy, GPS, pěší navigace s hlasem, Wake Lock a web bez instalace.

## 1. Architektura a pravidla vývoje
- Statický frontend React/TypeScript (Vite), MapLibre, statický soubor PMTiles a statické JSON soubory `places.cs.json`, `routes.cs.json`, `media-candidates.json`. Fotografie po licenční kontrole uložit jako WebP/AVIF přímo do repozitáře nebo verzovaného statického úložiště pod kontrolou hotelu.
- **Žádná administrace, žádný CRUD, žádný PostgreSQL/PostGIS, žádná uživatelská autentizace, žádná oprávnění ani cookies pro provoz průvodce.** Přístup k zápisu existuje pouze v Gitu a prostředí nasazení, nikoli na veřejném webu.
- Každá změna obsahu = editace souboru v repo → commit do schválené větve → CI validace → build statického webu → publikace. Release číslo / datum aktualizace viditelné v patičce.
- Statický **obsah a frontend** neznamená bezserverovou libovolnou navigaci: pro skutečné přepočty tras z proměnlivé GPS polohy zůstává nutná **samostatná, neautentizovaná pouze pro čtení, omezená routovací služba Valhalla** (vlastní hosting, omezení provozu). Ta nespravuje POI, účty ani redakční data. Alternativa zcela bez routovací služby je pouze sledování předem připravených tras, která nesplňuje původní požadavek.
- Mapový podklad vlastní hostovaný PMTiles a jeho styl, se zachováním všech datových atribucí. Geolokace v HTTPS a s výslovným souhlasem hosta.
- Web Speech API pro hlas; Wake Lock se získá pouze při spuštěné navigaci, při návratu na stránku se pokusí obnovit; na pozadí při zamknutí telefonu se živá navigace negarantuje.
- Žádné externí skripty analytiky, marketingových cookies, reklamních widgetů a přihlašování. U žádného hosta se neukládá historie GPS polohy.
- Mapy jen pro pěší. Vzdálenější destinace (Zoo, Průhonice, Troja, centrum) v detailu zobrazí: „K výchozímu místu využijte MHD či taxi; pěší navigace pak vede po místě.“ Bez předstírání automatického plánování MHD.

## 2. Struktura webu a konkrétní obsah sekcí
### Domů
**Titulek:** „Objevte Prahu s Hotelem CHODOV ASC“  
**Podtitulek:** „Vydejte se na procházku po Jižním Městě nebo objevte nejkrásnější místa Prahy. Vyberte cíl, otevřete mapu a nechte se navigovat pěšky.“
**Pět velkých tlačítek:** `Kolem hotelu` · `Památky Prahy` · `S dětmi` · `Doporučené trasy` · `Mapa a navigace`.
**Krátká lišta:** `Zpět do hotelu`, `Vyhledat místo`, `CZ / EN / DE`, `Praktické informace`.
### Kolem hotelu
Výběr: Chodovská tvrz; Kunratický les; Westfield Chodov; Jedenáctka VS; Toulcův dvůr; Hostivařská přehrada; Průhonický park; Dendrologická zahrada; Aquapalace Praha; Hamerský rybník. Označovat skutečné pěší okolí od vzdálenějších výletů.
### Památky Prahy
Dělení: `Historické centrum`, `Hradčany a Malá Strana`, `Vyhlídky`, `Muzea`, `Zahrady a parky`. Zobrazovat vstupné, sezonní režim a dobu návštěvy.
### S dětmi
Zvýraznit Zoo Praha, Toulcův dvůr, Aquapalace, Jedenáctka VS, botanickou a dendrologickou zahradu a vnitřní muzea. Bez falešných slibů bezbariérovosti či otevření atrakcí.
### Doporučené trasy
Každý okruh má název, popis, pořadí zastávek, výchozí bod, soupis možností placených vstupů a výrazné tlačítko „Začít navigovat“. Časy a délky se **nesmějí vymýšlet**; dopočítat Valhallou a ověřit v terénu.
### Mapa a navigace
Mapa přes většinu obrazovky, GPS tečka s přesností, zvýrazněná pěší trasa, nejbližší manévr, zbývající délka/čas, hlas zap/vyp, udržení obrazovky, vrátit mapu na polohu, zastavit, přepočítat, zpět do hotelu.
### Praktické informace
Hotel CHODOV ASC, Mírového hnutí 2137/7, 149 00 Praha 11; recepce +420 608 877 424; recepce@hotelchodovasc.cz; oficiální web https://hotelchodovasc.cz/. Tlačítko „Navigovat zpět“ používá **před produkcí fyzicky ověřené** souřadnice skutečného pěšího vchodu, ne automaticky střed budovy.
### Informace o cenách a fotografiích
Patička detailu: „Ceny a otevírací doby byly ověřeny dne 8. 10. 2026. Mohou se měnit; před návštěvou zkontrolujte oficiální web.“ Oddělený blok „Fotografie a licence“ s kredity dle použitých médií.

## 3. Redakční karta místa – jednotný obsah
Karta: název; poutavý krátký úvod; historie / hlavní zážitky; praktický tip; otevírací doba včetně sezónnosti; jednotlivé typy vstupného (nikoli jen jedno číslo); typická délka návštěvy; web provozovatele; samostatné ověřovací zdroje; datovaný stav; fotogalerie; navigace k ověřenému pěšímu vstupu.
Texty níže jsou **původní redakční návrhy** sestavené z ověřovaných faktů, nikoli kopie turistických článků. Pokud není přesná cena doložena, je výslovně uvedeno „dle provozovatele“.

### 3.1 Okolí hotelu a kratší výlety

#### Chodovská tvrz (`chodovska-tvrz`)
**Úvod:** Středověká tvrz uprostřed moderního Jižního Města.
**Co zažijete:** Nejvýraznější historická památka Chodova má kořeny ve středověké vodní tvrzi a dnes slouží jako kulturní centrum s výstavami a koncerty. Pozoruhodný je kruhový půdorys a vnitřní nádvoří.
**Tip recepce:** Prohlédněte si areál zvenčí a pro výstavu si ověřte konkrétní program. Cena se mění podle akce.
**Otevírací doba:** Galerie a pokladna út–ne 13:00–19:00; pondělí zavřeno.
**Vstupné:** Podle konkrétní výstavy/akce; jednotné vstupné neověřeno.
**Doporučená návštěva:** 30–60 min.
**Oficiální web:** https://chodovskatvrz.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/chodovska-tvrz/
**Fotografie v katalogu:** 3 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Kunratický les (`kunraticky-les`)
**Úvod:** Přírodní procházky a odpočinek v lese nedaleko Chodova.
**Co zažijete:** Rozsáhlé lesní území o rozloze přibližně 284 hektarů nabízí přírodní cesty, údolí Kunratického potoka a pozůstatky Nového hradu spojeného s Václavem IV. Hodí se na nenáročné procházky i delší okruh.
**Tip recepce:** Vstup do přírody na vlastní odpovědnost; některé úseky jsou nezpevněné. Naučná zastavení nejsou propojena souvislým značeným okruhem.
**Otevírací doba:** Volně přístupný přírodní areál, bez pokladny.
**Vstupné:** Vstup zdarma.
**Doporučená návštěva:** 60–150 min.
**Oficiální web:** https://www.praha-priroda.cz/lesy/kunraticky-les/
**Zdroj ověření:** https://www.praha-priroda.cz/naucne-stezky/kunraticky-les/
**Fotografie v katalogu:** 4 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Westfield Chodov (`westfield-chodov`)
**Úvod:** Velké nákupní centrum s obchody, restauracemi a kinem.
**Co zažijete:** Praktická volba, když host hledá nákupy, občerstvení, kino nebo program při špatném počasí. Různé provozovny uvnitř mohou mít vlastní otevírací dobu.
**Tip recepce:** Kromě obchodní pasáže lze využít restaurace či kino; otevírací dobu konkrétního podniku vždy ověřit zvlášť.
**Otevírací doba:** Obchodní centrum denně 9:00–21:00.
**Vstupné:** Vstup do centra zdarma; kino a jednotlivé služby placené podle provozovatele.
**Doporučená návštěva:** 60–180 min.
**Oficiální web:** https://www.westfield.com/cz/czech-republic/chodov
**Zdroj ověření:** https://www.westfield.com/cz/czech-republic/chodov/oteviraci-doba
**Fotografie v katalogu:** 3 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Jedenáctka VS (`jedenactka-vs`)
**Úvod:** Plavecký a sportovní komplex na Jižním Městě.
**Co zažijete:** Krytý bazénový areál s vodním a sportovním vyžitím vhodný pro jednotlivce i rodiny. V komplexu jsou oddělené bazénové, sportovní a dětské plavecké prostory.
**Tip recepce:** Před odchodem ověřte případná omezení veřejného plavání a aktuální cenu podle délky vstupu.
**Otevírací doba:** Bazén po–pá 6:30–21:00, so–ne/svátky 8:00–21:00.
**Vstupné:** Orientační vstupné od 160 Kč základní / 120 Kč snížené / 340 Kč rodinné dle přehledu PCT; přesný typ vstupenky ověřit.
**Doporučená návštěva:** 60–120 min.
**Oficiální web:** https://www.aquasportclub.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/jedenactka-vs/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Toulcův dvůr (`toulcuv-dvur`)
**Úvod:** Statek a přírodní areál zaměřený na ekologii a rodiny.
**Co zažijete:** Historický dvůr v Hostivaři nabízí setkání se zvířaty a přírodou i vzdělávací programy. Je vhodný především pro rodiny s dětmi, které chtějí klidnější program mimo centrum.
**Tip recepce:** Placena je farma a přírodní areál; skupiny nad 10 osob mají zvláštní pravidla návštěv a rezervací.
**Otevírací doba:** Leden, únor, listopad, prosinec 10–16; březen–červen a září–říjen 10–18; červenec–srpen 9–18.
**Vstupné:** Farma/přírodní areál: dospělí 60 Kč, dítě od 3 let/senior/ZTP 30 Kč, rodina 130 Kč.
**Doporučená návštěva:** 60–120 min.
**Oficiální web:** https://toulcuvdvur.cz/
**Zdroj ověření:** https://toulcuvdvur.cz/stranka/1971-vstupne
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Hostivařská přehrada (`hostivarska-prehrada`)
**Úvod:** Vodní nádrž a zelené okolí pro pěší výlet.
**Co zažijete:** V blízkosti Hostivařského lesoparku lze vyrazit na procházku kolem vody. V létě je zvláštní placenou službou provozovaná pláž; břehy mimo pláž je nutné rozlišovat.
**Tip recepce:** Pláž je sezónní. Koupání závisí na provozu a kvalitě vody. Nezaměňovat veřejný lesopark za placenou pláž.
**Otevírací doba:** Cesty v okolí bez stanovené návštěvní doby; provoz pláže sezónní – ověřit na oficiálním webu.
**Vstupné:** Procházka po veřejných cestách zdarma; při otevřené pláži dospělí celodenní 170 Kč, senioři/ZTP/děti do 140 cm 110 Kč, do 100 cm zdarma. K 8. 10. 2026 oficiální web uvádí pláže jako uzavřené.
**Doporučená návštěva:** 60–150 min.
**Oficiální web:** https://www.hostivarskaprehrada.cz/
**Zdroj ověření:** https://www.hostivarskaprehrada.cz/
**Fotografie v katalogu:** 2 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Průhonický park (`pruhonicky-park`)
**Úvod:** Rozsáhlý zámecký park zapsaný v UNESCO.
**Co zažijete:** Krajinářský park kolem zámku s romantickými cestami, rybníky a botanickými scenériemi. Výborný výlet na půlden, zejména v době květu rododendronů či na podzim.
**Tip recepce:** Z hotelu nejde o krátkou městskou procházku; doporučit MHD/taxi k parku a až poté pěší prohlídku. Vstupenky se kontrolují i v areálu.
**Otevírací doba:** Denně: leden–únor a listopad–prosinec 8–17; březen 7–18; duben a říjen 7–19; květen–září 7–20.
**Vstupné:** Dospělí 160 Kč, snížené 110 Kč, rodinné 430 Kč, pes 50 Kč.
**Doporučená návštěva:** 120–240 min.
**Oficiální web:** https://www.pruhonickypark.cz/
**Zdroj ověření:** https://www.pruhonickypark.cz/pro-navstevniky/oteviraci-doba/ | https://vstupenka.pruhonickypark.cz/
**Fotografie v katalogu:** 3 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Dendrologická zahrada Průhonice (`dendrologicka-zahrada`)
**Úvod:** Velká sbírková zahrada se sezonními květy a barevnými kompozicemi.
**Co zažijete:** Dendrologická zahrada se zaměřuje na kolekce stromů, keřů, trvalek a sadovnické kompozice. Příjemná varianta pro milovníky rostlin a rodiny; nejlepší doba závisí na sezoně.
**Tip recepce:** Pro rok 2026 je konec sezóny stanoven na 8. listopadu. Poslední vstup hodinu před zavřením.
**Otevírací doba:** Sezónně přibližně březen–8. listopad; duben a říjen út–ne 9–18, květen–srpen út–ne 9–19, září út–ne 9–18; 1.–8. 11. 9–17.
**Vstupné:** Dospělí 150 Kč, snížené 100 Kč, rodinné 350 Kč.
**Doporučená návštěva:** 90–180 min.
**Oficiální web:** https://dendrologickazahrada.cz/
**Zdroj ověření:** https://dendrologickazahrada.cz/pro-navstevniky/oteviraci-doba/ | https://dendrologickazahrada.cz/pro-navstevniky/cenik-vstupneho/
**Fotografie v katalogu:** 4 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Aquapalace Praha (`aquapalace-praha`)
**Úvod:** Vodní atrakce, tobogány a relaxace v Čestlicích.
**Co zažijete:** Vodní svět nabízí tobogány, bazény, divokou řeku a rodinné atrakce. Je dobrý pro celodenní program při horším počasí; sauna a wellness mohou být cenově oddělené.
**Tip recepce:** Nezaměňovat cenu pouze Vodního světa s kombinovanou vstupenkou Sauna + Vodní svět; nabídka se liší podle dne a nákupu online.
**Otevírací doba:** Vodní svět po–st 10–20, čt–pá 10–22, so 9–22, ne 9–20 (běžný rozpis, mimo výjimky).
**Vstupné:** Pouze Vodní svět podle zveřejněného ceníku: dospělí po–čt 3 h 1 049 Kč / den 1 149 Kč; pá–ne a svátky 3 h 1 299 Kč / den 1 399 Kč.
**Doporučená návštěva:** 180–360 min.
**Oficiální web:** https://www.aquapalace.cz/
**Zdroj ověření:** https://www.aquapalace.cz/sekce/vodni_svet/cenik
**Fotografie v katalogu:** 1 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Hamerský rybník a HAMR Záběhlice (`hamersky-rybnik`)
**Úvod:** Rybník s výhledy a nedalekým sportovním areálem.
**Co zažijete:** Záběhlická lokalita kombinuje procházku u vody s možností tenisu, squashe nebo posezení v restauraci. Jde o klidnější městský výlet s aktivním doplňkovým programem.
**Tip recepce:** Procházka u rybníka je jiná služba než placené sportoviště. Sport vyžaduje rezervaci podle pravidel provozovatele.
**Otevírací doba:** Veřejné okolí rybníka volně přístupné; sportovní areál HAMR denně 7:00–23:00.
**Vstupné:** Procházka zdarma; sporty a gastronomické služby podle aktuálního ceníku.
**Doporučená návštěva:** 30–90 min.
**Oficiální web:** https://www.hamrsport.cz/arealy/zabehlice
**Zdroj ověření:** https://www.hamrsport.cz/arealy/zabehlice
**Fotografie v katalogu:** 3 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

### 3.2 Praha – památky a zážitky

#### Pražský hrad (`prazsky-hrad`)
**Úvod:** Královská a prezidentská historie nad Vltavou.
**Co zažijete:** Rozsáhlý historický areál s katedrálou sv. Víta, Starým královským palácem, bazilikou sv. Jiří a Zlatou uličkou. Návštěvníci si mohou projít nádvoří nebo koupit vstupenku do objektů.
**Tip recepce:** Průchod areálem a vstupné do budov jsou dvě odlišné věci; možné kontroly a mimořádné uzavírky.
**Otevírací doba:** Areál denně 6–22; návštěvnické objekty duben–říjen 9–17, listopad–březen 9–16.
**Vstupné:** Základní prohlídkový okruh 450 Kč, snížené 300 Kč, rodinné 950 Kč; veřejný průchod areálem bez této vstupenky.
**Doporučená návštěva:** 120–240 min.
**Oficiální web:** https://www.hrad.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/prazsky-hrad/
**Fotografie v katalogu:** 5 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Karlův most (`karluv-most`)
**Úvod:** Historický kamenný most s výhledem na Hradčany.
**Co zažijete:** Gotický most přes Vltavu se sochami spojuje Staré Město a Malou Stranu. Nejhezčí atmosféra bývá ráno nebo večer a při pozorné procházce objevíte výhledy na věže a nábřeží.
**Tip recepce:** Samotný most je volně přístupný; vstup na přilehlé mostecké věže je samostatně placený.
**Otevírací doba:** Most je veřejná pěší komunikace, bez stanovené návštěvní doby.
**Vstupné:** Přechod mostu zdarma.
**Doporučená návštěva:** 20–45 min.
**Oficiální web:** https://prague.eu/cs/objevujte/karluv-most/
**Zdroj ověření:** https://prague.eu/cs/objevujte/karluv-most/
**Fotografie v katalogu:** 5 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Staroměstská radnice s orlojem (`staromestska-radnice`)
**Úvod:** Orloj, historické interiéry a věž nad Staroměstským náměstím.
**Co zažijete:** Radnice vznikla ve 14. století a její orloj představuje jeden z nejslavnějších pražských symbolů. Na věži je panoramatická vyhlídka, návštěvnický okruh zahrnuje historické prostory.
**Tip recepce:** Pozorovat venkovní orloj lze zdarma; vstup na věž a do objektu je placený.
**Otevírací doba:** Leden–březen denně 10–19; duben–prosinec denně 9–20.
**Vstupné:** Vnitřní okruh 350 Kč, snížené 230 Kč, rodinné 750 Kč; příplatek za výtah a komentovanou prohlídku.
**Doporučená návštěva:** 45–90 min.
**Oficiální web:** https://prague.eu/cs/objevujte/staromestska-radnice-s-orlojem/
**Zdroj ověření:** https://prague.eu/cs/objevujte/staromestska-radnice-s-orlojem/
**Fotografie v katalogu:** 4 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Staroměstská mostecká věž (`staromestska-mostecka-vez`)
**Úvod:** Gotická věž s výhledem na Karlův most.
**Co zažijete:** Reprezentativní vstupní brána Karlova mostu je gotickou památkou spojenou s Karlem IV. Na vyhlídku vede přibližně 138 schodů.
**Tip recepce:** Vstupní část mostu je zdarma; vyhlídková galerie je placená, bezbariérový přístup omezený.
**Otevírací doba:** Říjen–listopad denně 10–18; prosinec 10–19:30; duben–květen 10–19; červen–září 9–20:30.
**Vstupné:** Základní 250 Kč, snížené 170 Kč, rodinné 500 Kč.
**Doporučená návštěva:** 30–60 min.
**Oficiální web:** https://prague.eu/cs/objevujte/staromestska-mostecka-vez/
**Zdroj ověření:** https://prague.eu/cs/objevujte/staromestska-mostecka-vez/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Klementinum – astronomická věž a barokní knihovna (`klementinum`)
**Úvod:** Barokní areál s věží a slavnou historickou knihovnou.
**Co zažijete:** V rámci organizované prohlídky lze poznat monumentální knihovní sál a vystoupat na astronomickou věž s výhledem na historické centrum. Prohlídky mají omezenou kapacitu.
**Tip recepce:** Barokní knihovna se prohlíží podle pravidel prohlídky; není to volně přístupná studovna. Doporučen nákup e-vstupenky.
**Otevírací doba:** Běžně denně 9–20 v rámci vypsaných prohlídek.
**Vstupné:** Základní 380 Kč, snížené 230 Kč, rodinné 810 Kč.
**Doporučená návštěva:** 45–75 min.
**Oficiální web:** https://prague.eu/cs/objevujte/astronomicka-vez-a-barokni-knihovna-klementinum/
**Zdroj ověření:** https://prague.eu/cs/objevujte/astronomicka-vez-a-barokni-knihovna-klementinum/
**Fotografie v katalogu:** 2 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Josefov – Židovské muzeum a synagogy (`josefov`)
**Úvod:** Unikátní soubor synagog a Starého židovského hřbitova.
**Co zažijete:** Židovské muzeum tvoří více navštěvovaných objektů v někdejším pražském ghettu. Kombinovaná vstupenka zahrnuje historické synagogy a hřbitov; prohlídka je kulturně i historicky mimořádně významná.
**Tip recepce:** V sobotu a o židovských svátcích zavřeno; Staronová synagoga může mít jiné časy, zejména v pátek.
**Otevírací doba:** 1. 9.–17. 10. 2026 9–18; 18. 10.–31. 12. 2026 9–16:30; soboty a vybrané svátky zavřeno.
**Vstupné:** Okruh Pražské Židovské Město: dospělí 600 Kč, studenti do 26 let 400 Kč, děti 6–15 let 200 Kč.
**Doporučená návštěva:** 120–180 min.
**Oficiální web:** https://www.jewishmuseum.cz/
**Zdroj ověření:** https://www.jewishmuseum.cz/informace/navstivte-nas-rozcestnik/oteviraci-doba/ | https://www.jewishmuseum.cz/e-shop/vstupenky/prazske-zidovske-mesto/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Petřínská rozhledna (`petrinska-rozhledna`)
**Úvod:** Vyhlídka z kopce Petřín na panorama celé Prahy.
**Co zažijete:** Ocelová rozhledna stojí v petřínských sadech a nabízí působivé pohledy na město. Návštěvu lze spojit s procházkou zelení a okolními zahradami.
**Tip recepce:** Výstup může znamenat schody; výtah je za zvláštní poplatek, ověřit aktuální dostupnost.
**Otevírací doba:** Říjen denně přibližně 9–18; leden–březen a listopad–prosinec 10–18; ostatní období podle oficiální stránky.
**Vstupné:** Základní 250 Kč, snížené 170 Kč, rodinné 500 Kč; výtah za příplatek.
**Doporučená návštěva:** 45–90 min.
**Oficiální web:** https://prague.eu/cs/objevujte/petrinska-rozhledna/
**Zdroj ověření:** https://prague.eu/cs/objevujte/informacni-centrum-petrinske-rozhledny/ | https://prague.eu/cs/objevujte/petrinska-rozhledna/
**Fotografie v katalogu:** 3 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Vyšehrad (`vysehrad`)
**Úvod:** Hradby, legendy a vyhlídky nad řekou.
**Co zažijete:** Historické hradiště nabízí parky, románskou rotundu sv. Martina, baziliku sv. Petra a Pavla a hřbitov Slavín. Doporučujeme klidnější vycházku s krásnými výhledy.
**Tip recepce:** Parkový areál volně přístupný; kasematy, expozice a prohlídky se platí zvlášť.
**Otevírací doba:** Volný parkový areál celoročně; infocentrum zpravidla 10–12 a 13–18.
**Vstupné:** Veřejné cesty zdarma; vstupné do vybraných objektů dle programu.
**Doporučená návštěva:** 60–150 min.
**Oficiální web:** https://www.praha-vysehrad.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/vysehrad/
**Fotografie v katalogu:** 1 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Národní muzeum (`narodni-muzeum`)
**Úvod:** Rozsáhlé historické a přírodovědné expozice na Václavském náměstí.
**Co zažijete:** Historická a Nová budova Národního muzea tvoří jeden návštěvnický komplex. Expozice pokrývají dějiny i přírodní vědy a jsou vhodné také do deštivého počasí.
**Tip recepce:** Vstupenka do Muzejního komplexu nezahrnuje některé samostatné výstavy a Dětské muzeum.
**Otevírací doba:** Denně 10–18.
**Vstupné:** Muzejní komplex dospělí 360 Kč, snížené 260 Kč, děti do 15 let v doprovodu zdarma.
**Doporučená návštěva:** 90–180 min.
**Oficiální web:** https://www.nm.cz/
**Zdroj ověření:** https://www.nm.cz/navstivte-nas/objekty/muzejni-komplex-narodniho-muzea
**Fotografie v katalogu:** 1 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Národní technické muzeum (`narodni-technicke-muzeum`)
**Úvod:** Dopravní hala, technické sbírky a dějiny vynálezů.
**Co zažijete:** Muzeum na Letné se zaměřuje na dopravu, průmysl a technický vývoj. Rozsáhlé expozice ocení rodiny i návštěvníci zajímající se o techniku a design.
**Tip recepce:** Rudný a uhelný důl má zvláštní příplatkový režim.
**Otevírací doba:** Pondělí zavřeno, běžný provoz ostatní dny 9–18 (ověřit případné výjimky).
**Vstupné:** Hlavní budova: základní 330 Kč, snížené 200 Kč, děti 6–15 let 80 Kč, rodinné 680 Kč.
**Doporučená návštěva:** 90–180 min.
**Oficiální web:** https://www.ntm.cz/
**Zdroj ověření:** https://www.ntm.cz/pro-navstevniky/prehled-vstupneho/hlavni-budova-v-praze
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Zoo Praha (`zoo-praha`)
**Úvod:** Rozsáhlá zoologická zahrada v Troji pro celodenní výlet.
**Co zažijete:** Zoo v Troji nabízí velké množství expozic a přírodní venkovní areál. Doporučujeme vyhradit si několik hodin a počítat s kopcovitým terénem.
**Tip recepce:** U vybraných pavilonů a vstupů je kratší provozní doba; říjnové zavírání se mění s koncem letního času.
**Otevírací doba:** Říjen 9–17, od přechodu na zimní čas do 16; listopad–únor 9–16; další měsíce sezónně.
**Vstupné:** Na místě dospělí 330 Kč, děti 3–15 let 250 Kč, rodina (2 + až 4 děti) 1 000 Kč; online levněji.
**Doporučená návštěva:** 180–360 min.
**Oficiální web:** https://www.zoopraha.cz/
**Zdroj ověření:** https://www.zoopraha.cz/navsteva/oteviraci-doba | https://www.zoopraha.cz/navsteva
**Fotografie v katalogu:** 4 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Botanická zahrada Praha – Troja (`botanicka-troja`)
**Úvod:** Zahradní expozice, tropický skleník Fata Morgana a vinice.
**Co zažijete:** Rozmanitý botanický areál umožňuje procházku venkovními zahradami i návštěvu tropického skleníku. Nejzajímavější partie se mění podle roční doby a výstav.
**Tip recepce:** Skleník Fata Morgana je v pondělí uzavřený, ačkoli venkovní areál je otevřen.
**Otevírací doba:** Venkovní expozice březen–říjen denně 9–19, listopad–únor 9–16; Fata Morgana út–ne.
**Vstupné:** Na místě dospělí 180 Kč, děti 3–15 let 120 Kč, rodinné 540 Kč; online 150 / 100 / 450 Kč.
**Doporučená návštěva:** 120–240 min.
**Oficiální web:** https://www.botanicka.cz/
**Zdroj ověření:** https://www.botanicka.cz/pro-navstevniky/zakladni-informace/oteviraci-doba.html | https://www.botanicka.cz/pro-navstevniky/zakladni-informace/vstupne.html
**Fotografie v katalogu:** 3 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Obecní dům (`obecni-dum`)
**Úvod:** Secesní skvost se Smetanovou síní u Prašné brány.
**Co zažijete:** Obecní dům je významnou pražskou secesní stavbou s bohatě zdobenými interiéry. Hosté mohou navštívit kavárnu nebo absolvovat komentovanou prohlídku reprezentačních prostor.
**Tip recepce:** Prohlídky a koncerty mají vlastní termíny; pokladna není otevírací dobou všech prostor.
**Otevírací doba:** Pokladna denně 10–19; prohlídky podle rozpisu.
**Vstupné:** Komentovaná prohlídka základní 320 Kč, snížené 270 Kč, rodinné 660 Kč.
**Doporučená návštěva:** 45–90 min.
**Oficiální web:** https://www.obecnidum.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/obecni-dum/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Valdštejnská zahrada (`valdstejnska-zahrada`)
**Úvod:** Barokní geometrická zahrada s pávy a salou terrenou.
**Co zažijete:** Jedna z nejkrásnějších historických zahrad na Malé Straně. Působivé průhledy, umělá krápníková stěna a pávi vybízejí ke krátké návštěvě.
**Tip recepce:** V zimě je zahrada mimo hlavní návštěvní sezonu. Pozor na konkrétní vstupní bránu.
**Otevírací doba:** Duben–říjen po–pá 7–19, so–ne 9–19.
**Vstupné:** Vstup zdarma.
**Doporučená návštěva:** 20–45 min.
**Oficiální web:** https://www.senat.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/valdstejnska-zahrada/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Zahrady Pražského hradu (`zahrady-prazskeho-hradu`)
**Úvod:** Zahradní terasy, fontány a výhledy na centrum.
**Co zažijete:** Královská zahrada a přístupné jižní zahrady propojují renesanční, barokní i novější úpravy. Jsou vhodnou zastávkou při návštěvě Pražského hradu.
**Tip recepce:** Hartigovská zahrada je nepřístupná, ostatní zahrady jsou sezónní a mohou podléhat mimořádným uzavírkám.
**Otevírací doba:** Říjen denně 10–17, březen 10–17, duben–červen a září 10–19, červenec–srpen 10–20.
**Vstupné:** Vstup do přístupných zahrad zdarma.
**Doporučená návštěva:** 30–90 min.
**Oficiální web:** https://www.hrad.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/zahrady-prazskeho-hradu/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Žižkovská televizní věž (`zizkovska-vez`)
**Úvod:** Moderní vyhlídka vysoko nad Prahou.
**Co zažijete:** Dominanta Žižkova dosahuje výšky 216 metrů; vyhlídkové prostory se nacházejí výše než běžné pražské střechy. Na konstrukci jsou známé plastiky miminek od Davida Černého.
**Tip recepce:** Vyhlídkový prostor a restaurace jsou různé provozy, otevření akcí se může lišit.
**Otevírací doba:** Denně 9–24 podle přehledu Prague City Tourism.
**Vstupné:** Vyhlídka základní 350 Kč, snížené 250 Kč, rodinné 750 Kč.
**Doporučená návštěva:** 45–90 min.
**Oficiální web:** https://towerpark.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/prague-tv-tower-zizkov-television-tower/
**Fotografie v katalogu:** 4 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Zahrady pod Pražským hradem (`zahrady-pod-hradem`)
**Úvod:** Historické terasy a romantická zákoutí na jižním svahu.
**Co zažijete:** Soubor několika propojených palácových zahrad poskytuje architekturu, schodiště, vyhlídky a klidný program stranou hlavních davů.
**Tip recepce:** Vstup z Valdštejnské ulice; průchod přímo na Pražský hrad může být uzavřen. Při nepříznivém počasí zavřeno.
**Otevírací doba:** Duben a říjen denně 10–18, květen–září denně 10–19; sezónní.
**Vstupné:** Základní 180 Kč, snížené 140 Kč.
**Doporučená návštěva:** 45–90 min.
**Oficiální web:** https://www.palacove-zahrady.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/zahrady-pod-prazskym-hradem/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Letenské sady (`letenske-sady`)
**Úvod:** Park s panoramatem pražských mostů.
**Co zažijete:** Oblíbený park na Letné nabízí dlouhé pěší cesty, místa pro odpočinek a výhledy na Vltavu a historické centrum. Výlet lze propojit s Národním technickým muzeem.
**Tip recepce:** Veřejný park; restaurace, atrakce a historický kolotoč mají samostatné provozní podmínky.
**Otevírací doba:** Volně přístupný veřejný park.
**Vstupné:** Vstup do parku zdarma.
**Doporučená návštěva:** 30–90 min.
**Oficiální web:** https://prague.eu/cs/objevujte/letenske-sady/
**Zdroj ověření:** https://prague.eu/cs/objevujte/letenske-sady/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

#### Tančící dům a galerie (`tancici-dum`)
**Úvod:** Výrazná moderní budova u Vltavy.
**Co zažijete:** Ikonická budova od architektů Vlada Miluniće a Franka Gehryho patří k nejznámějším novodobým stavbám Prahy. Zvenčí lze obdivovat nezvyklé tvary, uvnitř se konají výstavy.
**Tip recepce:** Budovu můžete fotografovat z nábřeží bez vstupenky. Galerie a případný přístup na vyhlídku mají samostatná pravidla.
**Otevírací doba:** Galerie denně 9–20.
**Vstupné:** Exteriér zdarma; galerie základní 230 Kč, snížené 185 Kč, rodinné 600 Kč.
**Doporučená návštěva:** 20–75 min.
**Oficiální web:** https://www.galerietancicidum.cz/
**Zdroj ověření:** https://prague.eu/cs/objevujte/galerie-tancici-dum/
**Fotografie v katalogu:** 0 kandidátů s ověřenou licencí Commons; viz soupis. Stav souřadnic vstupu: PŘED PUBLIKOVÁNÍM OVĚŘIT.

## 4. Předpřipravené pěší trasy
- **Klidná procházka v okolí hotelu** (`chodov-klid`): Chodovská tvrz → Westfield Chodov. Výchozí bod: hotel nebo ručně zvolený bod. Poznámka: Lokální orientační okruh; skutečnou návaznost pěších cest a vzdálenost ověřit routerem a pěším průchodem.
- **Kunratický les a příroda** (`kunratice-priroda`): Kunratický les. Výchozí bod: schválený pěší vstup do lesa. Poznámka: Samostatná lesní procházka bez vymyšleného kruhového vedení; trasa se musí zkontrolovat na schůdných cestách.
- **Historické centrum za odpoledne** (`stare-mesto`): Obecní dům → Staroměstská radnice s orlojem → Klementinum – astronomická věž a barokní knihovna → Staroměstská mostecká věž → Karlův most. Výchozí bod: Obecní dům, Praha 1. Poznámka: Dojíždí se MHD/taxi do centra; průvodce vede pouze pěší úsek. Prohlídky interiérů jsou volitelné.
- **Hradčany a Malá Strana** (`mala-strana-hrad`): Pražský hrad → Zahrady Pražského hradu → Zahrady pod Pražským hradem → Valdštejnská zahrada. Výchozí bod: Pražský hrad, schválená vstupní brána. Poznámka: Propojení zahrad je sezónní a některé přímé průchody jsou uzavřené; editor trasy je musí v repo aktualizovat.
- **Letná a technika** (`letna-technika`): Národní technické muzeum → Letenské sady. Výchozí bod: Národní technické muzeum. Poznámka: Vhodné i za horšího počasí s pobytem v muzeu; venkovní část dle počasí.

## 5. Fotogalerie, použití a práva
K dispozici je **55 konkrétních fotografických kandidátů**, u kterých byla ve zdrojové stránce Wikimedia Commons zjištěna některá z licencí CC BY, CC BY-SA. **Není to schválený balíček publikovatelných fotografií.** Pro každou fotografii je nutná poslední kontrola originálního autora, licence a podmínek uvedení zdroje před nasazením. Obsah jiných webů se bez licence nekopíruje. Fotky nejsou v tomto podkladu fyzicky stažené.
Soubor `foto_licence.csv` obsahuje přesný odkaz na stránku každé jednotlivé fotografie, evidovanou licenci, autora (pokud byl při výzkumu dohledán) a návrh názvu lokálního souboru. Snímky s chybějícím autorem mají před vydáním blokující úkol doplnit kredit.
**Technický požadavek:** script `prepare-media` si fotografie načte z kontrolovaných originálních URL, ověří/zdokumentuje licenci a autora, převede na responzivní WebP/AVIF a vytvoří `credits.json`. Bez kompletní atribuce asset nesmí do buildu. Nedoporučuje se hotlink na Commons pro produkční galerii.
Pro Chodovský bazén, některé interiéry, akvapark a hotely nemusí existovat vhodný snímek s volnou licencí. Tyto fotografie je třeba nafotit vlastními silami nebo získat písemný souhlas. Fotky provozovatele na oficiálním webu nejsou automaticky volné.

## 6. Přesný formát souborů a správa z repozitáře
```text
src/                  # React/TypeScript UI a navigace
content/places.cs.json  # hotové texty a ceny (překladové soubory analogicky)
content/routes.cs.json  # trasy a zastávky
content/media.json      # jen finálně licenčně schválené obrázky
public/images/          # zmenšené obrázky a varianty
public/maps/praha.pmtiles # licencovaná vektorová mapa
docs/SPEC.md            # toto zadání
docs/SOURCES.md         # ověřovací odkazy a jejich datum
scripts/check-content.* # schema, odkazy, licence, duplicity
.github/workflows/site.yml  # validace + build + deploy
```
JSON schema pevně validuje `id` jedinečnost, jazyk, `officialUrl`, `sourceUrl`, `verifiedOn`, `hours`, `admission`, `imageIds`; chybějící hodnotu nemá domýšlet ani generativně doplňovat. Otevřené ceny nejsou „live“; aktualizace pouze commitem.

## 7. Bezpečnost a vydávací pojistky
1. Zdrojové texty pro CZ jsou připravené; EN a DE se musí přeložit kompletně (včetně cenových poznámek a hlasových navigačních vět) a redakčně schválit před produkcí.
2. Zveřejnit pouze prověřené souřadnice **skutečných pěších vstupů**. Ve stávajícím obsahu nejsou záměrně vymyšlené GPS body. Bez nich navigační tlačítko daného místa nesmí být aktivováno.
3. Automatické testy musí kontrolovat neměnné identifikátory, odkazy, referenční integritu tras, délku textů, chybějící překlady, licence a autora fotografií, datum ověření cen, neplatné URL a nepřítomnost tajných údajů.
4. Při nasazení používat konkrétně přidělené mapové dlaždice a vlastní Valhalla, ne veřejný demo endpoint jako produkci. Rate limiting a další ochrany u routeru; logy nesmí zaznamenávat historii pohybu.
5. Akceptace mobilu: reálný iPhone Safari a Android Chrome, GPS povoleno/odmítnuto, Wake Lock aktivní/nepodporován, 5 pěších tras včetně odchylky, výpadek internetu, zvuk a čitelnost.
6. Značky/události, vstupné a otevírací doby kontrolovat **ručně před publikací a následně při každém obsahovém releasu**. U komerčních a sezonních služeb stanovit interní povinnou čtvrtletní revizi; u ostatních půlroční. Během výjimečných provozů nutná mimořádná revize.

## 8. Definice hotového produktu
Static build prohlížeče bez loginu, bez DB, bez administrace, bez instalační nabídky, s nejméně 28 redakčně připravenými místy, kompletními CZ/EN/DE překlady, 5 ověřenými okruhy, funkční pěší navigací, legálními lokálně hostovanými fotografiemi s atribucí a ověřenými pěšími vstupy. Všechny neověřené údaje se před publikací musí dořešit, nikoli skrýt za označení „hotovo“.
