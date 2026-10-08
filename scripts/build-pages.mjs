import fs from 'node:fs';
import {execFileSync}from 'node:child_process';
const languages=['cs','en','de','it','pl','nl','fr','ko','bn','hi','es','uk'];
const screens=['','nearby','prague','trips','map','transport','health','hotel','restaurants','faith'];
const original=fs.readFileSync('dist/index.html','utf8');
const ui=JSON.parse(fs.readFileSync('src/content/ui-translations.json'));
const en=JSON.parse(fs.readFileSync('src/content/ui.en.json'));
const cs={home:'Vítejte',nearby:'Kolem hotelu',prague:'Objevte Prahu',trips:'Doporučené výlety',map:'Prozkoumat mapu',transport:'Doprava po Praze',health:'Zdraví a nouze',hotel:'Váš hotel'};
const extra=JSON.parse(fs.readFileSync('src/content/extra-ui.json'));
const escape=value=>value.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const origin='https://guest.hcasc.cz';
for(const language of languages)for(const screen of screens){
 const dictionary=language==='cs'?cs:language==='en'?en:ui[language];
 const url=`${origin}/${language}/${screen?screen+'/':''}`;
 const title=screen==='restaurants'||screen==='faith'?extra[screen][languages.indexOf(language)]:dictionary[screen||'home'];
 const description=language==='cs'?'Ukážu Vám oblíbená místa, klidná zákoutí i vše, co potřebujete pro svůj pobyt.':dictionary.intro;
 const alternate=languages.map(l=>`<link rel="alternate" hreflang="${l}" href="${origin}/${l}/${screen?screen+'/':''}"/>`).join('\n');
 const file=original.replace('<html lang="cs">',`<html lang="${language}">`).replace(/<title>[^<]*<\/title>/,`<title>Dagmar · ${escape(title)} · Hotel CHODOV ASC</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?>(?:\s*)/,`<meta name="description" content="${escape(description)}"/>`).replace('</head>',`<link rel="canonical" href="${url}"/>\n${alternate}\n<link rel="alternate" hreflang="x-default" href="${origin}/cs/${screen?screen+'/':''}"/>\n</head>`);
 const dir=`dist/${language}/${screen}`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/index.html`,file);
}
fs.writeFileSync('dist/404.html',original.replace(/<title>[^<]*<\/title>/,'<title>404 · Hotel CHODOV ASC</title>'));
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+languages.flatMap(language=>screens.map(screen=>`<url><loc>${origin}/${language}/${screen?screen+'/':''}</loc></url>`)).join('')+'</urlset>');
let sha=process.env.GITHUB_SHA||process.env.RELEASE_SHA;
if(!sha)try{sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{sha='development';}
fs.writeFileSync('dist/release.json',JSON.stringify({repository:'karelmartinek-a11y/GUEST_WEB',sha,builtAt:new Date().toISOString(),languages:languages.length,places:29,navigationEnabled:JSON.parse(fs.readFileSync('public/capabilities.json')).navigationEnabled},null,2)+'\n');
// macOS resource forks are build metadata, never public site assets.
function removeForks(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.name.startsWith('._'))fs.rmSync(p,{recursive:e.isDirectory()});else if(e.isDirectory())removeForks(p);}}
removeForks('dist');
console.log('Built 120 localized public pages, 404, sitemap and release manifest.');
