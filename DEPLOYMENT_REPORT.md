# GUEST_WEB — deployment report

Stav k 9. 10. 2026: **STATIC PRODUCTION DEPLOYED AND VERIFIED**. Uživatel v tomto chatu potvrdil „potvrzuji“ po konkrétní otázce na veřejné statické vydání a automatické nasazování dalších commitů na main s vypnutou živou pěší navigací. Rozhodnutí je zaznamenané v `docs/acceptance-evidence.json`. Fyzická akceptace vlastní navigace zůstává nedoložená.

## Doména, HTTPS a izolace

Cíl je `https://guest.hcasc.cz`. DNS A `89.221.222.92` a AAAA `2a02:2b88:2:b5c::1` odpovídají produkčnímu stroji. Před přípravou žádný vhost, certifikát, účet ani namespace tohoto webu neexistoval. Vytvořen byl pouze účet `guest-web`, vlastní vhost a cesty `/opt/guest-web`, `/var/lib/guest-web`, `/etc/guest-web`.

Nový certifikát Let's Encrypt je ověřený přes HTTPS a platí do 6. 1. 2027. Stávající aktivní `certbot.timer` jej automaticky obnovuje; profil tohoto certifikátu má vlastní rootem spravovaný hook `/etc/guest-web/guest-web-renew-certificate.sh`, který po `nginx -t` reloaduje Nginx. Jiné certifikáty, vhosty a globální konfigurace se nezměnily. Web nyní obsahuje skutečné otestované vydání a HTTP přesměrovává na HTTPS.

## Ověřená bezpečnost a serverový stav

Bezprostřední audit `docs/production-preflight-before-deploy-2026-10-09.json`: 9. 10. místně, čtyři CPU, přibližně 15.6 GiB RAM, 94.8 GiB volného místa, 56 % obsazenost. Nginx test prošel; pět sledovaných služeb bylo aktivních. Hotel, Dagmar, HA a GPT OAuth metadata byly dostupné, Mail MCP odpovídal 401 bez autentizace, jak odpovídá ochraně endpointu. Starší audit zůstává v `docs/production-preflight-2026-10-09.json`.

`docs/production-static-setup-2026-10-09.json` dokládá skutečné vlastníky a oprávnění. Receiver a SSH home jsou root-owned; účet má pouze čtení přes vlastní primární skupinu, nikdy zápis do SSH konfigurace či receiveru. Jiný SSH příkaz než `deploy <SHA>` byl skutečně odmítnut. Serverový klíč je připnutý podle již ověřeného spojení `ssh produkce`. Soukromý deployment klíč je předaný přes stdin do GitHub Secrets, není v Git ani výstupech.

Parent `/var/lib/guest-web` a ACME webroot spravuje root. Deployment účet zapisuje jen do `/var/lib/guest-web/deploy` a vlastního release namespace; nemůže nahradit certifikační webroot. Kontrolní součty všech šesti starších vhostů a všech původních veřejných certifikátů po přípravě i nasazení zůstaly shodné. HTTP stavy a pět sledovaných služeb se také nezměnily: `docs/production-preservation-2026-10-09.json`, navazující serverový audit a skutečný deployment receipt.

## GitHub → test → build → deploy

