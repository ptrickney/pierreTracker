"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Plus, X, Clock, Calendar, UtensilsCrossed, AlertCircle } from "lucide-react";
import { insertLog, buildTimestamp } from "@/lib/queries";
import { logSolidFood, searchFoodsByName } from "@/lib/foodQueries";
import {
  ALLERGEN_OPTIONS,
  PREFERENCE_OPTIONS,
  inferAllergens,
} from "@/lib/foodConstants";
import {
  getDefaultEventTime,
  generateTimeOptions,
  getTodayDateString,
  parseDateString,
} from "@/lib/timeUtils";
import DirtyDiaperCelebration from "@/components/DirtyDiaperCelebration";
import type { AllergenKey, FoodPreference, FoodRow } from "@/types/food";

const FEED_MIN = 0;
const FEED_MAX = 500;
const FEED_STEP = 10;
const FEED_DEFAULT = 200;

const timeOptions = generateTimeOptions();

export type ActivityLoggerProps = {
  onLogSaved?: () => void;
};

export default function ActivityLogger({ onLogSaved }: ActivityLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventDate, setEventDate] = useState(getTodayDateString);
  const [eventTime, setEventTime] = useState(getDefaultEventTime);
  const [feedMode, setFeedMode] = useState<"bottle" | "solids">("bottle");
  const [feedAmount, setFeedAmount] = useState(FEED_DEFAULT);
  const [feedSubmitting, setFeedSubmitting] = useState(false);
  const [diaperSubmitting, setDiaperSubmitting] = useState(false);
  const [dirtyCelebration, setDirtyCelebration] = useState(false);
  const [dirtyBurstKey, setDirtyBurstKey] = useState(0);

  const [foodName, setFoodName] = useState("");
  const [preference, setPreference] = useState<FoodPreference>("neutral");
  const [allergens, setAllergens] = useState<AllergenKey[]>([]);
  const [comment, setComment] = useState("");
  const [reportReaction, setReportReaction] = useState(false);
  const [reactionNotes, setReactionNotes] = useState("");
  const [foodError, setFoodError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FoodRow[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAllergenInfer = useRef(false);

  const resetSolidsForm = useCallback(() => {
    setFoodName("");
    setPreference("neutral");
    setAllergens([]);
    setComment("");
    setReportReaction(false);
    setReactionNotes("");
    setFoodError(null);
    setSuggestions([]);
    setShowSuggestions(false);
    skipNextAllergenInfer.current = false;
  }, []);

  const resetForm = useCallback(() => {
    setEventDate(getTodayDateString());
    setEventTime(getDefaultEventTime());
    setFeedAmount(FEED_DEFAULT);
    setFeedMode("bottle");
    resetSolidsForm();
  }, [resetSolidsForm]);

  useEffect(() => {
    if (isOpen) {
      setEventDate(getTodayDateString());
      setEventTime(getDefaultEventTime());
      setFeedAmount(FEED_DEFAULT);
      setFeedMode("bottle");
      resetSolidsForm();
    }
  }, [isOpen, resetSolidsForm]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!foodName.trim()) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      searchFoodsByName(foodName)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 200);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [foodName]);

  useEffect(() => {
    if (skipNextAllergenInfer.current) {
      skipNextAllergenInfer.current = false;
      return;
    }
    setAllergens(inferAllergens(foodName));
  }, [foodName]);

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

  const handleLogSolid = async () => {
    if (!foodName.trim()) {
      setFoodError("Enter what he ate");
      return;
    }
    setFoodError(null);
    setFeedSubmitting(true);
    try {
      await logSolidFood({
        name: foodName,
        timestamp: buildTimestamp(parseDateString(eventDate), eventTime),
        preference,
        allergens,
        had_reaction: reportReaction,
        reaction_notes: reportReaction ? reactionNotes.trim() || null : null,
        comment: comment.trim() || null,
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

  const toggleAllergen = (key: AllergenKey) => {
    setAllergens((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const selectSuggestion = (food: FoodRow) => {
    skipNextAllergenInfer.current = true;
    setFoodName(food.name);
    setAllergens(
      food.allergens.length > 0 ? food.allergens : inferAllergens(food.name)
    );
    setShowSuggestions(false);
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
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
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

              <div
                className="grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-zinc-600 dark:bg-zinc-800"
                role="tablist"
                aria-label="Feeding type"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={feedMode === "bottle"}
                  onClick={() => setFeedMode("bottle")}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${
                    feedMode === "bottle"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  <span aria-hidden>🍼</span>
                  Bottle
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={feedMode === "solids"}
                  onClick={() => setFeedMode("solids")}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${
                    feedMode === "solids"
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Solids
                </button>
              </div>

              {feedMode === "bottle" ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="relative">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      What did he eat?
                    </label>
                    <input
                      type="text"
                      value={foodName}
                      onChange={(e) => {
                        setFoodName(e.target.value);
                        setFoodError(null);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 150);
                      }}
                      placeholder="e.g. Avocado, Salmon, Peanut Butter"
                      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      aria-label="Food name"
                      autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-800">
                        {suggestions.map((food) => (
                          <li key={food.id}>
                            <button
                              type="button"
                              className="flex w-full min-h-[44px] items-center px-3 py-2 text-left text-sm text-gray-800 hover:bg-orange-50 dark:text-zinc-100 dark:hover:bg-zinc-700"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectSuggestion(food)}
                            >
                              {food.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {foodError && (
                      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                        {foodError}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Preference
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {PREFERENCE_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setPreference(opt.key)}
                          className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border text-2xl transition ${
                            preference === opt.key
                              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50"
                              : "border-gray-200 bg-white opacity-60 dark:border-zinc-600 dark:bg-zinc-800"
                          }`}
                          aria-label={opt.label}
                          aria-pressed={preference === opt.key}
                        >
                          <span aria-hidden>{opt.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Top allergens{" "}
                      <span className="font-normal text-gray-500 dark:text-zinc-400">
                        (auto from name — tap to adjust)
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGEN_OPTIONS.map((opt) => {
                        const selected = allergens.includes(opt.key);
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => toggleAllergen(opt.key)}
                            className={`min-h-[36px] rounded-full border px-3 py-1 text-xs font-medium transition ${
                              selected
                                ? "border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-600 dark:bg-orange-950/40 dark:text-orange-200"
                                : "border-gray-200 bg-white text-gray-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                            aria-pressed={selected}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Comment (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      placeholder="Texture, gagging, pairings…"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  {!reportReaction ? (
                    <button
                      type="button"
                      onClick={() => setReportReaction(true)}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Report Reaction
                    </button>
                  ) : (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-red-800 dark:text-red-200">
                          <AlertCircle className="h-4 w-4" />
                          Allergic Reaction Logged
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReportReaction(false);
                            setReactionNotes("");
                          }}
                          className="text-xs font-medium text-red-700 underline dark:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        value={reactionNotes}
                        onChange={(e) => setReactionNotes(e.target.value)}
                        rows={3}
                        placeholder="When did it start? What are the symptoms?"
                        className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-red-900/40 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogSolid}
                    disabled={feedSubmitting}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white shadow transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    Log Solid Food
                  </button>
                </>
              )}

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
