import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronsLeftRight,
  Columns2,
  Flame,
  Hash,
  ImagePlus,
  Layers,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { EXTENSION_IMAGE_ACCEPT, createSafeImagePreviewDataUrl } from "@extension/lib/imagePreview";
import type { CompareSeed } from "@extension/types";
import {
  computeDiff,
  getImageDimensions,
  sha256ShortFromDataUrl,
  type DiffResult,
} from "@extension/lib/imageDiff";
import { cn } from "@extension/lib/utils";

type ViewMode = "sidebyside" | "overlay" | "slider" | "heatmap";

interface ImageSelection {
  dataUrl: string | null;
  file: File | null;
  hash: string | null;
  height: number | null;
  isPreparing: boolean;
  label: string;
  metadataFields: string[];
  name: string | null;
  size: number | null;
  width: number | null;
}

function emptySlot(label: string): ImageSelection {
  return {
    dataUrl: null,
    file: null,
    hash: null,
    height: null,
    isPreparing: false,
    label,
    metadataFields: [],
    name: null,
    size: null,
    width: null,
  };
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
    <div className="relative overflow-hidden border border-cyan/10 bg-[#091120]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#08101d]">
        <img src={right} alt="Compared image" className="absolute inset-0 h-full w-full object-contain" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={left} alt="Original image" className="h-full w-full object-contain" />
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
          <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-white" />
          <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-cyan/18 bg-[#0f162a] text-cyan">
            <ChevronsLeftRight className="h-4 w-4" />
          </div>
        </div>
        <div className="absolute left-3 top-3 border border-black/30 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
          BEFORE
        </div>
        <div className="absolute right-3 top-3 border border-cyan/20 bg-cyan/80 px-2 py-0.5 text-[10px] font-semibold text-[#0a0f1e]">
          AFTER
        </div>
      </div>
      <div className="border-t border-cyan/10 bg-[#0d1528] px-3 py-2">
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

function UploadSlot({
  onClear,
  onPick,
  slot,
}: {
  onClear: () => void;
  onPick: (file: File) => void;
  slot: ImageSelection;
}) {
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) onPick(nextFile);
  };

  if (slot.dataUrl) {
    return (
      <div className="relative border border-cyan/10 bg-[#091120]">
        <img
          src={slot.dataUrl}
          alt={slot.label}
          className="aspect-[4/3] w-full border-b border-cyan/10 bg-[#07101d] object-contain"
        />
        <div className="absolute left-2 top-2 border border-black/30 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
          {slot.label}
        </div>
        {slot.hash ? (
          <div className="absolute right-2 top-2 border border-cyan/20 bg-[#08101d] px-2 py-0.5 font-mono text-[10px] text-cyan">
            {slot.hash.slice(0, 10)}...
          </div>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 bottom-[3.6rem] inline-flex h-7 w-7 items-center justify-center border border-white/10 bg-black/55 text-white transition-colors hover:border-red-400/30 hover:bg-red-500/20"
          aria-label={`Clear ${slot.label}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{slot.name ?? slot.label}</div>
            <div className="mt-1 text-xs text-slate-400">
              {formatBytes(slot.size)} · {slot.width ?? "—"}×{slot.height ?? "—"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label
      className="group flex min-h-[208px] cursor-pointer flex-col items-center justify-center border border-dashed border-cyan/14 bg-[#091120] px-4 py-6 text-center transition-colors hover:border-cyan/30 hover:bg-cyan/5"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={EXTENSION_IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) onPick(nextFile);
          event.target.value = "";
        }}
      />
      {slot.isPreparing ? (
        <>
          <div className="h-12 w-12 border-2 border-cyan border-t-transparent" style={{ animation: "spin 0.8s linear infinite" }} />
          <div className="mt-4 text-sm font-medium text-white">Preparing preview...</div>
        </>
      ) : (
        <>
          <span className="inline-flex h-12 w-12 items-center justify-center border border-cyan/15 bg-[#0d1528] text-cyan">
            <ImagePlus className="h-5 w-5" />
          </span>
          <div className="mt-3 text-sm font-medium text-white">{slot.label}</div>
          <div className="mt-1 text-xs text-slate-400">JPG · PNG · WebP · AVIF · HEIC</div>
        </>
      )}
    </label>
  );
}

export default function CompareTool({ seed }: { seed: CompareSeed | null }) {
  const [slotA, setSlotA] = useState<ImageSelection>(emptySlot("Image A — Original"));
  const [slotB, setSlotB] = useState<ImageSelection>(emptySlot("Image B — Cleaned"));
  const [viewMode, setViewMode] = useState<ViewMode>("sidebyside");
  const [tolerance, setTolerance] = useState(8);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyMode, setVerifyMode] = useState(false);

  const runDiffFor = async (leftDataUrl: string, rightDataUrl: string, nextTolerance: number) => {
    setComputing(true);
    setError(null);
    try {
      const result = await computeDiff(leftDataUrl, rightDataUrl, nextTolerance);
      setDiff(result);
      setViewMode("heatmap");
    } catch (caughtError) {
      setDiff(null);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to compare images.");
    } finally {
      setComputing(false);
    }
  };

  useEffect(() => {
    if (!seed) return;

    setVerifyMode(true);
    setTolerance(8);
    setError(null);
    setDiff(null);
    setViewMode("sidebyside");

    setSlotA({
      dataUrl: seed.originalDataUrl,
      file: null,
      hash: seed.originalHash,
      height: seed.height,
      isPreparing: false,
      label: "Image A — Original",
      metadataFields: Array.from(new Set(seed.metadataRemoved)),
      name: seed.originalName,
      size: seed.originalSize,
      width: seed.width,
    });
    setSlotB({
      dataUrl: seed.cleanedDataUrl,
      file: null,
      hash: seed.cleanedHash,
      height: seed.height,
      isPreparing: false,
      label: "Image B — Cleaned",
      metadataFields: [],
      name: seed.cleanedName,
      size: seed.cleanedSize,
      width: seed.width,
    });

    void runDiffFor(seed.originalDataUrl, seed.cleanedDataUrl, 8);
  }, [seed]);

  const handleFile = async (file: File, which: "a" | "b") => {
    const setSlot = which === "a" ? setSlotA : setSlotB;
    const label = which === "a" ? "Image A — Original" : "Image B — Cleaned";

    setDiff(null);
    setError(null);
    setSlot({
      ...emptySlot(label),
      file,
      isPreparing: true,
      name: file.name,
      size: file.size,
    });

    try {
      const dataUrl = await createSafeImagePreviewDataUrl(file);
      const [hash, dimensions] = await Promise.all([
        sha256ShortFromDataUrl(dataUrl),
        getImageDimensions(dataUrl),
      ]);

      setSlot({
        dataUrl,
        file,
        hash,
        height: dimensions.height,
        isPreparing: false,
        label,
        metadataFields: which === "a" ? ["EXIF", "GPS", "XMP", "IPTC", "C2PA"] : [],
        name: file.name,
        size: file.size,
        width: dimensions.width,
      });
    } catch (caughtError) {
      setSlot(emptySlot(label));
      setError(caughtError instanceof Error ? caughtError.message : "Could not prepare this image for comparison.");
    }
  };

  const summary = useMemo(() => {
    if (!diff) return [];
    return [
      { label: "Difference", value: `${diff.diffPercent.toFixed(2)}%` },
      { label: "Changed pixels", value: diff.differentPixels.toLocaleString() },
      { label: "Max delta", value: diff.maxDelta.toString() },
      { label: "Avg delta", value: diff.avgDelta.toFixed(2) },
    ];
  }, [diff]);

  const bothLoaded = Boolean(slotA.dataUrl && slotB.dataUrl);

  return (
    <div className="flex flex-col">
      <section className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
        {verifyMode ? (
          <div className="mb-4 border border-cyan/20 bg-cyan/6 px-3 py-2 text-sm text-slate-300">
            <span className="font-medium text-cyan">Verify Clean Mode.</span> Original and cleaned images are ready to compare.
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <UploadSlot
            slot={slotA}
            onPick={(file) => {
              void handleFile(file, "a");
            }}
            onClear={() => {
              setSlotA(emptySlot("Image A — Original"));
              setDiff(null);
            }}
          />
          <UploadSlot
            slot={slotB}
            onPick={(file) => {
              void handleFile(file, "b");
            }}
            onClear={() => {
              setSlotB(emptySlot("Image B — Cleaned"));
              setDiff(null);
              setVerifyMode(false);
            }}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="border border-cyan/10 bg-[#091120] px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Tolerance</div>
              <div className="font-mono text-xs text-cyan">{tolerance}</div>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={tolerance}
              onChange={(event) => setTolerance(Number(event.target.value))}
              className="mt-2 w-full accent-[var(--primary-solid)]"
            />
          </div>
          <button
            type="button"
            disabled={!bothLoaded || computing}
            onClick={() => {
              if (!slotA.dataUrl || !slotB.dataUrl) return;
              void runDiffFor(slotA.dataUrl, slotB.dataUrl, tolerance);
            }}
            className={cn(
              "gradient-cyan inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-medium text-[#0a0f1e] transition-opacity",
              !bothLoaded || computing ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {computing ? "Comparing..." : diff ? "Re-run Diff" : "Run Compare"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {summary.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {summary.map((item) => (
              <div key={item.label} className="border border-cyan/10 bg-[#091120] p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                <div className="mt-2 text-sm font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {verifyMode && bothLoaded ? (
          <div className="mt-4 border border-emerald-500/20 bg-emerald-500/8 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Metadata Verification
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="border border-cyan/10 bg-[#091120] p-3">
                <div className="text-xs text-slate-400">Original</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slotA.metadataFields.length > 0 ? (
                    slotA.metadataFields.map((tag) => (
                      <span key={tag} className="border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[11px] text-orange-300">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No fields listed</span>
                  )}
                </div>
              </div>
              <div className="border border-emerald-500/20 bg-emerald-500/8 p-3">
                <div className="text-xs text-emerald-300">BlankAI Cleaned</div>
                <div className="mt-2">
                  <span className="border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">
                    0 metadata fields
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
        {diff ? (
          <>
            <div className="flex gap-px overflow-x-auto border border-cyan/12 bg-[#08101d]">
              {([
                { icon: Columns2, label: "Side by Side", mode: "sidebyside" as ViewMode },
                { icon: Layers, label: "Overlay", mode: "overlay" as ViewMode },
                { icon: SlidersHorizontal, label: "Slider", mode: "slider" as ViewMode },
                { icon: Flame, label: "Heatmap", mode: "heatmap" as ViewMode },
              ] as const).map(({ icon: Icon, label, mode }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
                    viewMode === mode
                      ? "bg-cyan/12 text-cyan"
                      : "bg-[#0b1222]/70 text-slate-300 hover:bg-[#0f172b] hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 border border-cyan/10 bg-[#091120] p-3">
              {viewMode === "sidebyside" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="relative">
                    <img src={slotA.dataUrl ?? undefined} alt="Original" className="aspect-[4/3] w-full border border-cyan/10 bg-[#07101d] object-contain" />
                    <div className="absolute left-2 top-2 border border-black/30 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">BEFORE</div>
                  </div>
                  <div className="relative">
                    <img src={slotB.dataUrl ?? undefined} alt="Cleaned" className="aspect-[4/3] w-full border border-cyan/10 bg-[#07101d] object-contain" />
                    <div className="absolute left-2 top-2 border border-cyan/20 bg-cyan/80 px-2 py-0.5 text-[10px] font-semibold text-[#0a0f1e]">AFTER</div>
                  </div>
                </div>
              ) : null}

              {viewMode === "overlay" ? (
                <div className="relative">
                  <img src={slotA.dataUrl ?? undefined} alt="Base" className="aspect-[4/3] w-full border border-cyan/10 bg-[#07101d] object-contain opacity-75" />
                  <img src={diff.overlayDataUrl} alt="Diff overlay" className="absolute inset-0 h-full w-full object-contain" />
                  <div className="absolute left-2 top-2 border border-black/30 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Red = changed pixels
                  </div>
                </div>
              ) : null}

              {viewMode === "slider" && slotA.dataUrl && slotB.dataUrl ? (
                <CompareSlider left={slotA.dataUrl} right={slotB.dataUrl} />
              ) : null}

              {viewMode === "heatmap" ? (
                <div className="relative">
                  <img src={slotA.dataUrl ?? undefined} alt="Base" className="aspect-[4/3] w-full border border-cyan/10 bg-[#07101d] object-contain opacity-25" />
                  <img src={diff.heatmapDataUrl} alt="Heatmap" className="absolute inset-0 h-full w-full object-contain" />
                  <div className="absolute left-2 top-2 border border-black/30 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Heatmap = changed pixels
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 border border-cyan/10 bg-[#091120] p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Hash className="h-4 w-4 text-cyan" />
                SHA-256 Hash Comparison
              </div>
              <div className="mt-3 grid gap-2">
                <div className="border border-cyan/10 bg-[#0d1528] px-3 py-2 text-xs text-slate-300">
                  <span className="mr-2 text-slate-500">Image A</span>
                  <span className="font-mono text-orange-300">{slotA.hash}</span>
                </div>
                <div className="border border-cyan/10 bg-[#0d1528] px-3 py-2 text-xs text-slate-300">
                  <span className="mr-2 text-slate-500">Image B</span>
                  <span className="font-mono text-cyan">{slotB.hash}</span>
                </div>
                {slotA.hash && slotB.hash && slotA.hash !== slotB.hash ? (
                  <div className="text-xs text-emerald-300">Hashes differ — fingerprint changed.</div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-cyan/12 bg-[#091120] p-4 text-sm text-slate-300">
            Load two images and run compare to open side-by-side, overlay, slider, and heatmap views.
          </div>
        )}
      </section>
    </div>
  );
}
