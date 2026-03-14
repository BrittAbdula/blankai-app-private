import { useEffect, useMemo, useState } from "react";
import { ChevronsLeftRight, ImagePlus, Layers3, SplitSquareVertical, Sparkles } from "lucide-react";
import type { CompareSeed } from "@extension/types";
import { computeDiff, readFileAsDataUrl } from "@extension/lib/imageDiff";
import { cn } from "@extension/lib/utils";

type AdvancedMode = "slider" | "heatmap";

interface ImageSelection {
  dataUrl: string | null;
  label: string;
  name: string | null;
  size: number | null;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function CompareSlider({ left, right }: { left: string; right: string }) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={right} alt="Compared image" className="absolute inset-0 h-full w-full object-contain" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={left} alt="Original image" className="h-full w-full object-contain" />
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
          <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-white" />
          <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
            <ChevronsLeftRight className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="w-full accent-[var(--primary-solid)]"
        />
      </div>
    </div>
  );
}

function ImageSlot({
  selection,
  onPick,
}: {
  onPick: (file: File) => void;
  selection: ImageSelection;
}) {
  return (
    <label className="group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) {
            onPick(nextFile);
          }
        }}
      />
      {selection.dataUrl ? (
        <div className="flex w-full flex-col items-center gap-3">
          <img src={selection.dataUrl} alt={selection.label} className="max-h-36 w-auto rounded-xl border border-slate-200 object-contain" />
          <div className="text-sm font-medium text-slate-900">{selection.name ?? selection.label}</div>
          <div className="text-xs text-slate-500">{formatBytes(selection.size)}</div>
        </div>
      ) : (
        <>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-primary">
            <ImagePlus className="h-5 w-5" />
          </span>
          <div className="mt-3 text-sm font-medium text-slate-900">{selection.label}</div>
          <div className="mt-1 text-xs text-slate-500">Choose image</div>
        </>
      )}
    </label>
  );
}

export default function CompareTool({ seed }: { seed: CompareSeed | null }) {
  const [left, setLeft] = useState<ImageSelection>({
    dataUrl: null,
    label: "Original",
    name: null,
    size: null,
  });
  const [right, setRight] = useState<ImageSelection>({
    dataUrl: null,
    label: "Cleaned",
    name: null,
    size: null,
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedMode, setAdvancedMode] = useState<AdvancedMode>("slider");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diffPercent, setDiffPercent] = useState<number | null>(null);
  const [changedPixels, setChangedPixels] = useState<number | null>(null);
  const [heatmap, setHeatmap] = useState<string | null>(null);

  useEffect(() => {
    if (!seed) return;

    setLeft({
      dataUrl: seed.originalDataUrl,
      label: "Original",
      name: seed.originalName,
      size: seed.originalSize,
    });
    setRight({
      dataUrl: seed.cleanedDataUrl,
      label: "Cleaned",
      name: seed.cleanedName,
      size: seed.cleanedSize,
    });
  }, [seed]);

  useEffect(() => {
    if (!left.dataUrl || !right.dataUrl) {
      setDiffPercent(null);
      setChangedPixels(null);
      setHeatmap(null);
      return;
    }

    const leftDataUrl = left.dataUrl;
    const rightDataUrl = right.dataUrl;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await computeDiff(leftDataUrl, rightDataUrl, 12);
        if (!cancelled) {
          setDiffPercent(result.diffPercent);
          setChangedPixels(result.differentPixels);
          setHeatmap(result.heatmapDataUrl);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Failed to compare images.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [left.dataUrl, right.dataUrl]);

  const summary = useMemo(() => {
    if (diffPercent == null || changedPixels == null) return null;
    return [
      { label: "Difference", value: `${diffPercent.toFixed(2)}%` },
      { label: "Changed pixels", value: changedPixels.toLocaleString() },
      { label: "Original size", value: formatBytes(left.size) },
      { label: "Cleaned size", value: formatBytes(right.size) },
    ];
  }, [changedPixels, diffPercent, left.size, right.size]);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-slate-900">Compare image output</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the original and cleaned images side by side before you export or publish.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <SplitSquareVertical className="h-3.5 w-3.5" />
            Compare locally
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ImageSlot
            selection={left}
            onPick={(file) => {
              void readFileAsDataUrl(file).then((dataUrl) =>
                setLeft({ dataUrl, label: "Original", name: file.name, size: file.size })
              );
            }}
          />
          <ImageSlot
            selection={right}
            onPick={(file) => {
              void readFileAsDataUrl(file).then((dataUrl) =>
                setRight({ dataUrl, label: "Cleaned", name: file.name, size: file.size })
              );
            }}
          />
        </div>

        {left.dataUrl && right.dataUrl ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900">
              <Sparkles className="h-4 w-4 text-primary" />
              Default view
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <img src={left.dataUrl} alt="Original" className="aspect-[4/3] w-full rounded-xl border border-slate-200 bg-white object-contain" />
              <img src={right.dataUrl} alt="Cleaned" className="aspect-[4/3] w-full rounded-xl border border-slate-200 bg-white object-contain" />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Pick two images to see them side by side. If you came from Clean, the latest result is loaded automatically.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-slate-900">Diff details</h3>
            <p className="mt-1 text-sm text-slate-500">
              {summary
                ? "Use the metrics below and expand the advanced views for slider and heatmap inspection."
                : "After two images are selected, BlankAI computes a local diff summary and optional visualizations."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdvancedOpen((current) => !current)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Layers3 className="h-4 w-4" />
            {advancedOpen ? "Hide advanced" : "Show advanced"}
          </button>
        </div>

        {loading ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Calculating image diff...</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        {summary ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {advancedOpen && left.dataUrl && right.dataUrl ? (
          <div className="mt-4 space-y-4">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {[
                { key: "slider", label: "Slider" },
                { key: "heatmap", label: "Heatmap" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setAdvancedMode(mode.key as AdvancedMode)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm transition-colors",
                    advancedMode === mode.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {advancedMode === "slider" ? <CompareSlider left={left.dataUrl} right={right.dataUrl} /> : null}
            {advancedMode === "heatmap" && heatmap ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <img src={heatmap} alt="Difference heatmap" className="aspect-[4/3] w-full rounded-xl border border-slate-200 bg-white object-contain" />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          All processing happens locally in your browser.
        </div>
      </section>
    </div>
  );
}
