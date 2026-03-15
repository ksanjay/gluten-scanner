import { useEffect, useState } from "react";

const MESSAGES = [
  "Reading the menu…",
  "Checking ingredients…",
  "Identifying gluten sources…",
  "Almost there…",
];

export function LoadingScreen({ preview }: { preview: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 gap-6">
      <img
        src={preview}
        alt="Menu being analyzed"
        className="w-full max-w-xs rounded-2xl border border-gray-200 opacity-60"
      />

      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <svg className="animate-spin h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>

        <p className="text-gray-700 font-medium text-center transition-all duration-500">
          {MESSAGES[msgIndex]}
        </p>
        <p className="text-gray-400 text-xs text-center">
          This usually takes 5–10 seconds
        </p>
      </div>
    </div>
  );
}
