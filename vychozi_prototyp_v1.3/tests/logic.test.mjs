import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRoute } from '../server.mjs';
import { decodePolyline, haversine, lengths, nearestOnRoute, getNextManeuver, metersToText } from '../public/logic.js';
const from = { lat: 50.03996, lon: 14.50541 };
const to = { lat: 50.0865, lon: 14.4114 };
test('Pěší route validace a jazyk', () => {
  const q = validateRoute({ from, to, language: 'cs-CZ' });
  assert.equal(q.costing, 'pedestrian'); assert.equal(q.language, 'cs-CZ'); assert.deepEqual(q.locations[0], from);
});
test('Nevhodné souřadnice a jazyky odmítnuty', () => {
  assert.throws(() => validateRoute({ from: {lat: '50', lon: 14}, to }), /Souřadnice/);
  assert.throws(() => validateRoute({ from, to, language: 'zz' }), /jazyk/);
  assert.throws(() => validateRoute({ from, to: from }), /totožné/);
});
test('PolyLine6 dekódování klasické ukázky ve třech bodech', () => {
  // Polyline s přesností 5 z oficiálního algoritmického příkladu.
  const pts = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5);
  assert.equal(pts.length, 3);
  assert.deepEqual(pts[0], [-120.2, 38.5]);
});
test('Poškozená geometrie se odmítne', () => assert.throws(() => decodePolyline('a'), /Poškozená/));
test('Vzdálenost, projekce a manévry', () => {
  const points = [[14.4, 50.08], [14.401, 50.08], [14.402, 50.08]];
  const c = lengths(points); const match = nearestOnRoute([14.4005, 50.08003], points, c);
  assert.ok(match.distance < 8); assert.ok(match.along > 25); assert.ok(match.along < 60);
  const next = getNextManeuver([{ begin_shape_index: 0, instruction: 'Start' }, { begin_shape_index: 2, instruction: 'Turn right' }], match.along, c);
  assert.equal(next.instruction, 'Turn right'); assert.ok(next.distance > 0);
  assert.ok(haversine(points[0], points[1]) > 50);
});
test('Zobrazení vzdálenosti', () => { assert.equal(metersToText(170), '170 m'); assert.match(metersToText(1200), /km/); });
