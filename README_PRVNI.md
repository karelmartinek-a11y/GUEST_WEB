# WEB.ZIP — Hotel CHODOV ASC / Průvodce Prahou
## Stav k 8. 10. 2026
**Vývojový vstupní balíček připravený pro generátor webu, nikoliv hotové produkční vydání.** Uživatel chce výhradně veřejný statický web aktualizovaný přes Git, s oddělenou routovací službou pro GPS navigaci. Bez instalace, CMS, admina a účtů.

## Začněte zde
1. `PROMPT_PRO_CODEX.md` — vložte jako zadání do Codexu spolu s tímto ZIP.
2. `SPECIFIKACE_MASTER_v1.4.md` — jediná aktuální normativní specifikace.
3. `PRODUKCNI_SERVER_KAJOVO.md` — technické poznatky o produkčním serveru a bezpečnostní pravidla.
4. `assets/` — autentické PNG logo Hotelu CHODOV ASC, s původem a variantou.
5. `podklady_v1.3/` — 29 turistických míst, GPS, 5 okruhů, zdravotní údaje, PID, rozsáhlé původní zadání, 55 kandidátních fotografií a licenční evidence.
6. `vychozi_prototyp_v1.3/` — původní funkční vývojový web v1.3 s již vloženým pravým logem. `cd vychozi_prototyp_v1.3 && npm test && npm start` (pouze vývojově).
7. `specifikace_historie/` — všechny plné dřívější specifikace v1.0, v1.1, v1.2, v1.3.
8. `SHA256SUMS.txt` — integrita souborů v balíčku.

**Logo:** získáno přímo z Google Drive hotelu, `202508180951_logo_hotelu_novo.png`, viz LOGO_ZDROJ.json. Nezaměnit za software Kájovo.

**Kritické upozornění:** Doména nového webu není explicitně sdělena. Skutečné fotografie nebyly hromadně schváleny; existují kandidáti s možnými licenčními podmínkami. Před nasazením vyžaduje bezpečnostní preflight a reálné testy na zařízeních. Předchozí vývojový prototyp obsahuje externí vývojové mapové služby; pro produkci musí být nahrazeny skutečným vlastním hostingem.
