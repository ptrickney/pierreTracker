"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, X, Clock, Calendar } from "lucide-react";
import { insertLog, buildTimestamp } from "@/lib/queries";
import {
  getDefaultEventTime,
  generateTimeOptions,
  getTodayDateString,
  parseDateString,
} from "@/lib/timeUtils";
import DirtyDiaperCelebration from "@/components/DirtyDiaperCelebration";

const FEED_MIN = 0;
const FEED_MAX = 500;
const FEED_STEP = 10;
const FEED_DEFAULT = 120;

const timeOptions = generateTimeOptions();

export type ActivityLoggerProps = {
  onLogSaved?: () => void;
};

export default function ActivityLogger({ onLogSaved }: ActivityLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventDate, setEventDate] = useState(getTodayDateString);
  const [eventTime, setEventTime] = useState(getDefaultEventTime);
  const [feedAmount, setFeedAmount] = useState(FEED_DEFAULT);
  const [feedSubmitting, setFeedSubmitting] = useState(false);
  const [diaperSubmitting, setDiaperSubmitting] = useState(false);
  const [dirtyCelebration, setDirtyCelebration] = useState(false);
  const [dirtyBurstKey, setDirtyBurstKey] = useState(0);

  const resetForm = useCallback(() => {
    setEventDate(getTodayDateString());
    setEventTime(getDefaultEventTime());
    setFeedAmount(FEED_DEFAULT);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setEventDate(getTodayDateString());
      setEventTime(getDefaultEventTime());
      setFeedAmount(FEED_DEFAULT);
    }
  }, [isOpen]);

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleLogSaved = useCallback(() => {
    resetForm();
    setIsOpen(false);
    onLogSaved?.();
  }, [onLogSaved, resetForm]);

  const handleLogFeed = async () => {
    setFeedSubmitting(true);
    try {
      await insertLog({
        action_type: "feed",
        amount: feedAmount,
        unit: "ml",
        details: null,
        timestamp: buildTimestamp(parseDateString(eventDate), eventTime),
      });
      handleLogSaved();
    } finally {
      setFeedSubmitting(false);
    }
  };

  const handleLogDiaper = async (unit: "wet" | "dirty") => {
    setDiaperSubmitting(true);
    try {
      await insertLog({
        action_type: "diaper",
        amount: 1,
        unit,
        details: null,
        timestamp: buildTimestamp(parseDateString(eventDate), eventTime),
      });
      if (unit === "dirty") {
        setDirtyBurstKey((k) => k + 1);
        setDirtyCelebration(true);
      }
      handleLogSaved();
    } finally {
      setDiaperSubmitting(false);
    }
  };

  const isBackdate = eventDate !== getTodayDateString();
  const atMin = feedAmount <= FEED_MIN;
  const atMax = feedAmount >= FEED_MAX;

  return (
    <div className="mb-6">
      <DirtyDiaperCelebration
        show={dirtyCelebration}
        burstKey={dirtyBurstKey}
        onFinished={() => setDirtyCelebration(false)}
      />
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-base font-bold uppercase tracking-wide text-blue-700 shadow-sm transition hover:bg-gray-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-blue-300 dark:hover:bg-zinc-700"
        aria-expanded={isOpen}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 dark:ring-1 dark:ring-blue-800">
          <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </span>
        LOG ACTIVITY
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: isOpen ? "560px" : "0px" }}
      >
        <div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
            <div className="mb-4 flex min-h-[44px] items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label="Cancel"
              >
                <X className="h-5 w-5" />
                CANCEL
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <Calendar className="h-4 w-4" />
                    DATE:
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    max={getTodayDateString()}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    aria-label="Event date"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <Clock className="h-4 w-4" />
                    TIME:
                  </label>
                  <select
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    aria-label="Event time"
                  >
                    {timeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isBackdate && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Logging for a past date
                </p>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Feed amount
                </label>
                <div className="flex min-h-[44px] items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFeedAmount((a) => Math.max(FEED_MIN, a - FEED_STEP))
                    }
                    disabled={atMin}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    aria-label="Decrease amount"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-zinc-50">
                    {feedAmount}{" "}
                    <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">
                      ml
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedAmount((a) => Math.min(FEED_MAX, a + FEED_STEP))
                    }
                    disabled={atMax}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    aria-label="Increase amount"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogFeed}
                disabled={feedSubmitting}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                <span aria-hidden>🍼</span>
                Log Feed
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLogDiaper("wet")}
                  disabled={diaperSubmitting}
                  className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200 dark:hover:bg-green-900/40"
                >
                  <span aria-hidden>💧</span>
                  Wet
                </button>
                <button
                  type="button"
                  onClick={() => handleLogDiaper("dirty")}
                  disabled={diaperSubmitting}
                  className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/35"
                >
                  <span aria-hidden>💩</span>
                  Dirty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
