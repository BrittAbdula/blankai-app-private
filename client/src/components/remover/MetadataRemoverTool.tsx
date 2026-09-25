/**
 * MetadataRemoverTool: the browser-only metadata cleaner used on the home page
 * and on every landing page. Files never leave the device.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Cpu,
  FileText,
  Image,
  LoaderCircle,
  Upload,
  X,
  Zap,
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import MetadataViewerPanel from "@/components/MetadataViewerPanel";
import ProcessingResults from "@/components/remover/ProcessingResults";
import {
  processImages,
  type OutputFormat,
  type ProcessedImageResult,
} from "@/lib/imageProcessor";
import { extractExif, type ExifResult } from "@/lib/exifReader";
import { scanMetadata, type MetadataScan } from "@/lib/metadataScan";
import ProvenanceSummary from "@/components/ProvenanceSummary";
import { createImagePreviewDataUrl, isPreviewableImageFile } from "@/lib/imagePreview";
import { takePendingRemoverFile } from "@/lib/pendingImageRoute";
import { trackEvent } from "@/lib/analytics";

/** Dispatch this event after stashing a file to load it into a mounted tool. */
export const REMOVER_PENDING_UPLOAD_EVENT = "blankai-home-pending-upload";

type Stage = "idle" | "staged" | "processing" | "done" | "error";

export interface MetadataRemoverToolProps {
  /** Page id used in analytics events. */
  page?: string;
  /** Default output format for this page (e.g. "jpeg" on the HEIC to JPG page). */
  defaultFormat?: OutputFormat;
  /** Accept files handed over from the EXIF Viewer ("Remove GPS" / "Remove all"). */
  acceptPending?: boolean;
  /** Headline shown inside the empty drop zone. */
  dropLabel?: string;
}

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "auto", label: "Same as original" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG (lossless)" },
  { value: "webp", label: "WebP" },
];

const QUALITY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Maximum (100)" },
  { value: 0.92, label: "High (92)" },
  { value: 0.82, label: "Smaller file (82)" },
];

