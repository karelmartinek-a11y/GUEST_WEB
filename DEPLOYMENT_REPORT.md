# GUEST_WEB — deployment report

Stav k 9. 10. 2026: **FULL PRODUCTION BLOCKED**, veřejné nasazení ještě neprovedeno. Web, veřejný GitHub a automatické testy jsou připravené. Rozhodnutí uživatele o omezeném statickém vydání zatím nebylo doručeno; žádná produkční konfigurace ani pověření GUEST_WEB nebyla vytvořena.

## Cíl a izolace

Uživatel sdělil `guest.hcasc.cz` v tomto chatu. DNS A `89.221.222.92`, AAAA `2a02:2b88:2:b5c::1` odpovídají produkčnímu stroji. Preflight nenašel samostatný vhost ani certifikát tohoto jména. Web používá pouze nové vlastní cesty `/opt/guest-web`, `/var/lib/guest-web`, `/etc/guest-web`, vyhrazený účet `guest-web` a samostatný vhost; jiné projekty se nemění.

## Ověřený serverový preflight

Aktuální audit `docs/production-preflight-2026-10-09.json`: SSH `produkce`, 8. 10. 2026 22:32 UTC, tedy 9. 10. místně. Čtyři CPU, RAM 15.6 GiB, dostupná 12.4 GiB, root disk 94.8 GiB volno a 56 % obsazenost. Kapacita je vyšší než při starším pozorování; neprováděli jsme změny zdrojů serveru.

`nginx -t` PASS, s existujícími warnings listen/protocol options u GPT/HA. Hotel, Dagmar, HA a OAuth metadata GPT vracely HTTP 200. Mail MCP vracel HTTP 401 bez autentizace, což odpovídá ochraně endpointu. Nginx, Docker, Dagmar backend, KajaVoiceHA a samostatný Mail MCP byly aktivní. Dokument obsahuje kontrolní součty šesti stávajících vhostů. Před případnou mutací se tento audit zopakuje; po mutaci se kontrolují stejné služby a hashe.

## GitHub a automatické ověření

Veřejný repozitář je [karelmartinek-a11y/GUEST_WEB](https://github.com/karelmartinek-a11y/GUEST_WEB). Push na `main` spouští `.github/workflows/main.yml`: audit závislostí, typy a validaci zdrojového obsahu/médií, 10 jednotkových a HTTP testů, statický build a Playwright desktop/mobil Chromium. Základní verze prošla [CI 37856662127](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37856662127), commit `312938cd2417409cb107224087f62f139e54555d`. Následující commit `a986fa01025e8e5c4d2c7eb6411e24029eb827d6` prošel [CI 37857716513](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37857716513).

Aktuální rozšíření má 36 míst, 116 katalogových fotografií, 22 územně příslušných označení UNESCO, všech osm restaurací a 12 jazyků. Současná sada obsahuje 36 Playwright průchodů včetně oficiálního emblému, filtru, ikon dopravních prostředků a fotografického hotelového bodu. Každý další commit se znovu ověřuje; přesné SHA a výsledky jsou v [Actions](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/workflows/main.yml). Lokální A4 důkazy všech 12 jazyků mají každý jednu stranu; zkontrolováno i vykreslení bengálštiny.

Produkční job se dosud přeskočil: `GUEST_WEB_DEPLOY_ENABLED` není zapnuté. SSH deployment secrets nebyly vytvořeny. Úspěch testovacího jobu tedy neznamená produkční nasazení.

## Vlastní routovací graf mimo produkci

[Build 37857716009](https://github.com/karelmartinek-a11y/GUEST_WEB/actions/runs/37857716009), commit `a986fa01025e8e5c4d2c7eb6411e24029eb827d6`, úspěšně sestavil pražský OSM graf s Valhalla 3.6.3. Build má limit dvě CPU / 4 GiB; ověřovací engine půl CPU / 512 MiB, read-only filesystem, loopback port a zákaz nových privilegií. Vlastní engine v CI vrátil syntetickou pěší trasu v CS/EN/DE, se skutečně správným jazykem a 25 manévry.

Stažený `tiles.tar` byl znovu ověřen SHA-256 `a1127fb2ca89de0fe5f6db46087ff6b2525b08425eb5501fcd44855a7515c5a0`; zdroj, artifact digest a dílčí výsledky jsou v `docs/navigation-build-evidence.json`. Graf nebyl instalován na produkci. Ostatní jazyky pokynů a skutečné fyzické trasy tím ověřené nejsou.

## Připravené nasazení po rozhodnutí

CI nasazuje tentýž otestovaný artifact s přesným SHA, bez druhého buildu na serveru. Omezený SSH receiver kontroluje tar cesty, velikost, manifest, profil a SHA; nespouští uploadované soubory. Receiver a SSH authorized_keys musí být spravované rootem, aby je deployment účet nemohl přepsat. Účet nemá sudo ani přístup do jiných projektů.

Vlastní release je `/opt/guest-web/releases/<SHA>/www`; `current` se přepíná atomicky. Při rozdílu veřejného SHA nebo změně zdraví/konfigurace sledovaných webů se vrací jen vlastní symlink. Samostatný HTTPS certifikát, CSP, self geolocation, lokální mapy/fonty a vypnutý access log jsou připraveny v projektu. Reload Nginx je povolen až po `nginx -t`; stávající certifikáty a vhosty se nemění.

## Otevřené brány

Fyzický hotelový vstup, pět cílových vstupů a deset skutečných chůzí — pět iPhone Safari a pět Android Chrome — nejsou doloženy. `SPECIFIKACE_MASTER_v1.4.md`, §9, výslovně stanoví: „Nezapojovat automatické produkční kroky dřív, než jsou splněny kritické brány.“ Proto je před nasazením statické verze s vypnutou živou navigací potřeba výslovná výjimka uživatele. Otázka s konkrétním lokálním náhledem byla předložena v chatu; odpověď zatím chybí. Evidence zůstává `staticReleaseAuthorized: false`.

Delší texty v dalších devíti jazycích ještě vyžadují rodilou korekturu. Automatické mobilní rozměry a syntetické testy nejsou nahrazením fyzických telefonů. Veřejný runtime SHA, nový certifikát, deployment read-back a rollback lze doložit až po skutečném schváleném nasazení.
