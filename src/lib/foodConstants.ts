import type { AllergenKey, FoodCategory, FoodPreference } from "@/types/food";

export const ALLERGEN_OPTIONS: { key: AllergenKey; label: string }[] = [
  { key: "milk", label: "Milk" },
  { key: "egg", label: "Egg" },
  { key: "peanut", label: "Peanut" },
  { key: "tree_nuts", label: "Tree nuts" },
  { key: "soy", label: "Soy" },
  { key: "wheat", label: "Wheat" },
  { key: "fish", label: "Fish" },
  { key: "shellfish", label: "Shellfish" },
  { key: "sesame", label: "Sesame" },
];

export const CATEGORY_OPTIONS: { key: FoodCategory; label: string; emoji: string }[] =
  [
    { key: "vegetables", label: "Vegetables", emoji: "🥦" },
    { key: "fruits", label: "Fruits", emoji: "🍎" },
    { key: "proteins", label: "Proteins & Meat", emoji: "🍗" },
    { key: "grains", label: "Grains", emoji: "🌾" },
    { key: "dairy", label: "Dairy", emoji: "🧀" },
    { key: "other", label: "Other", emoji: "🍽️" },
  ];

export const PREFERENCE_OPTIONS: {
  key: FoodPreference;
  label: string;
  emoji: string;
}[] = [
  { key: "dislike", label: "Disliked", emoji: "🤢" },
  { key: "neutral", label: "Neutral", emoji: "😐" },
  { key: "okay", label: "Okay", emoji: "🙂" },
  { key: "like", label: "Loved", emoji: "😍" },
];

export function normalizeFoodNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function preferenceEmoji(preference: FoodPreference): string {
  return (
    PREFERENCE_OPTIONS.find((o) => o.key === preference)?.emoji ?? "😐"
  );
}

export function categoryMeta(category: FoodCategory) {
  return (
    CATEGORY_OPTIONS.find((c) => c.key === category) ??
    CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1]
  );
}

/**
 * Per-category tints for grouping food lists. Tailwind needs whole class
 * names, so each variant is spelled out rather than composed at runtime.
 */
export const CATEGORY_STYLES: Record<
  FoodCategory,
  { panel: string; header: string; badge: string }
> = {
  vegetables: {
    panel:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    header:
      "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-100",
    badge:
      "bg-white/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  },
  fruits: {
    panel:
      "border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/20",
    header:
      "border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-100",
    badge: "bg-white/80 text-rose-800 dark:bg-rose-950 dark:text-rose-100",
  },
  proteins: {
    panel:
      "border-orange-200 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/20",
    header:
      "border-orange-200 bg-orange-100 text-orange-900 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-100",
    badge:
      "bg-white/80 text-orange-800 dark:bg-orange-950 dark:text-orange-100",
  },
  grains: {
    panel:
      "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20",
    header:
      "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-100",
    badge: "bg-white/80 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
  },
  dairy: {
    panel:
      "border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/20",
    header:
      "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-100",
    badge: "bg-white/80 text-sky-800 dark:bg-sky-950 dark:text-sky-100",
  },
  other: {
    panel:
      "border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800/40",
    header:
      "border-slate-200 bg-slate-200 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100",
    badge: "bg-white/80 text-slate-800 dark:bg-zinc-900 dark:text-zinc-100",
  },
};

export function categoryStyles(category: FoodCategory) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;
}

/** Whole-word / phrase match against a normalized food name key. */
function nameContainsPhrase(nameKey: string, phrase: string): boolean {
  if (!nameKey || !phrase) return false;
  if (nameKey === phrase) return true;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(nameKey);
}

/** Keyword heuristics for baby foods. First matching category wins. */
const CATEGORY_KEYWORDS: { category: FoodCategory; keywords: string[] }[] = [
  {
    category: "fruits",
    keywords: [
      "apple",
      "applesauce",
      "banana",
      "berry",
      "blueberry",
      "strawberry",
      "raspberry",
      "blackberry",
      "mango",
      "peach",
      "pear",
      "plum",
      "orange",
      "grape",
      "kiwi",
      "melon",
      "watermelon",
      "cantaloupe",
      "pineapple",
      "cherry",
      "cherries",
      "apricot",
      "papaya",
      "coconut",
      "raisin",
      "date",
      "fig",
    ],
  },
  {
    category: "vegetables",
    keywords: [
      "avocado",
      "sweet potato",
      "potato",
      "carrot",
      "broccoli",
      "pea",
      "peas",
      "spinach",
      "kale",
      "zucchini",
      "courgette",
      "squash",
      "pumpkin",
      "bean",
      "beans",
      "green bean",
      "corn",
      "cauliflower",
      "cucumber",
      "pepper",
      "tomato",
      "beet",
      "beetroot",
      "asparagus",
      "cabbage",
      "celery",
      "mushroom",
      "onion",
      "garlic",
      "lentil",
      "chickpea",
      "edamame",
    ],
  },
  {
    category: "proteins",
    keywords: [
      "chicken",
      "turkey",
      "beef",
      "pork",
      "lamb",
      "meat",
      "egg",
      "eggs",
      "fish",
      "salmon",
      "tuna",
      "cod",
      "shrimp",
      "tofu",
      "peanut",
      "peanut butter",
      "almond",
      "cashew",
      "walnut",
      "nut",
      "nuts",
      "seed",
      "seeds",
      "hummus",
      "bean",
      "lentil",
    ],
  },
  {
    category: "grains",
    keywords: [
      "rice",
      "oat",
      "oats",
      "oatmeal",
      "cereal",
      "pasta",
      "noodle",
      "bread",
      "toast",
      "cracker",
      "quinoa",
      "barley",
      "wheat",
      "flour",
      "pancake",
      "waffle",
      "porridge",
      "couscous",
      "tortilla",
      "bagel",
    ],
  },
  {
    category: "dairy",
    keywords: [
      "yogurt",
      "yoghurt",
      "cheese",
      "cottage",
      "butter",
      "milk",
      "cream",
      "ricotta",
      "mozzarella",
      "cheddar",
      "kefir",
    ],
  },
];

