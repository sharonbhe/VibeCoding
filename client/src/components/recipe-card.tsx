import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Star, ExternalLink } from "lucide-react";
import { type Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  userIngredients: string[];
}

export function RecipeCard({ recipe, userIngredients }: RecipeCardProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getMatchTextColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-700";
    if (percentage >= 60) return "text-yellow-700";
    return "text-orange-700";
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  const normalizedUserIngredients = userIngredients.map(ing => ing.toLowerCase().trim());

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {recipe.imageUrl && (
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${getMatchColor(recipe.matchPercentage || 0)} rounded-full`}></div>
            <span className={`text-sm font-medium ${getMatchTextColor(recipe.matchPercentage || 0)}`}>
              {recipe.matchPercentage}% Match
            </span>
          </div>
          {recipe.prepTime && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{recipe.prepTime} min</span>
            </div>
          )}
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {recipe.title}
        </h4>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.ingredients.slice(0, 6).map((ingredient) => {
            const isMatched = normalizedUserIngredients.some(userIng => 
              ingredient.toLowerCase().includes(userIng) || userIng.includes(ingredient.toLowerCase())
            );
            
            return (
              <Badge 
                key={ingredient}
                variant="secondary"
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isMatched 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {ingredient}
              </Badge>
            );
          })}
          {recipe.ingredients.length > 6 && (
            <Badge variant="secondary" className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
              +{recipe.ingredients.length - 6} more
            </Badge>
          )}
        </div>
        
        {recipe.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {recipe.rating && (
            <div className="flex items-center space-x-1">
              <div className="flex">
                {renderStars(recipe.rating)}
              </div>
              <span className="text-sm text-gray-600">{recipe.rating.toFixed(1)}</span>
            </div>
          )}
          <a 
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center space-x-1 transition-colors"
          >
            <span>View Recipe</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
