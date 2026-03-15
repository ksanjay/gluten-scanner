import { useState } from "react";
import type { UserPreferences } from "../types";

interface Props {
  prefs: UserPreferences;
  onAddPreferredFood: (food: string) => void;
  onRemovePreferredFood: (food: string) => void;
  onToggleLikedItem: (item: string) => void;
  onBack: () => void;
}

export function Settings({
  prefs,
  onAddPreferredFood,
  onRemovePreferredFood,
  onToggleLikedItem,
  onBack,
}: Props) {
  const [input, setInput] = useState("");

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAddPreferredFood(trimmed);
    setInput("");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 pt-safe-top pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1 active:opacity-70" aria-label="Back">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Preferences</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        {/* Preferred foods */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-1">Preferred Foods</h2>
          <p className="text-xs text-gray-500 mb-3">
            These keywords are used to highlight matching items at the top of your results.
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a food preference…"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium active:bg-green-700"
            >
              Add
            </button>
          </div>

          {prefs.preferredFoods.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No preferences saved yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prefs.preferredFoods.map((food) => (
                <span
                  key={food}
                  className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-1.5 rounded-full"
                >
                  {food}
                  <button
                    onClick={() => onRemovePreferredFood(food)}
                    className="ml-1 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Liked items */}
        {prefs.likedItems.length > 0 && (
          <section>
            <h2 className="font-semibold text-gray-800 mb-1">Liked Items ❤️</h2>
            <p className="text-xs text-gray-500 mb-3">
              Items you've hearted from past scans. These also count as preferences.
            </p>
            <div className="space-y-2">
              {prefs.likedItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
                >
                  <span className="text-sm text-gray-700">{item}</span>
                  <button
                    onClick={() => onToggleLikedItem(item)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
