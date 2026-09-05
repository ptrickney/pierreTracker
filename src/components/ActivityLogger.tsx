"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Plus, X, Clock, Calendar, UtensilsCrossed } from "lucide-react";
import { insertLog, buildTimestamp } from "@/lib/queries";
import {
  logSolidFoods,
  PartialSolidLogError,
  searchFoodsByName,
} from "@/lib/foodQueries";
import {
  PREFERENCE_OPTIONS,
  normalizeFoodNameKey,
  preferenceEmoji,
} from "@/lib/foodConstants";
import {
  getDefaultEventTime,
  generateTimeOptions,
  getTodayDateString,
  parseDateString,
} from "@/lib/timeUtils";
import { useI18n } from "@/lib/i18n";
import DirtyDiaperCelebration from "@/components/DirtyDiaperCelebration";
import type { FoodPreference, FoodRow } from "@/types/food";

const FEED_MIN = 0;
const FEED_MAX = 500;
const FEED_STEP = 10;
const FEED_DEFAULT = 200;

const timeOptions = generateTimeOptions();

type PendingFood = {
  id: string;
  name: string;
  nameKey: string;
  preference: FoodPreference | null;
};

export type ActivityLoggerProps = {
  onLogSaved?: () => void;
};

export default function ActivityLogger({ onLogSaved }: ActivityLoggerProps) {
  const { t } = useI18n();
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
  const [pendingFoods, setPendingFoods] = useState<PendingFood[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [foodError, setFoodError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FoodRow[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedFood =
    pendingFoods.find((f) => f.id === selectedFoodId) ?? null;
  const typedKey = normalizeFoodNameKey(foodName);
  const exactSuggestion = suggestions.find((f) => f.name_key === typedKey);
  const showAddNew =
    Boolean(typedKey) && !exactSuggestion && !pendingFoods.some((f) => f.nameKey === typedKey);

  const resetSolidsForm = useCallback(() => {
    setFoodName("");
    setPendingFoods([]);
    setSelectedFoodId(null);
    setComment("");
    setFoodError(null);
    setSuggestions([]);
    setShowSuggestions(false);
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

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleLogSaved = useCallback(() => {
    resetForm();
    setIsOpen(false);
    onLogSaved?.();
  }, [onLogSaved, resetForm]);

  const addPendingFood = useCallback(
    (name: string, displayName?: string) => {
      const trimmed = (displayName ?? name).trim();
      if (!trimmed) return;
      const nameKey = normalizeFoodNameKey(trimmed);
      if (pendingFoods.some((f) => f.nameKey === nameKey)) {
        setFoodError(t.logger.alreadyAdded);
        setShowSuggestions(false);
        return;
      }
      const item: PendingFood = {
        id: crypto.randomUUID(),
        name: trimmed,
        nameKey,
        preference: null,
      };
      setPendingFoods((prev) => [...prev, item]);
      setSelectedFoodId(item.id);
      setFoodName("");
      setSuggestions([]);
      setShowSuggestions(false);
      setFoodError(null);
    },
    [pendingFoods, t]
  );

  const removePendingFood = (id: string) => {
    setPendingFoods((prev) => {
      const next = prev.filter((f) => f.id !== id);
      setSelectedFoodId((current) => {
        if (current !== id) return current;
        return next.length > 0 ? next[next.length - 1].id : null;
      });
      return next;
    });
  };

  const setPendingPreference = (preference: FoodPreference | null) => {
    if (!selectedFoodId) return;
    setPendingFoods((prev) =>
      prev.map((f) => (f.id === selectedFoodId ? { ...f, preference } : f))
    );
  };

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
    if (pendingFoods.length === 0) {
      setFoodError(t.logger.addAtLeastOneFood);
      return;
    }
    setFoodError(null);
    setFeedSubmitting(true);
    try {
      await logSolidFoods({
        foods: pendingFoods.map((f) => ({
          name: f.name,
          preference: f.preference,
        })),
        timestamp: buildTimestamp(parseDateString(eventDate), eventTime),
        comment: comment.trim() || null,
      });
      handleLogSaved();
    } catch (e) {
      if (e instanceof PartialSolidLogError && e.loggedCount > 0) {
        const remaining = pendingFoods.slice(e.loggedCount);
        setPendingFoods(remaining);
        setSelectedFoodId((current) => {
          if (remaining.some((f) => f.id === current)) return current;
          return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        });
        onLogSaved?.();
      }
      setFoodError(e instanceof Error ? e.message : t.logger.failedToLogFoods);
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
  const logLabel = t.logger.logFoods(pendingFoods.length);

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
        {t.logger.logActivity}
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
                aria-label={t.logger.cancelAria}
              >
                <X className="h-5 w-5" />
                {t.logger.cancel}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <Calendar className="h-4 w-4" />
                    {t.logger.dateLabel}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    max={getTodayDateString()}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    aria-label={t.logger.eventDate}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <Clock className="h-4 w-4" />
                    {t.logger.timeLabel}
                  </label>
                  <select
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    aria-label={t.logger.eventTime}
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
                  {t.logger.backdateNotice}
                </p>
              )}

              <div
                className="grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-zinc-600 dark:bg-zinc-800"
                role="tablist"
                aria-label={t.logger.feedingType}
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
                  {t.logger.bottle}
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
                  {t.logger.solids}
                </button>
              </div>

              {feedMode === "bottle" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      {t.logger.feedAmount}
                    </label>
                    <div className="flex min-h-[44px] items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFeedAmount((a) => Math.max(FEED_MIN, a - FEED_STEP))
                        }
                        disabled={atMin}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                        aria-label={t.logger.decreaseAmount}
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
                        aria-label={t.logger.increaseAmount}
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
                    {t.logger.logFeed}
                  </button>
                </>
              ) : (
                <>
                  {pendingFoods.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pendingFoods.map((food) => {
                        const selected = food.id === selectedFoodId;
                        const emoji = preferenceEmoji(food.preference);
                        return (
                          <span
                            key={food.id}
                            className={`inline-flex min-h-[36px] items-center gap-1 rounded-full border pl-3 pr-1 text-sm ${
                              selected
                                ? "border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/40"
                                : food.preference
                                  ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                                  : "border-gray-200 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedFoodId(food.id)}
                              className="max-w-[10rem] truncate py-1 text-left font-medium text-gray-800 dark:text-zinc-100"
                              aria-pressed={selected}
                            >
                              {food.name}
                              {emoji ? ` ${emoji}` : ""}
                            </button>
                            <button
                              type="button"
                              onClick={() => removePendingFood(food.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                              aria-label={t.logger.removeFood(food.name)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {selectedFood && (
                    <div className="rounded-xl border border-orange-200 bg-white p-3 dark:border-orange-900/50 dark:bg-zinc-800">
                      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                        {t.logger.howDidItGo(selectedFood.name.toLowerCase())}{" "}
                        <span className="font-normal text-gray-500 dark:text-zinc-400">
                          {t.common.optional}
                        </span>
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {PREFERENCE_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() =>
                              setPendingPreference(
                                selectedFood.preference === opt.key
                                  ? null
                                  : opt.key
                              )
                            }
                            className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border text-2xl transition ${
                              selectedFood.preference === opt.key
                                ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50"
                                : "border-gray-200 bg-white opacity-60 dark:border-zinc-600 dark:bg-zinc-800"
                            }`}
                            aria-label={t.preferences[opt.key]}
                            aria-pressed={selectedFood.preference === opt.key}
                          >
                            <span aria-hidden>{opt.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      {pendingFoods.length === 0
                        ? t.logger.whatDidHeEat
                        : t.logger.addAnotherFood}
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
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        if (exactSuggestion) {
                          addPendingFood(exactSuggestion.name);
                        } else if (foodName.trim()) {
                          addPendingFood(foodName);
                        }
                      }}
                      placeholder={t.logger.foodPlaceholder}
                      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      aria-label={t.logger.foodName}
                      autoComplete="off"
                    />
                    {showSuggestions &&
                      (suggestions.length > 0 || showAddNew) && (
                        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-800">
                          {showAddNew && (
                            <li>
                              <button
                                type="button"
                                className="flex w-full min-h-[44px] items-center px-3 py-2 text-left text-sm font-semibold text-orange-800 hover:bg-orange-50 dark:text-orange-200 dark:hover:bg-zinc-700"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addPendingFood(foodName)}
                              >
                                {t.logger.addFood(foodName.trim())}
                              </button>
                            </li>
                          )}
                          {suggestions.map((food) => (
                            <li key={food.id}>
                              <button
                                type="button"
                                className="flex w-full min-h-[44px] items-center px-3 py-2 text-left text-sm text-gray-800 hover:bg-orange-50 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addPendingFood(food.name)}
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
                    {pendingFoods.length === 0 && !foodError && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                        {t.logger.addFoodsHint}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      {t.logger.commentOptional}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      placeholder={t.logger.commentPlaceholder}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLogSolid}
                    disabled={feedSubmitting}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white shadow transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    {logLabel}
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
                  {t.logger.wet}
                </button>
                <button
                  type="button"
                  onClick={() => handleLogDiaper("dirty")}
                  disabled={diaperSubmitting}
                  className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/35"
                >
                  <span aria-hidden>💩</span>
                  {t.logger.dirty}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
