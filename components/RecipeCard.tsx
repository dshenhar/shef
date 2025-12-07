import React from 'react';
import { Recipe } from '../types';
import { Clock, Heart, Star, Flame, ChevronLeft } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, onToggleFavorite }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-300 border border-slate-50 group h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        <button 
          onClick={(e) => onToggleFavorite(recipe.id, e)}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${recipe.isFavorite ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' : 'bg-white/30 text-white hover:bg-white hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
          {recipe.matchScore}% התאמה
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">{recipe.title}</h3>
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg">#{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-3">
             <div className="flex items-center"><Clock className="w-4 h-4 mr-1 text-teal-500" /> {recipe.prepTime}</div>
             <div className="flex items-center"><Flame className="w-4 h-4 mr-1 text-orange-500" /> {recipe.difficulty}</div>
          </div>
          <div className="bg-teal-50 text-teal-600 p-2 rounded-full group-hover:bg-teal-500 group-hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};