import React, { useState } from 'react';
import { X, Plus, Sparkles, Leaf, Baby, Utensils, Coffee, Flame, Globe, ChefHat, Trash2, Edit3 } from 'lucide-react';
import { RecipePreferences } from '../types';

interface IngredientInputProps {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  preferences: RecipePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<RecipePreferences>>;
  onSearch: () => void;
  isLoading: boolean;
}

const FOOD_EMOJIS = ['🍳', '🥦', '🥑', '🍅', '🥕', '🌽', '🌶️', '🍞', '🧀', '🍗', '🥩', '🥚', '🥔', '🧅', '🧄', '🥗', '🥘', '🍲', '🍝', '🍕', '🥬', '🥒'];

export const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients, preferences, setPreferences, onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [showCustomRefinementInput, setShowCustomRefinementInput] = useState(false);
  
  // Initialize with a random emoji on mount
  const [headerEmoji] = useState(() => FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]);

  const addIngredient = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && trimmedInput.length > 1 && !ingredients.includes(trimmedInput)) {
      setIngredients([...ingredients, trimmedInput]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing: string) => { setIngredients(ingredients.filter(i => i !== ing)); };
  
  const clearAll = () => {
    setIngredients([]);
    setPreferences({});
    setInputValue('');
    setShowCustomRefinementInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addIngredient(); } };
  
  const togglePreference = (key: keyof RecipePreferences, value: any) => { 
    setPreferences(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value })); 
  };
  
  const handleCustomCuisineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, customCuisine: e.target.value }));
  };

  const handleCustomRefinementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, customRefinement: e.target.value }));
  };

  const cuisineTypes = ['איטלקי', 'אסייתי', 'ישראלי', 'מרוקאי', 'מקסיקני', 'אחר'];
  const dietaryTypes = ['חלבי', 'בשרי', 'פרווה'];
  const methods = ['אפייה', 'בישול', 'טיגון'];
  const courseTypes = ['ראשונה', 'עיקרית', 'קינוח'];

  const hasActiveFilters = Object.values(preferences).some(val => val !== undefined && val !== false);
  const showClearButton = ingredients.length > 0 || hasActiveFilters;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-teal-100/50 border border-white relative overflow-hidden group">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition duration-700"></div>
      
      <div className="relative z-10 flex items-center justify-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
           מה יש במקרר היום? <span className="text-3xl animate-bounce duration-1000 delay-1000">{headerEmoji}</span>
        </h2>
        
        {showClearButton && (
          <button 
            onClick={clearAll}
            className="absolute left-0 flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all"
            title="נקה הכל (מצרכים וסינונים)"
          >
            <Trash2 className="w-3 h-3" />
            נקה הכל
          </button>
        )}
      </div>
      
      {/* Ingredient Input */}
      <div className="relative mb-6 z-10">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={addIngredient} placeholder="הקלד מצרך ולחץ אנטר (לדוגמה: עגבניה, בצל...)" className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 text-lg rounded-2xl px-6 py-5 pl-14 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 transition-all placeholder:text-slate-400 shadow-inner" />
        <button onClick={addIngredient} className="absolute left-3 top-3 bottom-3 aspect-square bg-teal-100 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center"><Plus className="w-6 h-6" /></button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8 min-h-[2rem] z-10 relative">
        {ingredients.map((ing) => (
          <div key={ing} className="bg-gradient-to-r from-teal-400 to-teal-500 text-white pl-2 pr-4 py-2 rounded-full flex items-center shadow-lg shadow-teal-500/20 animate-in zoom-in duration-200">
            <span className="font-bold text-sm">{ing}</span>
            <button onClick={() => removeIngredient(ing)} className="mr-2 bg-white/20 hover:bg-white/40 rounded-full p-1 transition"><X className="w-3 h-3" /></button>
          </div>
        ))}
        {ingredients.length === 0 && <span className="text-slate-400 text-sm italic">עדיין לא הוספת מצרכים...</span>}
      </div>

      {/* Filters Section */}
      <div className="mb-8 relative z-10 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <p className="text-slate-500 text-sm font-bold mb-4 flex items-center"><Sparkles className="w-4 h-4 ml-1.5" />דיוקים למתכון:</p>
        
        <div className="space-y-4">
          {/* General Toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => togglePreference('kidFriendly', true)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center transition-all ${preferences.kidFriendly ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}><Baby className="w-3 h-3 ml-1.5" /> לילדים</button>
              <button onClick={() => togglePreference('mealSize', 'ארוחה גדולה')} className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center transition-all ${preferences.mealSize === 'ארוחה גדולה' ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}><Utensils className="w-3 h-3 ml-1.5" /> ארוחה גדולה</button>
              <button onClick={() => togglePreference('isVegetarian', true)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center transition-all ${preferences.isVegetarian ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}><Leaf className="w-3 h-3 ml-1.5" /> צמחוני</button>
              
              {/* "Other" Toggle */}
              <button 
                onClick={() => setShowCustomRefinementInput(!showCustomRefinementInput)} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center transition-all ${showCustomRefinementInput ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <Edit3 className="w-3 h-3 ml-1.5" /> אחר...
              </button>
            </div>

            {/* "Other" Input Field */}
            {showCustomRefinementInput && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" 
                  placeholder="כתוב כאן כל בקשה מיוחדת... (למשל: בלי גלוטן, חריף אש, קריספי)" 
                  value={preferences.customRefinement || ''}
                  onChange={handleCustomRefinementChange}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="h-px bg-slate-200 w-full"></div>

          {/* Course Type */}
           <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold ml-2"><ChefHat className="w-3 h-3 inline" /> סוג מנה:</span>
            {courseTypes.map(type => (
              <button key={type} onClick={() => togglePreference('courseType', type)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${preferences.courseType === type ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-white border-slate-200 text-slate-500'}`}>{type}</button>
            ))}
          </div>

          {/* Dietary Type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold ml-2">כשרות:</span>
            {dietaryTypes.map(type => (
              <button key={type} onClick={() => togglePreference('dietary', type)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${preferences.dietary === type ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-500'}`}>{type}</button>
            ))}
          </div>

          {/* Method */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold ml-2"><Flame className="w-3 h-3 inline" /> הכנה:</span>
            {methods.map(m => (
               <button key={m} onClick={() => togglePreference('method', m)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${preferences.method === m ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-500'}`}>{m}</button>
            ))}
          </div>

          {/* Cuisine */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-xs text-slate-400 font-bold ml-2"><Globe className="w-3 h-3 inline" /> סגנון:</span>
               {cuisineTypes.map(c => (
                  <button key={c} onClick={() => togglePreference('cuisine', c)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${preferences.cuisine === c ? 'bg-teal-100 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}>{c}</button>
               ))}
            </div>
            
            {/* Custom Cuisine Input */}
            {preferences.cuisine === 'אחר' && (
              <div className="mr-14 animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" 
                  placeholder="איזה סגנון? (למשל: תאילנדי, הודי...)" 
                  value={preferences.customCuisine || ''}
                  onChange={handleCustomCuisineChange}
                  className="w-full md:w-1/2 p-2 rounded-lg border border-teal-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={onSearch} disabled={isLoading || ingredients.length === 0} className={`w-full py-5 rounded-2xl text-xl font-black text-white shadow-xl flex items-center justify-center transition-all duration-300 transform relative overflow-hidden group/btn ${isLoading || ingredients.length === 0 ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 hover:shadow-teal-500/40 hover:-translate-y-1'}`}>
        <span className="relative z-10 flex items-center">{isLoading ? 'שפי חושב...' : 'מצא לי מתכון מנצח'}</span>
      </button>
    </div>
  );
};