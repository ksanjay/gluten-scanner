import { useState, useCallback } from "react";
import type { UserPreferences } from "../types";

const STORAGE_KEY = "gluten-scanner-prefs";

const DEFAULT_PREFS: UserPreferences = {
  hasCompletedOnboarding: false,
  preferredFoods: [],
  likedItems: [],
};

function load(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function save(prefs: UserPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(load);

  const updatePrefs = useCallback((updates: Partial<UserPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...updates };
      save(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(
    (preferredFoods: string[]) => {
      updatePrefs({ hasCompletedOnboarding: true, preferredFoods });
    },
    [updatePrefs]
  );

  const toggleLikedItem = useCallback(
    (itemName: string) => {
      setPrefs((prev) => {
        const liked = prev.likedItems.includes(itemName)
          ? prev.likedItems.filter((n) => n !== itemName)
          : [...prev.likedItems, itemName];
        const next = { ...prev, likedItems: liked };
        save(next);
        return next;
      });
    },
    []
  );

  const addPreferredFood = useCallback(
    (food: string) => {
      const trimmed = food.trim();
      if (!trimmed) return;
      setPrefs((prev) => {
        if (prev.preferredFoods.includes(trimmed)) return prev;
        const next = { ...prev, preferredFoods: [...prev.preferredFoods, trimmed] };
        save(next);
        return next;
      });
    },
    []
  );

  const removePreferredFood = useCallback((food: string) => {
    setPrefs((prev) => {
      const next = { ...prev, preferredFoods: prev.preferredFoods.filter((f) => f !== food) };
      save(next);
      return next;
    });
  }, []);

  /**
   * Returns true if an item name matches any of the user's preferences.
   * Uses simple case-insensitive substring matching.
   */
  const isPreferred = useCallback(
    (itemName: string): boolean => {
      const lower = itemName.toLowerCase();
      return (
        prefs.preferredFoods.some((f) => lower.includes(f.toLowerCase())) ||
        prefs.likedItems.some((l) => lower.includes(l.toLowerCase()) || l.toLowerCase().includes(lower))
      );
    },
    [prefs.preferredFoods, prefs.likedItems]
  );

  return {
    prefs,
    completeOnboarding,
    toggleLikedItem,
    addPreferredFood,
    removePreferredFood,
    isPreferred,
  };
}
