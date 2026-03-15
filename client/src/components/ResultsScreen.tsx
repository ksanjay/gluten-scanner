import { useState } from "react";
import type { AnalyzeResponse, MenuItem } from "../types";
import { ItemCard } from "./ItemCard";

interface Props {
  preview: string;
  result: AnalyzeResponse;
  isLiked: (name: string) => boolean;
  isPreferred: (name: string) => boolean;
  onToggleLike: (name: string) => void;
  onScanAnother: () => void;
}

const SAFE_STATUSES = new Set(["safe", "likely_safe"]);

export function ResultsScreen({
  preview,
  result,
  isLiked,
  isPreferred,
  onToggleLike,
  onScanAnother,
}: Props) {
  const safeItems = result.items.filter((i) => SAFE_STATUSES.has(i.gluten_status));
  const unsafeItems = result.items.filter((i) => !SAFE_STATUSES.has(i.gluten_status));

  const yourPicks = safeItems.filter((i) => isPreferred(i.name));
  const otherSafe = safeItems.filter((i) => !isPreferred(i.name));

  function handleShare() {
    if (!navigator.share) return;
    const safeList = safeItems.map((i) => `• ${i.name}`).join("\n");
    navigator.share({
      title: "Gluten-Free Menu Items",
      text: `Gluten-free items from ${result.restaurant_context || "this menu"}:\n\n${safeList}`,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 pt-safe-top pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Results</h1>
            {result.restaurant_context && (
              <p className="text-green-100 text-xs mt-0.5">{result.restaurant_context}</p>
            )}
          </div>
          <div className="flex gap-2">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={handleShare}
                className="p-2 rounded-full active:bg-green-700"
                aria-label="Share results"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu thumbnail */}
      <div className="px-6 pt-4">
        <img
          src={preview}
          alt="Scanned menu"
          className="w-full max-h-32 object-cover rounded-xl border border-gray-200"
        />
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 px-6 pt-3 pb-1">
        <Stat value={safeItems.length} label="Safe" color="text-green-700" />
        <Stat value={unsafeItems.length} label="Unsafe" color="text-red-600" />
        <Stat value={result.items.length} label="Total" color="text-gray-600" />
      </div>

      {/* Cross-contamination warning */}
      {result.general_notes && (
        <div className="mx-6 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            ⚠️ {result.general_notes}
          </p>
        </div>
      )}

      {/* Results list */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {/* Your Picks */}
        {yourPicks.length > 0 && (
          <Section title="Your Picks ❤️" subtitle="Gluten-free items matching your preferences">
            {yourPicks.map((item) => (
              <ItemCard
                key={item.name}
                item={item}
                isLiked={isLiked(item.name)}
                isPreferred={true}
                onToggleLike={onToggleLike}
              />
            ))}
          </Section>
        )}

        {/* All Gluten-Free */}
        {otherSafe.length > 0 && (
          <Section
            title={yourPicks.length > 0 ? "Other Gluten-Free Items" : "Gluten-Free Items"}
            subtitle={`${safeItems.length} item${safeItems.length !== 1 ? "s" : ""} safe to order`}
          >
            {otherSafe.map((item) => (
              <ItemCard
                key={item.name}
                item={item}
                isLiked={isLiked(item.name)}
                isPreferred={false}
                onToggleLike={onToggleLike}
              />
            ))}
          </Section>
        )}

        {safeItems.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">😔</p>
            <p className="text-sm">No gluten-free items detected. Consider asking staff about modifications.</p>
          </div>
        )}

        {/* Unsafe items (collapsed by default) */}
        {unsafeItems.length > 0 && (
          <Section
            title="Contains Gluten / Uncertain"
            subtitle={`${unsafeItems.length} item${unsafeItems.length !== 1 ? "s" : ""} to avoid`}
            collapsible
          >
            {unsafeItems.map((item) => (
              <ItemCard
                key={item.name}
                item={item}
                isLiked={false}
                isPreferred={false}
                onToggleLike={() => {}}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-safe-bottom pb-4 space-y-3">
        <button
          onClick={onScanAnother}
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-base active:bg-green-700"
        >
          📷 Scan Another Menu
        </button>
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Always confirm with restaurant staff before ordering. This is not medical advice.
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 py-2 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  collapsible = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);

  return (
    <div>
      <button
        className="w-full text-left mb-2"
        onClick={() => collapsible && setOpen((v: boolean) => !v)}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
          {collapsible && (
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}
