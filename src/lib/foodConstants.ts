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

export function preferenceEmoji(
  preference: FoodPreference | null | undefined
): string {
  if (!preference) return "";
  return PREFERENCE_OPTIONS.find((o) => o.key === preference)?.emoji ?? "";
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
      "border-emerald-300 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40",
    header:
      "border-emerald-300 bg-emerald-200/80 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100",
    badge:
      "bg-white/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  },
  fruits: {
    panel:
      "border-rose-300 bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40",
    header:
      "border-rose-300 bg-rose-200/80 text-rose-950 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-100",
    badge: "bg-white/80 text-rose-800 dark:bg-rose-950 dark:text-rose-100",
  },
  proteins: {
    panel:
      "border-orange-300 bg-orange-100 dark:border-orange-800 dark:bg-orange-950/40",
    header:
      "border-orange-300 bg-orange-200/80 text-orange-950 dark:border-orange-800 dark:bg-orange-950/70 dark:text-orange-100",
    badge:
      "bg-white/80 text-orange-800 dark:bg-orange-950 dark:text-orange-100",
  },
  grains: {
    panel:
      "border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40",
    header:
      "border-amber-300 bg-amber-200/80 text-amber-950 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100",
    badge: "bg-white/80 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
  },
  dairy: {
    panel:
      "border-sky-300 bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40",
    header:
      "border-sky-300 bg-sky-200/80 text-sky-950 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-100",
    badge: "bg-white/80 text-sky-800 dark:bg-sky-950 dark:text-sky-100",
  },
  other: {
    panel:
      "border-slate-300 bg-slate-200 dark:border-zinc-600 dark:bg-zinc-800/70",
    header:
      "border-slate-300 bg-slate-300/80 text-slate-950 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100",
    badge: "bg-white/80 text-slate-800 dark:bg-zinc-900 dark:text-zinc-100",
  },
};

export function categoryStyles(category: FoodCategory) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;
}

/**
 * Fold a name key for keyword matching only: strip diacritics (é→e, ç→c),
 * decompose ligatures (œ→oe), and treat apostrophes/hyphens as word breaks
 * so French spellings ("Pêche", "l'œuf", "chou-fleur") match unaccented
 * keywords. Stored `name_key` values are NOT folded — deduplication
 * semantics are unchanged.
 */
function foldKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’‘'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whole-word / phrase match against a normalized food name key. */
function nameContainsPhrase(nameKey: string, phrase: string): boolean {
  const key = foldKey(nameKey);
  const folded = foldKey(phrase);
  if (!key || !folded) return false;
  if (key === folded) return true;
  const escaped = folded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(key);
}

