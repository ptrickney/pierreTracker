"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Shield, X, AlertCircle, MessageSquare } from "lucide-react";
import {
  fetchFoodDetail,
  fetchPassportSummary,
  updateFoodCategory,
  updateFoodExposureComment,
  updateFoodExposureReaction,
} from "@/lib/foodQueries";
import {
  CATEGORY_OPTIONS,
  categoryMeta,
  preferenceEmoji,
} from "@/lib/foodConstants";
import {
  FOOD_CATEGORIES,
  type FoodCategory,
  type FoodDetail,
  type PassportFoodSummary,
  type PassportSummary,
} from "@/types/food";

function formatTriedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTriedDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} · ${d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}

/** Prevent the dashboard from scrolling while a passport overlay is open. */
function useLockBodyScroll() {
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, []);
}

export default function FoodPassport({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [summary, setSummary] = useState<PassportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [detailFoodId, setDetailFoodId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchPassportSummary()
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load passport");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  if (loading && !summary) {
    return (
      <div className="h-40 animate-pulse rounded-2xl bg-orange-100 dark:bg-orange-950/30" />
    );
  }

  if (error && !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  const data = summary!;

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 p-5 text-white shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-50/90">
          Milestone Tracker
        </p>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold">
          <BookOpen className="h-5 w-5" />
          Pierre&apos;s Food Passport
        </h2>
        <p className="mt-2 text-sm text-orange-50">
          {data.uniqueFoodCount === 0 ? (
            "No solids logged yet — tap Log Activity → Solids to start."
          ) : (
            <>
              Introduced {data.uniqueFoodCount} food
              {data.uniqueFoodCount === 1 ? "" : "s"} ({data.allergensPassedCount}{" "}
              Top Allergen
              {data.allergensPassedCount === 1 ? "" : "s"} Passed{" "}
              <Shield className="inline h-3.5 w-3.5 align-text-bottom" />)
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => setExploreOpen(true)}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition hover:bg-orange-50"
        >
          Explore Passport ›
        </button>

        {data.recentTried.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-orange-50/90">
              Tried:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.recentTried.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => {
                    setExploreOpen(true);
                    setDetailFoodId(food.id);
                  }}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                    food.hasReaction
                      ? "bg-red-600/90 text-white"
                      : "bg-white/20 text-white backdrop-blur-sm"
                  }`}
                >
                  <span aria-hidden>{preferenceEmoji(food.latestPreference)}</span>
                  {food.name}
                  {food.hasReaction && (
                    <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-red-600">
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {exploreOpen && (
        <ExplorePassportModal
          foods={data.foods}
          uniqueFoodCount={data.uniqueFoodCount}
          allergensPassedCount={data.allergensPassedCount}
          initialFoodId={detailFoodId}
          onClose={() => {
            setExploreOpen(false);
            setDetailFoodId(null);
          }}
          onChanged={() => {
            load();
          }}
        />
      )}
    </>
  );
}

function ExplorePassportModal({
  foods,
  uniqueFoodCount,
  allergensPassedCount,
  initialFoodId,
  onClose,
  onChanged,
}: {
  foods: PassportFoodSummary[];
  uniqueFoodCount: number;
  allergensPassedCount: number;
  initialFoodId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detailId, setDetailId] = useState<string | null>(initialFoodId);
  useLockBodyScroll();

  useEffect(() => {
    setDetailId(initialFoodId);
  }, [initialFoodId]);

  const byCategory = useMemo(() => {
    const map = new Map<FoodCategory, PassportFoodSummary[]>();
    for (const cat of FOOD_CATEGORIES) map.set(cat, []);
    for (const food of foods) {
      const list = map.get(food.category) ?? [];
      list.push(food);
      map.set(food.category, list);
    }
    return map;
  }, [foods]);

  if (detailId) {
    return (
      <FoodDetailModal
        foodId={detailId}
        onBack={() => setDetailId(null)}
        onClose={onClose}
        onChanged={onChanged}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pierre's Food Passport"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-zinc-900 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-zinc-700">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-zinc-50">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Pierre&apos;s Food Passport
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              {uniqueFoodCount} unique foods explored | {allergensPassedCount} Top
              Allergens Passed{" "}
              <Shield className="inline h-3.5 w-3.5 align-text-bottom text-orange-500" />
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {foods.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-zinc-400">
              No foods yet. Log a solid from Activity Logger to fill the passport.
            </p>
          ) : (
            <div className="space-y-5">
              {FOOD_CATEGORIES.map((cat) => {
                const list = byCategory.get(cat) ?? [];
                if (list.length === 0) return null;
                const meta = categoryMeta(cat);
                return (
                  <div key={cat}>
                    <div className="mb-2 flex items-center gap-2">
                      <span aria-hidden>{meta.emoji}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-zinc-50">
                        {meta.label}
                      </h4>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        {list.length} food{list.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {list.map((food) => (
                        <li key={food.id}>
                          <button
                            type="button"
                            onClick={() => setDetailId(food.id)}
                            className={`flex w-full min-h-[56px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                              food.hasReaction
                                ? "border-red-300 dark:border-red-800"
                                : "border-gray-200 dark:border-zinc-600"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-zinc-50">
                                <span aria-hidden className="mr-1.5">
                                  {preferenceEmoji(food.latestPreference)}
                                </span>
                                {food.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-zinc-400">
                                Tried {formatTriedDate(food.firstTriedTimestamp)}
                              </p>
                            </div>
                            {food.hasReaction && (
                              <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">
                                (!) Reaction
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FoodDetailModal({
  foodId,
  onBack,
  onClose,
  onChanged,
}: {
  foodId: string;
  onBack: () => void;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<FoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeExposureId, setActiveExposureId] = useState<string | null>(null);
  const [mode, setMode] = useState<"reaction" | "comment" | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFoodDetail(foodId)
      .then((d) => {
        if (!cancelled) {
          setDetail(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load food");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [foodId]);

  const reload = () => {
    setLoading(true);
    fetchFoodDetail(foodId)
      .then((d) => {
        setDetail(d);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load food");
      })
      .finally(() => setLoading(false));
  };

  const startAction = (
    exposureId: string,
    nextMode: "reaction" | "comment",
    initial: string
  ) => {
    setActiveExposureId(exposureId);
    setMode(nextMode);
    setDraft(initial);
  };

  const saveAction = async () => {
    if (!activeExposureId || !mode) return;
    setSaving(true);
    try {
      if (mode === "reaction") {
        await updateFoodExposureReaction(activeExposureId, draft);
      } else {
        await updateFoodExposureComment(activeExposureId, draft);
      }
      setMode(null);
      setActiveExposureId(null);
      setDraft("");
      reload();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Food detail"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-zinc-900 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-zinc-700">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              ← Back to passport
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50">
              {detail?.food.name ?? "Food"}
            </h3>
            {detail && (
              <div className="mt-2 space-y-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400">
                  Category
                </label>
                <select
                  value={detail.food.category}
                  onChange={async (e) => {
                    const next = e.target.value as FoodCategory;
                    try {
                      const updated = await updateFoodCategory(
                        detail.food.id,
                        next
                      );
                      setDetail((prev) =>
                        prev ? { ...prev, food: updated } : prev
                      );
                      onChanged();
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Failed to update category"
                      );
                    }
                  }}
                  className="min-h-[40px] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  aria-label="Food category"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
                {detail.food.allergens.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {detail.food.allergens.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {loading && !detail ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : detail && detail.exposures.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No exposures yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {detail?.exposures.map((exp) => (
                <li
                  key={exp.id}
                  className={`rounded-xl border p-3 ${
                    exp.had_reaction
                      ? "border-red-300 dark:border-red-800"
                      : "border-gray-200 dark:border-zinc-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-zinc-50">
                        <span aria-hidden className="mr-1.5">
                          {preferenceEmoji(exp.preference)}
                        </span>
                        {formatTriedDateTime(exp.timestamp)}
                      </p>
                      {exp.comment && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">
                          {exp.comment}
                        </p>
                      )}
                      {exp.had_reaction && (
                        <p className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">
                          Reaction: {exp.reaction_notes || "Logged"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!exp.had_reaction && (
                      <button
                        type="button"
                        onClick={() =>
                          startAction(exp.id, "reaction", exp.reaction_notes ?? "")
                        }
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Report reaction
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        startAction(exp.id, "comment", exp.comment ?? "")
                      }
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {exp.comment ? "Edit comment" : "Add comment"}
                    </button>
                  </div>

                  {activeExposureId === exp.id && mode && (
                    <div
                      className={`mt-3 rounded-lg border p-3 ${
                        mode === "reaction"
                          ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                          : "border-gray-200 bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800"
                      }`}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-300">
                        {mode === "reaction" ? "Reaction notes" : "Comment"}
                      </p>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder={
                          mode === "reaction"
                            ? "When did it start? What are the symptoms?"
                            : "Notes unrelated to allergy…"
                        }
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={saveAction}
                          disabled={saving}
                          className="min-h-[40px] rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMode(null);
                            setActiveExposureId(null);
                          }}
                          className="min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
