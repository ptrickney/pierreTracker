import { getSupabase } from "./supabase";
import { inferFoodCategory, normalizeFoodNameKey } from "./foodConstants";
import { ALLERGEN_KEYS } from "@/types/food";
import type {
  AllergenKey,
  FoodCategory,
  FoodDetail,
  FoodExposureRow,
  FoodExposureWithFood,
  FoodPreference,
  FoodRow,
  PassportFoodSummary,
  PassportSummary,
} from "@/types/food";

function asAllergens(value: unknown): AllergenKey[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(ALLERGEN_KEYS);
  return value.filter((v): v is AllergenKey => typeof v === "string" && allowed.has(v));
}

function mapFood(row: Record<string, unknown>): FoodRow {
  return {
    id: String(row.id),
    name: String(row.name),
    name_key: String(row.name_key),
    category: row.category as FoodCategory,
    allergens: asAllergens(row.allergens),
    created_at: String(row.created_at),
  };
}

function mapExposure(row: Record<string, unknown>): FoodExposureRow {
  return {
    id: String(row.id),
    food_id: String(row.food_id),
    timestamp: String(row.timestamp),
    preference: row.preference as FoodPreference,
    had_reaction: Boolean(row.had_reaction),
    reaction_notes:
      row.reaction_notes == null ? null : String(row.reaction_notes),
    comment: row.comment == null ? null : String(row.comment),
    created_at: String(row.created_at),
  };
}

export async function findFoodByNameKey(
  nameKey: string
): Promise<FoodRow | null> {
  const { data, error } = await getSupabase()
    .from("foods")
    .select("*")
    .eq("name_key", nameKey)
    .maybeSingle();
  if (error) throw error;
  return data ? mapFood(data as Record<string, unknown>) : null;
}

export type UpsertFoodParams = {
  name: string;
  allergens?: AllergenKey[];
  category?: FoodCategory;
};

