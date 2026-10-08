# GUEST_WEB — instructions for contributors

## Product and authority
- Build the public, mobile-first Hotel CHODOV ASC guest guide at `https://guest.hcasc.cz`.
- `SPECIFIKACE_MASTER_v1.4.md` is authoritative over historical specifications. The user's later instructions add animated original concierge Dagmar, cinematic photo galleries, and CS/EN/DE/IT/PL/NL/FR/KO/BN/HI/ES/UK languages.
- Read the source catalog in `podklady_v1.3/`. Preserve all 29 stable place IDs and all five itineraries. Keep original source material and prototypes intact.
- User-provided hotel flyers are mandatory expandable content. `docs/flyer-sources.json` records the source hashes. Include all eight nearby restaurants, pharmacy, Albert, nonstop OMV, Brodského bus stop, centre/main station/airport transport, ticket purchase links, taxi choices, worship services, hotel qibla and all emergency numbers. User confirmed `health.cs.json` is the medical flyer source. Keep historical flyer walking estimates separate from verified live routing.
- The expanded catalog has 36 locations: the original 29 plus seven tourist-flyer additions. Verify every restaurant against `docs/restaurant-flyer-checklist.json`. World Heritage badges identify locations within the two components of property 616bis; never imply each location is separately inscribed. Preserve the exact official emblem requested by the user and its provenance. Use the supplied hotel-building photograph at the hotel map marker. Every displayed transit line code must include a transport-mode icon and localized mode name; line 59 is a trolleybus.
- The website is static. No accounts, CMS, administration, analytics, tracking, user database or service worker installation. The only dynamic service is the tightly bounded pedestrian routing proxy and isolated Valhalla.
- Use the supplied hotel PNG logo without changing its aspect ratio. Dagmar and her dog must be original characters, not copies of existing cartoons.

## Implementation
- App: `src/`, static assets: `public/`, catalog translations: `src/content/`, infrastructure: `infra/`, scripts: `scripts/`.
- All requested languages must have complete UI and content. Never silently fall back to another language. Preserve the current screen, filters and health selection when changing language.
- Store only language and motion/voice preferences locally. Health selections and GPS stay in memory. Do not log coordinates, routing request bodies or query strings.
- All photos must be local files with individually verified source, author and commercial-use license in `public/media/manifest.json`; show credits. Never use unverified hotlinks or generated photos of actual attractions.
- Real maps use self-hosted PMTiles with MapLibre. Never connect public OSM tiles or demo routing services in production. Navigation to an unverified pedestrian entrance must fail closed.
- Motion must respect `prefers-reduced-motion`; touch targets are at least 44px; support keyboard navigation, dialogs, focus and screen readers.
- Keep emergency calls 155/112 visible and never offer pedestrian routing as emergency treatment. Health cards show the guest language and Czech sentence and print on A4.

## Git and verification
- Work on `main`; public GitHub repository is `karelmartinek-a11y/GUEST_WEB`. Never force-push or overwrite concurrent work. Do not commit credentials, generated screenshots, node_modules, build output or private keys.
- Run `npm run check`, `npm test`, `npm run build` and relevant Playwright UI checks before delivery. Test catalog counts, all languages, unsafe routing rejection, health privacy and responsive flows meaningfully.
- GitHub Actions must test every push to main and deploy the tested artifact by exact commit SHA, with an atomic current symlink and project-only rollback.
- Distinguish automated simulation from real GPS/voice tests on iPhone Safari and Android Chrome. Never invent physical acceptance evidence.

## Production boundary
- Production is accessible with `ssh produkce`. Inventory DNS, listeners, Nginx configuration hashes, resource capacity and existing service health before any mutation.
- Only this project's new vhost `guest.hcasc.cz`, `/opt/guest-web`, `/var/lib/guest-web`, `/etc/guest-web`, dedicated user `guest-web`, and `guest-web-*` units may be created or changed. Use loopback listeners only.
- Never change other vhosts, global Nginx configuration, existing Docker projects, hotel.hcasc.cz, Dagmar, HA, GPT/MCP or mail services. Never clean disks automatically.
- Preserve nginx -t and known-service health before/after. Only reload Nginx after validation. Do not change or delete other certificates.
- Build routing graphs outside production. Enforce CPU/RAM/disk limits. Do not activate production navigation without approved entrances and actual device walks required by v1.4.
- Full production acceptance requires evidence for physical gates. If unavailable, mark BLOCKED in ACCEPTANCE.md and DEPLOYMENT_REPORT.md. A limited static release requires an explicit user decision acknowledging disabled navigation and the unmet full-release gate.
