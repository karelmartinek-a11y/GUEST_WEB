# Licence a původ médií

## Hotelové logo

Originální logo dodal Hotel CHODOV ASC v tomto zadání. Původ a hotelový Drive soubor jsou v `assets/LOGO_ZDROJ.json`. Logo se používá se zachovaným poměrem stran a průhledností. Favicon je bitmapa odvozená z dodaného loga, nikoli vymyšlený vektor.

## Dagmar

`public/media/dagmar.webp` je původní obrázek vygenerovaný vestavěným OpenAI image_gen dne 8. 10. 2026 pro tento web. Nová postava a nový pes mají odlišný design od paní Kadrnoškové a Jonatána. Seriálová reference není zahrnutá mezi publikovanými soubory. Obrázek je zmenšený a převedený do WebP.

## Skutečné fotografie

95 místních JPEG pro všech 29 míst, 2–5 na místo. Autoři a komerčně použitelné licence byly ověřeny čerstvým MediaWiki `imageinfo.extmetadata` z Wikimedia Commons. Původní seznam kandidátů sám nebyl považován za schválení. Některé licence z CSV byly zpřesněny podle API.

Přesná evidence každého souboru: `public/media/manifest.json`; zdrojové API záznamy: `docs/media-provenance/`. Manifest obsahuje autora, název licence, odkaz na její plné znění, zdrojovou File stránku, datum získání, změny (thumbnail resize), rozměry, bajty, SHA-256 a případné upozornění na historický snímek. Web uvádí kredit u velkých fotografií a v přehledu všech autorů.

Použité licence zahrnují CC BY, CC BY-SA, CC0 a public domain. U CC BY-SA se požadavek vztahuje na konkrétní fotografii a její upravené kopie. Změnou byl pouze rozměr snímku podle thumbnailu Commons; fotografie zůstávají samostatnými soubory se svými licencemi.

## Mapy

Data © OpenStreetMap contributors, [ODbL 1.0](https://www.openstreetmap.org/copyright). Natural Earth: public domain. Mapový výřez pochází z Protomaps daily build `https://build.protomaps.com/20261007.pmtiles`, OSM replication timestamp 2026-10-07T04:00:00Z. Metadata v `public/maps/metadata.json`. Výřez: 14.22,49.92,14.72,50.25; zoom 0–15. Vlastní style a lokální PMTiles; žádný veřejný OSM tile server. Atribuce je na mapě viditelná.

MapLibre GL JS: BSD-3-Clause, PMTiles: BSD-3-Clause, Valhalla: MIT. Routing OSM zdroj BBBike [Prag](https://download.bbbike.org/osm/bbbike/Prag/) je ODbL; sestavený graf musí mít provenance a hash před nasazením.

## Fonty a software

Cormorant Garamond, DM Sans a Noto Sans: SIL Open Font License 1.1. Fonty se obsluhují místně; plná znění jsou v `public/fonts/` a `public/maps/Noto-Sans-OFL.txt`.

React, Vite, Motion a Lucide: příslušné MIT/ISC licence z uzamčených balíčků. M2M100 418M redakční offline překladový model: MIT; model ani jeho runtime nejsou součástí webového nasazení. Úplná licence je na [modelové stránce Meta](https://huggingface.co/facebook/m2m100_418M).
