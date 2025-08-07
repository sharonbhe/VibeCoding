import { Utensils, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function About() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Recipe Finder</h2>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Recipe Finder helps you discover delicious recipes using the ingredients you already have at home. 
              No more food waste, no more wondering "what can I make with this?"
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 mb-6">
              We believe cooking should be creative, sustainable, and accessible. By helping you find recipes 
              that match your available ingredients, we reduce food waste and inspire home cooking.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <p className="text-gray-600">Enter the ingredients you have available at home</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <p className="text-gray-600">Our system searches real recipe databases to find matching dishes</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <p className="text-gray-600">Browse recipes sorted by ingredient match, prep time, or difficulty</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <p className="text-gray-600">Click through to complete recipes with full instructions</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>Smart ingredient matching with variations and alternatives</li>
              <li>Real recipes from trusted cooking databases</li>
              <li>Multiple sorting options (match percentage, time, difficulty, rating)</li>
              <li>Mobile-friendly responsive design</li>
              <li>No API keys or registration required</li>
              <li>Fast search with caching for better performance</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recipe Sources</h3>
            <p className="text-gray-600">
              We source recipes from TheMealDB, a community-driven database of recipes from around the world. 
              All recipes link back to their original sources, giving credit to the recipe creators and 
              providing you with complete cooking instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}