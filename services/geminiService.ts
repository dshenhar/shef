import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe, RecipePreferences } from "../types";

const recipeSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "שם המתכון בעברית" },
      description: { type: Type.STRING, description: "תיאור קצר ומגרה של המנה" },
      imagePromptEn: { type: Type.STRING, description: "A detailed visual description of the dish in English, suitable for an AI image generator." },
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "רשימת מצרכים כולל כמויות"
      },
      instructions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "שלבי ההכנה צעד אחר צעד"
      },
      prepTime: { type: Type.STRING, description: "זמן הכנה" },
      difficulty: { type: Type.STRING, enum: ["קל", "בינוני", "קשה"] },
      mealSize: { type: Type.STRING, enum: ["ארוחה קטנה", "ארוחה גדולה", "נשנוש"], description: "גודל הארוחה" },
      healthTag: { type: Type.STRING, enum: ["בריא", "מפנק", "מאוזן"], description: "האם זה בריא או מושחת?" },
      kidFriendly: { type: Type.BOOLEAN, description: "האם מתאים לילדים?" },
      isVegan: { type: Type.BOOLEAN, description: "האם המנה טבעונית?" },
      isVegetarian: { type: Type.BOOLEAN, description: "האם המנה צמחונית?" },
      matchScore: { type: Type.INTEGER, description: "ציון התאמה מ-0 עד 100" },
      calories: { type: Type.INTEGER },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "description", "imagePromptEn", "ingredients", "instructions", "prepTime", "difficulty", "mealSize", "healthTag", "kidFriendly", "isVegan", "isVegetarian", "matchScore"]
  }
};

const FALLBACK_RECIPES = [
  {
    title: "חביתת ירק עשירה (מתכון גיבוי)",
    description: "כששפי עמוס, תמיד אפשר לסמוך על חביתה טובה עם כל הירקות שיש במקרר.",
    imagePromptEn: "Delicious vegetable omelet with fresh herbs, israeli breakfast style",
    ingredients: ["ביצים", "בצל", "עשבי תיבול", "מלח", "פלפל", "שמן לטיגון"],
    instructions: ["קוצצים את הבצל והירקות.", "טורפים את הביצים עם התבלינים.", "מטגנים את הבצל עד להזהבה.", "מוסיפים את בלילת הביצים ומטגנים עד למידת העשייה הרצויה."],
    prepTime: "10 דקות",
    difficulty: "קל",
    mealSize: "ארוחה קטנה",
    healthTag: "מאוזן",
    kidFriendly: true,
    isVegan: false,
    isVegetarian: true,
    matchScore: 100,
    tags: ["ארוחת בוקר", "מהיר", "קלאסי"]
  },
  {
    title: "פסטה ברוטב עגבניות (מתכון גיבוי)",
    description: "מנה קלאסית שתמיד עובדת. פשוטה, טעימה ומנחמת.",
    imagePromptEn: "Classic pasta with tomato sauce and fresh basil",
    ingredients: ["פסטה", "רסק עגבניות / עגבניות מרוסקות", "שום", "שמן זית", "בזיליקום"],
    instructions: ["מבשלים את הפסטה לפי הוראות היצרן.", "בסיר נפרד, מטגנים שום בשמן זית.", "מוסיפים את העגבניות והתבלינים ומבשלים כ-10 דקות.", "מערבבים את הרוטב עם הפסטה ומגישים."],
    prepTime: "15 דקות",
    difficulty: "קל",
    mealSize: "ארוחה גדולה",
    healthTag: "מפנק",
    kidFriendly: true,
    isVegan: true,
    isVegetarian: true,
    matchScore: 95,
    tags: ["איטלקי", "ילדים", "צהריים"]
  },
  {
    title: "סלט ירקות קצוץ דק (מתכון גיבוי)",
    description: "הכי ישראלי שיש. סלט בריא, מרענן ומתאים ליד כל ארוחה.",
    imagePromptEn: "Fresh chopped israeli salad with cucumber tomato and onion",
    ingredients: ["מלפפון", "עגבניה", "בצל", "פלפל", "פטרוזיליה", "שמן זית", "לימון"],
    instructions: ["קוצצים את כל הירקות לקוביות קטנות.", "מערבבים בקערה גדולה.", "מתבלים בשמן זית, לימון, מלח ופלפל ממש לפני ההגשה."],
    prepTime: "10 דקות",
    difficulty: "קל",
    mealSize: "נשנוש",
    healthTag: "בריא",
    kidFriendly: true,
    isVegan: true,
    isVegetarian: true,
    matchScore: 90,
    tags: ["בריאות", "סלט", "תוספת"]
  }
];

