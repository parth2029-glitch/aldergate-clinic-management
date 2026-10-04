/* Smallest thing that fails if the date logic breaks.
   Run: node src/lib/format.check.mjs */

import assert from "node:assert/strict";
import { fmtDate, fmtDayDate, dayName, toISO, nextDays, isPast, parseISO } from "./format.js";

assert.equal(fmtDate("2026-08-13"), "13 Aug 2026");
assert.equal(fmtDayDate("2026-08-13"), "Thu 13 Aug");
assert.equal(dayName("2026-08-13"), "Thu");

// Single-digit month and day must pad, or the ISO round-trip breaks.
assert.equal(toISO(new Date(2026, 0, 5)), "2026-01-05");
assert.equal(toISO(parseISO("2026-01-05")), "2026-01-05");

// The booking date strip must roll over a month boundary correctly.
const days = nextDays(3, new Date(2026, 7, 30));
assert.equal(days.length, 3);
assert.deepEqual(
  days.map((d) => d.iso),
  ["2026-08-30", "2026-08-31", "2026-09-01"],
);
assert.equal(days[2].day, "Tue");

// A year boundary is the other place off-by-one bugs live.
assert.deepEqual(
  nextDays(2, new Date(2026, 11, 31)).map((d) => d.iso),
  ["2026-12-31", "2027-01-01"],
);

// Today is not past — appointments booked for today must stay in "upcoming".
assert.equal(isPast("2020-01-01"), true);
assert.equal(isPast(toISO(new Date())), false);

console.log("format: ok");
