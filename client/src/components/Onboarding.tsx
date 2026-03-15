import { useState, useRef } from "react";

interface Props {
  onComplete: (preferredFoods: string[]) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [foods, setFoods] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addFood() {
    const trimmed = input.trim();
    if (!trimmed || foods.includes(trimmed)) {
      setInput("");
      return;
    }
    setFoods((prev) => [...prev, trimmed]);
    setInput("");
    inputRef.current?.focus();
  }

  function removeFood(food: string) {
    setFoods((prev) => prev.filter((f) => f !== food));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addFood();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 pt-12 pb-8">
        <div className="text-4xl mb-3">🌾</div>
        <h1 className="text-2xl font-bold">Welcome to GlutenScan</h1>
        <p className="mt-2 text-green-100 text-sm leading-relaxed">
          Scan any restaurant menu and instantly find gluten-free items safe for celiac disease.
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-8 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Any foods you love?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Optional — we'll highlight these first in your results.
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. salmon, grilled chicken…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={addFood}
            className="bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium active:bg-green-700"
          >
            Add
          </button>
        </div>

        {/* Tags */}
        {foods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {foods.map((food) => (
              <span
                key={food}
                className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-1.5 rounded-full"
              >
                {food}
                <button
                  onClick={() => removeFood(food)}
                  className="ml-1 text-green-500 hover:text-green-700 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-safe">
          <button
            onClick={() => onComplete(foods)}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-base active:bg-green-700"
          >
            Get Started
          </button>
          {foods.length === 0 && (
            <button
              onClick={() => onComplete([])}
              className="w-full text-gray-400 py-2 text-sm"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
