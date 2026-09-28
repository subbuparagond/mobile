import assert from "node:assert/strict";
import test from "node:test";
import { malls } from "../src/malls.ts";
import { getMallBounds } from "../src/geo.ts";

test("fits all mall coordinates with enough padding to separate nearby map markers", () => {
  const bounds = getMallBounds(malls);
  assert.ok(bounds);
  assert.ok(bounds[0][0] < Math.min(...malls.map((mall) => mall.latitude)));
  assert.ok(bounds[0][1] < Math.min(...malls.map((mall) => mall.longitude)));
  assert.ok(bounds[1][0] > Math.max(...malls.map((mall) => mall.latitude)));
  assert.ok(bounds[1][1] > Math.max(...malls.map((mall) => mall.longitude)));
  assert.ok(bounds[1][1] - bounds[0][1] < 2);
});

test("returns no map bounds when there are no mall coordinates", () => {
  assert.equal(getMallBounds([]), null);
});

test("ignores invalid mall coordinates when calculating map bounds", () => {
  assert.equal(getMallBounds([{ latitude: 91, longitude: 73 }]), null);
  assert.deepEqual(getMallBounds([
    { latitude: 18, longitude: 73 },
    { latitude: Number.NaN, longitude: 74 },
  ]), [[17.94, 72.94], [18.06, 73.06]]);
});
