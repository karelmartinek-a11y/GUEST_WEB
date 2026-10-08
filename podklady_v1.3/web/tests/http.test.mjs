import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { requestHandler } from '../server.mjs';
async function withServer(fn) {
  const server = http.createServer(requestHandler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test('HTTP HTML, health a odmítnutí nepodporovaných metod', () => withServer(async base => {
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Průvodce Prahou/);
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200); assert.equal((await health.json()).status, 'ok');
  const wrong = await fetch(`${base}/api/route`); assert.equal(wrong.status, 405);
  const noRouter = await fetch(`${base}/api/route`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: {lat:50,lon:14}, to: {lat:50.1,lon:14.1} }) });
  assert.equal(noRouter.status, 503);
}));
test('HTTP statický soubor a nenalezená cesta', () => withServer(async base => {
  const script = await fetch(`${base}/logic.js`);
  assert.equal(script.status, 200); assert.match(await script.text(), /decodePolyline/);
  const missing = await fetch(`${base}/not-here.txt`); assert.equal(missing.status, 404);
}));
