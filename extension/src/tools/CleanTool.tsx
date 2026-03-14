import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ImagePlus,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { processImage, type ProcessedImageResult } from "@blankai-core/lib/imageProcessor";
import type { CompareSeed } from "@extension/types";
import { readFileAsDataUrl } from "@extension/lib/imageDiff";
import { cn } from "@extension/lib/utils";

const PIPELINE_STEPS = [
  { label: "Strip EXIF", description: "Removes camera, software, and timestamp metadata." },
  { label: "Clear GPS", description: "Removes embedded location fields and related tags." },
  { label: "Drop C2PA", description: "Removes content credentials and provenance metadata." },
  { label: "Re-encode JPG", description: "Exports a fresh JPG after local processing." },
];

function downloadResult(result: ProcessedImageResult) {
  const anchor = document.createElement("a");
  anchor.href = result.downloadUrl;
  anchor.download = result.cleanedName;
  anchor.click();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface CleanToolProps {
  onUseInCompare: (seed: CompareSeed) => void;
}

export default function CleanTool({ onUseInCompare }: CleanToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!result) return null;
    return [
      { label: "Original", value: formatBytes(result.sizeBefore) },
      { label: "Cleaned", value: formatBytes(result.sizeAfter) },
      { label: "Quality", value: `${result.quality}%` },
      { label: "Pixels tweaked", value: result.pixelsModified.toLocaleString() },
    ];
  }, [result]);

  const reset = () => {
    setFile(null);
    setSourcePreview(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleFile = async (nextFile: File) => {
    setError(null);
    setResult(null);
    setFile(nextFile);
    setSourcePreview(await readFileAsDataUrl(nextFile));
  };

  const handleProcess = async () => {
    if (!file || !sourcePreview) return;
    setIsProcessing(true);
    setError(null);
    try {
      const nextResult = await processImage(file);
      setResult(nextResult);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to process the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseInCompare = () => {
    if (!file || !sourcePreview || !result) return;
    onUseInCompare({
      originalDataUrl: sourcePreview,
      originalName: file.name,
      originalSize: file.size,
      cleanedDataUrl: result.downloadUrl,
      cleanedName: result.cleanedName,
      cleanedSize: result.sizeAfter,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-slate-900">Clean image metadata</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload one image, clean it locally, and export a fresh JPG for sharing.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            No upload
          </div>
        </div>

        <div className="grid gap-4">
          <label className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (nextFile) {
                  void handleFile(nextFile);
                }
              }}
            />
            {sourcePreview ? (
              <div className="flex w-full flex-col items-center gap-4">
                <img
                  src={sourcePreview}
                  alt={file?.name ?? "Selected image"}
                  className="max-h-48 w-auto rounded-2xl border border-slate-200 object-contain"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">{file?.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{file ? formatBytes(file.size) : null}</div>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-primary">
                  <ImagePlus className="h-6 w-6" />
                </span>
                <div className="mt-4 text-base font-medium text-slate-900">Select an image to clean</div>
                <div className="mt-1 text-sm text-slate-500">JPG, PNG, WebP, AVIF, or HEIC</div>
              </>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            {PIPELINE_STEPS.map((step) => (
              <div key={step.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {step.label}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleProcess()}
              disabled={!file || isProcessing}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity",
                !file || isProcessing ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
              )}
            >
              <Sparkles className="h-4 w-4" />
              {isProcessing ? "Cleaning locally..." : "Clean image"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-slate-900">Result</h3>
            <p className="mt-1 text-sm text-slate-500">
              {result
                ? "Download the cleaned image or send it directly into Compare."
                : "Run the clean step to see size changes, removed items, and download actions."}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            All processing happens locally in your browser.
          </div>
        </div>

        {result ? (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Clean preview</div>
                <img
                  src={result.downloadUrl}
                  alt={result.cleanedName}
                  className="max-h-56 w-full rounded-xl border border-slate-200 object-contain"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Summary</div>
                <div className="grid grid-cols-2 gap-3">
                  {stats?.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white bg-white p-3">
                      <div className="text-xs text-slate-500">{stat.label}</div>
                      <div className="mt-1 text-sm font-medium text-slate-900">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-white bg-white p-3">
                  <div className="text-xs text-slate-500">Removed metadata</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.metadataRemoved.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => downloadResult(result)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download clean JPG
              </button>
              <button
                type="button"
                onClick={handleUseInCompare}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Compare result
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            BlankAI removes EXIF, GPS, and C2PA-related metadata by re-encoding your image locally. When ready, you can verify the result in Compare without leaving the side panel.
          </div>
        )}
      </section>
    </div>
  );
}
