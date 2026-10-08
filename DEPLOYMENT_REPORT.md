# GUEST_WEB — deployment report

Stav k 9. 10. 2026: **FULL PRODUCTION BLOCKED**, nasazení ještě neprovedeno.

## Cíl

- Uživatel sdělil `guest.hcasc.cz` v tomto chatu.
- DNS A `89.221.222.92`, AAAA `2a02:2b88:2:b5c::1`; obě adresy zjištěny i na produkčním stroji.
- V preflight není žádný vhost `guest.hcasc.cz`, nový certifikát ještě neexistuje. Stávající TLS pro nový název odmítá SNI; žádný cizí vhost se nepoužije.

## Ověřený serverový preflight

SSH `produkce`, 8. 10. 2026 20:49 UTC: 4 CPU, RAM 7.8 GiB, dostupná RAM přibližně 4.4 GiB, 18 GiB volno na root, obsazenost 88 %, load 0.02 / 0.05 / 0.07. `nginx -t` PASS; existují dřívější warnings o listen/protocol options u GPT/HA.

Hotel, Dagmar, HA a OAuth metadata GPT vracely HTTP 200, Mail MCP HTTP 401 bez autentizace (očekávaná ochrana, nikoli výpadek). Podstatné služby aktivní. Před každou mutací se preflight zopakuje.

Pouze nové jméno, vlastní statický root, vlastní release namespace, nový omezený uživatel a certifikát. Žádné současné konfigurace či kontejnery nebyly upraveny. Vhosty a jejich hashe se ověřují před/po; podklady budou v `docs/production-preflight.json` a read-back reportu.

## Připravené bezpečné nasazení

- CI test → build → mobilní/desktop e2e → otestovaný SHA artifact → prod gate.
- Restricted SSH receiver kontroluje cesty tar archivu, velikost, manifest, repo a SHA. Nespouští uploadované soubory.
- Web v `/opt/guest-web/releases/<SHA>/www`; přepnutí `current` je atomické. Při rozdílu v SHA či zdraví/konfiguraci jiných webů se vrací pouze vlastní symlink.
- Vlastní HTTPS, CSP, geolocation self, žádný access log, místní fonty, galerie a mapy.
- Routovací API je vypnuté, dokud neexistují fyzické důkazy. Nenastavuje se obecný backend, účty ani administrační systém.

## Otevřené brány

Fyzický vstup hotelu, pět cílových vstupů a deset skutečných chůzí (pět iPhone, pět Android) nedoloženy. V1.4 §9 výslovně zakazuje zapojení automatických produkčních kroků před splněním kritických bran. Rozhodnutí o použitelné statické verzi s navigací vypnutou zatím nedoloženo. Překlady dalších devíti jazyků potřebují rodilou korekturu.

## Testy

Výsledky finálního lokálního běhu, přesný commit, Actions run, veřejný runtime SHA, certifikát a rollback budou doplněny po skutečném provedení. Tento dokument neslibuje neprovedené nasazení ani fyzické testy.

## Obnoveny preflight 9. 10. 2026

Aktualni audit v `docs/production-preflight-2026-10-09.json`: 8. 10. 2026 22:32 UTC (9. 10. lokalne), RAM 15.6 GiB, dostupna 12.4 GiB, disk 94.8 GiB volno, obsazenost 56 %. Server ma vyssi kapacitu nez starsi podklad; nezasahovali jsme do jeho zdroju. Nginx test PASS a sledovane sluzby aktivni. Zadna produkcni mutace GUEST_WEB dosud neprovedena.

Lokalne: 10 unit/HTTP testu, 34 Playwright testu desktop/mobil Chromium, 12 jazyku a 120 statickych cest. Npm audit: 0 vulnerabilities. Tiskove dukazy vsech 12 jazyku po jedne A4, vizualni kontrola originalni Dagmar, mobilniho uvodu a lekarske karty. Vstupni brana fyzickych telefonu tim splnena neni.
