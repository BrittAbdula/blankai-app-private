import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Hash,
  HardDrive,
  ImagePlus,
  RefreshCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { EXTENSION_IMAGE_ACCEPT, createSafeImagePreviewDataUrl } from "@extension/lib/imagePreview";
import { processImage, type ProcessedImageResult } from "@extension/lib/imageProcessor";
import type { CleanSeed, CompareSeed } from "@extension/types";
import { cn } from "@extension/lib/utils";

type CleanStage = "idle" | "staged" | "processing" | "done" | "error";

const PROCESSING_STEPS = [
  "Loading image into memory...",
  "Rendering to canvas and stripping metadata...",
  "Modifying pixel fingerprint...",
  "Computing hash delta...",
  "Encoding clean output...",
];
const REMOVAL_TAGS = ["EXIF", "GPS", "C2PA", "AI Tags", "Pixel Hash"];

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

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

function hashSnippet(value: string) {
  return `${value.slice(0, 12)}...`;
}

function UploadSurface({
  fileName,
  onFile,
  previewUrl,
  size,
}: {
  fileName: string | null;
  onFile: (file: File) => void;
  previewUrl: string | null;
  size: number | null;
}) {
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) onFile(nextFile);
  };

  return (
    <label
      className="group flex min-h-[224px] cursor-pointer flex-col items-center justify-center border border-dashed border-cyan/14 bg-[#091120] px-6 py-8 text-center transition-colors hover:border-cyan/30 hover:bg-cyan/5"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={EXTENSION_IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) onFile(nextFile);
          event.target.value = "";
        }}
      />
      {previewUrl ? (
        <div className="flex w-full flex-col items-center gap-4">
          <img
            src={previewUrl}
            alt={fileName ?? "Selected image"}
            className="max-h-48 w-auto border border-cyan/10 bg-[#07101d] object-contain"
          />
          <div>
            <div className="text-sm font-medium text-white">{fileName}</div>
            <div className="mt-1 text-xs text-slate-400">{size != null ? formatBytes(size) : null}</div>
          </div>
        </div>
      ) : (
        <>
          <span className="inline-flex h-14 w-14 items-center justify-center border border-cyan/15 bg-[#0d1528] text-cyan">
            <ImagePlus className="h-6 w-6" />
          </span>
          <div className="mt-4 text-base font-medium text-white">Drop image or click to browse</div>
          <div className="mt-1 text-xs text-slate-400">JPG · PNG · WebP · AVIF · HEIC</div>
        </>
      )}
    </label>
  );
}

interface CleanToolProps {
  onUseInCompare: (seed: CompareSeed) => void;
  seed: CleanSeed | null;
}

