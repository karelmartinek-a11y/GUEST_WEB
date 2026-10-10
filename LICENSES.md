# Licence a původ médií

## Hotelové logo

Originální logo dodal Hotel CHODOV ASC v tomto zadání. Původ a hotelový Drive soubor jsou v `assets/LOGO_ZDROJ.json`. Logo se používá se zachovaným poměrem stran a průhledností. Favicon je bitmapa odvozená z dodaného loga, nikoli vymyšlený vektor.

## Dagmar

`public/media/dagmar.webp` je původní obrázek vygenerovaný vestavěným OpenAI image_gen dne 8. 10. 2026 pro tento web. Nová postava a nový pes mají odlišný design od paní Kadrnoškové a Jonatána. Seriálová reference není zahrnutá mezi publikovanými soubory. Obrázek je zmenšený a převedený do WebP.

Aktuální postavu **Female_Adult_01 z Microsoft Rocketbox** (blond culík, růžová košile a džíny) uživatel výslovně vybral 10. 10. 2026. Model, původní textury, kostra, váhy, obličejové terče i kompatibilní ženské animace jsou z oficiálního repozitáře pod [MIT](https://github.com/microsoft/Microsoft-Rocketbox/blob/0943055db6ec570bcef9f2c8b41c9e5467c808f9/LICENSE.md), copyright © 2020 Microsoft. Získané bez účtu a platby. Plný licenční text je součástí webu v `public/media/dagmar/rocketbox-MIT.txt`. Zdrojové cesty, SHA-256, úpravy, výsledný model a render zaznamenává `docs/dagmar-animation-sources.json`; přípravu `docs/rocketbox-preparation.md`.

Zachována je původní lidská síť a její váhy; používají se vybrané klidné úseky nativních animací, gesto otevřenou dlaní a chůze. Obličej používá původní visémy, úsměv a mrkání. Statický náhled vznikl z téhož schváleného modelu v místním Three.js přehrávači. Upravené textury a GLB jsou rovněž distribuované s licencí MIT a úplným původním oznámením.

### Historické modely zachované pro otevřené klienty

Předchozí asistentka byla dospělá žena vytvořená v **MakeHuman / MPFB 2.0.17** z nativní lidské sítě, modelovacích terčů a systémových assetů pod [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Základní anatomie, světlá pleť, hnědé oči, kompletní vlasy, obočí, řasy, zuby, jazyk, oblečení a boty pocházejí z oficiálního CC0 balíku. Obličejové terče a visémy jsou od Mika Suominen, rovněž CC0. Zdroje byly staženy 9. 10. 2026 bez registrace a platby. [Oficiální licence MPFB](https://github.com/makehumancommunity/mpfb2/blob/v2.0.17/LICENSE.md) výslovně odděluje GPL programový kód od CC0 grafických dat a výsledných modelů/renderů. Programový kód MPFB se do webu nepřidává.

Pro web byly upravené proporce, jemný úsměv, civilní barvy oděvu, zakrytí těla pod oblečením a návaznost bot na kalhoty. Sedm výrazů vzniklo z původních terčů rtů, čelistí, tváří a víček. Náhled při omezených animacích je render stejného modelu a má rovněž CC0. Čtyři sekvence `Idle_Loop`, `Walk_Formal_Loop`, `Idle_Talking_Loop` a `Interact` jsou z [Quaternius Universal Animation Library Standard](https://quaternius.itch.io/universal-animation-library), CC0, bez účtu a platby. Kostra a váhy byly přizpůsobené lidským proporcím; ukazování řídí místní IK.

Přesné archivy, vybrané assety, SHA-256, změny a výsledné soubory uvádí `docs/dagmar-makehuman-sources-2026-10-09.json`. Převod reprodukují `scripts/prepare-makehuman.py`, `scripts/animate-makehuman.py` a `scripts/compress-makehuman.mjs` podle `docs/makehuman-preparation.md`. Mezivýsledky ani zdrojové archivy se nepublikují v Git. Plná licence grafických dat je v `public/media/dagmar/makehuman-CC0.txt`; licence pohybu a runtime knihoven v `motions-CC0.txt`, `three-MIT.txt` a `meshoptimizer-MIT.txt`.

Starší soubory Rain a Quaternius zůstávají zachované pro již otevřené klienty. Aktuální aplikace je nenačítá. Rain je [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), kredit **Rain Rig (CC) Blender Foundation | studio.blender.org**, zdroj [Blender Studio](https://studio.blender.org/characters/rain/v3/). Původní licence `rain-CC-BY-4.0.txt`, zdrojové hashe, upravené textury, rig, sedm výrazů a náhled jsou zachovány v historii a záznamu `retainedLegacy`. Původní ilustrace `public/media/dagmar.webp` zůstává zachovaná v archivu projektu.

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
