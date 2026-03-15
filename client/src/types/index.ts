export type GlutenStatus = "safe" | "likely_safe" | "contains_gluten" | "uncertain";
export type Confidence = "high" | "medium" | "low";
export type Category = "appetizer" | "main" | "side" | "dessert" | "drink" | "unknown";

export interface MenuItem {
  name: string;
  category: Category;
  gluten_status: GlutenStatus;
  reason: string;
  confidence: Confidence;
}

export interface AnalyzeResponse {
  restaurant_context: string;
  items: MenuItem[];
  general_notes: string;
}

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  preferredFoods: string[]; // free-text keywords the user typed in onboarding
  likedItems: string[];     // item names saved by tapping the heart on result cards
}
