import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContent}from '../scripts/validate-content.mjs';
test('original and flyer catalog records, translations, routes, licensed photos and self-hosted maps validate',()=>{assert.equal(validateContent().places,36);});
test('health and GPS data cannot be persisted or sent from health UI',()=>{
 const app=fs.readFileSync('src/App.tsx','utf8');
 const stored=[...app.matchAll(/localStorage\.setItem\('([^']+)'/g)].map(m=>m[1]);
 assert.deepEqual([...new Set(stored)].sort(),['guest-language','guest-motion']);
 assert(app.includes('href="tel:155"'));assert(app.includes('href="tel:112"'));
 assert(!/fetch\([^)]*health/.test(app));
});
test('all rendered external links have safe rel attributes',()=>{
 const app=fs.readFileSync('src/App.tsx','utf8');
 for(const match of app.matchAll(/<a\s[^>]*target="_blank"[^>]*>/g))assert(match[0].includes('rel="noopener noreferrer"'));
});
