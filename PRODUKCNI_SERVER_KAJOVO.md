# PRODUKČNÍ SERVER KÁJOVO — READ-ONLY INVENTURA A DEPLOYMENT GUARD
Zjištěno read-only pluginem Kájovo 8.10.2026, jde o snapshot, opakovat před deployem.
- Ubuntu 24.04.5 LTS, 4 x CPU, RAM MemTotal 8,131,772 kB (~7.76 GiB), root FS ext4 144.49 GB, volno 18.59 GB, využití 88 %, 4 GiB swap.
- Host-level Nginx, aktivní konfigurační soubory jsou mj. `/etc/nginx/sites-enabled/hotel.hcasc.cz.conf`, `dagmar.hcasc.cz.conf`, `gpt.hcasc.cz.conf`, `ha.hcasc.cz.conf`, `apimcpkajavoiceha.hcasc.cz.conf` a `mail-mcp-standalone.conf`.
- Docker provozuje mimo jiné `kajovo-prod-api-1`, `kajovo-prod-web-1`, `kajovo-prod-admin-1`, `kajovo-prod-postgres-1`, `dagmar-postgres`; žádný takový projekt nepřebírat.
- Nový FQDN pro turistického průvodce nebyl v poskytnutých datech specifikován; jeho DNS nasměrování tvrdí uživatel, ale pro deploy je nutné ověřit konkrétní doménu. Nepoužít automaticky `hotel.hcasc.cz` — to už obsluhuje jinou aplikaci.
- Nové služby pouze samostatná identita, samostatná nová konfigurace vhostu, samostatné kontejnery/porty, nesdílet dokumentový root ani certifikát cizího projektu.
- Produkční mapové datasety a Valhalla grafy sestavovat mimo server pokud možno; v preflight změřit peak RAM+disk. Při nedostatku zdrojů STOP a doložit důvod; nikoli riskovat degradaci jiných aplikací.
- Before/after: hash důležitých stávajících vhostů, seznam listenerů, uptime/health známých aplikací, Nginx -t, TLS host verification; výjimky logovat.
- Deploy: test -> release to vlastní cesta -> vlastní vhost -> Nginx -t -> reload pouze pokud jsou prověrky PASS -> curl smoke -> health existence -> release manifest. Rollback pouze vlastní vhost/release.
- Tento balíček neobsahuje produkční SSL klíče, žádné autentizační tokeny ani přístup k zápisům na server. Deploy má provést váš Codex v odpovídajícím oprávněném prostředí.
