import { languages, type Language } from './i18n';
import rows from './content/extra-ui.json';
export type ExtraKey = keyof typeof rows;
export function te(language: Language, key: ExtraKey): string {
 return rows[key][languages.findIndex(l => l.code === language)];
}
export const extraTranslations = Object.fromEntries(languages.map((l,i)=>[l.code,Object.fromEntries(Object.entries(rows).map(([k,v])=>[k,v[i]]))]));
