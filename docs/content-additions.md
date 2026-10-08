# Obsah převzatý z hotelových letáků

Uživatel výslovně určil existující letáky jako povinný rozšiřitelný zdroj. Původní soubory jsou zachovány; jejich hashe a použití uvádí `flyer-sources.json`. Ilustrace z těchto letáků se nezveřejňují, nové galerie mají vlastní licenční evidenci.

`src/content/restaurants.json` obsahuje všech osm restaurací z nejnovějšího letáku z 28. 7. 2026. Pěší vzdálenosti a časy jsou převzaté odhady, ceny výslovně historické. Kontakty a otevírací doby byly ověřeny na uvedených webech provozovatelů 8. 10. 2026. Free Solo je ověřeno u městské Prague City Tourism. Bistro Café Park 11 má podle aktuálního webu změněné hodiny oproti letáku. Tran Viet Food má uveden boční vstup z Hvězdoslavovy.

`src/content/practical.json` zachovává EUC Majerského, Albert Leopoldova, nonstop OMV K Horkám a zastávku Brodského. EUC hodiny a kontakt jsou aktuálně ověřené na [webu lékárny](https://euc.cz/nase-zarizeni/lekarny/euc-lekarna-praha-majerskeho/). Údaje Albertu a OMV jsou datované údaje dodaného letáku. Žádná automatická vlastní pěší navigace k těmto adresám se nepředstírá; host volitelně otevře externí pěší trasu.

Doprava zachovává hotelový postup Brodského → 126 → Chodov → metro C. Pro centrum a letiště uvádí přestup Muzeum na A, pro hlavní nádraží přímé C. Letiště pokračuje z Nádraží Veleslavín linkou 59 podle [Letiště Praha](https://www.prg.aero/mhd-autobusem-na-letiste). Spojení a výluky host ověřuje v [PID/IDOS](https://pid.idos.cz/pid/spojeni/conn.aspx). Jízdenky mají odkazy na [PID Lítačku](https://app.pidlitacka.cz/), [prodejní místa](https://pid.cz/kontakty/prodejni-mista/) a [oficiální nákupní postup](https://pid.cz/jizdne-a-tarif/jak-poridit-jizdenku/). Taxi vede na oficiální Bolt, Uber a [AAA aplikace](https://www.aaataxi.cz/taxiaplikace/), AAA dispečink +420 222 333 222.

`src/content/faith.json` zahrnuje devět tradic. Neprohlašuje úplný seznam všech náboženských obcí. U dalších společenství nabízí spojení s recepcí. Konkrétní rozpisy se opírají o farnost KCMT, exarchát, ČCE Jižní Město, CASD, Židovskou obec, Süleymaniye, Buddha Mangala a centrum v Lužcích. Pravoslavná nedělní liturgie 9:30 je aktuálně doložená [Prague City Tourism](https://prague.eu/cs/objevujte/katedralni-chram-sv-cyrila-a-metodeje/). Říjnové termíny Staronové synagogy jsou z [kalendáře obce](https://www.kehilaprag.cz/docs/2773-cz_10_2026.pdf), mají skutečné datum a po uplynutí se nezobrazují; pro další termíny zůstává aktuální program. Sváteční změny se ověřují u konkrétní obce.

Směr Mekky je matematicky vypočtená počáteční ortodromická orientace z hotelu ke Kaabě: 135,8694° od skutečného severu po směru hodin. Obrázek se zarovnává ručně podle mapy nebo kompasu; nepředstírá telefonní senzor ani magnetický sever.

Zdravotní zdroj `health.cs.json` uživatel potvrdil. Zachováno všech 15 symptomů a FTN, přidány nepersistované údaje pro lékaře. Nouzová čísla 155, 112, 158, 150, 156 jsou ověřená u [HZS ČR](https://hzscr.gov.cz/tisnova-komunikace-v-ceske-republice-2).

Oba turistické letáky přidaly sedm dosud chybějících míst v Historickém centru: Staroměstské náměstí, Prašnou bránu, Lennonovu zeď, Václavské náměstí, kostel sv. Mikuláše na Malé Straně, Strahovský klášter a Národní divadlo. Původních 29 ID zůstalo zachovaných; nyní je 36 míst s 116 samostatně licenčně doloženými fotografiemi. Souřadnice doplnění jsou orientační polohy objektů, nikoli schválené pěší vstupy.

Podle [UNESCO](https://whc.unesco.org/en/list/616/) a [NPÚ](https://www.npu.cz/cs/pamatkova-pece/pamatkovy-fond/pamatky-s-mezinarodnim-statusem/praha) je označeno 21 katalogových cílů v Historickém centru Prahy a Průhonický park. Karty mají na výslovný pokyn uživatele nezměněný oficiální emblém; detail vysvětluje územní souvislost a odkazuje na skutečný zápis 616bis. Zoo, Žižkovská věž, botanická zahrada, Národní technické muzeum ani Letenské sady nejsou označeny. Seznam a zdroje jsou v `src/content/heritage.json`, filtr funguje samostatně pro Prahu i okolí hotelu.

Každý kód linky v dopravních postupech má vedle čísla/písmene ikonu a lokalizovaný druh dopravy. Linka 59 je správně trolejbus. U vybraných památek je doplněn postup z hotelu podle turistických letáků včetně autobusů, metra a tramvají a odkazu na aktuální PID spojení.

Mapový bod hotelu používá skutečný snímek budovy z dodané knihy pro hosty. Bod otevře fotografický popup a hotelové informace; poloha bodu nadále neprohlašuje fyzicky ověřený pěší vstup. Původní hotelová kniha se nezveřejňuje.

Přidané rozhraní má explicitní překlad ve všech 12 jazycích. Delší turistické překlady v dalších devíti jazycích stále potřebují rodilou redakční korekturu. Toto omezení není zaměňováno za chybějící jazyk v aplikaci.