export const generateRecipes = async (ingredients: string[], preferences: RecipePreferences): Promise<Recipe[]> => {
  if (ingredients.length === 0) return [];
  
  let preferencesPrompt = "";
  
  // Existing Preferences
  if (preferences.difficulty) preferencesPrompt += `- דרגת קושי: ${preferences.difficulty}\n`;
  if (preferences.mealSize) preferencesPrompt += `- גודל ארוחה: ${preferences.mealSize}\n`;
  if (preferences.isVegetarian) preferencesPrompt += `- צמחוני: כן\n`;
  if (preferences.isVegan) preferencesPrompt += `- טבעוני: כן\n`;
  if (preferences.kidFriendly) preferencesPrompt += `- מתאים לילדים: כן\n`;
  if (preferences.isHealthy) preferencesPrompt += `- בריא: כן\n`;
  
  // New Preferences
  if (preferences.dietary) preferencesPrompt += `- כשרות/סוג: ${preferences.dietary}\n`;
  
  // Cuisine handling (standard or custom)
  if (preferences.cuisine) {
    if (preferences.cuisine === 'אחר' && preferences.customCuisine) {
        preferencesPrompt += `- סגנון מטבח: ${preferences.customCuisine}\n`;
    } else if (preferences.cuisine !== 'אחר') {
        preferencesPrompt += `- סגנון מטבח: ${preferences.cuisine}\n`;
    }
  }

  if (preferences.method) preferencesPrompt += `- שיטת הכנה: ${preferences.method}\n`;
  if (preferences.courseType) preferencesPrompt += `- סוג מנה: ${preferences.courseType} (חובה)\n`;

  // General Custom Refinement
  if (preferences.customRefinement) {
    preferencesPrompt += `- הערות ובקשות מיוחדות של המשתמש: ${preferences.customRefinement}\n`;
  }

  const prompt = `אני מחפש 3 מתכונים אמיתיים ומוכרים מהאינטרנט שמבוססים על המצרכים הבאים: ${ingredients.join(", ")}. 
  חשוב מאוד: 
  1. המתכונים חייבים להיות כשרים לחלוטין.
  2. המתכונים חייבים להיות קיימים במציאות (לא מומצאים).
  3. אינך חייב להשתמש בכל המצרכים! תשתמש רק באלו שמתאימים למתכון הגיוני וטעים.
  העדפות המשתמש: ${preferencesPrompt}.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "אתה שף ישראלי מומחה. אתה מספק אך ורק מתכונים אמיתיים, קלאסיים או פופולריים שקיימים ברשת. אל תמציא מנות. הקפד על כשרות מלאה (ללא בשר וחלב, ללא פירות ים וכדומה)."
      }
    });

    const rawRecipes = JSON.parse(response.text || "[]");
    return rawRecipes.map((r: any, index: number) => ({
      ...r,
      id: `gen_${Date.now()}_${index}`,
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(r.imagePromptEn || r.title)}?nologo=true&width=640&height=360&seed=${index}`,
      isFavorite: false,
      comments: []
    }));
  } catch (error: any) {
    // Suppress 429 errors from console to avoid user panic, treat as warning
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429')) {
        console.warn("Gemini Quota Exceeded. Using fallback recipes.");
    } else {
        console.error("Error generating recipes (possibly missing API key or network issue):", error);
    }
    
    // Return fallback recipes instead of throwing
    return FALLBACK_RECIPES.map((r, index) => ({
        ...r,
        id: `fallback_${Date.now()}_${index}`,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(r.imagePromptEn)}?nologo=true&width=640&height=360&seed=${index}`,
        isFavorite: false,
        comments: []
    })) as unknown as Recipe[];
  }
};

export const regenerateRecipeWithoutIngredients = async (originalRecipe: Recipe, missingIngredients: string): Promise<Recipe> => {
  const singleRecipeSchema: Schema = {
    type: Type.OBJECT,
    properties: recipeSchema.items!.properties,
    required: recipeSchema.items!.required
  };

  const prompt = `המשתמש רוצה להכין את המנה האמיתית "${originalRecipe.title}" אבל חסרים לו המצרכים הבאים: "${missingIngredients}". אנא צור גרסה חדשה ומתוקנת של המתכון ללא המצרכים החסרים (מצא תחליפים כשרים או התאם את המתכון). שמור על האותנטיות של המנה ככל האפשר.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleRecipeSchema,
        systemInstruction: "אתה שף יצירתי שמוצא פתרונות למצרכים חסרים. וודא שהמתכון החדש נשאר כשר לחלוטין ומבוסס על ידע קולינרי אמיתי."
      }
    });

    const newRecipeData = JSON.parse(response.text || "{}");
    return {
      ...newRecipeData,
      id: `mod_${Date.now()}`,
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(newRecipeData.imagePromptEn || newRecipeData.title)}?nologo=true&width=640&height=360&seed=${Date.now()}`,
      isFavorite: false,
      comments: originalRecipe.comments
    };
  } catch (error) {
    console.error("Error modifying recipe:", error);
    // Don't crash, just rethrow with a user friendly message
    throw new Error("לא הצלחתי למצוא תחליף כרגע (עומס על המערכת).");
  }
};

export const findYoutubeVideoForRecipe = async (recipeTitle: string): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find a youtube video link that shows how to cook: ${recipeTitle}. Return ONLY the URL.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri && (chunk.web.uri.includes("youtube.com") || chunk.web.uri.includes("youtu.be"))) {
          return chunk.web.uri;
        }
      }
    }
    
    const text = response.text || "";
    const urlMatch = text.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
    if (urlMatch) {
        return urlMatch[0];
    }

    return undefined;
  } catch (error) {
    console.error("Error finding video:", error);
    return undefined;
  }
};

export const generateVideoForRecipe = async (recipeTitle: string, promptEn: string): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic cooking shot of ${promptEn || recipeTitle}, 4k, delicious food photography, slow motion`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return undefined;
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};

