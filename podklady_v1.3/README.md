# Hotel CHODOV ASC – web průvodce v1.3 (vývojová dodávka)

Tato dodávka obsahuje aktualizovaný prototyp hotelového webu a autoritativní statické podklady. **Nenasazeno do produkce.**

- `web/` – statické stránky a prohlížečová navigace s oddělenou routovací službou. `web/public/index.html` turistický průvodce, `web/public/zdravi.html` zdravotní karta.
- `places.cs.json` – GPS 29 cílů s typem bodu a zdrojem (ne všechny jsou správné pěší vstupy).
- `hotel.json` – GPS a kontakt Hotel CHODOV ASC; pěší vstup je nutno ověřit.
- `health.cs.json` – zdravotní karta s kontakty a překlady pro lékaře.
- `ZADANI_A_OBSAH_v1.3.md` – úplný předchozí text v1.2 a nadřazená změna v1.3.
- `media-candidates.json` a `foto_licence.csv` – neschválené kandidátní fotografie, **ne automaticky publikovat**.

## Spuštění testovacího webu
Node.js 20+; `cd web && npm test && npm start`, otevřít `http://localhost:8787/`. Turistická data, PID i zdravotní pomoc jsou statické. Pěší navigace volá `/api/route`, který vyžaduje `VALHALLA_BASE_URL` (nepoužívat veřejné demo v produkci). Demo obrázek mapy využívá externí vývojové zdroje, produkční mapový hosting ještě není zapojen.

## Důležitá omezení
Web není nasazený, fyzické pěší vstupy a reálné testy GPS nebyly dokončeny. Část turistických cílů jsou plochy nebo stavby, nikoli konkrétní vstupy. Zdravotní stránka má vybranou nemocnici; nejde o výpočet geograficky nejbližší otevřené pohotovosti. PID vyhledávač je přístupný oficiálním odkazem, **výsledky spojení nejsou vestavěné**. Oficiální aplikace PID Lítačka se používá jen dobrovolně při koupi mobilní jízdenky – hotelový web se neinstaluje.
