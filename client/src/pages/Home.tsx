/**
 * BlankAI — Home Page
 * Design: Precision Engineering Dark Technical
 * Color: Deep Navy (#0A0F1E) + Electric Cyan (#00D4FF)
 * Typography: Space Grotesk (display) + Inter (body) + JetBrains Mono (stats)
 * SEO Target: remove ai pixel metadata remover undetectable ai image
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import JSZip from "jszip";
import BlogSection from "@/components/BlogSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import WaitlistSection from "@/components/WaitlistSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  Shield,
  Zap,
  Lock,
  EyeOff,
  CheckCircle2,
  X,
  ChevronDown,
  Upload,
  Download,
  Cpu,
  Globe,
  Image,
  FileText,
  MapPin,
  Tag,
  Hash,
  Layers,
  Users,
  Star,
  ArrowRight,
  Check,
  HardDrive,
  Zap as ZapIcon,
  Target,
  AlertCircle,
  Share2,
  Archive,
} from "lucide-react";
import { processImages, formatBytes, formatCount, type ProcessedImageResult } from "@/lib/imageProcessor";

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Counter Animation Hook ───────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
  const count = useCounter(value, 1800, started);
  return (
    <div className="text-center px-6 py-4 border-r border-border last:border-r-0">
      <div className="font-display text-3xl font-bold text-cyan glow-cyan-text">
        <span className="font-mono-custom">{count.toLocaleString()}</span>
        <span className="text-2xl">{suffix}</span>
      </div>
      <div className="text-muted-foreground text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, badge }: { icon: any; title: string; description: string; badge?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 card-hover relative overflow-hidden group">
      {badge && (
        <span className="absolute top-4 right-4 text-xs font-mono-custom font-medium px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">
          {badge}
        </span>
      )}
      <div className="w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
        <Icon className="w-5 h-5 text-cyan" />
      </div>
      <h3 className="font-display font-semibold text-foreground mb-2 text-base">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Use Case Card ────────────────────────────────────────────────────────────
function UseCaseCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-5 bg-card border border-border rounded-lg card-hover">
      <div className="w-9 h-9 rounded-md bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-cyan" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-foreground text-sm mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-foreground text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-cyan flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Processing Complete Results Panel ────────────────────────────────────────
// ─── Before/After Comparison Slider ─────────────────────────────────────────
function CompareSlider({ before, after }: { before: string; after: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };

  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; updatePos(e.clientX); };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { updatePos(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-t-xl bg-black"
      style={{ maxHeight: "65vh", cursor: "col-resize" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After (base layer) */}
      <img src={after} alt="After" className="w-full h-auto max-h-[65vh] object-contain block" draggable={false} />
      {/* Before (clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={before} alt="Before" className="w-full h-auto max-h-[65vh] object-contain block" draggable={false} />
        {/* Before label */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
          BEFORE
        </div>
      </div>
      {/* After label */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-cyan/80 text-navy text-xs font-semibold backdrop-blur-sm">
        AFTER
      </div>
      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 7H1M1 7L3 5M1 7L3 9" stroke="#0A0F1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7H13M13 7L11 5M13 7L11 9" stroke="#0A0F1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/50 text-white/70 text-[10px] pointer-events-none">
        ← drag to compare →
      </div>
    </div>
  );
}

