import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  instructions: text("instructions"),
  prepTime: integer("prep_time"), // in minutes
  isTimeEstimated: integer("is_time_estimated", { mode: 'boolean' }).default(true), // true if time is estimated, false if from recipe
  difficulty: text("difficulty"), // easy, medium, hard
  cuisine: text("cuisine"), // cuisine type like 'italian', 'chinese', 'mexican', etc.
  rating: real("rating"),
  sourceUrl: text("source_url").notNull(),
  imageUrl: text("image_url"),
  matchPercentage: real("match_percentage"), // calculated based on user ingredients
});

export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  results: json("results").$type<string[]>().notNull(), // recipe IDs
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").default("default"), // Single user for now
  popularIngredients: json("popular_ingredients").$type<string[]>().notNull().default(sql`'[]'::json`),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Frontend-specific types
export type RecipeSearchRequest = {
  ingredients: string[];
  sortBy?: 'match' | 'time' | 'difficulty' | 'rating';
  cuisine?: string;
};

export type RecipeSearchResponse = {
  recipes: Recipe[];
  total: number;
};

// Default popular ingredients - 12 most common in cooking
export const DEFAULT_POPULAR_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'eggs', 'cheese', 'tomatoes',
  'onions', 'garlic', 'potatoes', 'rice', 'pasta', 'olive oil'
];

// Extended list of all available ingredients
export const ALL_AVAILABLE_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'bacon',
  'eggs', 'cheese', 'milk', 'butter', 'yogurt', 'cream',
  'tomatoes', 'onions', 'garlic', 'potatoes', 'carrots', 'bell peppers',
  'zucchini', 'broccoli', 'spinach', 'mushrooms', 'corn', 'peas', 'lettuce', 'cucumber',
  'rice', 'pasta', 'noodles', 'bread', 'flour', 'quinoa', 'oats', 'barley',
  'olive oil', 'vegetable oil', 'coconut oil', 'vinegar', 'soy sauce', 'salt', 'pepper',
  'herbs', 'basil', 'parsley', 'cilantro', 'oregano', 'thyme', 'rosemary',
  'beans', 'lentils', 'chickpeas', 'tofu', 'nuts', 'seeds',
  'lemon', 'lime', 'apple', 'banana', 'ginger', 'chili', 'avocado'
];

// Available cuisine types
export const CUISINE_TYPES = [
  'all', 'italian', 'chinese', 'mexican', 'indian', 'thai', 'french', 'japanese', 
  'mediterranean', 'american', 'greek', 'spanish', 'korean', 'middle eastern', 
  'german', 'british', 'vietnamese', 'moroccan'
];
