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
  difficulty: text("difficulty"), // easy, medium, hard
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

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

// Frontend-specific types
export type RecipeSearchRequest = {
  ingredients: string[];
  sortBy?: 'match' | 'time' | 'difficulty' | 'rating';
};

export type RecipeSearchResponse = {
  recipes: Recipe[];
  total: number;
};