/**
 * Infer a passport category from a food name using simple keyword matching.
 * Falls back to `other` when nothing matches.
 */
export function inferFoodCategory(name: string): FoodCategory {
  const key = normalizeFoodNameKey(name);
  if (!key) return "other";

  // Prefer longer keywords so "peanut butter" / "sweet potato" beat shorter substrings.
  const ranked = CATEGORY_KEYWORDS.flatMap(({ category, keywords }) =>
    keywords.map((keyword) => ({ category, keyword }))
  ).sort((a, b) => b.keyword.length - a.keyword.length);

  for (const { category, keyword } of ranked) {
    if (nameContainsPhrase(key, keyword)) return category;
  }
  return "other";
}

const ALLERGEN_KEYWORDS: { allergen: AllergenKey; keywords: string[] }[] = [
  {
    allergen: "peanut",
    keywords: ["peanut butter", "peanuts", "peanut"],
  },
  {
    allergen: "tree_nuts",
    keywords: [
      "almond butter",
      "cashew butter",
      "almond",
      "almonds",
      "cashew",
      "cashews",
      "walnut",
      "walnuts",
      "pecan",
      "pecans",
      "hazelnut",
      "hazelnuts",
      "pistachio",
      "pistachios",
      "macadamia",
      "brazil nut",
      "tree nut",
      "tree nuts",
    ],
  },
  {
    allergen: "milk",
    keywords: [
      "yogurt",
      "yoghurt",
      "cheese",
      "cottage cheese",
      "ricotta",
      "mozzarella",
      "cheddar",
      "kefir",
      "cream",
      "dairy",
      "whey",
      "milk",
      // plain butter only — plant butters handled by peanut / tree_nuts above
      "butter",
    ],
  },
  {
    allergen: "egg",
    keywords: ["eggs", "egg", "omelette", "omelet", "french toast"],
  },
  {
    allergen: "soy",
    keywords: ["soy sauce", "soy milk", "soya", "soy", "tofu", "edamame", "tempeh", "miso"],
  },
  {
    allergen: "wheat",
    keywords: [
      "whole wheat",
      "wheat",
      "bread",
      "toast",
      "pasta",
      "noodle",
      "noodles",
      "flour",
      "cracker",
      "crackers",
      "bagel",
      "pancake",
      "pancakes",
      "waffle",
      "waffles",
      "cereal",
      "pretzel",
      "couscous",
      "tortilla",
    ],
  },
  {
    allergen: "fish",
    keywords: ["salmon", "tuna", "cod", "haddock", "tilapia", "fish"],
  },
  {
    allergen: "shellfish",
    keywords: [
      "shrimp",
      "prawn",
      "prawns",
      "crab",
      "lobster",
      "shellfish",
      "clam",
      "clams",
      "mussel",
      "mussels",
      "oyster",
      "oysters",
    ],
  },
  {
    allergen: "sesame",
    keywords: ["sesame", "tahini", "hummus"],
  },
];

/**
 * Infer classic-9 allergen tags from a food name.
 * Returns every matching allergen (a food can hit more than one).
 */
export function inferAllergens(name: string): AllergenKey[] {
  const key = normalizeFoodNameKey(name);
  if (!key) return [];

  const found = new Set<AllergenKey>();

  // Plant butters: don't also treat as dairy via the word "butter".
  const isPlantButter =
    nameContainsPhrase(key, "peanut butter") ||
    nameContainsPhrase(key, "almond butter") ||
    nameContainsPhrase(key, "cashew butter");

  for (const { allergen, keywords } of ALLERGEN_KEYWORDS) {
    for (const keyword of keywords) {
      if (!nameContainsPhrase(key, keyword)) continue;
      if (allergen === "milk" && keyword === "butter" && isPlantButter) {
        continue;
      }
      found.add(allergen);
      break;
    }
  }

  return ALLERGEN_OPTIONS.map((o) => o.key).filter((k) => found.has(k));
}
