import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Onboarding } from "./components/Onboarding";
import { CaptureScreen } from "./components/CaptureScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { Settings } from "./components/Settings";
import { usePreferences } from "./hooks/usePreferences";
import type { AnalyzeResponse } from "./types";

type Screen = "capture" | "loading" | "results" | "settings";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function analyzeMenu(image: string, mediaType: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, mediaType }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Error ${res.status}`);
  }

  return res.json();
}

export default function App() {
  const {
    prefs,
    completeOnboarding,
    toggleLikedItem,
    addPreferredFood,
    removePreferredFood,
    isPreferred,
  } = usePreferences();

  const [screen, setScreen] = useState<Screen>("capture");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const mutation = useMutation({
    mutationFn: ({ image, mediaType }: { image: string; mediaType: string }) =>
      analyzeMenu(image, mediaType),
    onSuccess: (data) => {
      setResult(data);
      setScreen("results");
    },
  });

  // Show onboarding on first launch
  if (!prefs.hasCompletedOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  if (screen === "settings") {
    return (
      <Settings
        prefs={prefs}
        onAddPreferredFood={addPreferredFood}
        onRemovePreferredFood={removePreferredFood}
        onToggleLikedItem={toggleLikedItem}
        onBack={() => setScreen("capture")}
      />
    );
  }

  if (screen === "loading") {
    return <LoadingScreen preview={preview} />;
  }

  if (screen === "results" && result) {
    return (
      <ResultsScreen
        preview={preview}
        result={result}
        isLiked={(name) => prefs.likedItems.includes(name)}
        isPreferred={isPreferred}
        onToggleLike={toggleLikedItem}
        onScanAnother={() => {
          setResult(null);
          setScreen("capture");
        }}
      />
    );
  }

  // Default: capture screen
  return (
    <div>
      {mutation.isError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-sm text-center px-4 py-3">
          {(mutation.error as Error).message}
          <button onClick={() => mutation.reset()} className="ml-3 underline">Dismiss</button>
        </div>
      )}
      <CaptureScreen
        onCapture={(base64, mediaType, previewUrl) => {
          setPreview(previewUrl);
          setScreen("loading");
          mutation.mutate({ image: base64, mediaType });
        }}
        onOpenSettings={() => setScreen("settings")}
      />
    </div>
  );
}