function ProcessingResults({
  results,
  filePreviews,
  onReset,
}: {
  results: ProcessedImageResult[];
  filePreviews: string[];
  onReset: () => void;
}) {
  const [, navigate] = useLocation();

  const handleVerifyClean = () => {
    // Use the first result for single image, or let user pick for batch
    const r = results[0];
    if (!r) return;
    sessionStorage.setItem("blankai_verify_clean", JSON.stringify({
      dataUrl: r.downloadUrl,
      name: r.cleanedName,
      size: r.sizeAfter,
    }));
    navigate("/image-diff");
  };
  const totalPixelsModified = results.reduce((s, r) => s + r.pixelsModified, 0);
  const avgSizeReduction = Math.round(
    results.reduce((s, r) => s + r.sizeReductionPct, 0) / results.length
  );
  const avgQuality = Math.round(
    results.reduce((s, r) => s + r.quality, 0) / results.length
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [headerPulsed, setHeaderPulsed] = useState(false);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderPulsed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("blankai-cleaned")!;
      for (const r of results) {
        // Convert data URL to blob
        const res = await fetch(r.downloadUrl);
        const blob = await res.blob();
        folder.file(r.cleanedName, blob);
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
    const a = document.createElement("a");
    a.href = r.downloadUrl;
    a.download = r.cleanedName;
    a.click();
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `Just removed AI metadata from ${results.length} image${results.length > 1 ? "s" : ""} — now completely undetectable! 🔒 Try it free at blankai.app #AIMetadata #UndetectableAI`
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="border border-border rounded-xl overflow-hidden bg-card"
      style={{ animation: "fadeInUp 0.4s ease both" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-gradient-to-r from-cyan/5 to-transparent">
        <div
          className="relative w-9 h-9 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center flex-shrink-0"
          style={{ animation: "scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both" }}
        >
          <CheckCircle2 className="w-4 h-4 text-cyan" />
          {headerPulsed && (
            <span
              className="absolute inset-0 rounded-full border border-cyan/60"
              style={{ animation: "pingOnce 0.8s ease-out 0.2s both" }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-foreground text-lg leading-none">
            Processing Complete!
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            All AI metadata and pixel fingerprints have been removed
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-xs"
        >
          <Upload className="w-3 h-3" />
          New Batch
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
        {[
          { icon: Download, value: results.length.toString(), label: "Images Processed" },
          { icon: HardDrive, value: `${avgSizeReduction > 0 ? avgSizeReduction : "<1"}%`, label: "Size Reduction" },
          { icon: ZapIcon, value: formatCount(totalPixelsModified), label: "Pixels Modified" },
          { icon: Target, value: `${avgQuality}%`, label: "Avg. Quality" },
        ].map(({ icon: Icon, value, label }, i) => (
          <div
            key={label}
            className="bg-muted/40 border border-border rounded-xl p-4 text-center"
            style={{ animation: `fadeInUp 0.4s ease ${0.1 + i * 0.07}s both` }}
          >
            <Icon className="w-5 h-5 mx-auto mb-2 text-cyan" />
            <div className="font-display font-bold text-foreground text-2xl leading-none mb-1">{value}</div>
            <div className="text-muted-foreground text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Thumbnail Grid */}
      <div className="px-5 pb-4">
        <h4 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2 flex-wrap">
          <span>Cleaned Images</span>
          <span className="text-xs font-normal text-muted-foreground">— tap to preview · long-press to save on mobile</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((r, i) => (
            <div
              key={r.originalName}
              className="relative group rounded-lg overflow-hidden border border-border bg-muted/30 aspect-square cursor-pointer"
              style={{ animation: `fadeInUp 0.35s ease ${0.15 + i * 0.05}s both` }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              {/* After thumbnail — data: URI, iOS can long-press save */}
              <img
                src={r.downloadUrl}
                alt={`Cleaned: ${r.cleanedName}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Always-visible bottom gradient info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                <p className="text-white text-[10px] font-mono-custom truncate leading-tight">{r.cleanedName}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-cyan text-[10px] font-medium">{r.sizeReductionPct > 0 ? `-${r.sizeReductionPct}%` : "Clean"}</p>
                  {/* Always-visible save button — critical for mobile users */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadOne(r); }}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan/90 text-navy text-[9px] font-bold active:scale-95 transition-transform"
                    aria-label={`Save ${r.cleanedName}`}
                  >
                    <Download className="w-2.5 h-2.5" />
                    Save
                  </button>
                </div>
              </div>
              {/* Clean badge */}
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500/90 flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
              {/* Expand hint on hover (desktop) */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">
                Compare
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox with Before/After Comparison Slider */}
        {expanded !== null && results[expanded] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            style={{ animation: "fadeIn 0.2s ease" }}
            onClick={() => setExpanded(null)}
          >
            <div
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-cyan/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: "scaleIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275)" }}
            >
              {/* Before/After Slider — show original vs cleaned */}
              {filePreviews[expanded] ? (
                <CompareSlider
                  before={filePreviews[expanded]}
                  after={results[expanded].downloadUrl}
                />
              ) : (
                <img
                  src={results[expanded].downloadUrl}
                  alt={results[expanded].cleanedName}
                  className="w-full h-auto max-h-[65vh] object-contain bg-black"
                />
              )}
              {/* Footer bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
                <div className="min-w-0 flex-1">
                  <p className="font-mono-custom text-foreground text-xs font-semibold truncate">{results[expanded].cleanedName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {results[expanded].width}×{results[expanded].height}px · {formatBytes(results[expanded].sizeAfter)}
                    {results[expanded].sizeReductionPct > 0 && (
                      <span className="text-green-400 ml-1">— {results[expanded].sizeReductionPct}% smaller</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadOne(results[expanded!])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-semibold hover:opacity-90"
                  >
                    <Download className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => setExpanded(null)}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Details */}
      <div className="px-5 pb-5">
        <h4 className="font-display font-semibold text-foreground text-sm mb-3">File Details</h4>
        <div className="space-y-3">
          {results.map((r, i) => (
            <div
              key={r.originalName}
              className="border border-border rounded-lg p-4 bg-background/50"
              style={{ animation: `fadeInUp 0.35s ease ${0.2 + i * 0.06}s both` }}
            >
              {/* Filename + download button */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono-custom text-foreground text-xs font-semibold truncate">{r.originalName}</p>
                  <p className="font-mono-custom text-cyan text-xs truncate mt-0.5">→ {r.cleanedName}</p>
                </div>
                <button
                  onClick={() => handleDownloadOne(r)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="w-3 h-3" />
                  Save
                </button>
              </div>

              <div className="space-y-2">
                {/* Metadata removed — tags wrap on mobile */}
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-green-400 font-medium">Removed:</span>
                    {r.metadataRemoved.map((m) => (
                      <span key={m} className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-mono-custom text-[10px]">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Hash changed — stacked on mobile */}
                <div className="flex items-start gap-2 text-xs">
                  <Hash className="w-3.5 h-3.5 text-cyan flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-cyan font-medium">Hash changed</span>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span className="font-mono-custom text-muted-foreground text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{r.hashBefore.slice(0, 16)}…</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono-custom text-muted-foreground text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{r.hashAfter.slice(0, 16)}…</span>
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <HardDrive className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Size:</span>
                  <span className="text-muted-foreground">{formatBytes(r.sizeBefore)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-muted-foreground">{formatBytes(r.sizeAfter)}</span>
                  {r.sizeReductionPct > 0 && (
                    <span className="text-green-400 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">{r.sizeReductionPct}% smaller</span>
                  )}
                </div>

                {/* Pixels modified */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <ZapIcon className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Pixels:</span>
                  <span className="text-muted-foreground">{r.pixelsModified.toLocaleString()} fingerprint changes</span>
                </div>

                {/* Resolution */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <Target className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Output:</span>
                  <span className="text-muted-foreground">{r.quality}% JPEG · {r.width}×{r.height}px</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 flex gap-3 flex-wrap">
        {results.length > 1 ? (
          <button
            onClick={handleDownloadZip}
            disabled={zipping}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {zipping ? (
              <>
                <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
                Zipping…
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Download ZIP ({results.length} files)
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => handleDownloadOne(results[0])}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
        <button
          onClick={handleVerifyClean}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cyan/30 text-cyan hover:bg-cyan/5 transition-colors text-sm font-medium"
          title="Verify metadata was removed by comparing original vs cleaned image"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verify Clean
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
          Process More
        </button>
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
type Stage = "idle" | "staged" | "processing" | "done" | "error";

function UploadZone() {
  const [stage, setStage] = useState<Stage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ProcessedImageResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const processingSteps = [
    "Loading image into memory…",
    "Rendering to Canvas · stripping metadata…",
    "Modifying pixel fingerprint…",
    "Computing SHA-256 hash…",
    "Encoding clean output…",
  ];

  useEffect(() => {
    if (stage !== "processing") return;
    const interval = setInterval(() => {
      setProcessingStep((s) => (s + 1) % processingSteps.length);
    }, 900);
    return () => clearInterval(interval);
  }, [stage]);

  const generatePreviews = (selectedFiles: File[]): Promise<string[]> => {
    return new Promise((resolve) => {
      const previews: string[] = new Array(selectedFiles.length).fill("");
      let loaded = 0;
      selectedFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[i] = e.target?.result as string;
          loaded++;
          if (loaded === selectedFiles.length) resolve(previews);
        };
        reader.readAsDataURL(file);
      });
    });
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (!selectedFiles.length) return;
    const previews = await generatePreviews(selectedFiles);
    setFiles(selectedFiles);
    setFilePreviews(previews);
    setStage("staged");
    setErrorMsg(null);
    setResults([]);
  };

  const startProcessing = async () => {
    setStage("processing");
    setProcessingStep(0);
    setProgress({ current: 0, total: files.length });
    try {
      const processed = await processImages(files, (current, total) => {
        setProgress({ current, total });
      });
      setResults(processed);
      setStage("done");
    } catch (err) {
      setErrorMsg("Processing failed. Please try a different image format.");
      setStage("error");
      console.error(err);
    }
  };

  const reset = () => {
    setStage("idle");
    setFiles([]);
    setFilePreviews([]);
    setResults([]);
    setErrorMsg(null);
    setProgress({ current: 0, total: 0 });
    // Clear file input so same files can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files)
      .filter(f => f.type.startsWith("image/"))
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
    if (newFiles.length === 0) { reset(); return; }
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const progressPct = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  // Current image index clamped to valid range
  const currentIdx = Math.min(progress.current, progress.total - 1);

  return (
    <div className="w-full">

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: IDLE — Drop Zone */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {stage === "idle" && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-cyan bg-cyan/5 scale-[1.01]"
              : "border-border hover:border-cyan/50 hover:bg-muted/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Upload images to remove AI metadata"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
            multiple
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center transition-all ${isDragging ? "animate-pulse-glow" : ""}`}>
              <Upload className="w-7 h-7 text-cyan" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-lg mb-1">
                Drop images here or <span className="text-cyan">click to upload</span>
              </p>
              <p className="text-muted-foreground text-sm">
                JPG, PNG, WebP, AVIF, HEIC · Up to 20 images
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["EXIF", "GPS", "C2PA", "AI Tags", "Pixel Hash"].map((tag) => (
                <span key={tag} className="text-xs font-mono-custom px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
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
      {stage === "staged" && (
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
              <span className="text-muted-foreground text-xs">— review before processing</span>
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/30"
                  style={{ animation: `scaleIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275) ${i * 0.04}s both` }}
                >
                  <img src={src} alt={files[i]?.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeFile(i)}
                      className="w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                    <p className="text-white text-[9px] truncate font-mono-custom">{files[i]?.name}</p>
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
                  <span className="text-[9px] text-muted-foreground">Add more</span>
                </div>
              </div>
            </div>
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
              <span className="font-mono-custom font-normal text-sm opacity-70">({files.length})</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* STAGE: PROCESSING */}
      {/* ──────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {stage === "processing" && (
        <div
          className="border border-cyan/30 rounded-xl overflow-hidden"
          style={{ animation: "fadeIn 0.3s ease", background: "linear-gradient(135deg, oklch(0.18 0.02 220 / 0.8), oklch(0.14 0.01 220 / 0.9))" }}
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
                      <img src={src} alt="" className="w-full h-full object-cover" />
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
                  background: "radial-gradient(circle, oklch(0.82 0.18 196 / 0.15) 0%, transparent 70%)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              {/* SVG ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="4" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)" }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="oklch(0.82 0.18 196)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.15 220)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu
                  className="w-7 h-7 text-cyan"
                  style={{ animation: "spin 2.5s linear infinite", filter: "drop-shadow(0 0 6px oklch(0.82 0.18 196 / 0.6))" }}
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
                <span className="font-mono-custom text-cyan">{progressPct}%</span>
              </div>
              <div className="relative bg-muted/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, oklch(0.82 0.18 196), oklch(0.65 0.15 220))",
                    boxShadow: "0 0 10px oklch(0.82 0.18 196 / 0.7)",
                  }}
                />
                {/* Shimmer */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
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
        <div className="border border-destructive/30 rounded-xl p-6 bg-destructive/5" style={{ animation: "fadeInUp 0.3s ease" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-sm">Processing Failed</p>
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
        <ProcessingResults results={results} filePreviews={filePreviews} onReset={reset} />
      )}
    </div>
  );
}

// ─── Main Home Component ───────────────────────────────────────────────────────
export default function Home() {
  const statsSection = useInView(0.3);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    if (statsSection.inView) setStatsStarted(true);
  }, [statsSection.inView]);

  const features = [
    { icon: Tag, title: "EXIF Data Removal", description: "Strips camera model, software, timestamps, device identifiers, and all EXIF fields that reveal image origins.", badge: "EXIF" },
    { icon: MapPin, title: "GPS & Location Tags", description: "Removes geotags, GPS coordinates, and location metadata embedded by phones and cameras.", badge: "GPS" },
    { icon: FileText, title: "XMP & IPTC Metadata", description: "Clears creator info, copyright fields, keywords, captions, and edit history from XMP and IPTC blocks.", badge: "XMP" },
    { icon: Shield, title: "C2PA Content Credentials", description: "Removes Adobe's provenance data that triggers 'Made with AI' labels on Instagram, Facebook, and Pinterest.", badge: "C2PA" },
    { icon: Cpu, title: "Stable Diffusion Parameters", description: "Strips prompts, seeds, CFG scale, sampler, and model hash from Automatic1111, ComfyUI, and Forge outputs.", badge: "SD" },
    { icon: Image, title: "AI Generator Signatures", description: "Removes fingerprints from DALL-E, MidJourney, Adobe Firefly, Leonardo AI, and all major AI image tools.", badge: "AI" },
    { icon: Hash, title: "Pixel-Level Hash Modification", description: "Applies ±1-2 RGB pixel changes — invisible to the eye but completely changes the digital fingerprint and hash.", badge: "HASH" },
    { icon: Layers, title: "PNG Info Chunks", description: "Clears tEXt, iTXt, and zTXt chunks used by Stable Diffusion interfaces to store generation parameters.", badge: "PNG" },
  ];

  const useCases = [
    { icon: Image, title: "Digital Artists & AI Creators", description: "Remove AI signatures from DALL-E, MidJourney, and Stable Diffusion images before sharing on social platforms." },
    { icon: Globe, title: "Social Media Managers", description: "Prepare AI-generated content for Pinterest, Instagram, and Facebook without triggering detection algorithms." },
    { icon: Tag, title: "Print-on-Demand Sellers", description: "Clean metadata from AI artwork before uploading to Etsy, Amazon Merch, Redbubble, or other POD platforms." },
    { icon: FileText, title: "Bloggers & Content Marketers", description: "Use AI-generated images in blog posts and marketing materials without metadata revealing their AI origins." },
    { icon: Users, title: "Businesses & Agencies", description: "Protect brand image by ensuring AI-generated content appears natural and professional across all channels." },
    { icon: Lock, title: "Privacy-Conscious Users", description: "Remove GPS location data and camera information from all your photos before sharing online." },
  ];

  const faqs = [
    {
      q: "Does BlankAI really make AI images undetectable?",
      a: "BlankAI removes both metadata signatures and modifies pixel-level fingerprints that AI detection systems use. Our tool has been tested extensively against Pinterest, Instagram, and other platforms' detection systems. We remove C2PA credentials, EXIF data, AI generator signatures, and apply pixel-level hash modification. While highly effective, platforms continuously update their algorithms — we recommend re-processing images periodically for best results.",
    },
    {
      q: "Is it safe? Are my images uploaded to a server?",
      a: "Completely safe. All processing happens entirely in your browser using the HTML5 Canvas API. Your images never leave your device — they are never uploaded to our servers at any point. We have zero access to your images. This is by design: client-side processing is both faster and more private than server-based tools.",
    },
    {
      q: "What AI image generators does BlankAI support?",
      a: "BlankAI works with all major AI image generators: DALL-E 2 & 3, MidJourney (all versions), Stable Diffusion (Automatic1111, ComfyUI, Forge, InvokeAI), Adobe Firefly, Leonardo AI, Bing Image Creator, and any other tool that embeds metadata or digital signatures in generated images.",
    },
    {
      q: "What metadata does BlankAI remove from AI images?",
      a: "BlankAI removes: EXIF data (camera model, timestamps, software, device IDs), GPS and location tags, XMP and IPTC metadata (creator info, copyright, captions), C2PA content credentials (Adobe's provenance data), Stable Diffusion parameters (prompts, seeds, CFG scale, sampler, model hash), AI generator signatures from DALL-E, MidJourney, Firefly, and PNG info chunks (tEXt, iTXt, zTXt). It also modifies the pixel-level hash/fingerprint.",
    },
    {
      q: "Will removing AI metadata affect image quality?",
      a: "No visible quality loss occurs. Our algorithm applies microscopic pixel changes (±1-2 RGB values) that are completely invisible to the human eye but change the digital fingerprint. We automatically optimize JPEG compression (85-95% quality) to maintain visual fidelity while keeping files under 5MB.",
    },
    {
      q: "How does the AI pixel metadata removal process work?",
      a: "BlankAI uses a 4-step process: (1) Your image is loaded into browser memory via HTML5 File API — no network transmission. (2) The image is rendered onto an HTML5 Canvas, which automatically strips all EXIF, IPTC, XMP metadata and AI-specific signatures. (3) Our algorithm applies microscopic pixel modifications (±1-2 RGB) to change the digital fingerprint. (4) The image is re-encoded as a fresh JPEG with optimized compression, eliminating all AI traces.",
    },
  ];

  const comparisonFeatures = [
    "Client-Side Processing",
    "AI Pixel Fingerprint Removal",
    "Hash Modification",
    "C2PA Credential Removal",
    "Batch Processing (20 images)",
    "No Installation Required",
    "Pinterest & Instagram Optimized",
    "Stable Diffusion Parameter Strip",
    "100% Free",
  ];

  const competitors = [
    { name: "BlankAI", checks: [true, true, true, true, true, true, true, true, true] },
    { name: "ExifCleaner", checks: [true, false, false, false, false, false, false, false, false] },
    { name: "Metadata2Go", checks: [false, false, false, false, false, true, false, false, true] },
    { name: "VerExif", checks: [true, false, false, false, false, true, false, false, true] },
  ];

  return (
    <div className="min-h-screen bg-background hex-grid-bg">
      {/* ── Navigation ── */}
      <SiteHeader showAnchorLinks />

      {/* ── Hero Section ── */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310419663030568626/8ywQyTwM8J3DhQPbxGgFvw/blankai-hero-bg-Qxshpx7MkYGSroMPBZDNoP.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/85" />
        
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-mono-custom mb-6">
              <Shield className="w-3 h-3" />
              <span>100% Client-Side · Zero Uploads · Trusted by 50,000+ Creators</span>
            </div>

            {/* H1 — Primary keyword: remove ai pixel metadata remover undetectable ai image */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6">
              Remove AI Metadata &<br />
              <span className="text-cyan glow-cyan-text">Make Images Undetectable</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              BlankAI strips <strong className="text-foreground">EXIF, GPS, C2PA, and AI pixel fingerprints</strong> from your images in seconds.
              The most advanced free AI metadata remover — runs entirely in your browser, zero server uploads.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {[
                { icon: Lock, label: "No Server Upload" },
                { icon: Zap, label: "Instant Processing" },
                { icon: Layers, label: "Batch 20 Images" },
                { icon: Shield, label: "Pinterest & Instagram Safe" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-cyan" />
                  {label}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#upload"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg gradient-cyan text-navy font-bold text-base hover:opacity-90 transition-opacity animate-pulse-glow"
              >
                <Upload className="w-4 h-4" />
                Remove AI Metadata Free
              </a>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border text-foreground hover:border-cyan/40 hover:bg-muted/20 transition-colors text-base"
              >
                How It Works
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right side: mini upload preview on desktop */}
          <div className="hidden lg:block">
            <div className="bg-card/60 backdrop-blur-sm border border-cyan/20 rounded-2xl p-6 glow-cyan">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-mono-custom text-muted-foreground ml-2">blankai.app — AI Metadata Remover</span>
              </div>
              <UploadZone />
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3 text-cyan" />
                <span>Zero server uploads · 100% browser-based</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div ref={statsSection.ref} className="border-y border-border bg-card/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <StatCard value={50000} suffix="+" label="Images Cleaned" started={statsStarted} />
            <StatCard value={99} suffix="%" label="Detection Bypass Rate" started={statsStarted} />
            <StatCard value={8} suffix="" label="Metadata Types Removed" started={statsStarted} />
            <StatCard value={0} suffix="ms" label="Server Upload Time" started={statsStarted} />
          </div>
        </div>
      </div>

      {/* ── Tool Matrix Banner ── */}
      <div className="border-b border-border bg-card/30">
        <div className="container py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono-custom text-cyan/60 mr-1">TOOLS:</span>
            <a
              href="#upload"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan font-medium hover:bg-cyan/15 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v8M4 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" strokeLinecap="round" />
              </svg>
              AI Metadata Remover
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-cyan/20 text-[9px] font-bold">FREE</span>
            </a>
            <span className="text-border">·</span>
            <a
              href="/image-diff"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-cyan/30 hover:text-cyan transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="6" height="10" rx="1" />
                <rect x="9" y="3" width="6" height="10" rx="1" />
                <path d="M7 8h2" strokeLinecap="round" />
              </svg>
              Image Diff Tool
            </a>
            <span className="ml-auto text-[10px] text-muted-foreground/50 hidden sm:block">blankai.app</span>
          </div>
        </div>
      </div>

      {/* ── Upload Tool Section ── */}
      <section id="upload" className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Strip AI Metadata from Your Images
            </h2>
            <p className="text-muted-foreground text-base">
              Free AI pixel metadata remover — no account required, no uploads to servers.
              Remove EXIF, C2PA, and AI fingerprints instantly.
            </p>
          </div>
          <UploadZone />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3 text-cyan" />
            <span>Your images never leave your device. All processing happens in your browser.</span>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── What We Remove Section ── */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              COMPLETE METADATA REMOVAL
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Every AI Metadata Type — Removed
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              BlankAI is the most comprehensive AI metadata remover available. We strip every type of embedded data
              that can identify your images as AI-generated or compromise your privacy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
                <span className="w-6 h-px bg-cyan" />
                4-STEP PROCESS
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                How BlankAI Removes AI Pixel Metadata
              </h2>
              <p className="text-muted-foreground text-base mb-8">
                Our advanced algorithm removes all AI traces from your images in under 2 seconds — entirely in your browser. No server, no queue, no waiting.
              </p>
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Upload Your AI Image",
                    desc: "Your image is loaded directly into browser memory via HTML5 File API. No network transmission — everything stays on your device.",
                  },
                  {
                    step: "02",
                    title: "Canvas Processing Strips Metadata",
                    desc: "The image renders onto an HTML5 Canvas, automatically stripping all EXIF, IPTC, XMP metadata, C2PA credentials, and AI-specific signatures in one operation.",
                  },
                  {
                    step: "03",
                    title: "AI Pixel Fingerprint Removal",
                    desc: "Our algorithm applies microscopic changes to pixel values (±1-2 RGB) — invisible to the human eye but completely changing the image's digital fingerprint.",
                  },
                  {
                    step: "04",
                    title: "Download Undetectable Image",
                    desc: "The processed image is encoded as a fresh JPEG with optimized compression (85-95% quality). All AI metadata traces eliminated, ready for any platform.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="font-mono-custom text-3xl font-bold text-cyan/20 leading-none w-12 flex-shrink-0 pt-0.5">{step}</div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030568626/8ywQyTwM8J3DhQPbxGgFvw/blankai-process-visual-hhKuwaWRNPYMvwN9oyzQFA.webp"
                alt="BlankAI process: removing AI metadata and pixel fingerprints from images"
                className="w-full rounded-xl border border-border"
                loading="lazy"
                width="600"
                height="450"
              />
              <div className="absolute -bottom-4 -right-4 bg-card border border-cyan/20 rounded-xl p-4 shadow-xl glow-cyan">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-display font-bold text-foreground text-sm">Undetectable</div>
                    <div className="text-muted-foreground text-xs font-mono-custom">All AI traces removed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── Use Cases ── */}
      <section id="use-cases" className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              WHO USES BLANKAI
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perfect for Content Creators & Businesses
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              Whether you're a digital artist, social media manager, or privacy-conscious user, BlankAI gives you full control over your image metadata.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.title} {...uc} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── Comparison Table ── */}
      <section id="comparison" className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              TOOL COMPARISON
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why BlankAI is the Best AI Metadata Remover
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              See how BlankAI compares to other metadata removal tools. We're the only tool that removes AI pixel fingerprints at the hash level.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm" role="table" aria-label="AI metadata remover tool comparison">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-display font-semibold text-foreground">Feature</th>
                  {comparisonFeatures.length > 0 && competitors.map((c) => (
                    <th key={c.name} className={`text-center p-4 font-display font-semibold ${c.name === "BlankAI" ? "text-cyan" : "text-muted-foreground"}`}>
                      {c.name === "BlankAI" && <span className="block text-xs font-mono-custom text-cyan/60 mb-0.5">★ Best</span>}
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, fi) => (
                  <tr key={feature} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-foreground font-medium">{feature}</td>
                    {competitors.map((c) => (
                      <td key={c.name} className="p-4 text-center">
                        {c.checks[fi] ? (
                          <Check className={`w-5 h-5 mx-auto ${c.name === "BlankAI" ? "text-cyan" : "text-green-500/60"}`} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-muted-foreground/30" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── Trust Signals ── */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                badge: "SECURE",
                title: "100% Client-Side Processing",
                desc: "Your images never leave your device. All AI metadata removal happens in your browser for maximum privacy and security.",
              },
              {
                icon: Zap,
                badge: "FAST",
                title: "Instant AI Metadata Removal",
                desc: "Process images in under 2 seconds with our optimized Canvas API algorithm. No waiting, no queues, no server round-trips.",
              },
              {
                icon: Star,
                badge: "FREE",
                title: "Free AI Pixel Remover",
                desc: "Core functionality is completely free. Remove AI metadata from up to 20 images at once without any hidden costs or subscriptions.",
              },
            ].map(({ icon: Icon, badge, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 card-hover text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-mono-custom mb-4">
                  {badge}
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-cyan" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── Platform Compatibility ── */}
      <section className="py-16">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
            <span className="w-6 h-px bg-cyan" />
            PLATFORM COMPATIBILITY
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Compatible with All Major Platforms
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-xl mx-auto">
            Clean your AI-generated images before uploading to any platform that may flag or restrict AI content.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Pinterest", "Instagram", "Facebook", "Etsy", "Amazon Merch", "Redbubble", "TikTok", "Twitter/X", "LinkedIn", "Shopify"].map((platform) => (
              <div key={platform} className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:border-cyan/30 hover:text-foreground transition-colors">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-20">
        <div className="container max-w-3xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything About AI Metadata Removal
            </h2>
            <p className="text-muted-foreground text-base">
              Common questions about removing AI pixel metadata, making images undetectable, and how BlankAI works.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── Testimonials ── */}
      <TestimonialsSection />

      <div className="section-divider container" />

      {/* ── Blog / SEO Content ── */}
      <BlogSection />

      {/* ── Waitlist / API CTA ── */}
      <WaitlistSection />

      {/* ── CTA Section ── */}
      <section className="py-20">
        <div className="container text-center max-w-2xl">
          <div
            className="rounded-2xl p-12 border border-cyan/20 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, oklch(0.15 0.025 240), oklch(0.12 0.03 200))",
            }}
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310419663030568626/8ywQyTwM8J3DhQPbxGgFvw/blankai-hero-bg-Qxshpx7MkYGSroMPBZDNoP.webp)`,
              backgroundSize: "cover",
            }} />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl gradient-cyan flex items-center justify-center mx-auto mb-6">
                <EyeOff className="w-7 h-7 text-navy" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Make Your AI Images Undetectable
              </h2>
              <p className="text-muted-foreground text-base mb-8">
                Join 50,000+ creators using BlankAI to remove AI metadata and pixel fingerprints.
                Free, instant, and 100% private.
              </p>
              <a
                href="#upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-cyan text-navy font-bold text-base hover:opacity-90 transition-opacity animate-pulse-glow"
              >
                <Upload className="w-5 h-5" />
                Remove AI Metadata Free — No Signup
              </a>
              <p className="text-muted-foreground text-xs mt-4 font-mono-custom">
                No account required · No server uploads · Supports JPG, PNG, WebP, AVIF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
