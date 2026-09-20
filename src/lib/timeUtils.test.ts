import assert from "node:assert/strict";
import test from "node:test";
import {
  generateTimeOptions,
  getDefaultEventTime,
  roundDownTo15Minutes,
} from "./timeUtils";

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

test("rounds local clock time down to the nearest 15-minute mark", () => {
  assert.equal(hhmm(roundDownTo15Minutes(new Date(2026, 8, 20, 16, 7))), "16:00");
  assert.equal(hhmm(roundDownTo15Minutes(new Date(2026, 8, 20, 16, 0))), "16:00");
  assert.equal(hhmm(roundDownTo15Minutes(new Date(2026, 8, 20, 16, 14))), "16:00");
  assert.equal(hhmm(roundDownTo15Minutes(new Date(2026, 8, 20, 16, 15))), "16:15");
  assert.equal(hhmm(roundDownTo15Minutes(new Date(2026, 8, 20, 16, 44))), "16:30");
  assert.equal(hhmm(roundDownTo15Minutes(new Date(2026, 8, 20, 16, 59))), "16:45");
});

test("default event time is 15 minutes ago, rounded down to 15 minutes", () => {
  assert.equal(getDefaultEventTime(new Date(2026, 8, 20, 16, 7)), "15:45");
  assert.equal(getDefaultEventTime(new Date(2026, 8, 20, 16, 15)), "16:00");
  assert.equal(getDefaultEventTime(new Date(2026, 8, 20, 16, 0)), "15:45");
});

test("time options are 15-minute increments covering a full day", () => {
  const options = generateTimeOptions();

  assert.equal(options[0], "00:00");
  assert.equal(options[1], "00:15");
  assert.equal(options[2], "00:30");
  assert.equal(options[3], "00:45");
  assert.equal(options[4], "01:00");
  assert.equal(options.at(-1), "23:45");
  assert.equal(options.length, 96);
  assert.ok(!options.includes("15:50"));
  assert.ok(!options.includes("15:55"));
  assert.ok(options.includes("15:45"));
  assert.ok(options.includes("16:00"));
  assert.ok(options.every((opt) => {
    const minutes = Number(opt.split(":")[1]);
    return minutes % 15 === 0;
  }));
});

test("default event time is always a selectable option", () => {
  const options = generateTimeOptions();
  const samples = [
    new Date(2026, 8, 20, 0, 2),
    new Date(2026, 8, 20, 16, 7),
    new Date(2026, 8, 20, 23, 59),
  ];

  for (const now of samples) {
    assert.ok(options.includes(getDefaultEventTime(now)));
  }
});
