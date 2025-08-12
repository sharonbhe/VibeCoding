import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recipeScraper } from "./services/scraper";
import { z } from "zod";
import { type RecipeSearchRequest, type RecipeSearchResponse, insertUserPreferencesSchema, DEFAULT_POPULAR_INGREDIENTS } from "@shared/schema";

const searchRequestSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1),
  sortBy: z.enum(['match', 'time', 'difficulty', 'rating']).optional().default('match'),
  cuisine: z.string().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Search for recipes based on ingredients
  app.post("/api/recipes/search", async (req, res) => {
    try {
      const { ingredients, sortBy, cuisine } = searchRequestSchema.parse(req.body);
      
      // Scrape recipes from external sources
      const scrapedRecipes = await recipeScraper.scrapeRecipes(ingredients);
      
      // Filter by cuisine if specified
      let filteredRecipes = scrapedRecipes;
      if (cuisine && cuisine !== 'all') {
        console.log(`🔍 Filtering ${scrapedRecipes.length} recipes for cuisine: ${cuisine}`);
        console.log('Available cuisines in recipes:', [...new Set(scrapedRecipes.map(r => r.cuisine))]);
        
        filteredRecipes = scrapedRecipes.filter(recipe => 
          recipe.cuisine?.toLowerCase() === cuisine.toLowerCase()
        );
        
        console.log(`🍽️ Filtered from ${scrapedRecipes.length} to ${filteredRecipes.length} recipes for cuisine: ${cuisine}`);
      }
      
      // Sort recipes based on the requested criteria
      let sortedRecipes = [...filteredRecipes];
      switch (sortBy) {
        case 'match':
          sortedRecipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
          break;
        case 'time':
          sortedRecipes.sort((a, b) => (a.prepTime || 999) - (b.prepTime || 999));
          break;
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          sortedRecipes.sort((a, b) => {
            const aScore = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 999;
            const bScore = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 999;
            return aScore - bScore;
          });
          break;
        case 'rating':
          sortedRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
      }
      
      // Save search for analytics
      try {
        await storage.createSearch({
          ingredients,
          results: sortedRecipes.map(r => r.id)
        });
      } catch (error) {
        console.error('Failed to save search:', error);
      }
      
      const response: RecipeSearchResponse = {
        recipes: sortedRecipes,
        total: sortedRecipes.length
      };
      
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: error.errors 
        });
      }
      
      console.error('Recipe search error:', error);
      res.status(500).json({ 
        message: "Failed to search for recipes. Please try again later." 
      });
    }
  });

  // Get recipe by ID
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Get recipe error:', error);
      res.status(500).json({ message: "Failed to retrieve recipe" });
    }
  });

  // Get recent searches for analytics/history
  app.get("/api/searches", async (req, res) => {
    try {
      const searches = await storage.getRecentSearches(10);
      res.json(searches);
    } catch (error) {
      console.error('Get searches error:', error);
      res.status(500).json({ message: "Failed to retrieve search history" });
    }
  });

  // Get user preferences for popular ingredients
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences("default");
      
      if (!preferences) {
        // Return default preferences if none exist
        return res.json({
          popularIngredients: DEFAULT_POPULAR_INGREDIENTS
        });
      }
      
      res.json({
        popularIngredients: preferences.popularIngredients
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: "Failed to retrieve preferences" });
    }
  });

  // Update user preferences for popular ingredients
  app.post("/api/preferences", async (req, res) => {
    try {
      const validatedData = insertUserPreferencesSchema.parse(req.body);
      
      // Ensure we have exactly 12 ingredients
      if (validatedData.popularIngredients && validatedData.popularIngredients.length !== 12) {
        return res.status(400).json({ 
          message: "Popular ingredients must contain exactly 12 items" 
        });
      }
      
      const preferences = await storage.updateUserPreferences({
        userId: "default",
        popularIngredients: validatedData.popularIngredients || DEFAULT_POPULAR_INGREDIENTS
      });
      
      res.json({
        popularIngredients: preferences.popularIngredients
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: error.errors 
        });
      }
      
      console.error('Update preferences error:', error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
