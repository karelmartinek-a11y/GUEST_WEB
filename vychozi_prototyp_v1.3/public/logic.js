// Čisté funkce navigačního jádra; lze testovat bez prohlížeče.
export function decodePolyline(encoded, precision = 6) {
  if (typeof encoded !== 'string' || encoded.length > 400_000) throw new Error('Neplatná geometrie.');
  const out = []; let pos = 0, lat = 0, lon = 0;
  const decodeNumber = () => {
    let shift = 0, result = 0, b;
    do {
      if (pos >= encoded.length || shift > 30) throw new Error('Poškozená geometrie trasy.');
      b = encoded.charCodeAt(pos++) - 63;
      if (b < 0 || b > 63) throw new Error('Poškozená geometrie trasy.');
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    return (result & 1) ? ~(result >> 1) : result >> 1;
  };
  while (pos < encoded.length) {
    lat += decodeNumber(); lon += decodeNumber();
    const point = [lon / (10 ** precision), lat / (10 ** precision)];
    if (!point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) throw new Error('Souřadnice trasy mimo rozsah.');
    out.push(point);
  }
  if (out.length < 2) throw new Error('Prázdná geometrie.');
  return out;
}
export function haversine(a, b) {
  const rad = Math.PI / 180;
  const phi1 = a[1] * rad, phi2 = b[1] * rad;
  const dPhi = (b[1] - a[1]) * rad, dLon = (b[0] - a[0]) * rad;
  const x = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1 - x)));
}
export function lengths(points) {
  const result = [0];
  for (let i = 1; i < points.length; i++) result.push(result[i - 1] + haversine(points[i - 1], points[i]));
  return result;
}
// Projekce na nejbližší úsek; meters + index/position po trase.
export function nearestOnRoute(current, points, cumulative = lengths(points)) {
  if (!points?.length || points.length < 2) return null;
  let best = null;
  const scaleLat = 111_195;
  const scaleLon = scaleLat * Math.cos(current[1] * Math.PI / 180);
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    const x = (b[0] - a[0]) * scaleLon, y = (b[1] - a[1]) * scaleLat;
    const px = (current[0] - a[0]) * scaleLon, py = (current[1] - a[1]) * scaleLat;
    const t = Math.max(0, Math.min(1, (px * x + py * y) / (x * x + y * y || 1)));
    const distance = Math.hypot(px - t * x, py - t * y);
    if (!best || distance < best.distance) best = { distance, along: cumulative[i] + t * (cumulative[i + 1] - cumulative[i]), segment: i };
  }
  return best;
}
export function metersToText(m, language = 'cs') {
  if (!Number.isFinite(m)) return '—';
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toLocaleString(language, { maximumFractionDigits: 1 })} km`;
}
export function getNextManeuver(maneuvers, along, cumulative) {
  if (!maneuvers?.length) return null;
  // Manévry od začátku s shape_index=0 nejsou skutečné odbočky.
  for (let i = 0; i < maneuvers.length; i++) {
    const m = maneuvers[i];
    const shapeIndex = Math.min(cumulative.length - 1, Math.max(0, m.begin_shape_index ?? 0));
    const dist = cumulative[shapeIndex] - along;
    if (shapeIndex === 0 && maneuvers.length > 1) continue;
    if (dist >= -18) return { index: i, instruction: m.instruction, distance: Math.max(0, dist) };
  }
  return null;
}
