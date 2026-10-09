# Příprava webové asistentky Rain

Zdroj je [Rain v3.3 od Blender Studio](https://studio.blender.org/characters/rain/v3/),
CC BY 4.0, stažený 9. 10. 2026 bez účtu a platby. ZIP obsahuje soubor
`Rain v3.3/rain_v3.2.blend` — rozdílné číslo v názvu souboru pochází od autora.
Pohyb je z Quaternius Universal Animation Library Standard, CC0 1.0.
Konkrétní soubory, licence a SHA-256 uvádí `dagmar-animation-sources.json`.

Povinné autorství na webu a u odvozeného statického náhledu:
**Rain Rig (CC) Blender Foundation | studio.blender.org**.
Web současně odkazuje na CC BY 4.0 a označuje úpravy ve všech 12 jazycích.

## Reprodukce

Ověřený nástroj: Blender 4.5.14 LTS. Před spuštěním ověřit SHA staženého
instalačního souboru proti oficiálnímu souboru SHA-256. Python pro kompresi
obrázků potřebuje Pillow (ověřeno 11.3.0). Zdrojové ZIP, .blend a mezisoubory
patří do ignorované `.cache/dagmar/`, nikoli do veřejného Git repozitáře.

1. Rozbalit Rain do `.cache/dagmar/rain-source/` a Quaternius Standard do
   `.cache/dagmar/quaternius-standard/` se zachováním vnitřních adresářů.
2. V kořeni projektu spustit níže uvedené příkazy. `RAIN_BLENDER` je absolutní
   cesta k oficiálnímu binárnímu souboru Blenderu na daném stroji.

```sh
"$RAIN_BLENDER" --background --disable-autoexec \
  '.cache/dagmar/rain-source/Rain v3.3/rain_v3.2.blend' \
  --python scripts/prepare-rain.py
"$RAIN_BLENDER" --background --disable-autoexec \
  .cache/dagmar/rain-web-base.blend --python scripts/animate-rain.py
npm install --prefix .cache/dagmar/asset-tools --no-save --ignore-scripts \
  @gltf-transform/core@4.5.1 @gltf-transform/extensions@4.5.1 \
  @gltf-transform/functions@4.5.1 meshoptimizer@1.1.0
node scripts/compress-rain.mjs
```

Embedded Python autora se nespouští. Původní geometrie, materiálové barevné
grafy, váhy a obličejové korekce se vyhodnocují offline. Žádný Blender ani
kompresní nástroje nejsou nutné při běžném sestavení či provozu webu.

Výstupem jsou GLB a WebP s názvy podle obsahu, `src/dagmar/asset.json`
a aktualizované kontrolní součty výstupů v evidenci zdrojů. Při změně zdrojového
archivu je nutné znovu ověřit jeho licenci a zaznamenat jeho skutečný hash.
Starší již publikované soubory se zachovávají pro otevřené klienty; nepublikované
pokusné výstupy se nestagují do Gitu.

## Vizuální kontrola

Kontrolovat obličej, úplné vlasy včetně zadní části, cop z profilu, spojení
ramen, průniky těla a oblečení, chodidla, klidový postoj a prsty. Kontrolovat
otevřené, zaoblené a široké rty, zavření rtů a souběžné zavření víček a řas.
Prohlédnout skutečnou chůzi, otočení, gesto a přechody do řeči ve webovém
rendereru, vedle automatických kontrol na 1280, 390 a 320 px.

Asistentka začíná klidným úsměvem. První automatická procházka následuje až
po 18 sekundách. Ukazující gesto má pokrčený loket; v klidovém stavu se
automaticky neopakuje. Zdravotní volby a GPS se do řeči nepředávají.

Časování rtů uvnitř slov je odhad z textu, ukotvený událostmi prohlížečového
hlasu. Více správně deformovaných výrazů samo nedokládá fonémovou přesnost.
Automatické testy používají simulované události TTS a emulaci telefonu;
skutečný zvuk, Safari na iPhonu a fyzický Android zůstávají neověřené.
