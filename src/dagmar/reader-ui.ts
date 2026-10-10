import type {Language} from '../i18n';
const rows:Record<Language,string[]>={
 cs:['Přečíst stránku','Pozastavit čtení','Pokračovat ve čtení','Připravuji hlas…','Hlas vytvořený umělou inteligencí · OpenAI','Hlas se nepodařilo načíst. Zkuste čtení znovu.'],
 en:['Read this page','Pause reading','Resume reading','Preparing voice…','AI-generated voice · OpenAI','The voice could not load. Please try reading again.'],
 de:['Seite vorlesen','Vorlesen pausieren','Vorlesen fortsetzen','Stimme wird vorbereitet…','KI-generierte Stimme · OpenAI','Die Stimme konnte nicht geladen werden. Bitte erneut versuchen.'],
 it:['Leggi la pagina','Metti in pausa','Riprendi la lettura','Preparazione della voce…','Voce generata dall’IA · OpenAI','Impossibile caricare la voce. Riprova la lettura.'],
 pl:['Czytaj stronę','Wstrzymaj czytanie','Wznów czytanie','Przygotowywanie głosu…','Głos wygenerowany przez AI · OpenAI','Nie udało się wczytać głosu. Spróbuj ponownie.'],
 nl:['Lees deze pagina','Lezen pauzeren','Lezen hervatten','Stem voorbereiden…','AI-gegenereerde stem · OpenAI','De stem kon niet worden geladen. Probeer opnieuw.'],
 fr:['Lire la page','Mettre en pause','Reprendre la lecture','Préparation de la voix…','Voix générée par IA · OpenAI','Impossible de charger la voix. Réessayez la lecture.'],
 ko:['페이지 읽기','읽기 일시 정지','읽기 계속','음성 준비 중…','AI 생성 음성 · OpenAI','음성을 불러올 수 없습니다. 다시 시도해 주세요.'],
 bn:['পাতাটি পড়ুন','পড়া থামান','পড়া চালিয়ে যান','কণ্ঠ প্রস্তুত হচ্ছে…','এআই দিয়ে তৈরি কণ্ঠ · OpenAI','কণ্ঠ লোড করা যায়নি। আবার চেষ্টা করুন।'],
 hi:['पृष्ठ पढ़ें','पढ़ना रोकें','पढ़ना जारी रखें','आवाज़ तैयार हो रही है…','AI से निर्मित आवाज़ · OpenAI','आवाज़ लोड नहीं हो सकी। फिर से प्रयास करें।'],
 es:['Leer la página','Pausar lectura','Continuar lectura','Preparando la voz…','Voz generada por IA · OpenAI','No se pudo cargar la voz. Vuelve a intentarlo.'],
 uk:['Прочитати сторінку','Призупинити читання','Продовжити читання','Підготовка голосу…','Голос створений ШІ · OpenAI','Не вдалося завантажити голос. Спробуйте ще раз.']
};
export const readerText=(language:Language,index:number)=>rows[language][index];
