import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateSevenDayAverage,
  canGoNextTrendWindow,
  getTrendLookbackStart,
  getNextTrendWindowEnd,
  getPreviousTrendWindowEnd,
  getTrendWindow,
} from "./trendWindow";

function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

test("builds a seven-day local window ending on the anchor day", () => {
  const window = getTrendWindow(new Date(2026, 4, 22, 14, 30));

  assert.equal(localDateKey(window.start), "2026-05-16");
  assert.equal(localDateKey(window.endExclusive), "2026-05-23");
  assert.equal(window.label, "May 16 - May 22");
});

test("moves backward and forward one day without passing today", () => {
  const today = new Date(2026, 4, 22, 14, 30);
  const currentEnd = new Date(2026, 4, 22);
  const previousEnd = getPreviousTrendWindowEnd(currentEnd);

  assert.equal(localDateKey(previousEnd), "2026-05-21");
  assert.equal(canGoNextTrendWindow(previousEnd, today), true);
  assert.equal(localDateKey(getNextTrendWindowEnd(previousEnd, today)), "2026-05-22");
  assert.equal(canGoNextTrendWindow(currentEnd, today), false);
  assert.equal(localDateKey(getNextTrendWindowEnd(currentEnd, today)), "2026-05-22");
});

test("calculates a daily average across the full seven-day window", () => {
  assert.equal(calculateSevenDayAverage([4, 5, 6, 0, 0, 0, 6]), 3);
  assert.equal(calculateSevenDayAverage([]), 0);
});


test("starts trend queries six days before the displayed window for running averages", () => {
  const window = getTrendWindow(new Date(2026, 4, 22, 14, 30));

  assert.equal(localDateKey(getTrendLookbackStart(window.start)), "2026-05-10");
});
