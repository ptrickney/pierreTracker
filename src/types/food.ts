export const ALLERGEN_KEYS = [
  "milk",
  "egg",
  "peanut",
  "tree_nuts",
  "soy",
  "wheat",
  "fish",
  "shellfish",
  "sesame",
] as const;

export type AllergenKey = (typeof ALLERGEN_KEYS)[number];

export const FOOD_CATEGORIES = [
  "vegetables",
  "fruits",
  "proteins",
  "grains",
  "dairy",
  "other",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const FOOD_PREFERENCES = ["dislike", "neutral", "okay", "like"] as const;

export type FoodPreference = (typeof FOOD_PREFERENCES)[number];

export type FoodRow = {
  id: string;
  name: string;
  name_key: string;
  category: FoodCategory;
  allergens: AllergenKey[];
  created_at: string;
};

export type FoodExposureRow = {
  id: string;
  food_id: string;
  timestamp: string;
  preference: FoodPreference;
  had_reaction: boolean;
  reaction_notes: string | null;
  comment: string | null;
  created_at: string;
};

export type FoodExposureWithFood = FoodExposureRow & {
  food: Pick<FoodRow, "id" | "name" | "category" | "allergens">;
};

export type PassportFoodSummary = {
  id: string;
  name: string;
  category: FoodCategory;
  allergens: AllergenKey[];
  latestPreference: FoodPreference;
  latestTimestamp: string;
  firstTriedTimestamp: string;
  hasReaction: boolean;
  exposureCount: number;
};

export type PassportSummary = {
  uniqueFoodCount: number;
  allergensPassedCount: number;
  allergensPassed: AllergenKey[];
  recentTried: PassportFoodSummary[];
  foods: PassportFoodSummary[];
};

export type FoodDetail = {
  food: FoodRow;
  exposures: FoodExposureRow[];
};
