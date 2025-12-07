export interface Comment {
  id: string;
  user: string;
  text: string;
  date: number;
}

export interface Ingredient {
  name: string;
  amount?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'קל' | 'בינוני' | 'קשה';
  matchScore: number;
  calories?: number;
  tags: string[];
  mealSize: 'ארוחה קטנה' | 'ארוחה גדולה' | 'נשנוש';
  healthTag: 'בריא' | 'מפנק' | 'מאוזן';
  kidFriendly: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  imagePromptEn: string;
  imageUrl?: string;
  videoUri?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string; // New field for direct link
  isFavorite?: boolean;
  comments: Comment[];
}

export interface RecipePreferences {
  difficulty?: 'קל' | 'בינוני' | 'קשה';
  mealSize?: 'ארוחה קטנה' | 'ארוחה גדולה' | 'נשנוש';
  isVegetarian?: boolean;
  isVegan?: boolean;
  kidFriendly?: boolean;
  isHealthy?: boolean;
  // New Filters
  dietary?: 'בשרי' | 'חלבי' | 'פרווה';
  cuisine?: 'איטלקי' | 'אסייתי' | 'ישראלי' | 'מרוקאי' | 'צרפתי' | 'מקסיקני' | 'אחר';
  customCuisine?: string; // For "Other" cuisine input
  method?: 'אפייה' | 'בישול' | 'טיגון' | 'ללא בישול';
  courseType?: 'ראשונה' | 'עיקרית' | 'קינוח';
  customRefinement?: string; // For general "Other" preferences
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewState = 'HOME' | 'RECIPE_DETAIL' | 'FAVORITES' | 'ABOUT' | 'MESSAGES' | 'CONVERTER';