import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = Number(process.env.PORT || 8787);
const VALHALLA_BASE_URL = process.env.VALHALLA_BASE_URL || '';
const DEMO_ROUTING = process.env.DEMO_ROUTING === '1';
const DEMO_API = 'https://valhalla1.openstreetmap.de';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const LIMIT_BYTES = 2000;
const counter = new Map();

export function validateRoute(input) {
  if (!input || typeof input !== 'object') throw new Error('Chybí požadavek.');
  const { from, to, language = 'cs-CZ' } = input;
  for (const p of [from, to]) {
    if (!p || typeof p.lat !== 'number' || typeof p.lon !== 'number' || !Number.isFinite(p.lat) || !Number.isFinite(p.lon) || p.lat < 49.5 || p.lat > 50.5 || p.lon < 13.5 || p.lon > 15.5) {
      throw new Error('Souřadnice musí být číselné a v oblasti Prahy.');
    }
  }
  if (!['cs-CZ', 'en-US', 'de-DE'].includes(language)) throw new Error('Nepodporovaný jazyk.');
  if (Math.abs(from.lat - to.lat) + Math.abs(from.lon - to.lon) < 0.00001) throw new Error('Start a cíl jsou totožné.');
  return { locations: [{ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }], costing: 'pedestrian', directions_type: 'instructions', language, units: 'kilometers' };
}

function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(value));
}
function allowRequest(req) {
  const host = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = counter.get(host);
  if (!entry || now - entry.start > 60_000) { counter.set(host, { start: now, count: 1 }); return true; }
  return ++entry.count <= 30;
}
async function bodyJson(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk.toString();
    if (Buffer.byteLength(data) > LIMIT_BYTES) throw new Error('Příliš velký požadavek.');
  }
  return JSON.parse(data || '{}');
}

export async function requestHandler(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('permissions-policy', 'geolocation=(self), screen-wake-lock=(self)');
  if (url.pathname === '/api/health') return json(res, 200, { status: 'ok', routing: Boolean(VALHALLA_BASE_URL || DEMO_ROUTING), demo: DEMO_ROUTING && !VALHALLA_BASE_URL });
  if (url.pathname === '/api/route') {
    if (req.method !== 'POST') return json(res, 405, { error: 'Použijte POST.' });
    if (!allowRequest(req)) return json(res, 429, { error: 'Příliš mnoho požadavků. Zkuste to za chvíli.' });
    if (!VALHALLA_BASE_URL && !DEMO_ROUTING) return json(res, 503, { error: 'Výpočet trasy není zapojen. Správce musí nastavit VALHALLA_BASE_URL.' });
    let route;
    try { route = validateRoute(await bodyJson(req)); }
    catch (e) { return json(res, 400, { error: e.message }); }
    const base = (VALHALLA_BASE_URL || DEMO_API).replace(/\/+$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    try {
      const headers = { 'content-type': 'application/json' };
      if (!VALHALLA_BASE_URL) headers['x-client-id'] = 'hotel-chodov-asc-demo';
      const upstream = await fetch(`${base}/route`, { method: 'POST', headers, body: JSON.stringify(route), signal: controller.signal });
      if (!upstream.ok) return json(res, 502, { error: `Routovací služba neodpověděla správně (${upstream.status}).` });
      const valhalla = await upstream.json();
      const leg = valhalla?.trip?.legs?.[0];
      if (!leg || typeof leg.shape !== 'string' || !Array.isArray(leg.maneuvers)) return json(res, 502, { error: 'Neúplná trasa od routovací služby.' });
      return json(res, 200, { shape: leg.shape, maneuvers: leg.maneuvers.map(m => ({ instruction: m.instruction, begin_shape_index: m.begin_shape_index, end_shape_index: m.end_shape_index, type: m.type })), summary: { length: valhalla.trip.summary?.length, time: valhalla.trip.summary?.time }, language: route.language });
    } catch { return json(res, 502, { error: 'Výpočet trasy není momentálně dostupný.' }); }
    finally { clearTimeout(timeout); }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Metoda není podporována.' });
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  let file;
  try { file = path.join(ROOT, decodeURIComponent(pathname)); }
  catch { return json(res, 400, { error: 'Neplatná adresa.' }); }
  if (!file.startsWith(ROOT + path.sep)) return json(res, 403, { error: 'Přístup odepřen.' });
  try {
    const data = await fs.readFile(file);
    const ext = path.extname(file);
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { json(res, 404, { error: 'Nenalezeno.' }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  http.createServer(requestHandler).listen(PORT, '0.0.0.0', () => console.log(`Hotel CHODOV ASC guide: http://localhost:${PORT} (demoRouting=${DEMO_ROUTING}, ownValhalla=${!!VALHALLA_BASE_URL})`));
}