/** Finds by name_key or creates; optionally updates allergens/category on existing. */
export async function upsertFood(params: UpsertFoodParams): Promise<FoodRow> {
  const trimmed = params.name.trim();
  if (!trimmed) throw new Error("Food name is required");
  const nameKey = normalizeFoodNameKey(trimmed);
  const existing = await findFoodByNameKey(nameKey);

  if (existing) {
    const nextAllergens = params.allergens ?? existing.allergens;
    // Never overwrite an existing food's category from logging; only allergen tags may update.
    const nextCategory = existing.category;
    const allergensChanged =
      JSON.stringify([...nextAllergens].sort()) !==
      JSON.stringify([...existing.allergens].sort());
    if (!allergensChanged) return existing;

    const { data, error } = await getSupabase()
      .from("foods")
      .update({ allergens: nextAllergens, category: nextCategory })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapFood(data as Record<string, unknown>);
  }

  const { data, error } = await getSupabase()
    .from("foods")
    .insert({
      name: trimmed,
      name_key: nameKey,
      category: params.category ?? inferFoodCategory(trimmed),
      allergens: params.allergens ?? [],
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapFood(data as Record<string, unknown>);
}

export async function updateFoodCategory(
  foodId: string,
  category: FoodCategory
): Promise<FoodRow> {
  const { data, error } = await getSupabase()
    .from("foods")
    .update({ category })
    .eq("id", foodId)
    .select("*")
    .single();
  if (error) throw error;
  return mapFood(data as Record<string, unknown>);
}

export type InsertFoodExposureParams = {
  food_id: string;
  timestamp: string;
  preference: FoodPreference;
  had_reaction?: boolean;
  reaction_notes?: string | null;
  comment?: string | null;
};

export async function insertFoodExposure(
  params: InsertFoodExposureParams
): Promise<FoodExposureRow> {
  const { data, error } = await getSupabase()
    .from("food_exposures")
    .insert({
      food_id: params.food_id,
      timestamp: params.timestamp,
      preference: params.preference,
      had_reaction: params.had_reaction ?? false,
      reaction_notes: params.reaction_notes ?? null,
      comment: params.comment ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapExposure(data as Record<string, unknown>);
}

export async function updateFoodExposureReaction(
  id: string,
  reactionNotes: string
): Promise<FoodExposureRow> {
  const { data, error } = await getSupabase()
    .from("food_exposures")
    .update({
      had_reaction: true,
      reaction_notes: reactionNotes.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapExposure(data as Record<string, unknown>);
}

export async function updateFoodExposureComment(
  id: string,
  comment: string
): Promise<FoodExposureRow> {
  const { data, error } = await getSupabase()
    .from("food_exposures")
    .update({ comment: comment.trim() || null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapExposure(data as Record<string, unknown>);
}

export async function deleteFoodExposure(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("food_exposures")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function searchFoodsByName(
  query: string,
  limit = 8
): Promise<FoodRow[]> {
  const q = normalizeFoodNameKey(query);
  if (!q) return [];
  const { data, error } = await getSupabase()
    .from("foods")
    .select("*")
    .ilike("name_key", `%${q}%`)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => mapFood(row as Record<string, unknown>));
}

function buildPassportFoodSummaries(
  foods: FoodRow[],
  exposures: FoodExposureRow[]
): PassportFoodSummary[] {
  const byFood = new Map<string, FoodExposureRow[]>();
  for (const exp of exposures) {
    const list = byFood.get(exp.food_id) ?? [];
    list.push(exp);
    byFood.set(exp.food_id, list);
  }

  const summaries: PassportFoodSummary[] = [];
  for (const food of foods) {
    const list = (byFood.get(food.id) ?? []).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (list.length === 0) continue;
    const latest = list[0];
    const first = list[list.length - 1];
    summaries.push({
      id: food.id,
      name: food.name,
      category: food.category,
      allergens: food.allergens,
      latestPreference: latest.preference,
      latestTimestamp: latest.timestamp,
      firstTriedTimestamp: first.timestamp,
      hasReaction: list.some((e) => e.had_reaction),
      exposureCount: list.length,
    });
  }

  return summaries.sort(
    (a, b) =>
      new Date(b.latestTimestamp).getTime() -
      new Date(a.latestTimestamp).getTime()
  );
}

function computeAllergensPassed(
  foods: FoodRow[],
  exposures: FoodExposureRow[]
): AllergenKey[] {
  const reactionByAllergen = new Map<AllergenKey, boolean>();
  const triedByAllergen = new Map<AllergenKey, boolean>();
  const foodById = new Map(foods.map((f) => [f.id, f]));

  for (const exp of exposures) {
    const food = foodById.get(exp.food_id);
    if (!food) continue;
    for (const allergen of food.allergens) {
      triedByAllergen.set(allergen, true);
      if (exp.had_reaction) reactionByAllergen.set(allergen, true);
    }
  }

  return ALLERGEN_KEYS.filter(
    (key) => triedByAllergen.get(key) && !reactionByAllergen.get(key)
  );
}

export async function fetchPassportSummary(
  recentLimit = 3
): Promise<PassportSummary> {
  const [{ data: foodsData, error: foodsError }, { data: expData, error: expError }] =
    await Promise.all([
      getSupabase().from("foods").select("*"),
      getSupabase().from("food_exposures").select("*"),
    ]);
  if (foodsError) throw foodsError;
  if (expError) throw expError;

  const foods = (foodsData ?? []).map((r) => mapFood(r as Record<string, unknown>));
  const exposures = (expData ?? []).map((r) =>
    mapExposure(r as Record<string, unknown>)
  );
  const summaries = buildPassportFoodSummaries(foods, exposures);
  const allergensPassed = computeAllergensPassed(foods, exposures);

  return {
    uniqueFoodCount: summaries.length,
    allergensPassedCount: allergensPassed.length,
    allergensPassed,
    recentTried: summaries.slice(0, recentLimit),
    foods: summaries,
  };
}

export async function fetchFoodDetail(foodId: string): Promise<FoodDetail> {
  const { data: foodData, error: foodError } = await getSupabase()
    .from("foods")
    .select("*")
    .eq("id", foodId)
    .single();
  if (foodError) throw foodError;

  const { data: expData, error: expError } = await getSupabase()
    .from("food_exposures")
    .select("*")
    .eq("food_id", foodId)
    .order("timestamp", { ascending: false });
  if (expError) throw expError;

  return {
    food: mapFood(foodData as Record<string, unknown>),
    exposures: (expData ?? []).map((r) =>
      mapExposure(r as Record<string, unknown>)
    ),
  };
}

export async function fetchRecentFoodExposures(
  limit: number,
  beforeTimestamp?: string
): Promise<FoodExposureWithFood[]> {
  let query = getSupabase()
    .from("food_exposures")
    .select("*, food:foods(id, name, category, allergens)")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (beforeTimestamp) {
    query = query.lt("timestamp", beforeTimestamp);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    const foodRaw = record.food as Record<string, unknown>;
    const exposure = mapExposure(record);
    return {
      ...exposure,
      food: {
        id: String(foodRaw.id),
        name: String(foodRaw.name),
        category: foodRaw.category as FoodCategory,
        allergens: asAllergens(foodRaw.allergens),
      },
    };
  });
}

export type LogSolidFoodParams = {
  name: string;
  timestamp: string;
  preference: FoodPreference;
  allergens?: AllergenKey[];
  category?: FoodCategory;
  had_reaction?: boolean;
  reaction_notes?: string | null;
  comment?: string | null;
};

export async function logSolidFood(
  params: LogSolidFoodParams
): Promise<{ food: FoodRow; exposure: FoodExposureRow }> {
  const food = await upsertFood({
    name: params.name,
    allergens: params.allergens,
    category: params.category,
  });
  const exposure = await insertFoodExposure({
    food_id: food.id,
    timestamp: params.timestamp,
    preference: params.preference,
    had_reaction: params.had_reaction,
    reaction_notes: params.reaction_notes,
    comment: params.comment,
  });
  return { food, exposure };
}
