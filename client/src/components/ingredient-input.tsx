import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface IngredientInputProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function IngredientInput({ 
  ingredients, 
  onIngredientsChange, 
  onSearch, 
  isLoading = false 
}: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addIngredient();
    }
  };

  const addIngredient = () => {
    const newIngredient = inputValue.trim().toLowerCase();
    if (newIngredient && !ingredients.includes(newIngredient)) {
      onIngredientsChange([...ingredients, newIngredient]);
      setInputValue("");
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    onIngredientsChange(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="mb-6">
        <label htmlFor="ingredient-input" className="block text-sm font-medium text-gray-700 mb-3">
          What ingredients do you have?
        </label>
        <div className="relative">
          <Input
            id="ingredient-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type an ingredient and press Enter (e.g., tomatoes, zucchini, chicken)"
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {ingredients.map((ingredient) => (
            <Badge 
              key={ingredient} 
              variant="secondary"
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20"
            >
              <span className="capitalize">{ingredient}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(ingredient)}
                className="ml-2 h-4 w-4 p-0 text-primary hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Button 
        onClick={onSearch}
        disabled={ingredients.length === 0 || isLoading}
        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <Search className="h-4 w-4" />
        <span>{isLoading ? 'Searching...' : 'Find Recipes'}</span>
      </Button>
    </div>
  );
}
