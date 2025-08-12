import { useState } from "react";
import { RecipeCard } from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Recipe } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface RecipeGridProps {
  recipes: Recipe[];
  userIngredients: string[];
  isLoading?: boolean;
  onSortChange: (sortBy: string) => void;
  totalRecipes?: number;
}

export function RecipeGrid({ recipes, userIngredients, isLoading = false, onSortChange, totalRecipes }: RecipeGridProps) {
  const [displayCount, setDisplayCount] = useState(6);

  const visibleRecipes = recipes.slice(0, displayCount);
  const hasMore = displayCount < recipes.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 6, recipes.length));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Searching for recipes...</h3>
        <p className="text-gray-600">Scanning recipe websites for the best matches</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
        <p className="text-gray-600">Try different ingredients or check your spelling</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Status and Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Showing {visibleRecipes.length} of {totalRecipes || recipes.length} recipe{(totalRecipes || recipes.length) !== 1 ? 's' : ''}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing recipes that match your ingredients
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <Select onValueChange={onSortChange} defaultValue="match">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="time">Prep Time</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleRecipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            userIngredients={userIngredients}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={loadMore}
            variant="outline"
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg"
          >
            Load More Recipes
          </Button>
        </div>
      )}
    </div>
  );
}
