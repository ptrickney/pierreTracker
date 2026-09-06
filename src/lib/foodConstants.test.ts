import assert from "node:assert/strict";
import test from "node:test";
import { inferAllergens, inferFoodCategory } from "./foodConstants";

test("English category inference is unchanged", () => {
  assert.equal(inferFoodCategory("Sweet Potato"), "vegetables");
  assert.equal(inferFoodCategory("Applesauce"), "fruits");
  assert.equal(inferFoodCategory("Peanut Butter"), "proteins");
  assert.equal(inferFoodCategory("Oatmeal"), "grains");
  assert.equal(inferFoodCategory("Greek Yogurt"), "dairy");
  assert.equal(inferFoodCategory("Mystery Puree"), "other");
});

test("previously uncategorized real-data names now categorize", () => {
  assert.equal(inferFoodCategory("Avocat"), "vegetables");
  assert.equal(inferFoodCategory("Chèvre"), "dairy");
  assert.equal(inferFoodCategory("Pain"), "grains");
  assert.equal(inferFoodCategory("Ham"), "proteins");
  assert.equal(inferFoodCategory("Chickpeas"), "vegetables");
});

test("French names infer categories", () => {
  assert.equal(inferFoodCategory("Carotte"), "vegetables");
  assert.equal(inferFoodCategory("Épinards"), "vegetables");
  assert.equal(inferFoodCategory("Chou-fleur"), "vegetables");
  assert.equal(inferFoodCategory("Banane"), "fruits");
  assert.equal(inferFoodCategory("Compote de pomme"), "fruits");
  assert.equal(inferFoodCategory("Poulet"), "proteins");
  assert.equal(inferFoodCategory("Jambon"), "proteins");
  assert.equal(inferFoodCategory("Riz"), "grains");
  assert.equal(inferFoodCategory("Flocons d'avoine"), "grains");
  assert.equal(inferFoodCategory("Yaourt nature"), "dairy");
  assert.equal(inferFoodCategory("Fromage blanc"), "dairy");
});

test("accents and apostrophes do not matter", () => {
  assert.equal(inferFoodCategory("Pêche"), "fruits");
  assert.equal(inferFoodCategory("Peche"), "fruits");
  assert.equal(inferFoodCategory("PÊCHE"), "fruits");
  assert.equal(inferFoodCategory("Céréales"), "grains");
  assert.equal(inferFoodCategory("L'œuf"), "proteins");
  assert.deepEqual(inferAllergens("Œuf brouillé"), ["egg"]);
});

test("longer French phrases beat contained words", () => {
  // "pomme de terre" (vegetable) must beat "pomme" (fruit)
  assert.equal(inferFoodCategory("Pomme de terre"), "vegetables");
  assert.equal(inferFoodCategory("Purée de pommes de terre"), "vegetables");
  // "patate douce" stays a vegetable
  assert.equal(inferFoodCategory("Patate douce"), "vegetables");
  // "noix de coco" (fruit) must beat "noix" (protein/nut)
  assert.equal(inferFoodCategory("Noix de coco"), "fruits");
});

test("English allergen inference is unchanged", () => {
  assert.deepEqual(inferAllergens("Peanut Butter"), ["peanut"]);
  assert.deepEqual(inferAllergens("Butter"), ["milk"]);
  assert.deepEqual(inferAllergens("Salmon"), ["fish"]);
  assert.deepEqual(inferAllergens("Hummus"), ["sesame"]);
});

test("French names infer allergens", () => {
  assert.deepEqual(inferAllergens("Cacahuète"), ["peanut"]);
  assert.deepEqual(inferAllergens("Œuf"), ["egg"]);
  assert.deepEqual(inferAllergens("Yaourt"), ["milk"]);
  assert.deepEqual(inferAllergens("Pain"), ["wheat"]);
  assert.deepEqual(inferAllergens("Saumon"), ["fish"]);
  assert.deepEqual(inferAllergens("Crevettes"), ["shellfish"]);
  assert.deepEqual(inferAllergens("Sésame"), ["sesame"]);
  assert.deepEqual(inferAllergens("Noisette"), ["tree_nuts"]);
  assert.deepEqual(inferAllergens("Tofu"), ["soy"]);
});

test("French plant butters are not dairy", () => {
  assert.deepEqual(inferAllergens("Beurre de cacahuète"), ["peanut"]);
  assert.deepEqual(inferAllergens("Beurre d'amande"), ["tree_nuts"]);
  assert.deepEqual(inferAllergens("Beurre de cajou"), ["tree_nuts"]);
  // plain butter remains dairy
  assert.deepEqual(inferAllergens("Beurre"), ["milk"]);
});

test("coconut is not a tree nut", () => {
  assert.deepEqual(inferAllergens("Noix de coco"), []);
  // but plain "noix" (walnut) still is
  assert.deepEqual(inferAllergens("Noix"), ["tree_nuts"]);
});
