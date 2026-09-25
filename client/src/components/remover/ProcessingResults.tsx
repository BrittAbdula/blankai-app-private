import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  Hash,
  HardDrive,
  Layers,
  Share2,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import CompareSlider from "@/components/remover/CompareSlider";
import { formatBytes, type ProcessedImageResult } from "@/lib/imageProcessor";
import type { FindingCategory } from "@/lib/metadataScan";
import { trackEvent } from "@/lib/analytics";

const CATEGORY_STYLE: Record<FindingCategory, string> = {
  privacy: "bg-red-500/10 border-red-500/25 text-red-300",
  provenance: "bg-amber-500/10 border-amber-500/25 text-amber-200",
  ai: "bg-violet-500/10 border-violet-500/25 text-violet-200",
  technical: "bg-muted/60 border-border text-muted-foreground",
};

const FORMAT_LABEL: Record<string, string> = { jpeg: "JPEG", png: "PNG", webp: "WebP" };

export const VERIFY_LINKS = [
  {
    label: "Content Credentials Verify",
    href: "https://contentcredentials.org/verify",
    note: "Reads C2PA manifests",
  },
  {
    label: "Gemini SynthID check",
    href: "https://gemini.google.com/",
    note: "Ask “Is this AI-generated?”",
  },
  {
    label: "OpenAI provenance tools",
    href: "https://openai.com/index/advancing-content-provenance/",
    note: "C2PA + SynthID for ChatGPT images",
  },
];

function outputSummary(r: ProcessedImageResult) {
  const format = FORMAT_LABEL[r.outputFormat] ?? r.outputFormat.toUpperCase();
  return r.quality ? `${format} · quality ${r.quality}` : `${format} · lossless`;
}

