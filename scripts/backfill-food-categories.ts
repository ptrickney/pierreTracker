/**
 * One-off backfill after adding French keywords to the food inference
 * heuristics (see openspec/changes/archive: french-food-keywords).
 *
 * - Foods stored with category "other" whose name now infers a real
 *   category are updated to that category.
 * - Foods with an empty allergen list whose name now infers allergens
 *   receive them.
 *
 * Manually chosen categories (anything but "other") and non-empty
 * allergen lists are never touched.
 *
 * Run from the repo root:  npx tsx scripts/backfill-food-categories.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * in the environment or in .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { inferAllergens, inferFoodCategory } from "../src/lib/foodConstants";
import type { AllergenKey, FoodCategory } from "../src/types/food";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // no .env.local — rely on the process environment
  }
}

type FoodRow = {
  id: string;
  name: string;
  category: FoodCategory;
  allergens: AllergenKey[];
};

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("foods")
    .select("id, name, category, allergens")
    .order("name");
  if (error) throw error;

  const foods = (data ?? []) as FoodRow[];
  let updated = 0;

  for (const food of foods) {
    const patch: Partial<Pick<FoodRow, "category" | "allergens">> = {};

    if (food.category === "other") {
      const inferred = inferFoodCategory(food.name);
      if (inferred !== "other") patch.category = inferred;
    }

    if ((food.allergens ?? []).length === 0) {
      const inferred = inferAllergens(food.name);
      if (inferred.length > 0) patch.allergens = inferred;
    }

    if (Object.keys(patch).length === 0) continue;

    const { error: updateError } = await supabase
      .from("foods")
      .update(patch)
      .eq("id", food.id);
    if (updateError) {
      console.error(`FAILED  ${food.name}: ${updateError.message}`);
      continue;
    }
    updated += 1;
    const parts: string[] = [];
    if (patch.category) parts.push(`category other → ${patch.category}`);
    if (patch.allergens) parts.push(`allergens [] → [${patch.allergens.join(", ")}]`);
    console.log(`UPDATED ${food.name}: ${parts.join("; ")}`);
  }

  console.log(`\n${foods.length} foods scanned, ${updated} updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
