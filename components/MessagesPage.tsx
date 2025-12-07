import React from 'react';
import { Recipe, Comment } from '../types';
import { MessageCircle, ChefHat, ArrowLeft, Lightbulb, Trash2 } from 'lucide-react';

interface MessagesPageProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  dailyTip: string;
  onDeleteComment: (recipeId: string, commentId: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ recipes, onRecipeClick, dailyTip, onDeleteComment }) => {
  // Filter recipes that have comments from "שפי 👨‍🍳"
  const recipesWithShefiComments = recipes.filter(recipe => 
    recipe.comments?.some(c => c.user.includes('שפי'))
  );

  // Flatten to get specific threads
  const threads = recipesWithShefiComments.flatMap(recipe => {
    const shefiComments = recipe.comments.filter(c => c.user.includes('שפי'));
    return shefiComments.map(shefiComment => {
      // Find the user comment immediately preceding Shefi's comment (heuristic)
      // Since comments are chronological, we look for the last user comment before this one
      const commentIndex = recipe.comments.indexOf(shefiComment);
      const userComment = recipe.comments
        .slice(0, commentIndex)
        .reverse()
        .find(c => !c.user.includes('שפי'));

      return {
        recipe,
        shefiComment,
        userComment
      };
    });
  }).sort((a, b) => b.shefiComment.date - a.shefiComment.date);

  const handleDelete = (e: React.MouseEvent, recipeId: string, commentId: string) => {
    e.stopPropagation();
    onDeleteComment(recipeId, commentId);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-teal-100 rounded-full text-teal-600 mb-4">
          <MessageCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">ההודעות שלי</h2>
        <p className="text-slate-500 mt-2">תשובות וטיפים משפי</p>
      </div>

      {/* Daily Tip Section */}
      {dailyTip && (
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-amber-100 shadow-md relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
           <div className="flex items-start gap-4 relative z-10">
              <div className="bg-white p-3 rounded-full shadow-sm text-amber-500">
                 <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-amber-800 mb-1">הטיפ היומי של שפי</h3>
                 <p className="text-amber-900/80 font-medium leading-relaxed italic">
                   "{dailyTip}"
                 </p>
              </div>
           </div>
        </div>
      )}

      {threads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <MessageCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">אין הודעות חדשות</h3>
          <p className="text-slate-400">כששפי יענה לך על מתכון, זה יופיע כאן.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map((thread, index) => (
            <div 
              key={`${thread.recipe.id}-${thread.shefiComment.id}-${index}`}
              onClick={() => onRecipeClick(thread.recipe)}
              className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-50 cursor-pointer hover:border-teal-200 transition-all group relative"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-teal-600 transition-colors">
                  {thread.recipe.title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {new Date(thread.shefiComment.date).toLocaleDateString()}
                    </span>
                    <button 
                        onClick={(e) => handleDelete(e, thread.recipe.id, thread.shefiComment.id)}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="מחק הודעה"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>

              {thread.userComment && (
                <div className="mb-4 pl-4 border-r-2 border-slate-200 mr-1">
                  <p className="text-xs text-slate-400 font-bold mb-1">את/ה:</p>
                  <p className="text-slate-600 text-sm italic">"{thread.userComment.text}"</p>
                </div>
              )}

              <div className="bg-teal-50 p-4 rounded-2xl rounded-tr-none relative">
                 <div className="absolute -top-3 -right-2 bg-white rounded-full p-1 shadow-sm">
                   <ChefHat className="w-5 h-5 text-teal-600" />
                 </div>
                 <p className="text-teal-900 text-sm font-medium leading-relaxed">
                   {thread.shefiComment.text}
                 </p>
              </div>

              <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-teal-500 flex items-center group-hover:translate-x-[-4px] transition-transform">
                  עבור למתכון <ArrowLeft size={14} className="mr-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};