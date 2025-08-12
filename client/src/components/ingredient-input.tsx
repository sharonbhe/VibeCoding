import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search, Plus, ChefHat } from "lucide-react";

interface IngredientInputProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onSearch: () => void;
  isLoading?: boolean;
  resultsPerPage: number;
  onResultsPerPageChange: (value: number) => void;
}

// Popular ingredients for suggestions
const POPULAR_INGREDIENTS = [
  'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp',
  'pasta', 'rice', 'noodles', 'bread', 'flour',
  'tomatoes', 'onions', 'garlic', 'potatoes', 'carrots', 'bell peppers',
  'zucchini', 'broccoli', 'spinach', 'mushrooms', 'corn', 'peas',
  'cheese', 'milk', 'eggs', 'butter', 'olive oil',
  'lemon', 'lime', 'herbs', 'basil', 'parsley', 'cilantro',
  'beans', 'lentils', 'chickpeas', 'quinoa', 'oats'
];

const QUICK_ADD_SUGGESTIONS = [
  { name: 'chicken', icon: '🐔' },
  { name: 'tomatoes', icon: '🍅' },
  { name: 'onions', icon: '🧅' },
  { name: 'garlic', icon: '🧄' },
  { name: 'pasta', icon: '🍝' },
  { name: 'rice', icon: '🍚' },
  { name: 'cheese', icon: '🧀' },
  { name: 'eggs', icon: '🥚' }
];

export function IngredientInput({ 
  ingredients, 
  onIngredientsChange, 
  onSearch, 
  isLoading = false,
  resultsPerPage,
  onResultsPerPageChange
}: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = POPULAR_INGREDIENTS.filter(ingredient =>
        ingredient.toLowerCase().includes(inputValue.toLowerCase()) &&
        !ingredients.includes(ingredient.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, ingredients]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue.trim());
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addIngredient = (ingredient: string) => {
    const newIngredient = ingredient.toLowerCase();
    if (newIngredient && !ingredients.includes(newIngredient)) {
      onIngredientsChange([...ingredients, newIngredient]);
      setInputValue("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    onIngredientsChange(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <ChefHat className="h-4 w-4 text-primary" />
          </div>
          <label htmlFor="ingredient-input" className="text-lg font-semibold text-gray-900">
            What ingredients do you have?
          </label>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              id="ingredient-input"
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Start typing an ingredient (e.g., chicken, tomatoes, pasta)..."
              className="w-full px-4 py-4 pr-12 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <Button
            onClick={() => inputValue.trim() && addIngredient(inputValue.trim())}
            disabled={!inputValue.trim() || ingredients.includes(inputValue.trim().toLowerCase())}
            className="px-6 py-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </Button>
        </div>
        
        {/* Autocomplete Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 left-0 right-20 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addIngredient(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-xl last:rounded-b-xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span className="capitalize text-gray-900">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Selected Ingredients Display */}
        {ingredients.length > 0 && (
          <div className="mt-3 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-sm font-medium text-gray-700">Your ingredients:</h4>
              <Badge variant="outline" className="text-xs">
                {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {ingredients.map((ingredient) => (
                <Badge 
                  key={ingredient} 
                  variant="secondary"
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors group"
                >
                  <span className="capitalize">{ingredient}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-2 h-5 w-5 p-0 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-2">
          Type and press Enter to add ingredients, or click suggestions below
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Popular ingredients:</h4>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_SUGGESTIONS.map((item) => {
            const isAdded = ingredients.includes(item.name.toLowerCase());
            return (
              <button
                key={item.name}
                onClick={() => addIngredient(item.name)}
                disabled={isAdded}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isAdded 
                    ? 'bg-primary/10 text-primary cursor-default' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span className="capitalize">{item.name}</span>
                {isAdded ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="results-per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Initial shown:
          </label>
          <Select value={resultsPerPage.toString()} onValueChange={(value) => onResultsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-20 py-4 rounded-xl border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={onSearch}
          disabled={ingredients.length === 0 || isLoading}
          className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="h-5 w-5" />
          <span className="text-lg">{isLoading ? 'Searching Recipes...' : 'Find Recipes'}</span>
        </Button>
        
        {ingredients.length > 0 && (
          <Button 
            variant="outline"
            onClick={() => onIngredientsChange([])}
            className="py-4 px-6 rounded-xl border-2 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
