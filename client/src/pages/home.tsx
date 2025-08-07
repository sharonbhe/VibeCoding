import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { IngredientInput } from "@/components/ingredient-input";
import { RecipeGrid } from "@/components/recipe-grid";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Recipe, type RecipeSearchRequest, type RecipeSearchResponse } from "@shared/schema";
import { Utensils } from "lucide-react";

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentSort, setCurrentSort] = useState<string>('match');
  const [resultsPerPage, setResultsPerPage] = useState<number>(9);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: async (searchRequest: RecipeSearchRequest) => {
      const response = await apiRequest('POST', '/api/recipes/search', searchRequest);
      return response.json() as Promise<RecipeSearchResponse>;
    },
    onSuccess: (data) => {
      setRecipes(data.recipes);
      toast({
        title: "Search completed!",
        description: `Found ${data.recipes.length} recipe${data.recipes.length !== 1 ? 's' : ''} matching your ingredients.`,
      });
    },
    onError: (error) => {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for recipes. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add at least one ingredient to search for recipes.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      ingredients,
      sortBy: currentSort as 'match' | 'time' | 'difficulty' | 'rating'
    });
  };

  const handleSortChange = (sortBy: string) => {
    setCurrentSort(sortBy);
    if (recipes.length > 0) {
      searchMutation.mutate({
        ingredients,
        sortBy: sortBy as 'match' | 'time' | 'difficulty' | 'rating'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="text-white h-4 w-4" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Recipe Finder</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it works</Link>
              <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">About</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-orange-50 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              Find Recipes with Your Ingredients
            </h2>
            <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
              Discover delicious recipes with the ingredients you already have!
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Real recipes</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Smart matching</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>No signup needed</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Interface */}
      <section className="-mt-4 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <IngredientInput
            ingredients={ingredients}
            onIngredientsChange={setIngredients}
            onSearch={handleSearch}
            isLoading={searchMutation.isPending}
            resultsPerPage={resultsPerPage}
            onResultsPerPageChange={setResultsPerPage}
          />
        </div>
      </section>

      {/* Results Section */}
      {(recipes.length > 0 || searchMutation.isPending) && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecipeGrid
              recipes={recipes.slice(0, resultsPerPage)}
              userIngredients={ingredients}
              isLoading={searchMutation.isPending}
              onSortChange={handleSortChange}
            />
          </div>
        </section>
      )}

      {/* Stats Section */}
      {!searchMutation.isPending && recipes.length === 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">300+</div>
                <div className="text-gray-600">Authentic Recipes</div>
                <div className="text-sm text-gray-500 mt-2">From international cuisines</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600">Common Ingredients</div>
                <div className="text-sm text-gray-500 mt-2">Smart matching variations</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">5 sec</div>
                <div className="text-gray-600">Average Search Time</div>
                <div className="text-sm text-gray-500 mt-2">Lightning fast results</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Utensils className="text-white h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold">Recipe Finder</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Discover amazing recipes using the ingredients you already have at home. 
                No food waste, just delicious meals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Smart ingredient matching</li>
                <li>Multiple recipe sources</li>
                <li>Mobile-friendly design</li>
                <li>No registration required</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Recipe Finder. Built for home cooks who love fresh ingredients.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
