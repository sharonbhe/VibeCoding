import { Utensils, ArrowLeft, Search, Filter, Star, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
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
            <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Search</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Recipe Finder Works</h2>
          <p className="text-lg text-gray-600">
            Discover amazing recipes using ingredients you already have at home
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Enter Ingredients</h3>
            <p className="text-gray-600">
              Type the ingredients you have available and press Enter to add each one to your list.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Smart Matching</h3>
            <p className="text-gray-600">
              Our system searches recipe databases and calculates match percentages based on your ingredients.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Browse Results</h3>
            <p className="text-gray-600">
              Sort recipes by match percentage, prep time, difficulty, or rating to find your perfect dish.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Cook & Enjoy</h3>
            <p className="text-gray-600">
              Click "View Recipe" to get complete cooking instructions from trusted recipe sources.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Smart Ingredient Matching</h4>
              <p className="text-gray-600 mb-4">
                Our algorithm understands ingredient variations (tomatoes vs tomato, zucchini vs courgette) 
                and finds recipes that use what you have.
              </p>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Multiple Sorting Options</h4>
              <p className="text-gray-600 mb-4">
                Sort results by:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Best Match - recipes using most of your ingredients</li>
                <li>Prep Time - fastest recipes first</li>
                <li>Difficulty - easiest recipes first</li>
                <li>Rating - highest rated recipes first</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Real Recipe Data</h4>
              <p className="text-gray-600 mb-4">
                All recipes come from TheMealDB, a comprehensive database of real recipes with 
                authentic ingredients and cooking instructions.
              </p>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Visual Match Indicators</h4>
              <p className="text-gray-600 mb-4">
                Each recipe shows:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Match percentage with color coding</li>
                <li>Your ingredients highlighted in green</li>
                <li>Prep time and difficulty level</li>
                <li>Star ratings from the community</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-primary/5 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pro Tips</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🥘 For Best Results</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Use common ingredient names (chicken, not chicken breast)</li>
                <li>• Add 3-5 ingredients for optimal matching</li>
                <li>• Include both proteins and vegetables</li>
                <li>• Check ingredient spelling</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🍳 Popular Combinations</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Chicken + rice + vegetables</li>
                <li>• Pasta + tomatoes + herbs</li>
                <li>• Beef + potatoes + onions</li>
                <li>• Fish + lemon + herbs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}