export default function MetadataRemoverTool({
  page = "home",
  defaultFormat = "auto",
  acceptPending = true,
  dropLabel,
}: MetadataRemoverToolProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [format, setFormat] = useState<OutputFormat>(defaultFormat);
  const [quality, setQuality] = useState(0.92);
  const rootRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [preparingFiles, setPreparingFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ProcessedImageResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [singleFileMetadata, setSingleFileMetadata] = useState<ExifResult | null>(
    null,
  );
  const [singleFileMetadataLoading, setSingleFileMetadataLoading] = useState(false);
  const [singleFileMetadataError, setSingleFileMetadataError] = useState<string | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [stagedScans, setStagedScans] = useState<(MetadataScan | null)[]>([]);

  // Scan staged files so users see what each one carries before cleaning.
  useEffect(() => {
    if (stage !== "staged" || files.length === 0) {
      setStagedScans([]);
      return;
    }
    let cancelled = false;
    void Promise.all(files.map((file) => scanMetadata(file).catch(() => null))).then((scans) => {
      if (!cancelled) setStagedScans(scans);
    });
    return () => {
      cancelled = true;
    };
  }, [files, stage]);

  const processingSteps = [
    "Reading the file locally…",
    "Scanning metadata containers…",
    "Redrawing pixels on a canvas…",
    "Encoding a fresh file…",
    "Re-scanning the output…",
  ];

  useEffect(() => {
    if (stage !== "processing") return;
    const interval = setInterval(() => {
      setProcessingStep(s => (s + 1) % processingSteps.length);
    }, 900);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== "staged" || files.length !== 1) {
      setSingleFileMetadata(null);
      setSingleFileMetadataLoading(false);
      setSingleFileMetadataError(null);
      return;
    }

    let cancelled = false;

    setSingleFileMetadata(null);
    setSingleFileMetadataLoading(true);
    setSingleFileMetadataError(null);

    void extractExif(files[0])
      .then(result => {
        if (cancelled) return;
        setSingleFileMetadata(result);
      })
      .catch(error => {
        console.error(error);
        if (cancelled) return;
        setSingleFileMetadataError(
          "Could not inspect this file's metadata preview. You can still remove metadata safely.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setSingleFileMetadataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [files, stage]);

  const generatePreviews = (selectedFiles: File[]): Promise<string[]> => {
    return Promise.all(selectedFiles.map((file) => createImagePreviewDataUrl(file, file.name)));
  };

  const handleFilesSelected = useCallback(async (
    selectedFiles: File[],
    options?: { replace?: boolean },
  ) => {
    if (!selectedFiles.length) return;
    const shouldReplace = options?.replace ?? false;

    // In staged mode: APPEND new files (deduplicate by name+size, cap at 20 total)
    const existing = stage === "staged" && !shouldReplace ? files : [];
    const existingPreviews =
      stage === "staged" && !shouldReplace ? filePreviews : [];
    const existingKeys = new Set(existing.map(f => `${f.name}-${f.size}`));
    const incoming = selectedFiles.filter(
      f => !existingKeys.has(`${f.name}-${f.size}`)
    );
    if (!incoming.length) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const merged = [...existing, ...incoming].slice(0, 20);

    trackEvent("remover_files_selected", {
      page,
      source: shouldReplace ? "replace" : stage === "staged" ? "append" : "new",
      incoming_count: incoming.length,
      total_count: merged.length,
    });

    setPreparingFiles(incoming);
    setErrorMsg(null);

    try {
      const incomingPreviews = await generatePreviews(incoming);
      const mergedPreviews = [...existingPreviews, ...incomingPreviews].slice(
        0,
        20
      );

      setFiles(merged);
      setFilePreviews(mergedPreviews);
      setStage("staged");
      setResults([]);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not prepare image preview. Please try a different file.");
      setStage("error");
    } finally {
      setPreparingFiles([]);
      // Clear input so the same file can be re-selected next time
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [filePreviews, files, page, stage]);

  // Auto-load a file handed over from the EXIF Viewer or the sample card.
  useEffect(() => {
    if (!acceptPending) return;
    const acceptPendingUpload = () => {
      const pending = takePendingRemoverFile();
      if (!pending) return;

      void handleFilesSelected([pending], { replace: true });

      window.setTimeout(() => {
        rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 160);
    };

    acceptPendingUpload();
    window.addEventListener(REMOVER_PENDING_UPLOAD_EVENT, acceptPendingUpload);

    return () => {
      window.removeEventListener(REMOVER_PENDING_UPLOAD_EVENT, acceptPendingUpload);
    };
  }, [acceptPending, handleFilesSelected]);

  const startProcessing = async () => {
    trackEvent("remover_processing_started", {
      page,
      image_count: files.length,
      output_format: format,
    });
    setStage("processing");
    setProcessingStep(0);
    setProgress({ current: 0, total: files.length });
    try {
      const processed = await processImages(files, { format, quality }, (current, total) => {
        setProgress({ current, total });
      });
      setResults(processed);
      setStage("done");
      trackEvent("remover_processing_completed", {
        page,
        image_count: processed.length,
        metadata_blocks: processed.reduce((sum, r) => sum + r.found.length, 0),
        gps_found: processed.some((r) => r.found.some((f) => f.id === "gps")),
        c2pa_found: processed.some((r) => r.hints.c2pa),
        verified: processed.every((r) => r.outputVerified),
      });
    } catch (err) {
      setErrorMsg("Processing failed. Please try a different image format.");
      setStage("error");
      trackEvent("remover_processing_failed", {
        page,
        image_count: files.length,
      });
      console.error(err);
    }
  };

  const reset = () => {
    setStage("idle");
    setFiles([]);
    setFilePreviews([]);
    setResults([]);
    setErrorMsg(null);
    setSingleFileMetadata(null);
    setSingleFileMetadataLoading(false);
    setSingleFileMetadataError(null);
    setProgress({ current: 0, total: 0 });
    // Clear file input so same files can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files)
      .filter(isPreviewableImageFile)
      .slice(0, 20);
    handleFilesSelected(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 20);
    handleFilesSelected(selected);
  };

  const removeFile = (idx: number) => {
    const newFiles = files.filter((_, i) => i !== idx);
    const newPreviews = filePreviews.filter((_, i) => i !== idx);
    if (newFiles.length === 0) {
      reset();
      return;
    }
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const progressPct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;
  const isPreparingFiles = preparingFiles.length > 0;
  const preparingHasHeic = preparingFiles.some(
    (file) =>
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.(heic|heif)$/i.test(file.name),
  );

  // Current image index clamped to valid range
  const currentIdx = Math.min(progress.current, progress.total - 1);

  return (
    <div ref={rootRef} className="w-full scroll-mt-24">
      {/* ── Persistent hidden file input — always in DOM so inputRef never goes stale ── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: IDLE — Drop Zone */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {isPreparingFiles && stage !== "processing" && (
        <div
          className="relative overflow-hidden rounded-xl border border-cyan/30 p-10 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.03 220 / 0.95), oklch(0.14 0.02 220 / 0.98))",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.14),transparent_48%)]" />
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10">
              <LoaderCircle className="h-7 w-7 animate-spin text-cyan" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                {preparingHasHeic ? "Preparing HEIC preview…" : "Preparing image preview…"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {preparingHasHeic
                  ? "Converting HEIC so the preview opens instantly and keeps the flow responsive."
                  : "Optimizing the preview before the image enters the workflow."}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                {preparingFiles.length > 1
                  ? `${preparingFiles.length} files queued`
                  : preparingFiles[0]?.name}
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-cyan/90 animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === "idle" && !isPreparingFiles && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-cyan bg-cyan/5 scale-[1.01]"
              : "border-border hover:border-cyan/50 hover:bg-muted/20"
          }`}
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Choose images to remove metadata"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center transition-all ${isDragging ? "animate-pulse-glow" : ""}`}
            >
              <Upload className="w-7 h-7 text-cyan" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-lg mb-1">
                {dropLabel ?? "Drop images here or"}{" "}
                <span className="text-cyan">click to choose</span>
              </p>
              <p className="text-muted-foreground text-sm">
                JPG, PNG, WebP, AVIF, HEIC · Up to 20 images · Nothing is uploaded
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["EXIF", "GPS", "XMP", "IPTC", "C2PA", "PNG text"].map(tag => (
                <span
                  key={tag}
                  className="text-xs font-mono-custom px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: STAGED — Preview + Start Button */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {stage === "staged" && !isPreparingFiles && (
        <div className="space-y-4">
          <div
            className="border border-border rounded-xl overflow-hidden bg-card"
            style={{ animation: "fadeInUp 0.35s ease" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                  <Image className="w-3.5 h-3.5 text-cyan" />
                </div>
                <span className="font-display font-semibold text-foreground text-sm">
                  {files.length} image{files.length > 1 ? "s" : ""} ready
                </span>
                <span className="text-muted-foreground text-xs">
                  — review before processing
                </span>
              </div>
              <button
                onClick={reset}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {filePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/30"
                    style={{
                      animation: `scaleIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275) ${i * 0.04}s both`,
                    }}
                  >
                    <ImagePreview
                      src={src}
                      alt={files[i]?.name ?? "Selected image preview"}
                      file={files[i] ?? null}
                      actionPlacement="bottom-right"
                      actionVariant="compact"
                      className="h-full w-full"
                      imgClassName="object-cover"
                      fallbackLabel="No preview"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-200 hover:bg-destructive hover:text-white"
                      aria-label={`Remove ${files[i]?.name ?? "image"}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 pr-20">
                      <p className="text-white text-[9px] truncate font-mono-custom">
                        {files[i]?.name}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Add more button */}
                <div
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-cyan/40 flex items-center justify-center cursor-pointer transition-colors"
                  onClick={() => inputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">
                      Add more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Output options */}
            <div className="px-4 pb-3 grid gap-2 sm:grid-cols-2">
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                <span>Output format</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutputFormat)}
                  className="bg-transparent text-foreground text-xs font-medium focus:outline-none"
                >
                  {FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className={`flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground ${format === "png" ? "opacity-50" : ""}`}
              >
                <span>Quality (JPEG/WebP)</span>
                <select
                  value={quality}
                  disabled={format === "png"}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="bg-transparent text-foreground text-xs font-medium focus:outline-none"
                >
                  {QUALITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Start button */}
            <div className="px-4 pb-4 flex items-center gap-3">
              <button
                onClick={startProcessing}
                className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl gradient-cyan text-navy font-display font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ boxShadow: "0 0 20px oklch(0.82 0.18 196 / 0.3)" }}
              >
                <Zap className="w-4 h-4" />
                Remove Metadata
                <span className="font-mono-custom font-normal text-sm opacity-70">
                  ({files.length})
                </span>
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {stagedScans.length === files.length &&
            stagedScans.map((scan, i) =>
              scan ? (
                <ProvenanceSummary
                  key={`${files[i]?.name}-${i}`}
                  scan={scan}
                  title={files.length > 1 ? `Found in ${files[i]?.name}` : "Found in this file"}
                />
              ) : null,
            )}

          {files.length === 1 && (
            singleFileMetadata ? (
              <MetadataViewerPanel
                result={singleFileMetadata}
                previewUrl={filePreviews[0] ?? null}
                groups={singleFileMetadata.groups}
                stickyToolbar
                containerIdPrefix="home-metadata"
                stickyBaseOffset={64}
              />
            ) : (
              <div className="rounded-2xl border border-border/40 bg-navy-800/45 px-5 py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10">
                  {singleFileMetadataLoading ? (
                    <LoaderCircle className="h-7 w-7 animate-spin text-cyan" />
                  ) : (
                    <FileText className="h-7 w-7 text-cyan" />
                  )}
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-foreground">
                  {singleFileMetadataLoading
                    ? "Preparing metadata viewer…"
                    : "Metadata viewer unavailable"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {singleFileMetadataLoading
                    ? "Reading this image with the shared EXIF Viewer component."
                    : singleFileMetadataError ??
                      "This image can still be processed even if the viewer could not be loaded."}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: PROCESSING */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {stage === "processing" && (
        <div
          className="border border-cyan/30 rounded-xl overflow-hidden"
          style={{
            animation: "fadeIn 0.3s ease",
            background:
              "linear-gradient(135deg, oklch(0.18 0.02 220 / 0.8), oklch(0.14 0.01 220 / 0.9))",
          }}
        >
          {/* Thumbnail strip with per-image status */}
          {filePreviews.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filePreviews.map((src, i) => {
                  const isDone = i < progress.current;
                  const isCurrent = i === currentIdx;
                  return (
                    <div
                      key={i}
                      className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-500"
                      style={{
                        border: isDone
                          ? "2px solid oklch(0.82 0.18 196)"
                          : isCurrent
                            ? "2px solid oklch(0.65 0.15 220)"
                            : "2px solid rgba(255,255,255,0.08)",
                        opacity: isDone ? 1 : isCurrent ? 1 : 0.4,
                        transform: isCurrent ? "scale(1.08)" : "scale(1)",
                        animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
                      }}
                    >
                      <ImagePreview
                        src={src}
                        alt={`Processing preview ${i + 1}`}
                        showExifAction={false}
                        className="h-full w-full"
                        imgClassName="object-cover"
                        fallbackLabel="No preview"
                      />
                      {isDone && (
                        <div className="absolute inset-0 bg-cyan/25 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-t-transparent border-cyan"
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Central processing animation */}
          <div className="flex flex-col items-center gap-5 px-6 pb-7 pt-4">
            {/* Progress ring + icon */}
            <div className="relative w-20 h-20">
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.82 0.18 196 / 0.15) 0%, transparent 70%)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              {/* SVG ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="rgba(0,212,255,0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                  style={{
                    transition:
                      "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
                <defs>
                  <linearGradient
                    id="ringGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="oklch(0.82 0.18 196)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.15 220)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu
                  className="w-7 h-7 text-cyan"
                  style={{
                    animation: "spin 2.5s linear infinite",
                    filter: "drop-shadow(0 0 6px oklch(0.82 0.18 196 / 0.6))",
                  }}
                />
              </div>
            </div>

            {/* Status text */}
            <div className="text-center">
              <p className="font-display font-semibold text-foreground text-base mb-1">
                {progress.current < progress.total
                  ? `Processing ${progress.current + 1} of ${progress.total} image${progress.total > 1 ? "s" : ""}`
                  : "Finalizing…"}
              </p>
              <p
                className="text-muted-foreground text-sm h-5"
                key={processingStep}
                style={{ animation: "fadeIn 0.4s ease" }}
              >
                {processingSteps[processingStep]}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Overall progress</span>
                <span className="font-mono-custom text-cyan">
                  {progressPct}%
                </span>
              </div>
              <div className="relative bg-muted/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.82 0.18 196), oklch(0.65 0.15 220))",
                    boxShadow: "0 0 10px oklch(0.82 0.18 196 / 0.7)",
                  }}
                />
                {/* Shimmer */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s ease infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: ERROR */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {stage === "error" && (
        <div
          className="border border-destructive/30 rounded-xl p-6 bg-destructive/5"
          style={{ animation: "fadeInUp 0.3s ease" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-sm">
                Processing Failed
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-cyan text-navy text-sm font-semibold hover:opacity-90"
            >
              <Zap className="w-3.5 h-3.5" />
              Retry
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: DONE — Results */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {stage === "done" && results.length > 0 && (
        <ProcessingResults
          results={results}
          filePreviews={filePreviews}
          onReset={reset}
          page={page}
        />
      )}
    </div>
  );
}
