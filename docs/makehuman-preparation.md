# Realistická Dagmar z MakeHuman

Model je dospělá žena vytvořená z nativních MakeHuman dat: běžné lidské
proporce, světlá pleť, hnědé oči, kompletní dlouhé vlasy, civilní oděv,
jemný úsměv a uvolněné ruce. Jde o realisticky proporční 3D avatar.
Fotorealistická herecká animace se tímto převodem nedokládá.

Oficiální MPFB 2.0.17 rozlišuje GPL programový kód a CC0 grafická data,
včetně modelů, terčů, rigů a výstupů. Systémový balík je výslovně CC0.
Face Units 01 a Visemes 02 od Mika Suominen jsou rovněž CC0.
Pohyb pochází z Quaternius Universal Animation Library Standard, CC0.
Žádný zdroj nevyžaduje účet nebo platbu. Přímé zdroje, hashe archivů,
licence, vybrané assety a výsledné soubory uvádí `dagmar-animation-sources.json`.

## Reprodukce

Použité nástroje: Blender 4.5.14 LTS, MPFB 2.0.17, Pillow 11.3.0,
glTF Transform 4.5.1 a meshoptimizer 1.1.0. Ověřit SHA archivů proti evidenci.
Připravit pracovní adresář `GUEST_DAGMAR_WORK`, nejlépe na interním disku:

- MPFB tag ZIP rozbalit do `mpfb2-2.0.17/`.
- Systémový CC0 ZIP, Face Units 01 a Visemes 02 rozbalit společně do
  `downloads/assets/` se zachováním adresářů `clothes`, `targets`, `packs` atd.
- Quaternius Standard rozbalit do projektové
  `.cache/dagmar/quaternius-standard/` se zachováním vnitřních adresářů.

Příkazy spustit v kořeni projektu; `GUEST_DAGMAR_BLENDER` je cesta k binárnímu
souboru Blenderu, `GUEST_DAGMAR_WORK` absolutní cesta k pracovnímu adresáři.

```sh
"$GUEST_DAGMAR_BLENDER" --background --factory-startup --disable-autoexec \
  --python scripts/prepare-makehuman.py -- "$GUEST_DAGMAR_WORK"
"$GUEST_DAGMAR_BLENDER" --background \
  "$GUEST_DAGMAR_WORK/dagmar-realistic-native.blend" --disable-autoexec \
  --python scripts/animate-makehuman.py -- "$GUEST_DAGMAR_WORK"
npm install --prefix .cache/dagmar/asset-tools --no-save --ignore-scripts \
  @gltf-transform/core@4.5.1 @gltf-transform/extensions@4.5.1 \
  @gltf-transform/functions@4.5.1 meshoptimizer@1.1.0
node scripts/compress-makehuman.mjs "$GUEST_DAGMAR_WORK"
```

MPFB se načítá z ověřeného zdrojového archivu do izolovaného pracovního
adresáře. Skripty nemění uživatelovu konfiguraci Blenderu. Blender může při
Python chybě vrátit nulu; ověřit také značky `REALISTIC_PREVIEW_DONE`
a `REALISTIC_EXPORT_DONE` v logu. Zdrojové archivy, .blend a renderované
kontrolní snímky se nestagují do Gitu. Běžný build webu tyto nástroje nepotřebuje.

Převod zachová nativní obličejové deformace a zredukuje je do sedmi výrazů:
otevření, zaoblení a roztažení úst, sevření rtů, mrknutí, úsměv a obočí.
Oči, víčka, řasy, zuby a jazyk sledují původní terče. Zakryté části těla
se maskují. Horní ponožkové části bot se oříznou pod kalhotami. Model se
vyhodnotí v neutrální póze pohybové kostry před přenosem vah a sekvencí.
Textury zůstanou lokální a vložené v GLB; alfa vlasů a řas se zachová.

## Ověření

Vedle kontrol licence, hashů, skutečných deformací a sekvencí prohlédnout
obličej, vlasy zepředu/z profilu/zezadu, spojení těla, oblečení, boty,
chůzi oběma směry, ukazování a řeč ve skutečném webovém rendereru.
Zkontrolovat také šířky 1280, 390 a 320 px a statický náhled při omezení pohybu.

Mimika používá události začátku a hranic slov prohlížečového hlasu a odhad
visémů uvnitř slov. Testy simulují TTS; nedokládají přesnou fonémovou
synchronizaci, skutečný zvuk ani fyzický iPhone/Android.
