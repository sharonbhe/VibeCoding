import { type Recipe, type InsertRecipe, type Search, type InsertSearch, type UserPreferences, type InsertUserPreferences } from "@shared/schema";
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

  // User preference methods
  getUserPreferences(userId?: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private recipes: Map<string, Recipe>;
  private searches: Map<string, Search>;
  private userPreferences: Map<string, UserPreferences>;

  constructor() {
    this.recipes = new Map();
    this.searches = new Map();
    this.userPreferences = new Map();
    console.log('🗄️ Initialized fresh storage');
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
      ingredients: Array.isArray(insertRecipe.ingredients) ? insertRecipe.ingredients : [],
      instructions: insertRecipe.instructions || null,
      prepTime: insertRecipe.prepTime || null,
      isTimeEstimated: insertRecipe.isTimeEstimated ?? true,
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
      ingredients: Array.isArray(insertSearch.ingredients) ? insertSearch.ingredients : [],
      results: Array.isArray(insertSearch.results) ? insertSearch.results : [],
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

  async getUserPreferences(userId: string = "default"): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async updateUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const userId = preferences.userId || "default";
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    
    const userPrefs: UserPreferences = {
      id,
      userId,
      popularIngredients: preferences.popularIngredients || [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    this.userPreferences.set(userId, userPrefs);
    return userPrefs;
  }
}

export const storage = new MemStorage();
