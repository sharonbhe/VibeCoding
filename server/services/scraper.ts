import { type Recipe, type InsertRecipe } from "@shared/schema";
import { storage } from "../storage";

interface ScrapedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions?: string;
  prepTime?: number;
  difficulty?: string;
  rating?: number;
  sourceUrl: string;
  imageUrl?: string;
}

class RecipeScraper {
  private cache: Map<string, ScrapedRecipe[]> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  // Mock recipe data to simulate scraping from popular recipe sites
  private mockRecipes: ScrapedRecipe[] = [
    {
      title: "Mediterranean Zucchini Tomato Gratin",
      description: "A delicious layered gratin featuring fresh zucchini and ripe tomatoes, seasoned with Mediterranean herbs.",
      ingredients: ["zucchini", "tomatoes", "olive oil", "garlic", "herbs", "cheese", "onion"],
      instructions: "1. Slice zucchini and tomatoes. 2. Layer in baking dish. 3. Drizzle with olive oil. 4. Bake at 375°F for 25 minutes.",
      prepTime: 25,
      difficulty: "easy",
      rating: 4.8,
      sourceUrl: "https://example-recipe-site.com/zucchini-gratin",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b"
    },
    {
      title: "Roasted Vegetable Pasta",
      description: "Simple yet flavorful pasta dish with roasted zucchini, cherry tomatoes, and aromatic garlic.",
      ingredients: ["pasta", "zucchini", "cherry tomatoes", "garlic", "olive oil", "basil", "parmesan"],
      instructions: "1. Roast vegetables at 400°F. 2. Cook pasta. 3. Combine with roasted vegetables. 4. Toss with herbs.",
      prepTime: 30,
      difficulty: "easy",
      rating: 4.6,
      sourceUrl: "https://example-recipe-site.com/roasted-vegetable-pasta",
      imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5"
    },
    {
      title: "Classic Tomato Bruschetta",
      description: "Traditional Italian appetizer with fresh diced tomatoes, garlic, and basil on toasted bread.",
      ingredients: ["tomatoes", "garlic", "basil", "olive oil", "bread", "balsamic vinegar"],
      instructions: "1. Dice tomatoes and combine with garlic and basil. 2. Toast bread. 3. Top with tomato mixture.",
      prepTime: 15,
      difficulty: "easy",
      rating: 4.9,
      sourceUrl: "https://example-recipe-site.com/tomato-bruschetta",
      imageUrl: "https://images.unsplash.com/photo-1572441713132-51c75654db73"
    },
    {
      title: "Garden Vegetable Soup",
      description: "Hearty and nutritious soup packed with fresh garden vegetables in a flavorful tomato base.",
      ingredients: ["tomatoes", "zucchini", "carrots", "celery", "onion", "garlic", "vegetable broth", "herbs"],
      instructions: "1. Sauté vegetables. 2. Add broth and simmer. 3. Season with herbs. 4. Serve hot.",
      prepTime: 40,
      difficulty: "medium",
      rating: 4.7,
      sourceUrl: "https://example-recipe-site.com/garden-vegetable-soup",
      imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554"
    },
    {
      title: "Stuffed Zucchini Boats",
      description: "Hollowed zucchini filled with a savory mixture of tomatoes, herbs, and cheese, then baked to perfection.",
      ingredients: ["zucchini", "tomatoes", "garlic", "onion", "cheese", "breadcrumbs", "herbs", "olive oil"],
      instructions: "1. Hollow out zucchini. 2. Prepare filling with tomatoes and herbs. 3. Stuff zucchini and bake.",
      prepTime: 35,
      difficulty: "medium",
      rating: 4.8,
      sourceUrl: "https://example-recipe-site.com/stuffed-zucchini",
      imageUrl: "https://images.unsplash.com/photo-1604909052743-94e838986d24"
    },
    {
      title: "Grilled Vegetable Salad",
      description: "Fresh and healthy salad featuring grilled zucchini and cherry tomatoes with a light vinaigrette.",
      ingredients: ["zucchini", "cherry tomatoes", "olive oil", "balsamic vinegar", "mixed greens", "feta cheese"],
      instructions: "1. Grill zucchini and tomatoes. 2. Prepare vinaigrette. 3. Combine with greens and cheese.",
      prepTime: 20,
      difficulty: "easy",
      rating: 4.5,
      sourceUrl: "https://example-recipe-site.com/grilled-vegetable-salad",
      imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
    },
    {
      title: "Tomato Garlic Chicken",
      description: "Juicy chicken breast cooked with fresh tomatoes, garlic, and herbs in olive oil.",
      ingredients: ["chicken breast", "tomatoes", "garlic", "olive oil", "herbs", "onion", "wine"],
      instructions: "1. Season chicken. 2. Sear in olive oil. 3. Add tomatoes and garlic. 4. Simmer until tender.",
      prepTime: 45,
      difficulty: "medium",
      rating: 4.7,
      sourceUrl: "https://example-recipe-site.com/tomato-garlic-chicken",
      imageUrl: "https://images.unsplash.com/photo-1598515213692-d4eb536b5917"
    },
    {
      title: "Zucchini Fritters",
      description: "Crispy golden fritters made with grated zucchini, herbs, and a touch of garlic.",
      ingredients: ["zucchini", "flour", "eggs", "garlic", "herbs", "olive oil", "parmesan"],
      instructions: "1. Grate and drain zucchini. 2. Mix with flour, eggs, and herbs. 3. Fry until golden.",
      prepTime: 25,
      difficulty: "easy",
      rating: 4.6,
      sourceUrl: "https://example-recipe-site.com/zucchini-fritters",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32"
    }
  ];

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private calculateMatchPercentage(userIngredients: string[], recipeIngredients: string[]): number {
    const normalizedUserIngredients = userIngredients.map(ing => ing.toLowerCase().trim());
    const normalizedRecipeIngredients = recipeIngredients.map(ing => ing.toLowerCase().trim());
    
    let matchCount = 0;
    for (const userIng of normalizedUserIngredients) {
      if (normalizedRecipeIngredients.some(recipeIng => 
        recipeIng.includes(userIng) || userIng.includes(recipeIng)
      )) {
        matchCount++;
      }
    }
    
    return Math.round((matchCount / normalizedUserIngredients.length) * 100);
  }