export default function CleanTool({ onUseInCompare, seed }: CleanToolProps) {
  const [stage, setStage] = useState<CleanStage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (stage !== "processing") return;

    const interval = window.setInterval(() => {
      setProcessingStep((current) => (current + 1) % PROCESSING_STEPS.length);
    }, 850);

    return () => window.clearInterval(interval);
  }, [stage]);

  const prepareFile = async (nextFile: File, nextPreviewUrl?: string | null) => {
    setError(null);
    setResult(null);
    setFile(nextFile);
    setStage("staged");

    try {
      const preview = nextPreviewUrl ?? await createSafeImagePreviewDataUrl(nextFile);
      setSourcePreview(preview);
    } catch (caughtError) {
      setSourcePreview(null);
      setStage("error");
      setError(caughtError instanceof Error ? caughtError.message : "Could not prepare a preview for this image.");
    }
  };

  useEffect(() => {
    if (!seed) return;
    void prepareFile(seed.file, seed.previewDataUrl ?? null);
  }, [seed]);

  const reset = () => {
    setStage("idle");
    setFile(null);
    setSourcePreview(null);
    setResult(null);
    setError(null);
    setProcessingStep(0);
  };

  const handleProcess = async () => {
    if (!file || !sourcePreview) return;

    setStage("processing");
    setProcessingStep(0);
    setError(null);

    try {
      const [nextResult] = await Promise.all([processImage(file), wait(1400)]);
      setResult(nextResult);
      setStage("done");
    } catch (caughtError) {
      setStage("error");
      setError(caughtError instanceof Error ? caughtError.message : "Failed to clean this image.");
    }
  };

  const handleUseInCompare = () => {
    if (!file || !sourcePreview || !result) return;

    onUseInCompare({
      cleanedDataUrl: result.downloadUrl,
      cleanedHash: result.hashAfter,
      cleanedName: result.cleanedName,
      cleanedSize: result.sizeAfter,
      height: result.height,
      metadataRemoved: result.metadataRemoved,
      originalDataUrl: sourcePreview,
      originalHash: result.hashBefore,
      originalName: file.name,
      originalSize: file.size,
      width: result.width,
    });
  };

  const stats = useMemo(() => {
    if (!result) return [];
    return [
      {
        icon: HardDrive,
        label: "Size",
        value: `${formatBytes(result.sizeBefore)} -> ${formatBytes(result.sizeAfter)}`,
      },
      {
        icon: Zap,
        label: "Pixels",
        value: result.pixelsModified.toLocaleString(),
      },
      {
        icon: Sparkles,
        label: "Quality",
        value: `${result.quality}% JPEG`,
      },
      {
        icon: Hash,
        label: "Hash",
        value: result.hashBefore !== result.hashAfter ? "Changed" : "Same",
      },
    ];
  }, [result]);

  return (
    <div className="flex flex-col">
      <section className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
        <UploadSurface
          fileName={file?.name ?? null}
          previewUrl={sourcePreview}
          size={file?.size ?? null}
          onFile={(nextFile) => {
            void prepareFile(nextFile);
          }}
        />

        {stage === "idle" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {REMOVAL_TAGS.map((tag) => (
              <span key={tag} className="border border-cyan/10 bg-[#0d1528] px-2.5 py-1 text-[11px] text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {stage === "staged" ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PROCESSING_STEPS.slice(1).map((step) => (
                <div key={step} className="border border-cyan/10 bg-[#0d1528] px-3 py-2 text-xs text-slate-300">
                  {step.replace("...", "")}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleProcess()}
                className="gradient-cyan inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-medium text-[#0a0f1e] transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Remove Metadata
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center justify-center gap-2 border border-cyan/14 bg-[#0b1222] px-4 text-sm font-medium text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {stage === "processing" ? (
          <div className="mt-4 border border-cyan/14 bg-[#091120] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">Processing</div>
                <div className="mt-1 text-xs text-slate-400">{PROCESSING_STEPS[processingStep]}</div>
              </div>
              <div className="border border-cyan/15 bg-cyan/10 px-2.5 py-1 text-xs text-cyan">
                {processingStep + 1}/{PROCESSING_STEPS.length}
              </div>
            </div>
            <div className="mt-4 h-2 bg-[#0d1528]">
              <div
                className="h-full gradient-cyan transition-all duration-500"
                style={{ width: `${((processingStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </section>

      {stage === "done" && result ? (
        <section className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
          <div className="flex items-center gap-2 border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Clean complete
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-cyan/10 bg-[#091120] p-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <Icon className="h-3.5 w-3.5 text-cyan" />
                    {label}
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="border border-cyan/10 bg-[#091120] p-3">
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">Before</div>
                <img
                  src={sourcePreview ?? undefined}
                  alt={file?.name ?? "Original image"}
                  className="aspect-[4/3] w-full border border-cyan/10 bg-[#07101d] object-contain"
                />
              </div>
              <div className="border border-cyan/10 bg-[#091120] p-3">
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">After</div>
                <img
                  src={result.downloadUrl}
                  alt={result.cleanedName}
                  className="aspect-[4/3] w-full border border-cyan/10 bg-[#07101d] object-contain"
                />
              </div>
            </div>

            <div className="border border-cyan/10 bg-[#091120] p-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Verification</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="border border-cyan/10 bg-[#0d1528] px-2 py-1 font-mono text-orange-300">
                  {hashSnippet(result.hashBefore)}
                </span>
                <span className="text-slate-500">-&gt;</span>
                <span className="border border-cyan/10 bg-[#0d1528] px-2 py-1 font-mono text-cyan">
                  {hashSnippet(result.hashAfter)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.metadataRemoved.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center border border-cyan/15 bg-cyan/10 px-2.5 py-1 text-xs font-medium text-cyan"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => downloadResult(result)}
                className="gradient-cyan inline-flex h-11 items-center gap-2 px-4 text-sm font-medium text-[#0a0f1e] transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                type="button"
                onClick={handleUseInCompare}
                className="inline-flex h-11 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-4 text-sm font-medium text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
              >
                Verify Clean
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-4 text-sm font-medium text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Process More
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
