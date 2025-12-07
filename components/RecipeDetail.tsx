import React, { useState } from 'react';
import { Recipe } from '../types';
import { ArrowRight, Clock, Flame, Users, Leaf, Loader2, Youtube, Check, ExternalLink, MessageCircle, Send, Heart, ChefHat, Trash2 } from 'lucide-react';
import { findYoutubeVideoForRecipe, regenerateRecipeWithoutIngredients, generateCommentResponse } from '../services/geminiService';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onUpdateRecipe: (updated: Recipe) => void;
  onAddComment: (recipeId: string, text: string, user: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteComment: (recipeId: string, commentId: string) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onUpdateRecipe, onAddComment, onToggleFavorite, onDeleteComment }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [missingIng, setMissingIng] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  
  // Comment state
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState('');
  const [isShefiTyping, setIsShefiTyping] = useState(false);

  const handleToggleIngredient = (ing: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ing)) newChecked.delete(ing);
    else newChecked.add(ing);
    setCheckedIngredients(newChecked);
  };

  const handleFindVideo = async () => {
    if (recipe.youtubeUrl || recipe.videoUri) return;
    setLoadingVideo(true);
    try {
      let youtubeUrl = await findYoutubeVideoForRecipe(recipe.title);
      
      // Fallback: If no specific video found, create a YouTube search URL
      if (!youtubeUrl) {
        youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' מתכון')}`;
      }

      onUpdateRecipe({ ...recipe, youtubeUrl: youtubeUrl });
      
    } catch (e) {
      console.error(e);
      // Fallback on error: YouTube search URL
      const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' מתכון')}`;
      onUpdateRecipe({ ...recipe, youtubeUrl: fallbackUrl });
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleRegenerate = async () => {
    if (!missingIng.trim()) return;
    setRegenerating(true);
    try {
      const newRecipe = await regenerateRecipeWithoutIngredients(recipe, missingIng);
      onUpdateRecipe(newRecipe);
      setMissingIng('');
      alert("המתכון עודכן בהצלחה!");
    } catch (e) {
      alert("שגיאה בעדכון המתכון");
    } finally {
      setRegenerating(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !userName.trim()) return;
    
    // 1. Add User Comment
    const currentText = commentText;
    const currentUser = userName;
    onAddComment(recipe.id, currentText, currentUser);
    setCommentText('');
    setUserName('');

    // 2. Trigger Shefi Response
    setIsShefiTyping(true);
    try {
        const shefiResponse = await generateCommentResponse(recipe.title, currentText, currentUser);
        onAddComment(recipe.id, shefiResponse, "שפי 👨‍🍳");
    } catch (e) {
        console.error("Failed to get Shefi response");
    } finally {
        setIsShefiTyping(false);
    }
  };

  // Helper to extract YouTube Video ID
  const getYoutubeId = (url: string | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(recipe.youtubeUrl);

  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 overflow-hidden">
             <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition"><ArrowRight className="w-6 h-6 text-slate-700" /></button>
             <h2 className="text-lg font-bold text-slate-800 truncate">{recipe.title}</h2>
        </div>
        <button 
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            className={`p-2 rounded-full transition-all duration-300 ${recipe.isFavorite ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-400'}`}
            title={recipe.isFavorite ? "הסר ממועדפים" : "הוסף למועדפים"}
        >
            <Heart className={`w-6 h-6 ${recipe.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-80 md:h-[500px] group">
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {/* Heart Button on Image */}
            <button 
               onClick={(e) => onToggleFavorite(recipe.id, e)}
               className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all duration-300 z-20 ${recipe.isFavorite ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' : 'bg-white/30 text-white hover:bg-white hover:text-red-500'}`}
             >
               <Heart className={`w-6 h-6 ${recipe.isFavorite ? 'fill-current' : ''}`} />
             </button>

            <div className="absolute bottom-6 left-6 right-6 text-white">
               <div className="flex gap-2 mb-3">
                 {recipe.isVegetarian && <span className="bg-green-500/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center"><Leaf className="w-3 h-3 mr-1" /> צמחוני</span>}
                 <span className="bg-orange-500/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">{recipe.healthTag}</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black mb-2">{recipe.title}</h1>
               <p className="text-white/90 text-sm md:text-base">{recipe.description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-teal-50 p-4 rounded-2xl text-center">
                <Clock className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500 font-bold">זמן הכנה</div>
                <div className="font-bold text-slate-800">{recipe.prepTime}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl text-center">
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-xs text-slate-500 font-bold">קושי</div>
                <div className="font-bold text-slate-800">{recipe.difficulty}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-xs text-slate-500 font-bold">גודל</div>
                <div className="font-bold text-slate-800">{recipe.mealSize}</div>
              </div>
            </div>

            {/* Video Link Section */}
            {videoId ? (
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 aspect-video w-full relative bg-black">
                 <iframe 
                   className="absolute inset-0 w-full h-full"
                   src={`https://www.youtube.com/embed/${videoId}`} 
                   title={recipe.title}
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 />
              </div>
            ) : (
              <div className="bg-slate-900 rounded-3xl p-8 relative flex flex-col items-center justify-center shadow-xl text-center overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-3xl opacity-20 rounded-full"></div>
                 <Youtube className="w-12 h-12 text-red-500 mb-4 relative z-10" />
                 <h3 className="text-white font-bold text-xl mb-2 relative z-10">רוצה לראות איך מכינים?</h3>
                 <p className="text-slate-400 text-sm mb-6 relative z-10">מצאנו עבורך מדריך וידאו ב-YouTube</p>
                 
                 {recipe.youtubeUrl ? (
                   <a 
                     href={recipe.youtubeUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="relative z-10 bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-900/50 animate-in zoom-in duration-300 group"
                   >
                     לחץ לצפייה ב-YouTube <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </a>
                 ) : (
                   <button 
                     onClick={handleFindVideo} 
                     disabled={loadingVideo}
                     className="relative z-10 bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-teal-400 hover:text-white transition flex items-center gap-2"
                   >
                     {loadingVideo ? 'מחפש סרטון...' : 'מצא לי סרטון הדרכה'} {loadingVideo && <Loader2 className="w-4 h-4 animate-spin" />}
                   </button>
                 )}
              </div>
            )}

            {/* Missing Ingredients Tool */}
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
              <h4 className="font-bold text-amber-800 mb-2 text-sm">חסר לך משהו?</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={missingIng}
                  onChange={(e) => setMissingIng(e.target.value)}
                  placeholder="למשל: אין לי ביצים..." 
                  className="flex-1 bg-white border-amber-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button 
                  onClick={handleRegenerate}
                  disabled={regenerating || !missingIng}
                  className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50"
                >
                  {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'שנה מתכון'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-50 mb-10">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors ${activeTab === 'ingredients' ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              מצרכים ({recipe.ingredients.length})
            </button>
            <button 
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors ${activeTab === 'instructions' ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-500' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              הוראות הכנה
            </button>
          </div>
          
          <div className="p-6 md:p-8 min-h-[300px]">
            {activeTab === 'ingredients' && (
              <div className="grid md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ing, i) => (
                  <label key={i} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${checkedIngredients.has(ing) ? 'bg-teal-50 border-teal-200 opacity-60' : 'bg-white border-slate-100 hover:border-teal-200'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${checkedIngredients.has(ing) ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>
                      {checkedIngredients.has(ing) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={checkedIngredients.has(ing)}
                      onChange={() => handleToggleIngredient(ing)} 
                    />
                    <span className={`text-slate-700 font-medium ${checkedIngredients.has(ing) ? 'line-through' : ''}`}>{ing}</span>
                  </label>
                ))}
              </div>
            )}
            
            {activeTab === 'instructions' && (
              <div className="space-y-6">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold font-mono">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-50">
           <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <MessageCircle className="w-6 h-6 text-teal-500" />
             תגובות ושאלות ({recipe.comments?.length || 0})
           </h3>

           <div className="space-y-6 mb-8">
             {(!recipe.comments || recipe.comments.length === 0) && (
               <p className="text-slate-400 text-sm text-center py-4">עדיין אין תגובות. היה הראשון להגיב!</p>
             )}
             {recipe.comments?.map((comment) => (
               <div key={comment.id} className={`p-4 rounded-2xl relative group ${comment.user.includes('שפי') ? 'bg-teal-50 border border-teal-100' : 'bg-slate-50'}`}>
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-teal-700 flex items-center gap-1">
                     {comment.user.includes('שפי') && <ChefHat className="w-4 h-4 text-teal-600" />}
                     {comment.user}
                   </span>
                   <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{new Date(comment.date).toLocaleDateString()}</span>
                        <button 
                            onClick={() => onDeleteComment(recipe.id, comment.id)}
                            className="text-slate-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                            title="מחק תגובה"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                   </div>
                 </div>
                 <p className="text-slate-700 text-sm">{comment.text}</p>
               </div>
             ))}
             {isShefiTyping && (
                 <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
                     <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                     <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                     <span className="mr-2">שפי מקליד...</span>
                 </div>
             )}
           </div>

           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <h4 className="font-bold text-sm text-slate-700 mb-4">הוסף תגובה</h4>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
               <input 
                 type="text" 
                 placeholder="השם שלך" 
                 value={userName}
                 onChange={(e) => setUserName(e.target.value)}
                 className="md:col-span-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 text-sm"
               />
               <input 
                 type="text" 
                 placeholder="איך יצא? יש לך שאלה?" 
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
                 className="md:col-span-3 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 text-sm"
               />
             </div>
             <button 
               onClick={submitComment}
               disabled={!userName.trim() || !commentText.trim() || isShefiTyping}
               className="bg-teal-500 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-teal-600 disabled:opacity-50 transition flex items-center gap-2"
             >
               שלח תגובה <Send className="w-4 h-4" />
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};