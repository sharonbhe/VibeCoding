import { type Recipe, type InsertRecipe } from "@shared/schema";
import { storage } from "../storage";

interface ScrapedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions?: string;
  prepTime?: number;
  isTimeEstimated?: boolean;
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
    console.log('🔍 Scraping recipes for ingredients:', ingredients);
    const cacheKey = ingredients.sort().join(',');
    
    // Skip cache for now to force fresh data
    // if (this.isCacheValid(cacheKey) && this.cache.has(cacheKey)) {
    //   const cachedRecipes = this.cache.get(cacheKey)!;
    //   return this.convertToRecipes(cachedRecipes, ingredients);
    // }

    try {
      // Try to fetch real recipes from TheMealDB API
      const realRecipes = await this.fetchFromMealDB(ingredients);
      console.log('📡 Fetched', realRecipes.length, 'real recipes from API');
      
      if (realRecipes.length > 0) {
        // Cache the results
        this.cache.set(cacheKey, realRecipes);
        this.cacheTimestamps.set(cacheKey, Date.now());
        return this.convertToRecipes(realRecipes, ingredients);
      }
      
      // Fallback to mock data if API doesn't return results
      console.log('⚠️ Falling back to mock data');
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
    const processedRecipeIds = new Set<string>();
    
    // Search for recipes using each ingredient with variations
    for (const ingredient of ingredients) {
      const searchTerms = this.getIngredientVariations(ingredient);
      
      for (const searchTerm of searchTerms) {
        try {
          console.log(`🔍 Searching API for: ${searchTerm}`);
          const response = await fetch(`${this.MEAL_DB_API}/filter.php?i=${encodeURIComponent(searchTerm)}`);
          const data = await response.json();
          
          if (data.meals) {
            console.log(`📡 Found ${data.meals.length} meals for ${searchTerm}`);
            // Get detailed info for each meal
            for (const meal of data.meals.slice(0, 8)) { // Limit to 8 per search term
              if (!processedRecipeIds.has(meal.idMeal)) {
                processedRecipeIds.add(meal.idMeal);
                
                try {
                  const detailResponse = await fetch(`${this.MEAL_DB_API}/lookup.php?i=${meal.idMeal}`);
                  const detailData = await detailResponse.json();
                  
                  if (detailData.meals && detailData.meals[0]) {
                    const mealDetail = detailData.meals[0];
                    const scrapedRecipe = this.convertMealDBToScraped(mealDetail);
                    allRecipes.push(scrapedRecipe);
                  }
                } catch (detailError) {
                  console.error('Error fetching meal details:', detailError);
                }
              }
            }
          } else {
            console.log(`❌ No meals found for ${searchTerm}`);
          }
        } catch (error) {
          console.error(`Error fetching recipes for ingredient ${searchTerm}:`, error);
        }
      }
    }
    
    console.log(`🍽️ Total unique recipes found: ${allRecipes.length}`);
    return allRecipes;
  }

  private getIngredientVariations(ingredient: string): string[] {
    const normalized = ingredient.toLowerCase().trim();
    const variations = [normalized];
    
    // Handle common ingredient variations
    const ingredientMap: { [key: string]: string[] } = {
      'tomatoes': ['tomato', 'tomatoes'],
      'tomato': ['tomato', 'tomatoes'],
      'zucchini': ['zucchini', 'courgette'],
      'zucchinis': ['zucchini', 'courgette'],
      'onions': ['onion', 'onions'],
      'onion': ['onion', 'onions'],
      'potatoes': ['potato', 'potatoes'],
      'potato': ['potato', 'potatoes'],
      'carrots': ['carrot', 'carrots'],
      'carrot': ['carrot', 'carrots'],
      'peppers': ['pepper', 'peppers', 'bell pepper'],
      'pepper': ['pepper', 'peppers', 'bell pepper'],
      'chicken': ['chicken', 'chicken breast'],
      'beef': ['beef', 'ground beef'],
      'pork': ['pork', 'pork chops'],
    };
    
    if (ingredientMap[normalized]) {
      return ingredientMap[normalized];
    }
    
    // Add singular/plural variations
    if (normalized.endsWith('s') && normalized.length > 3) {
      variations.push(normalized.slice(0, -1)); // Remove 's'
    } else {
      variations.push(normalized + 's'); // Add 's'
    }
    
    return Array.from(new Set(variations)); // Remove duplicates
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
    
    // Extract time information and determine if it's estimated
    const timeInfo = this.extractTimeFromInstructions(instructions);
    
    // Determine difficulty based on ingredient count and instruction complexity
    const difficulty = this.estimateDifficulty(ingredients.length, instructions);

    return {
      title: meal.strMeal,
      description: `${meal.strArea || 'International'} ${meal.strCategory || 'dish'}`,
      ingredients,
      instructions,
      prepTime: timeInfo.minutes,
      isTimeEstimated: timeInfo.isEstimated,
      difficulty,
      rating: Math.random() * 1.5 + 3.5, // Random rating between 3.5 and 5
      sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
      imageUrl: meal.strMealThumb
    };
  }

  private extractTimeFromInstructions(instructions: string): { minutes: number; isEstimated: boolean } {
    const instructionsLower = instructions.toLowerCase();
    
    // Look for explicit total time statements first (most accurate)
    const totalTimePatterns = [
      /ready\s+in\s+(\d+)\s*(?:hours?|hrs?)\s*(?:and\s+)?(\d+)?\s*(?:minutes?|mins?)/i,
      /total[^.]*?(\d+)\s*(?:hours?|hrs?)\s*(?:and\s+)?(\d+)?\s*(?:minutes?|mins?)/i,
      /total[^.]*?(\d+)\s*(?:minutes?|mins?)/i,
      /total[^.]*?(\d+)\s*(?:hours?|hrs?)/i,
      /(?:takes|requires|needs)[^.]*?(\d+)\s*(?:hours?|hrs?)\s*(?:and\s+)?(\d+)?\s*(?:minutes?|mins?)/i,
      /(\d+)\s*(?:hours?|hrs?)\s*(?:and\s+)?(\d+)?\s*(?:minutes?|mins?)[^.]*?(?:total|altogether|in total)/i
    ];
    
    for (const pattern of totalTimePatterns) {
      const match = instructionsLower.match(pattern);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const totalMinutes = hours * 60 + minutes;
        
        if (totalMinutes > 0) {
          console.log(`Found explicit total time: ${hours}h ${minutes}m = ${totalMinutes} minutes`);
          return { minutes: Math.min(totalMinutes, 300), isEstimated: false }; // Cap at 5 hours
        }
      }
    }
    
    // Look for individual time mentions and sum them up
    const timeMatches = instructionsLower.match(/(?:at least )?(\d+)\s*(?:hours?|hrs?|minutes?|mins?)/g);
    if (timeMatches && timeMatches.length > 0) {
      let totalMinutes = 0;
      let explicitTimes: string[] = [];
      
      timeMatches.forEach(match => {
        const timeValue = parseInt(match.match(/\d+/)?.[0] || '0');
        if (match.includes('hour') || match.includes('hr')) {
          totalMinutes += timeValue * 60;
          explicitTimes.push(`${timeValue}h`);
        } else if (match.includes('minute') || match.includes('min')) {
          totalMinutes += timeValue;
          explicitTimes.push(`${timeValue}m`);
        }
      });
      
      if (explicitTimes.length > 0 && totalMinutes > 0) {
        console.log(`Found individual times: ${explicitTimes.join(', ')} = ${totalMinutes} minutes total`);
        return { minutes: Math.min(totalMinutes, 300), isEstimated: false };
      }
    }
    
    // Fallback to estimation - ensure it's marked as estimated
    const estimatedTime = this.estimatePrepTime(instructions);
    console.log(`Using estimated time: ${estimatedTime} minutes`);
    return { minutes: estimatedTime, isEstimated: true };
  }

  private estimatePrepTime(instructions: string): number {
    const instructionsLower = instructions.toLowerCase();
    const length = instructions.length;
    const steps = instructions.split(/[.!]/).filter(step => step.trim().length > 10).length;
    
    // Enhanced estimation based on cooking methods and complexity
    let baseTime = 20;
    
    // Adjust for cooking methods that take longer
    if (instructionsLower.includes('marinate')) baseTime += 30;
    if (instructionsLower.includes('chill') || instructionsLower.includes('refrigerate')) baseTime += 60;
    if (instructionsLower.includes('slow cook') || instructionsLower.includes('braise')) baseTime += 90;
    if (instructionsLower.includes('roast') || instructionsLower.includes('bake')) baseTime += 25;
    if (instructionsLower.includes('fry') || instructionsLower.includes('deep')) baseTime += 15;
    if (instructionsLower.includes('simmer')) baseTime += 20;
    if (instructionsLower.includes('steam')) baseTime += 10;
    
    // Adjust for dish complexity
    const complexWords = ['fold', 'whisk', 'reduce', 'caramelize', 'julienne', 'brunoise', 'tempura', 'karaage'];
    const complexityBonus = complexWords.filter(word => instructionsLower.includes(word)).length * 10;
    
    // Factor in instruction length and number of steps
    const lengthFactor = Math.min(length / 10, 30); // 1 minute per 10 chars, max 30 minutes
    const stepFactor = steps * 5; // 5 minutes per step
    
    const totalTime = baseTime + complexityBonus + lengthFactor + stepFactor;
    return Math.min(Math.max(totalTime, 15), 180); // Between 15 minutes and 3 hours
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
        isTimeEstimated: scraped.isTimeEstimated,
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
