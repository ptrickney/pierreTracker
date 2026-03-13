"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, X, Clock } from "lucide-react";
import { insertLog, buildTimestamp } from "@/lib/queries";
import {
  getDefaultEventTime,
  generateTimeOptions,
} from "@/lib/timeUtils";

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
  const [eventTime, setEventTime] = useState(getDefaultEventTime);
  const [feedAmount, setFeedAmount] = useState(FEED_DEFAULT);
  const [feedSubmitting, setFeedSubmitting] = useState(false);
  const [diaperSubmitting, setDiaperSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setEventTime(getDefaultEventTime());
    setFeedAmount(FEED_DEFAULT);
  }, []);

  useEffect(() => {
    if (isOpen) {
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
      const today = new Date();
      await insertLog({
        action_type: "feed",
        amount: feedAmount,
        unit: "ml",
        details: null,
        timestamp: buildTimestamp(today, eventTime),
      });
      handleLogSaved();
    } finally {
      setFeedSubmitting(false);
    }
  };

  const handleLogDiaper = async (unit: "wet" | "dirty") => {
    setDiaperSubmitting(true);
    try {
      const today = new Date();
      await insertLog({
        action_type: "diaper",
        amount: 1,
        unit,
        details: null,
        timestamp: buildTimestamp(today, eventTime),
      });
      handleLogSaved();
    } finally {
      setDiaperSubmitting(false);
    }
  };

  const atMin = feedAmount <= FEED_MIN;
  const atMax = feedAmount >= FEED_MAX;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-base font-bold uppercase tracking-wide text-blue-700 shadow-sm transition hover:bg-gray-200"
        aria-expanded={isOpen}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <Plus className="h-5 w-5 text-blue-600" />
        </span>
        LOG ACTIVITY
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: isOpen ? "480px" : "0px" }}
      >
        <div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="mb-4 flex min-h-[44px] items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                aria-label="Cancel"
              >
                <X className="h-5 w-5" />
                CANCEL
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4" />
                  EVENT TIME:
                </label>
                <select
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Event time"
                >
                  {timeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Feed amount
                </label>
                <div className="flex min-h-[44px] items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFeedAmount((a) => Math.max(FEED_MIN, a - FEED_STEP))
                    }
                    disabled={atMin}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
                    aria-label="Decrease amount"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-lg font-semibold text-gray-900">
                    {feedAmount} <span className="text-sm font-normal text-gray-500">ml</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedAmount((a) => Math.min(FEED_MAX, a + FEED_STEP))
                    }
                    disabled={atMax}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
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
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span aria-hidden>🍼</span>
                Log Feed
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLogDiaper("wet")}
                  disabled={diaperSubmitting}
                  className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span aria-hidden>💧</span>
                  Wet
                </button>
                <button
                  type="button"
                  onClick={() => handleLogDiaper("dirty")}
                  disabled={diaperSubmitting}
                  className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
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
