import { useRef, useState } from "react";
import { resizeImageToBase64 } from "../utils/imageResize";

interface Props {
  onCapture: (base64: string, mediaType: "image/jpeg", preview: string) => void;
  onOpenSettings: () => void;
}

export function CaptureScreen({ onCapture, onOpenSettings }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const { base64, mediaType } = await resizeImageToBase64(file);
      const previewUrl = `data:image/jpeg;base64,${base64}`;
      setPreview(previewUrl);
      onCapture(base64, mediaType, previewUrl);
    } catch {
      setError("Could not process image. Please try again.");
    } finally {
      setIsProcessing(false);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 pt-safe-top pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">GlutenScan</h1>
          <p className="text-green-100 text-xs mt-0.5">Scan a menu to find safe items</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full active:bg-green-700"
          aria-label="Settings"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        {/* Preview */}
        {preview && (
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <img src={preview} alt="Menu preview" className="w-full object-cover" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Tip */}
        {!preview && (
          <div className="text-center text-gray-400 max-w-xs">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-sm leading-relaxed">
              Take a clear photo of the menu. For best results, make sure the text is sharp and well-lit.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          {/* Camera */}
          <label className="w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="sr-only"
            />
            <span className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-base active:bg-green-700 cursor-pointer">
              {isProcessing ? (
                <>
                  <Spinner />
                  Processing…
                </>
              ) : (
                <>📷 Take Photo</>
              )}
            </span>
          </label>

          {/* Photo library */}
          <label className="w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <span className="flex items-center justify-center gap-2 w-full bg-white border-2 border-green-600 text-green-700 py-4 rounded-2xl font-semibold text-base active:bg-green-50 cursor-pointer">
              🖼 Choose from Library
            </span>
          </label>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-safe-bottom pb-4">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Always confirm with restaurant staff before ordering. This tool is not a substitute for medical advice.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