export default function ProcessingResults({
  results,
  filePreviews,
  onReset,
  page,
}: {
  results: ProcessedImageResult[];
  filePreviews: string[];
  onReset: () => void;
  page: string;
}) {
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);
  const [headerPulsed, setHeaderPulsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderPulsed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const totalFound = results.reduce((sum, r) => sum + r.found.length, 0);
  const allVerified = results.every((r) => r.outputVerified);
  const gpsCount = results.filter((r) => r.found.some((f) => f.id === "gps")).length;
  const formats = Array.from(new Set(results.map((r) => FORMAT_LABEL[r.outputFormat] ?? r.outputFormat)));
  const watermarkNotes = Array.from(new Set(results.flatMap((r) => r.hints.watermarkLikely)));
  const aiProvenance = results.some(
    (r) => r.hints.c2pa || r.hints.aiSourceType || r.hints.aiTools.length || r.hints.cnAigcLabel,
  );

  const handleVerifyClean = () => {
    const r = results[0];
    if (!r) return;
    trackEvent("remover_verify_click", { page, image_count: results.length });
    sessionStorage.setItem(
      "blankai_verify_clean",
      JSON.stringify({ dataUrl: r.downloadUrl, name: r.cleanedName, size: r.sizeAfter }),
    );
    navigate("/image-diff");
  };

  const handleDownloadZip = async () => {
    setZipping(true);
    trackEvent("remover_download", { page, mode: "zip", image_count: results.length });
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const folder = zip.folder("blankai-cleaned")!;
      const used = new Set<string>();
      for (const r of results) {
        let name = r.cleanedName;
        for (let n = 2; used.has(name); n++) name = r.cleanedName.replace(/(\.[^.]+)$/, `-${n}$1`);
        used.add(name);
        folder.file(name, r.blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blankai-cleaned-${results.length}-images.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setZipping(false);
    }
  };

  const handleDownloadOne = (r: ProcessedImageResult) => {
    trackEvent("remover_download", { page, mode: "single", image_count: 1 });
    const a = document.createElement("a");
    a.href = r.downloadUrl;
    a.download = r.cleanedName;
    a.click();
  };

  const handleShareX = () => {
    trackEvent("share_click", { page, target: "x", image_count: results.length });
    const text = encodeURIComponent(
      `Checked and cleaned hidden metadata (EXIF, GPS, C2PA) from ${results.length} image${results.length > 1 ? "s" : ""} locally with BlankAI. Nothing uploaded. blankai.app`,
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card" style={{ animation: "fadeInUp 0.4s ease both" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-gradient-to-r from-cyan/5 to-transparent">
        <div className="relative w-9 h-9 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-cyan" />
          {headerPulsed && (
            <span className="absolute inset-0 rounded-full border border-cyan/60" style={{ animation: "pingOnce 0.8s ease-out 0.2s both" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-foreground text-lg leading-none">
            {results.length} image{results.length > 1 ? "s" : ""} cleaned
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {allVerified
              ? "Re-scanned the new files: no EXIF, GPS, XMP, IPTC, C2PA or text metadata found."
              : "Some output needs a second look. See the notes on each file."}
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-xs"
        >
          <Upload className="w-3 h-3" />
          New batch
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
        {[
          { icon: FileCheck2, value: String(results.length), label: "Images cleaned" },
          { icon: Layers, value: String(totalFound), label: "Metadata blocks found" },
          { icon: HardDrive, value: formats.join(" / "), label: "Output format" },
          {
            icon: allVerified ? ShieldCheck : AlertTriangle,
            value: allVerified ? "Clean" : "Review",
            label: "Output re-scan",
          },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-muted/40 border border-border rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 mx-auto mb-2 text-cyan" />
            <div className="font-display font-bold text-foreground text-2xl leading-none mb-1">{value}</div>
            <div className="text-muted-foreground text-xs">{label}</div>
          </div>
        ))}
      </div>

      {gpsCount > 0 && (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            GPS coordinates were found in {gpsCount} original file{gpsCount > 1 ? "s" : ""} and are not in the cleaned copies.
          </span>
        </div>
      )}

      {/* Thumbnails */}
      <div className="px-5 pb-4">
        <h4 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2 flex-wrap">
          <span>Cleaned images</span>
          <span className="text-xs font-normal text-muted-foreground">Tap to compare. Long-press to save on mobile.</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {results.map((r, i) => (
            <div
              key={`${r.originalName}-${i}`}
              className="relative group rounded-lg overflow-hidden border border-border bg-muted/30 aspect-square cursor-pointer"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <img src={r.downloadUrl} alt={`Cleaned copy of ${r.originalName}`} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                <p className="text-white text-[10px] font-mono-custom truncate leading-tight">{r.cleanedName}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-cyan text-[10px] font-medium">{r.found.length} removed</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadOne(r);
                    }}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan/90 text-navy text-[9px] font-bold"
                    aria-label={`Save ${r.cleanedName}`}
                  >
                    <Download className="w-2.5 h-2.5" />
                    Save
                  </button>
                </div>
              </div>
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500/90 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}
        </div>

        {expanded !== null && results[expanded] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setExpanded(null)}
          >
            <div
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-cyan/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {filePreviews[expanded] ? (
                <CompareSlider before={filePreviews[expanded]} after={results[expanded].downloadUrl} />
              ) : (
                <img
                  src={results[expanded].downloadUrl}
                  alt={results[expanded].cleanedName}
                  className="w-full h-auto max-h-[65vh] object-contain bg-black"
                />
              )}
              <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
                <div className="min-w-0 flex-1">
                  <p className="font-mono-custom text-foreground text-xs font-semibold truncate">{results[expanded].cleanedName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {results[expanded].width}×{results[expanded].height}px · {formatBytes(results[expanded].sizeAfter)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadOne(results[expanded!])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => setExpanded(null)}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Close preview"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Per-file report */}
      <div className="px-5 pb-5">
        <h4 className="font-display font-semibold text-foreground text-sm mb-3">File report</h4>
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={`${r.originalName}-detail-${i}`} className="border border-border rounded-lg p-4 bg-background/50">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono-custom text-foreground text-xs font-semibold truncate">{r.originalName}</p>
                  <p className="font-mono-custom text-cyan text-xs truncate mt-0.5">→ {r.cleanedName}</p>
                </div>
                <button
                  onClick={() => handleDownloadOne(r)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-semibold"
                >
                  <Download className="w-3 h-3" />
                  Save
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                  {r.found.length ? (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-green-400 font-medium mr-1">Removed:</span>
                      {r.found.map((f) => (
                        <span
                          key={f.id}
                          title={f.detail}
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${CATEGORY_STYLE[f.category]}`}
                        >
                          {f.label}
                          {f.detail ? <span className="opacity-70"> · {f.detail}</span> : null}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      No embedded metadata was found in the original. The new copy is still a fresh export.
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  {r.outputVerified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={r.outputVerified ? "text-muted-foreground" : "text-amber-200"}>
                    {r.outputVerified
                      ? "Output re-scan: no metadata containers in the new file."
                      : `Output re-scan still found: ${r.residual.map((f) => f.label).join(", ")}.`}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
                  <HardDrive className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span>
                    {outputSummary(r)} · {r.width}×{r.height}px · {formatBytes(r.sizeBefore)} → {formatBytes(r.sizeAfter)}
                    {r.convertedFrom ? ` · converted from ${r.convertedFrom}` : ""}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Hash className="w-3.5 h-3.5 text-cyan flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex flex-wrap items-center gap-1 text-muted-foreground">
                    <span>SHA-256</span>
                    <span className="font-mono-custom text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{r.hashBefore.slice(0, 12)}…</span>
                    <span>→</span>
                    <span className="font-mono-custom text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{r.hashAfter.slice(0, 12)}…</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What stays */}
      <div className="mx-5 mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-display text-sm font-semibold text-foreground mb-1">What cleaning does not change</p>
        <p>
          BlankAI removes file metadata. It does not remove invisible watermarks that are part of the pixels,
          such as Google&apos;s SynthID, or visible logos.
          {aiProvenance && watermarkNotes.length > 0 && (
            <>
              {" "}
              The original file&apos;s own provenance data points to a generator that applies{" "}
              <strong className="text-foreground">{watermarkNotes.join("; ")}</strong>, so the vendor&apos;s checker can
              still identify it.
            </>
          )}{" "}
          If a platform asks you to disclose AI-generated content, removing metadata does not change that obligation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VERIFY_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-cyan/30"
              title={link.note}
            >
              {link.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3 flex-wrap">
        {results.length > 1 ? (
          <button
            onClick={handleDownloadZip}
            disabled={zipping}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 disabled:opacity-60"
          >
            <Archive className="w-4 h-4" />
            {zipping ? "Zipping…" : `Download ZIP (${results.length} files)`}
          </button>
        ) : (
          <button
            onClick={() => handleDownloadOne(results[0])}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
        <button
          onClick={handleVerifyClean}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cyan/30 text-cyan hover:bg-cyan/5 transition-colors text-sm font-medium"
          title="Compare the original and cleaned image pixel by pixel"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Compare in Image Diff
        </button>
        <button
          onClick={handleShareX}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share on X
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          Clean more
        </button>
      </div>
    </div>
  );
}