export const chatWithShefi = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "קוראים לך שפי (Shefi). אתה עוזר בישול אישי וחברותי מישראל. כל ההמלצות והמתכונים שלך הם כשרים בלבד ומבוססים על ידע קולינרי אמיתי. תפקידך לענות על שאלות בנושאי בישול, המרות מידה, תחליפים למצרכים, וטיפים למטבח. ענה תמיד בעברית, בגובה העיניים, בצורה נעימה ורגועה."
      },
      history: history
    });
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "אופס, אני קצת עייף כרגע (עומס מערכת או בעיית חיבור). אפשר לנסות שוב עוד דקה?";
  }
};

export const generateCommentResponse = async (recipeTitle: string, userComment: string, userName: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `המשתמש בשם "${userName}" הגיב על המתכון "${recipeTitle}": "${userComment}". 
    כתוב תגובה קצרה, חברותית, קצת הומוריסטית ואישית בשם "שפי" (שף וירטואלי). אל תהיה רשמי מדי.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "תודה על התגובה! בתיאבון!";
  } catch (e) {
    console.error(e);
    return "שמח שאהבת! בתיאבון 👨‍🍳";
  }
};

export const generateDailyTip = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `תן לי "טיפ יומי" קצר, כללי ושימושי מאוד למטבח. 
    הטיפ חייב להיות:
    1. כשר לחלוטין (ללא שום אזכור לערבוב בשר וחלב).
    2. כללי (טכניקה, אחסון, ניקיון, או שיפור טעם כללי).
    3. לא מתכון ספציפי.
    תכתוב את זה ישירות, בלי הקדמות. מקסימום 2 משפטים. תהיה חברותי.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "טיפ יומי: קמצוץ מלח בקפה ידגיש את הטעם ויוריד מרירות!";
  } catch (e) {
    // If quota exceeded (429) or other error, fallback to a pre-defined list
    const fallbackTips = [
      "טיפ יומי: סכין חדה היא הסכין הבטוחה ביותר במטבח!",
      "טיפ יומי: כדי להוציא יותר מיץ מלימון, גלגלו אותו על השיש לפני הסחיטה.",
      "טיפ יומי: הוסיפו קצת שמן למים של הפסטה רק אחרי שהם רתחו.",
      "טיפ יומי: כדי למנוע דמעות בצל, קררו אותו במקרר לפני החיתוך.",
      "טיפ יומי: רוצים ביצה קשה מושלמת? שימו במים קרים והביאו לרתיחה.",
      "טיפ יומי: שמרו את התבלינים במקום חשוך וקריר לשמירה על הטעם.",
      "טיפ יומי: ניקוי קרש חיתוך עם לימון ומלח גס מעלים ריחות לא נעימים.",
      "טיפ יומי: טבילת עשבי תיבול במים קרים מאוד תחזיר להם את הרעננות.",
      "טיפ יומי: כשמטגנים, אל תעמיסו על המחבת כדי שהאוכל יקבל צריבה יפה.",
      "טיפ יומי: קמצוץ מלח בקפה ידגיש את הטעם ויוריד מרירות!"
    ];
    return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
  }
};
