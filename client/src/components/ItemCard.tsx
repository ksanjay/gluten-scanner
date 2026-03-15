import { useState } from "react";
import type { MenuItem } from "../types";

interface Props {
  item: MenuItem;
  isLiked: boolean;
  isPreferred: boolean;
  onToggleLike: (name: string) => void;
}

const STATUS_CONFIG = {
  safe: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800",
    icon: "✅",
    label: "Safe",
  },
  likely_safe: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
    icon: "⚠️",
    label: "Likely Safe",
  },
  contains_gluten: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    icon: "❌",
    label: "Contains Gluten",
  },
  uncertain: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-700",
    icon: "❓",
    label: "Uncertain",
  },
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ItemCard({ item, isLiked, isPreferred, onToggleLike }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[item.gluten_status];

  return (
    <div className={`rounded-2xl border ${cfg.bg} ${cfg.border} overflow-hidden`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer active:opacity-80"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xl shrink-0">{cfg.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{item.name}</span>
            {isPreferred && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                ❤️ Your pick
              </span>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Heart button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(item.name);
            }}
            className="p-1.5 rounded-full active:scale-90 transition-transform"
            aria-label={isLiked ? "Remove from favourites" : "Add to favourites"}
          >
            {isLiked ? "❤️" : "🤍"}
          </button>

          {/* Expand chevron */}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-black/5 pt-2 space-y-1">
          <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
          <p className="text-xs text-gray-400">{CONFIDENCE_LABELS[item.confidence] ?? item.confidence}</p>
        </div>
      )}
    </div>
  );
}