Veřejný repozitář je [karelmartinek-a11y/GUEST_WEB](https://github.com/karelmartinek-a11y/GUEST_WEB). Každý push na main spouští audit závislostí, typy, validaci obsahu/licencí, 14 unit/HTTP testů, build 120 jazykových stránek a 44 Playwright průchodů desktop/mobil Chromium. Původní statická verze prošla [CI 37859827071](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37859827071), commit `31dfbb415254e5fe77a877d73114d8f1fdc8e091`, s nulovým nálezem auditu. Její deploy job byl ještě přeskočen před schválením.

Nyní jsou uložené `GUEST_WEB_SSH_KEY`, `GUEST_WEB_KNOWN_HOSTS` a `GUEST_WEB_DEPLOY_ENABLED=true`. Schvalovací commit `113b2d87ee4286f7f938f064219e6a844d5fef45` prošel [CI i deployem 37861768418](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37861768418). Veřejný runtime měl stejné SHA. Job používá přesně tentýž otestovaný artifact a SHA, nikdy druhý build na serveru. Receiver kontroluje tar cesty, velikost, repo, SHA a vypnutou navigaci; nespouští uploadované soubory. Účet nemá sudo ani právo měnit jiné projekty.

Release je `/opt/guest-web/releases/<SHA>/www`, přepnutí `current` atomické. Veřejný `/release.json` musí odpovídat testovanému SHA. Při chybě se vrací pouze vlastní symlink. Udržuje se nejvýše pět vlastních vydání a 2 GiB projektový rozpočet; jiné disky či projekty se nečistí. Hashované JS/CSS a mapový worker se navíc obsluhují z `/opt/guest-web/assets`, takže již otevřená stránka může načíst svou původní mapovou sekci i po novém vydání. Obsah shodného názvu musí být byte-identický; cache zachovává soubory pěti uchovaných vydání a čistí pouze vlastní nepotřebné soubory.

## Veřejné ověření prvního vydání

Přímo proti `https://guest.hcasc.cz` prošlo všech 36 Playwright průchodů desktop/mobil Chromium, včetně všech jazyků, osmi restaurací, zdravotních voleb, dopravy, UNESCO a skutečně načtené místní mapy s fotografickým bodem hotelu. Po zapojení trvalých hashovaných assetů navíc prošly čtyři příslušné průchody mapy a úvodu. Tato evidence nenahrazuje fyzické telefony ani skutečnou chůzi.

`docs/production-public-verification-2026-10-09.json` dokládá 120 existujících jazykových stránek, 116 dostupných JPEG, kontrolní součty hotelové fotografie a nezměněného oficiálního emblému, PMTiles Range 206, správný MIME modulu workeru, CSP/HTTPS hlavičky, HTTP→HTTPS, skutečný 404 a vypnutý routing 503. `docs/production-first-deploy-receipt-2026-10-09.json` pochází přímo z receiveru; obsahuje hash přijatého archivu a kontrolu veřejného SHA. Jde o snímek prvního vydání; aktuální SHA je vždy na [release.json](https://guest.hcasc.cz/release.json) a další main commity jej automaticky mění po testech.

## Mapa, navigace a fyzické brány

Předchozí asistentka z 9. 10. 2026 je na poslední pokyn uživatele dospělá žena s běžnými lidskými proporcemi, světlou pletí a civilním oblečením, vytvořená z MakeHuman / MPFB 2.0.17. Model, původní obličejové terče Mika Suominen a pohyb Quaternius jsou CC0; získané bez účtu a platby. Má kompletní dlouhé vlasy, hnědé oči, nativní rty, víčka, řasy, zuby a jazyk, jemný úsměv, uvolněné ruce a přizpůsobené pohybové sekvence. Její licenci a hashe všech zdrojů uvádí `docs/dagmar-makehuman-sources-2026-10-09.json`; reprodukci `docs/makehuman-preparation.md`. Starší Rain zůstává pouze pro otevřené klienty a v historické evidenci.

Model i statický náhled mají názvy s kontrolním součtem. Model se stahuje jen při povoleném pohybu a renderování se mimo obrazovku zastavuje. Ovládání a hlasy mají všech 12 jazyků; žádná zdravotní volba ani GPS se do řeči nepředává. Web Speech API neposkytuje zvuk ani fonémová časování: ústa reagují na skutečný začátek a slovní události, časování uvnitř slov se odhaduje. Automatická simulace hlasů není dokladem skutečného zvuku či přesné synchronizace na fyzickém telefonu. Profesionální model s webovými sekvencemi není tvrzením o filmovém hereckém výkonu nebo přesném dabingu.

Ověření realistické Dagmar zaznamenává `docs/dagmar-realistic-verification-2026-10-09.json`. Při skutečné vizuální kontrole byla opravena průhlednost materiálů: pleť, oči a zuby jsou neprůhledné, vlasy a řasy používají alfa výřez se zápisem hloubky. Původní export označoval všechny materiály jako průhledné a v prohlížeči odhaloval skrytou geometrii. Regresní kontrola materiálů je součástí testu GLB. Bezprostřední read-only audit `docs/production-preflight-realistic-2026-10-09.json` dokládá kapacitu, DNS, listenery, hashe Nginxu, aktivní služby a jejich HTTP stavy. Statické nasazení používá stávající schválený postup; živá navigace zůstává vypnutá.

Rain prošla [CI a nasazením 37916954742](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37916954742), SHA `c9718ca644297698707e90fbd8d12b5c666d5ba2`, se 14/14 unit a 44/44 UI testy. Následná skutečná veřejná kontrola odhalila chybějící produkční CSP oprávnění pro WebAssembly dekodér a `blob:` fetch vložených textur. Po opakování všech 44 lokálních testů s produkčními hlavičkami byl změněn pouze `/etc/guest-web/headers.conf`: `script-src` doplňuje `'wasm-unsafe-eval'`, `connect-src` doplňuje `blob:`. Před i po změně prošel `nginx -t`; následoval reload. Všech osm vhostů, globální konfigurace Nginxu, listenery, sledované služby a HTTP stavy zůstaly shodné. Veřejný renderer poté prošel načtením modelu a textur, chůzí oběma směry, gestem na 1280/320 px, kontrolou zmenšeného pohybu a nulových cizích požadavků či JS chyb. Konkrétní kontrolní součty a snímek ověření uvádí `docs/dagmar-public-verification-2026-10-09.json`. Testovací Vite preview nyní přebírá stejné hlavičky přímo z `infra/guest-web.headers.conf`; test skutečného rendereru vyžaduje přítomnost CSP.

Katalog má 36 míst, 116 katalogových fotografií, všech osm restaurací, 22 územně příslušných označení UNESCO a 12 jazyků. Mapa, galerie, externí pěší odkazy, doprava, zdravotní karta a ostatní obsah jsou součástí statického vydání. Automatické mobilní rozměry ani 12 jednostránkových A4 důkazů nejsou fyzickou chůzí.

Vlastní pražský graf a Valhalla 3.6.3 prošly [syntetickým CI ověřením](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37857716009) mimo produkci. Zdroj a kontrolní součty jsou v `docs/navigation-build-evidence.json`. Graf a engine nebyly instalovány na produkční server; CS/EN/DE syntetické trasy nenahrazují skutečné chůze a neověřují ostatní jazyky pokynů.

`SPECIFIKACE_MASTER_v1.4.md`, §9, stanoví: „Nezapojovat automatické produkční kroky dřív, než jsou splněny kritické brány a známa doména.“ Přímé rozhodnutí uživatele nyní dovoluje pouze statické vydání s vypnutou živou navigací. Hotelový pěší vstup, pět cílových vstupů a pět chůzí na každé platformě iPhone Safari / Android Chrome zůstávají otevřené. Delší texty v dalších devíti jazycích stále potřebují rodilou korekturu.

### Schválená Rocketbox Dagmar — 10. 10. 2026

Uživatel po prohlédnutí tří přehratelných kandidátek výslovně vybral Female_Adult_01: blond žena v růžové košili a džínách. Nová verze používá původní anatomii, váhy a kostru, vybrané klidné úseky kompatibilních animací, otevřenou dlaň a nativní obličejové terče; zdroje MIT bez účtu/platby. Automatické přecházení a ukazování po každé větě byly odstraněny. Chůze a gesto zůstávají na tlačítkách. Obličejové tvary řeči mají stále odhadnuté časování; fyzický hlas a přesná fonémová synchronizace nejsou potvrzené.

Bezprostřední read-only audit je v `docs/production-preflight-rocketbox-2026-10-10.json`; živá navigace zůstává vypnutá a fyzické vstupní/device-walk brány BLOCKED. Tato sekce popisuje obsah připravovaného statického vydání; úspěšné veřejné nasazení vyžaduje vlastní přesné SHA, CI a kontrolu runtime.

Na následný pokyn je Dagmar jedinou trvale připojenou plovoucí postavou nad obsahem. Uživatel ji přesouvá přetažením myší či dotykem nebo šipkami; stránka pod ní posouvá svůj obsah. Pozice se zachová při navigaci i změně jazyka, při změně viewportu se omezí na dostupný prostor, neukládá se do localStorage. Bublina s řečí, chůzí, gestem a omezením animací se otevírá kliknutím, Escape/zavření vrací fokus. Na mobilu bublina směřuje nad postavu; ovládací prvky mají nejméně 44 px. Tisk plovoucí vrstvu skryje.

Lokálně prošly `npm run check`, 14 unit testů, sestavení 120 jazykových stránek a 46 Playwright kontrol na desktopu/mobilu. Skutečná vizuální kontrola nového postoje, chůze, gesta a floating rozložení: `docs/dagmar-rocketbox-verification-2026-10-10.json`. Dotyk je simulace Chromium přes CDP, nikoli doklad fyzického Safari/Android telefonu.