  async scrapeRecipes(ingredients: string[]): Promise<Recipe[]> {
    const cacheKey = ingredients.sort().join(',');
    
    // Check cache first
    if (this.isCacheValid(cacheKey) && this.cache.has(cacheKey)) {
      const cachedRecipes = this.cache.get(cacheKey)!;
      return this.convertToRecipes(cachedRecipes, ingredients);
    }

    try {
      // In a real implementation, this would scrape multiple recipe sites
      // For now, we'll filter our mock data based on ingredients
      const filteredRecipes = this.mockRecipes.filter(recipe => {
        const normalizedIngredients = ingredients.map(ing => ing.toLowerCase().trim());
        const normalizedRecipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase().trim());
        
        return normalizedIngredients.some(userIng =>
          normalizedRecipeIngredients.some(recipeIng =>
            recipeIng.includes(userIng) || userIng.includes(recipeIng)
          )
        );
      });

      // Cache the results
      this.cache.set(cacheKey, filteredRecipes);
      this.cacheTimestamps.set(cacheKey, Date.now());

      return this.convertToRecipes(filteredRecipes, ingredients);
    } catch (error) {
      console.error('Error scraping recipes:', error);
      throw new Error('Failed to scrape recipes from external sources');
    }
  }

  private async convertToRecipes(scrapedRecipes: ScrapedRecipe[], userIngredients: string[]): Promise<Recipe[]> {
    const recipes: Recipe[] = [];

    for (const scraped of scrapedRecipes) {
      const matchPercentage = this.calculateMatchPercentage(userIngredients, scraped.ingredients);
      
      const insertRecipe: InsertRecipe = {
        title: scraped.title,
        description: scraped.description,
        ingredients: scraped.ingredients,
        instructions: scraped.instructions,
        prepTime: scraped.prepTime,
        difficulty: scraped.difficulty,
        rating: scraped.rating,
        sourceUrl: scraped.sourceUrl,
        imageUrl: scraped.imageUrl,
        matchPercentage
      };

      try {
        const recipe = await storage.createRecipe(insertRecipe);
        recipes.push(recipe);
      } catch (error) {
        console.error('Error storing recipe:', error);
      }
    }

    return recipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }
}

export const recipeScraper = new RecipeScraper();
