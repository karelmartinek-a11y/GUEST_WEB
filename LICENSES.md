# Licence a původ médií

## Hotelové logo

Originální logo dodal Hotel CHODOV ASC v tomto zadání. Původ a hotelový Drive soubor jsou v `assets/LOGO_ZDROJ.json`. Logo se používá se zachovaným poměrem stran a průhledností. Favicon je bitmapa odvozená z dodaného loga, nikoli vymyšlený vektor.

## Dagmar

`public/media/dagmar.webp` je původní obrázek vygenerovaný vestavěným OpenAI image_gen dne 8. 10. 2026 pro tento web. Nová postava a nový pes mají odlišný design od paní Kadrnoškové a Jonatána. Seriálová reference není zahrnutá mezi publikovanými soubory. Obrázek je zmenšený a převedený do WebP.

Pohyblivá asistentka používá profesionální postavu **Rain v3.3** od [Blender Studio](https://studio.blender.org/characters/rain/v3/) pod [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Po pozdějším výslovném pokynu uživatele může mít průvodkyně podobu postavy třetí strany. Archiv byl stažen 9. 10. 2026 bez registrace a platby. Licence dovoluje komerční použití a úpravy s autorstvím, odkazem na licenci a označením změn. Povinný kredit **Rain Rig (CC) Blender Foundation | studio.blender.org** je v přehledu zdrojů na webu. Hotelu ani webu se nepřipisuje autorství původního modelu.

Původní povrchy, vlasy, oči, oblečení a anatomie pocházejí z Rain. Pro web se vyhodnotily modifikátory, vypálily barevné textury, vytvořilo sedm výrazů z původního obličejového rigu, změkčil oblouk obočí a přidal vřelý úsměv. Klidový postoj má uvolněné ruce a užší postavení nohou. Místní statický náhled je render stejné upravené Rain a má stejnou licenci. Původní ilustrace `public/media/dagmar.webp` zůstává zachovaná v archivu projektu.

Čtyři pohybové sekvence `Idle_Loop`, `Walk_Formal_Loop`, `Idle_Talking_Loop` a `Interact` pocházejí z [Quaternius Universal Animation Library Standard](https://quaternius.itch.io/universal-animation-library), **CC0 1.0**, rovněž bez účtu a platby. Jsou přizpůsobené proporcím Rain. Starší CC0 rig se ponechává pro již otevřené klienty předchozího vydání, aktuální aplikace jej nestahuje. Nedokonalá původní podoba není současným modelem.

Přesné zdroje, SHA-256 archivů, modelu a náhledu i popis změn jsou v `docs/dagmar-animation-sources.json`. Výsledné soubory mají název s kontrolním součtem, aby se nepoužil starý model z cache. Licenční oznámení jsou v `public/media/dagmar/rain-CC-BY-4.0.txt`, `motions-CC0.txt`, `base-CC0.txt`, `three-MIT.txt` a `meshoptimizer-MIT.txt`. Převod reprodukují `scripts/prepare-rain.py`, `scripts/animate-rain.py` a `scripts/compress-rain.mjs`; mezisoubory a zdrojové archivy se nepublikují v Git.

Řeč používá Web Speech API po kliknutí. Časování mimiky se opírá o události začátku/slov a odhad tvarů rtů uvnitř slov. Není to záznam herecké mimiky ani přesná fonémová synchronizace; chybějící hlas vybraného jazyka se nenahrazuje jiným jazykem.

## Skutečné fotografie

116 místních JPEG pro všech 36 míst, 2–5 na místo. Autoři a komerčně použitelné licence byly ověřeny čerstvým MediaWiki `imageinfo.extmetadata` z Wikimedia Commons. Původní seznam kandidátů sám nebyl považován za schválení. Některé licence z CSV byly zpřesněny podle API. Evidence dalších sedmi cílů je v `docs/media-provenance/unesco-additions/`.

Přesná evidence každého souboru: `public/media/manifest.json`; zdrojové API záznamy: `docs/media-provenance/`. Manifest obsahuje autora, název licence, odkaz na její plné znění, zdrojovou File stránku, datum získání, změny (thumbnail resize), rozměry, bajty, SHA-256 a případné upozornění na historický snímek. Web uvádí kredit u velkých fotografií a v přehledu všech autorů.

Použité licence zahrnují CC BY, CC BY-SA, CC0 a public domain. U CC BY-SA se požadavek vztahuje na konkrétní fotografii a její upravené kopie. Změnou byl pouze rozměr snímku podle thumbnailu Commons; fotografie zůstávají samostatnými soubory se svými licencemi.

## Hotelová fotografie a oficiální emblém UNESCO

`public/media/hotel-chodov-asc.jpg` pochází z uživatelem dodané knihy `Hotel_Chodov_ASC_Kniha_pro_hosty_STRANA_10_MAPA_V6_2026.docx`, vloženého souboru `word/media/image3.jpg`. Uživatel výslovně požádal o fotografii budovy na mapovém bodu hotelu. Optimalizováno je pouze JPEG kódování, kompozice zůstala zachovaná. Nevymýšlíme jméno fotografa ani veřejnou licenci; záznam původu, rozměry a kontrolní součty jsou v `public/media/hotel-provenance.json`.

`public/media/unesco-official.svg` je přesný nezměněný soubor z [oficiálního webu World Heritage Centre](https://whc.unesco.org/en/emblem/), s původními barvami a poměrem stran. Na výslovný pokyn uživatele je použit pouze u míst náležejících k zápisu [Historic Centre of Prague / Průhonice Park, 616bis](https://whc.unesco.org/en/list/616/). Záznam `public/media/unesco-provenance.json` uvádí přímý zdroj, hash a pokyn k použití; neuděluje obecnou licenci emblému. Web neuvádí patronát či partnerství hotelu s UNESCO.

## Mapy

Data © OpenStreetMap contributors, [ODbL 1.0](https://www.openstreetmap.org/copyright). Natural Earth: public domain. Mapový výřez pochází z Protomaps daily build `https://build.protomaps.com/20261007.pmtiles`, OSM replication timestamp 2026-10-07T04:00:00Z. Metadata v `public/maps/metadata.json`. Výřez: 14.22,49.92,14.72,50.25; zoom 0–15. Vlastní style a lokální PMTiles; žádný veřejný OSM tile server. Atribuce je na mapě viditelná.

MapLibre GL JS: BSD-3-Clause, PMTiles: BSD-3-Clause, Valhalla: MIT. Routing OSM zdroj BBBike [Prag](https://download.bbbike.org/osm/bbbike/Prag/) je ODbL; sestavený graf musí mít provenance a hash před nasazením.

## Fonty a software

Cormorant Garamond, DM Sans a Noto Sans: SIL Open Font License 1.1. Fonty se obsluhují místně; plná znění jsou v `public/fonts/` a `public/maps/Noto-Sans-OFL.txt`.

React, Vite, Motion a Lucide: příslušné MIT/ISC licence z uzamčených balíčků. Three.js a meshoptimizer: MIT, plná znění v `public/media/dagmar/three-MIT.txt` a `meshoptimizer-MIT.txt`. M2M100 418M redakční offline překladový model: MIT; model ani jeho runtime nejsou součástí webového nasazení. Úplná licence je na [modelové stránce Meta](https://huggingface.co/facebook/m2m100_418M).
