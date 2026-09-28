import assert from "node:assert/strict";
import test from "node:test";
import { malls } from "../src/malls.ts";
import { getMallStatus } from "../src/status.ts";

const pune = malls[0];
const at = (hour, minute) =>
  new Date(`2026-09-28T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`);

test("uses local mall time and includes opening but excludes closing", () => {
  assert.equal(getMallStatus(pune, at(10, 0)).isOpen, true);
  assert.equal(getMallStatus(pune, at(21, 59)).isOpen, true);
  assert.equal(getMallStatus(pune, at(22, 0)).isOpen, false);
});

test("returns closed outside operating hours", () => {
  assert.equal(getMallStatus(pune, at(9, 59)).isOpen, false);
});

test("calculates status in the mall's own timezone", () => {
  const newYorkMall = {
    ...pune,
    timezone: "America/New_York",
    openingTime: "10:00",
    closingTime: "22:00",
  };
  const status = getMallStatus(newYorkMall, new Date("2026-09-28T14:00:00Z"));
  assert.equal(status.localTime, "10:00");
  assert.equal(status.isOpen, true);
});

test("supports hours that cross midnight", () => {
  const overnight = { ...pune, openingTime: "20:00", closingTime: "02:00" };
  assert.equal(getMallStatus(overnight, at(23, 0)).isOpen, true);
  assert.equal(getMallStatus(overnight, at(1, 59)).isOpen, true);
  assert.equal(getMallStatus(overnight, at(2, 0)).isOpen, false);
});

test("marks malformed hours as unavailable", () => {
  const invalid = { ...pune, openingTime: "soon" };
  assert.equal(getMallStatus(invalid, at(12, 0)).hoursValid, false);
});

test("marks an invalid timezone as unavailable", () => {
  const invalid = { ...pune, timezone: "Mars/Olympus_Mons" };
  assert.equal(getMallStatus(invalid, at(12, 0)).hoursValid, false);
});

test("closes a mall on a holiday using its local calendar date", () => {
  const mall = {
    ...pune,
    closedDates: ["2026-09-28"],
  };
  const status = getMallStatus(mall, new Date("2026-09-28T10:00:00+05:30"));
  assert.equal(status.hoursValid, true);
  assert.equal(status.isHoliday, true);
  assert.equal(status.isOpen, false);
});

test("matches holiday dates against the mall's local date instead of the UTC date", () => {
  const mall = {
    ...pune,
    closedDates: ["2026-09-29"],
  };
  const status = getMallStatus(mall, new Date("2026-09-28T19:00:00Z"));
  assert.equal(status.isHoliday, true);
  assert.equal(status.isOpen, false);
});
