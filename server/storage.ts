import { type Recipe, type InsertRecipe, type Search, type InsertSearch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Recipe methods
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipesByIds(ids: string[]): Promise<Recipe[]>;
  searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipeMatchPercentage(id: string, matchPercentage: number): Promise<void>;

  // Search methods
  createSearch(search: InsertSearch): Promise<Search>;
  getRecentSearches(limit?: number): Promise<Search[]>;
}

export class MemStorage implements IStorage {
  private recipes: Map<string, Recipe>;
  private searches: Map<string, Search>;

  constructor() {
    this.recipes = new Map();
    this.searches = new Map();
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipesByIds(ids: string[]): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    for (const id of ids) {
      const recipe = this.recipes.get(id);
      if (recipe) {
        recipes.push(recipe);
      }
    }
    return recipes;
  }

  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const normalizedIngredients = ingredients.map(ing => ing.toLowerCase().trim());
    
    return Array.from(this.recipes.values()).filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase().trim());
      return normalizedIngredients.some(userIng => 
        recipeIngredients.some(recipeIng => 
          recipeIng.includes(userIng) || userIng.includes(recipeIng)
        )
      );
    });
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { 
      id,
      title: insertRecipe.title,
      description: insertRecipe.description || null,
      ingredients: insertRecipe.ingredients,
      instructions: insertRecipe.instructions || null,
      prepTime: insertRecipe.prepTime || null,
      difficulty: insertRecipe.difficulty || null,
      rating: insertRecipe.rating || null,
      sourceUrl: insertRecipe.sourceUrl,
      imageUrl: insertRecipe.imageUrl || null,
      matchPercentage: insertRecipe.matchPercentage || 0
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipeMatchPercentage(id: string, matchPercentage: number): Promise<void> {
    const recipe = this.recipes.get(id);
    if (recipe) {
      recipe.matchPercentage = matchPercentage;
      this.recipes.set(id, recipe);
    }
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const search: Search = {
      id,
      ingredients: insertSearch.ingredients,
      results: insertSearch.results,
      createdAt: new Date().toISOString(),
    };
    this.searches.set(id, search);
    return search;
  }

  async getRecentSearches(limit: number = 10): Promise<Search[]> {
    return Array.from(this.searches.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