/**
 * Keyword heuristics for baby foods, in English and French. First matching
 * category wins; matching is accent-insensitive (see `foldKey`), so the
 * French keywords are written unaccented. Words spelled the same in both
 * languages (kiwi, tofu, quinoa…) appear once.
 */
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
      // French
      "fruit",
      "fruits",
      "pomme",
      "compote",
      "banane",
      "fraise",
      "fraises",
      "framboise",
      "framboises",
      "myrtille",
      "myrtilles",
      "mure",
      "mures",
      "cassis",
      "mangue",
      "peche",
      "peches",
      "poire",
      "prune",
      "pruneau",
      "pasteque",
      "ananas",
      "cerise",
      "cerises",
      "abricot",
      "papaye",
      "noix de coco",
      "figue",
      "datte",
      "dattes",
      "clementine",
      "mandarine",
      "citron",
      "pamplemousse",
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
      "chickpeas",
      "edamame",
      // French
      "legume",
      "legumes",
      "avocat",
      "patate douce",
      "patate",
      "pomme de terre",
      "pommes de terre",
      "carotte",
      "carottes",
      "brocoli",
      "petits pois",
      "petit pois",
      "pois",
      "epinard",
      "epinards",
      "chou",
      "choux",
      "chou fleur",
      "courge",
      "potiron",
      "citrouille",
      "haricot",
      "haricots",
      "haricot vert",
      "haricots verts",
      "mais",
      "concombre",
      "poivron",
      "tomate",
      "betterave",
      "asperge",
      "asperges",
      "celeri",
      "champignon",
      "champignons",
      "oignon",
      "ail",
      "lentille",
      "lentilles",
      "pois chiche",
      "pois chiches",
      "navet",
      "panais",
      "artichaut",
      "aubergine",
      "fenouil",
      "poireau",
      "salade",
      "laitue",
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
      "ham",
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
      // French
      "viande",
      "poulet",
      "dinde",
      "boeuf",
      "porc",
      "agneau",
      "veau",
      "jambon",
      "oeuf",
      "oeufs",
      "poisson",
      "saumon",
      "thon",
      "cabillaud",
      "colin",
      "morue",
      "sardine",
      "sardines",
      "crevette",
      "crevettes",
      "cacahuete",
      "cacahuetes",
      "arachide",
      "arachides",
      "beurre de cacahuete",
      "amande",
      "amandes",
      "beurre d'amande",
      "noix de cajou",
      "noix",
      "noisette",
      "noisettes",
      "graine",
      "graines",
      "houmous",
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
      // French
      "riz",
      "avoine",
      "flocons d'avoine",
      "cereale",
      "cereales",
      "pates",
      "nouille",
      "nouilles",
      "pain",
      "tartine",
      "biscotte",
      "ble",
      "farine",
      "crepe",
      "crepes",
      "gaufre",
      "gaufres",
      "bouillie",
      "semoule",
      "orge",
      "sarrasin",
      "boulgour",
      "polenta",
      "brioche",
      "croissant",
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
      // French
      "yaourt",
      "yogourt",
      "fromage",
      "fromage blanc",
      "petit suisse",
      "beurre",
      "lait",
      "creme",
      "laitier",
      "comte",
      "gruyere",
      "emmental",
      "camembert",
      "brie",
      "chevre",
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
    keywords: [
      "peanut butter",
      "peanuts",
      "peanut",
      // French
      "beurre de cacahuete",
      "cacahuete",
      "cacahuetes",
      "cacahouete",
      "arachide",
      "arachides",
    ],
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
      // French — "noix" alone is excluded for "noix de coco" (coconut)
      "beurre d'amande",
      "beurre de cajou",
      "noix de cajou",
      "noix du bresil",
      "fruits a coque",
      "amande",
      "amandes",
      "noix",
      "noisette",
      "noisettes",
      "pecans",
      "pistache",
      "pistaches",
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
      // French
      "yaourt",
      "yogourt",
      "fromage",
      "fromage blanc",
      "petit suisse",
      "lait",
      "creme",
      "laitier",
      "comte",
      "gruyere",
      "emmental",
      "camembert",
      "brie",
      "chevre",
      // plain butter only — plant butters handled by peanut / tree_nuts above
      "butter",
      "beurre",
    ],
  },
  {
    allergen: "egg",
    keywords: [
      "eggs",
      "egg",
      "omelette",
      "omelet",
      "french toast",
      // French
      "oeuf",
      "oeufs",
      "pain perdu",
    ],
  },
  {
    allergen: "soy",
    keywords: [
      "soy sauce",
      "soy milk",
      "soya",
      "soy",
      "tofu",
      "edamame",
      "tempeh",
      "miso",
      // French
      "sauce soja",
      "lait de soja",
      "soja",
    ],
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
      // French
      "ble",
      "pain",
      "tartine",
      "biscotte",
      "pates",
      "nouille",
      "nouilles",
      "farine",
      "crepe",
      "crepes",
      "gaufre",
      "gaufres",
      "cereale",
      "cereales",
      "semoule",
      "bretzel",
      "brioche",
      "croissant",
      "boulgour",
    ],
  },
  {
    allergen: "fish",
    keywords: [
      "salmon",
      "tuna",
      "cod",
      "haddock",
      "tilapia",
      "fish",
      // French
      "poisson",
      "saumon",
      "thon",
      "cabillaud",
      "colin",
      "morue",
      "sardine",
      "sardines",
    ],
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
      // French
      "crevette",
      "crevettes",
      "crabe",
      "homard",
      "crustace",
      "crustaces",
      "fruits de mer",
      "palourde",
      "palourdes",
      "moule",
      "moules",
      "huitre",
      "huitres",
    ],
  },
  {
    allergen: "sesame",
    keywords: ["sesame", "tahini", "hummus", "houmous"],
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

  // Plant butters: don't also treat as dairy via the word "butter"/"beurre".
  const isPlantButter =
    nameContainsPhrase(key, "peanut butter") ||
    nameContainsPhrase(key, "almond butter") ||
    nameContainsPhrase(key, "cashew butter") ||
    nameContainsPhrase(key, "beurre de cacahuete") ||
    nameContainsPhrase(key, "beurre d'amande") ||
    nameContainsPhrase(key, "beurre de cajou");

  // Coconut ("noix de coco") is a fruit, not a tree nut, despite "noix".
  const isCoconut = nameContainsPhrase(key, "noix de coco");

  for (const { allergen, keywords } of ALLERGEN_KEYWORDS) {
    for (const keyword of keywords) {
      if (!nameContainsPhrase(key, keyword)) continue;
      if (
        allergen === "milk" &&
        (keyword === "butter" || keyword === "beurre") &&
        isPlantButter
      ) {
        continue;
      }
      if (allergen === "tree_nuts" && keyword === "noix" && isCoconut) {
        continue;
      }
      found.add(allergen);
      break;
    }
  }

  return ALLERGEN_OPTIONS.map((o) => o.key).filter((k) => found.has(k));
}
