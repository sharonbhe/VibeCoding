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

  // TheMealDB API base URL
  private readonly MEAL_DB_API = "https://www.themealdb.com/api/json/v1/1";

  // Backup mock recipes in case API fails
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
      // Try to fetch real recipes from TheMealDB API
      const realRecipes = await this.fetchFromMealDB(ingredients);
      
      if (realRecipes.length > 0) {
        // Cache the results
        this.cache.set(cacheKey, realRecipes);
        this.cacheTimestamps.set(cacheKey, Date.now());
        return this.convertToRecipes(realRecipes, ingredients);
      }
      
      // Fallback to mock data if API doesn't return results
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

  private async fetchFromMealDB(ingredients: string[]): Promise<ScrapedRecipe[]> {
    const allRecipes: ScrapedRecipe[] = [];
    
    // Search for recipes using each ingredient
    for (const ingredient of ingredients) {
      try {
        const response = await fetch(`${this.MEAL_DB_API}/filter.php?i=${encodeURIComponent(ingredient)}`);
        const data = await response.json();
        
        if (data.meals) {
          // Get detailed info for each meal
          for (const meal of data.meals.slice(0, 10)) { // Limit to 10 per ingredient
            try {
              const detailResponse = await fetch(`${this.MEAL_DB_API}/lookup.php?i=${meal.idMeal}`);
              const detailData = await detailResponse.json();
              
              if (detailData.meals && detailData.meals[0]) {
                const mealDetail = detailData.meals[0];
                const scrapedRecipe = this.convertMealDBToScraped(mealDetail);
                
                // Avoid duplicates
                if (!allRecipes.find(r => r.sourceUrl === scrapedRecipe.sourceUrl)) {
                  allRecipes.push(scrapedRecipe);
                }
              }
            } catch (detailError) {
              console.error('Error fetching meal details:', detailError);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching recipes for ingredient ${ingredient}:`, error);
      }
    }
    
    return allRecipes;
  }

  private convertMealDBToScraped(meal: any): ScrapedRecipe {
    // Extract ingredients from the MealDB format
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.trim());
      }
    }

    // Extract instructions
    const instructions = meal.strInstructions || '';
    
    // Estimate prep time based on instruction length and complexity
    const prepTime = this.estimatePrepTime(instructions);
    
    // Determine difficulty based on ingredient count and instruction complexity
    const difficulty = this.estimateDifficulty(ingredients.length, instructions);

    return {
      title: meal.strMeal,
      description: `${meal.strArea || 'International'} ${meal.strCategory || 'dish'}`,
      ingredients,
      instructions,
      prepTime,
      difficulty,
      rating: Math.random() * 1.5 + 3.5, // Random rating between 3.5 and 5
      sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
      imageUrl: meal.strMealThumb
    };
  }

  private estimatePrepTime(instructions: string): number {
    const length = instructions.length;
    const steps = instructions.split('.').length;
    
    // Basic estimation based on complexity
    if (length < 200) return 15;
    if (length < 400) return 25;
    if (length < 600) return 35;
    return Math.min(60, 30 + steps * 2);
  }

  private estimateDifficulty(ingredientCount: number, instructions: string): string {
    const complexWords = ['fold', 'whisk', 'reduce', 'caramelize', 'julienne', 'brunoise'];
    const hasComplexTechniques = complexWords.some(word => 
      instructions.toLowerCase().includes(word)
    );
    
    if (ingredientCount <= 5 && !hasComplexTechniques) return 'easy';
    if (ingredientCount <= 8 && !hasComplexTechniques) return 'medium';
    return 'hard';
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
