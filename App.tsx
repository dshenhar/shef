import React, { useState, useEffect } from 'react';
import { IngredientInput } from './components/IngredientInput';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { Chatbot } from './components/Chatbot';
import { MessagesPage } from './components/MessagesPage';
import { ConverterPage } from './components/ConverterPage';
import { generateRecipes, generateDailyTip } from './services/geminiService';
import { Recipe, RecipePreferences, ViewState, Comment } from './types';
import { ChefHat, Search, Heart, Loader2, Crown, Home, Info, BookHeart, Bell, ArrowRightLeft } from 'lucide-react';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  // We store full recipe objects for favorites to persist them across searches
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [preferences, setPreferences] = useState<RecipePreferences>({});
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification and Tip State
  const [dailyTip, setDailyTip] = useState<string>('');
  const [hasNotification, setHasNotification] = useState<boolean>(false);

  // Fetch Daily Tip on Mount
  useEffect(() => {
    const fetchTip = async () => {
      const tip = await generateDailyTip();
      setDailyTip(tip);
      // Trigger notification when tip arrives
      setHasNotification(true);
    };
    fetchTip();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setRecipes([]);
    try {
      const results = await generateRecipes(ingredients, preferences);
      // Mark recipes as favorite if they are already in savedRecipes
      const resultsWithFavorites = results.map(r => {
        const isSaved = savedRecipes.some(saved => saved.title === r.title); // Matching by title/id
        return isSaved ? { ...r, isFavorite: true, id: savedRecipes.find(s => s.title === r.title)!.id } : r;
      });
      setRecipes(resultsWithFavorites);
    } catch (error) {
      console.error(error);
      alert("מצטערים, שפי נתקל בבעיה. נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('RECIPE_DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // If we came from favorites, go back to favorites, otherwise home
    if (view === 'RECIPE_DETAIL' && !recipes.find(r => r.id === selectedRecipe?.id) && savedRecipes.find(r => r.id === selectedRecipe?.id)) {
        setView('FAVORITES');
    } else {
        setView('HOME');
    }
    setSelectedRecipe(null);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if it's currently in saved recipes
    const isAlreadySaved = savedRecipes.some(r => r.id === id);
    let newSavedRecipes = [...savedRecipes];

    if (isAlreadySaved) {
      newSavedRecipes = newSavedRecipes.filter(r => r.id !== id);
    } else {
      // Find the recipe in current search results or selected recipe
      const recipeToAdd = recipes.find(r => r.id === id) || (selectedRecipe?.id === id ? selectedRecipe : null);
      if (recipeToAdd) {
        newSavedRecipes.push({ ...recipeToAdd, isFavorite: true });
      }
    }

    setSavedRecipes(newSavedRecipes);

    // Update current view state
    const updateRecipeState = (r: Recipe) => r.id === id ? { ...r, isFavorite: !isAlreadySaved } : r;
    setRecipes(prev => prev.map(updateRecipeState));
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(prev => prev ? { ...prev, isFavorite: !isAlreadySaved } : null);
    }
  };

  const handleUpdateRecipe = (updated: Recipe) => {
    setSelectedRecipe(updated);
    setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    // Also update in favorites if it exists there
    setSavedRecipes(prev => prev.map(r => r.id === updated.id ? { ...updated, isFavorite: true } : r));
  };

  const handleAddComment = (recipeId: string, text: string, user: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      user,
      text,
      date: Date.now()
    };

    const addCommentToRecipe = (r: Recipe) => {
      if (r.id === recipeId) {
        return { ...r, comments: [...(r.comments || []), newComment] };
      }
      return r;
    };

    setRecipes(prev => prev.map(addCommentToRecipe));
    setSavedRecipes(prev => prev.map(addCommentToRecipe));
    
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
    }

    // If Shefi responds, trigger notification
    if (user.includes('שפי') && view !== 'MESSAGES') {
      setHasNotification(true);
    }
  };

  const handleDeleteComment = (recipeId: string, commentId: string) => {
    const removeCommentFromRecipe = (r: Recipe) => {
        if (r.id === recipeId) {
            return { ...r, comments: r.comments?.filter(c => c.id !== commentId) || [] };
        }
        return r;
    };

    setRecipes(prev => prev.map(removeCommentFromRecipe));
    setSavedRecipes(prev => prev.map(removeCommentFromRecipe));

    if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe(prev => prev ? { ...prev, comments: prev.comments?.filter(c => c.id !== commentId) || [] } : null);
    }
  };

  const handleMessagesClick = () => {
    setView('MESSAGES');
    setSelectedRecipe(null);
    setHasNotification(false); // Clear notification
  };

  // Combine saved and current recipes for messages view to ensure we see all interactions
  const allRecipesForMessages = [...savedRecipes, ...recipes.filter(r => !savedRecipes.some(saved => saved.id === r.id))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 pb-24 font-rubik text-slate-800">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-30 border-b border-teal-100 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div 
          onClick={() => { setView('HOME'); setSelectedRecipe(null); }} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
           <div className="bg-gradient-to-tr from-teal-500 to-cyan-500 text-white p-1.5 rounded-lg shadow-md">
              <ChefHat size={20} />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight hidden md:block">שפי</h1>
        </div>
        
        <div className="flex gap-1 md:gap-3 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => { setView('HOME'); setSelectedRecipe(null); }}
             className={`p-2 rounded-full transition ${view === 'HOME' ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-50'}`}
             title="בית"
           >
             <Home size={20} />
           </button>
           <button 
             onClick={() => { setView('FAVORITES'); setSelectedRecipe(null); }}
             className={`p-2 rounded-full transition ${view === 'FAVORITES' ? 'bg-red-50 text-red-500' : 'text-slate-500 hover:bg-slate-50'}`}
             title="המועדפים שלי"
           >
             <Heart size={20} className={view === 'FAVORITES' ? 'fill-current' : ''} />
           </button>
           <button 
             onClick={handleMessagesClick}
             className={`p-2 rounded-full transition relative ${view === 'MESSAGES' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
             title="הודעות"
           >
             <Bell size={20} />
             {hasNotification && (
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
             )}
           </button>
           <button 
             onClick={() => { setView('CONVERTER'); setSelectedRecipe(null); }}
             className={`p-2 rounded-full transition ${view === 'CONVERTER' ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}
             title="המרת מידות"
           >
             <ArrowRightLeft size={20} />
           </button>
           <button 
             onClick={() => setView('ABOUT')}
             className={`p-2 rounded-full transition ${view === 'ABOUT' ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}
             title="אודות"
           >
             <Info size={20} />
           </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 max-w-5xl pt-24">
        
        {view === 'HOME' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-10 pt-4">
              <h1 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 animate-gradient-text drop-shadow-sm p-1">
                ברוכים הבאים לשפי
              </h1>
              <h2 className="text-2xl font-bold text-slate-700 mb-3">מה נבשל היום?</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                הזינו מצרכים, בחרו סגנון, ושפי ירכיב לכם ארוחה מושלמת.
              </p>
             </div>

            <IngredientInput 
              ingredients={ingredients} 
              setIngredients={setIngredients} 
              preferences={preferences} 
              setPreferences={setPreferences} 
              onSearch={handleSearch} 
              isLoading={isLoading}
            />

            <div id="results">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-24 h-24">
                     <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                     <ChefHat className="absolute inset-0 m-auto text-teal-500 w-8 h-8 animate-pulse" />
                  </div>
                  <p className="mt-6 text-slate-400 font-medium animate-pulse">שפי מבשל לך רעיונות...</p>
                </div>
              )}

              {!isLoading && recipes.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                   {recipes.map(recipe => (
                     <RecipeCard 
                       key={recipe.id} 
                       recipe={{...recipe, isFavorite: savedRecipes.some(r => r.id === recipe.id)}} 
                       onClick={handleRecipeClick} 
                       onToggleFavorite={handleToggleFavorite}
                     />
                   ))}
                 </div>
              )}
              
              {!isLoading && recipes.length === 0 && ingredients.length > 0 && (
                <div className="text-center py-12 opacity-50">
                  <div className="w-16 h-16 bg-white/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Search className="text-slate-400" />
                  </div>
                  <p>המתכונים יופיעו כאן</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'FAVORITES' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-10">
               <div className="inline-block p-4 bg-red-100 rounded-full text-red-500 mb-4">
                 <BookHeart size={40} />
               </div>
               <h2 className="text-3xl font-black text-slate-800">ספר המתכונים שלי</h2>
               <p className="text-slate-500 mt-2">כל המנות שאהבת במקום אחד</p>
             </div>

             {savedRecipes.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                 <p className="text-lg text-slate-400 mb-4">עדיין לא שמרת מתכונים.</p>
                 <button onClick={() => setView('HOME')} className="text-teal-600 font-bold hover:underline">חזור לחיפוש</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {savedRecipes.map(recipe => (
                   <RecipeCard 
                     key={recipe.id} 
                     recipe={{...recipe, isFavorite: true}} 
                     onClick={handleRecipeClick} 
                     onToggleFavorite={handleToggleFavorite}
                   />
                 ))}
               </div>
             )}
           </div>
        )}

        {view === 'MESSAGES' && (
          <MessagesPage 
            recipes={allRecipesForMessages} 
            onRecipeClick={handleRecipeClick}
            dailyTip={dailyTip} 
            onDeleteComment={handleDeleteComment}
          />
        )}

        {view === 'CONVERTER' && (
          <ConverterPage />
        )}

        {view === 'RECIPE_DETAIL' && selectedRecipe && (
          <RecipeDetail 
            recipe={{...selectedRecipe, isFavorite: savedRecipes.some(r => r.id === selectedRecipe.id)}} 
            onBack={handleBack} 
            onUpdateRecipe={handleUpdateRecipe}
            onAddComment={handleAddComment}
            onToggleFavorite={handleToggleFavorite}
            onDeleteComment={handleDeleteComment}
          />
        )}

        {view === 'ABOUT' && (
           <div className="max-w-2xl mx-auto py-12 text-center animate-in zoom-in duration-300">
              <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-teal-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-50 to-transparent"></div>
                <div className="relative z-10">
                   <div className="inline-block p-4 bg-yellow-100 rounded-full text-yellow-500 mb-6 shadow-lg rotate-12">
                     <Crown size={48} fill="currentColor" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 mb-4">המלכות של שפי</h2>
                   <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                     האפליקציה נוצרה על ידי...
                   </p>
                   
                   <div className="flex flex-col gap-4 text-2xl font-bold text-teal-700 bg-teal-50 p-8 rounded-3xl">
                      <div className="flex items-center justify-center gap-2"><Crown className="w-5 h-5 text-yellow-500" /> רוני <Crown className="w-5 h-5 text-yellow-500" /></div>
                      <div className="w-12 h-0.5 bg-teal-200 mx-auto"></div>
                      <div className="flex items-center justify-center gap-2"><Crown className="w-5 h-5 text-yellow-500" /> גפן <Crown className="w-5 h-5 text-yellow-500" /></div>
                      <div className="w-12 h-0.5 bg-teal-200 mx-auto"></div>
                      <div className="flex items-center justify-center gap-2"><Crown className="w-5 h-5 text-yellow-500" /> קמה <Crown className="w-5 h-5 text-yellow-500" /></div>
                   </div>

                   <p className="mt-8 text-slate-400 text-sm">
                     שפי - בשלו ותהנו ❤️
                   </p>
                </div>
              </div>
           </div>
        )}

      </main>

      <Chatbot />
    </div>
  );
};

export default App;