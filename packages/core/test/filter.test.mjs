import assert from "node:assert/strict";
import test from "node:test";
import { malls } from "../src/malls.ts";
import { filterMalls } from "../src/filter.ts";

const now = new Date("2026-09-28T12:00:00+05:30");

test("filters malls by selected country and mall or city query", () => {
  assert.deepEqual(
    filterMalls(malls, { country: "India", query: "  PUNE ", status: "all", now }).map((mall) => mall.id),
    ["pmc-pune"],
  );
  assert.deepEqual(
    filterMalls(malls, { country: "India", query: "mumbai", status: "all", now }).map((mall) => mall.id),
    ["pmc-mumbai", "palladium-mumbai"],
  );
});

test("filters open and closed malls using mall-local status", () => {
  assert.deepEqual(
    filterMalls(malls, { country: "India", query: "", status: "open", now }).map((mall) => mall.id),
    ["pmc-pune", "pmc-mumbai", "palladium-mumbai"],
  );
  assert.deepEqual(
    filterMalls(malls, {
      country: "India",
      query: "",
      status: "closed",
      now: new Date("2026-09-28T04:00:00Z"),
    }).map((mall) => mall.id),
    ["pmc-pune", "pmc-mumbai", "palladium-mumbai"],
  );
});

test("returns no malls before a country is selected", () => {
  assert.deepEqual(filterMalls(malls, { country: null, query: "", status: "all", now }), []);
});

test("does not classify invalid operating hours as open or closed", () => {
  const invalid = { ...malls[0], openingTime: "later" };
  assert.deepEqual(
    filterMalls([invalid], { country: "India", query: "", status: "open", now }),
    [],
  );
  assert.deepEqual(
    filterMalls([invalid], { country: "India", query: "", status: "closed", now }),
    [],
  );
});
