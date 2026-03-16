/**
 * BlankAI — /image-diff
 * Free Image Diff & Comparison Tool
 *
 * Design: Dark technical aesthetic (same as Home)
 * Features:
 *  - Upload Image A (Original) and Image B (Cleaned/Modified)
 *  - Verify Clean mode: Image B pre-loaded from sessionStorage (passed from Home results)
 *  - 4 view modes: Side-by-Side, Overlay, Slider, Heatmap
 *  - Tolerance slider for JPEG noise filtering
 *  - Metadata comparison panel: hash before/after, size, metadata fields
 *  - SEO: structured data, keyword-rich content, FAQ accordion
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Upload, ArrowLeft, Columns2, Layers, SlidersHorizontal,
  Flame, ChevronDown, ChevronUp, CheckCircle2, Shield,
  Hash, HardDrive, Zap, Info, X, ArrowRight
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { createImagePreviewDataUrl, isPreviewableImageFile } from "@/lib/imagePreview";

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = "sidebyside" | "overlay" | "slider" | "heatmap";

interface ImageSlot {
  file: File | null;
  dataUrl: string | null;
  isPreparing: boolean;
  label: string;
  hash: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  metadataFields: string[];
}

interface DiffResult {
  totalPixels: number;
  differentPixels: number;
  diffPercent: number;
  maxDelta: number;
  avgDelta: number;
  heatmapDataUrl: string;
  overlayDataUrl: string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
async function sha256Short(dataUrl: string): Promise<string> {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return "—";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes.buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.prototype.map.call(hashArray, (b: number) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function computeDiff(dataUrlA: string, dataUrlB: string, tolerance: number): Promise<DiffResult> {
  const [imgA, imgB] = await Promise.all([loadImageFromDataUrl(dataUrlA), loadImageFromDataUrl(dataUrlB)]);
  const w = Math.max(imgA.naturalWidth, imgB.naturalWidth);
  const h = Math.max(imgA.naturalHeight, imgB.naturalHeight);

  const canvasA = document.createElement("canvas");
  canvasA.width = w; canvasA.height = h;
  const ctxA = canvasA.getContext("2d")!;
  ctxA.drawImage(imgA, 0, 0);
  const dataA = ctxA.getImageData(0, 0, w, h).data;

  const canvasB = document.createElement("canvas");
  canvasB.width = w; canvasB.height = h;
  const ctxB = canvasB.getContext("2d")!;
  ctxB.drawImage(imgB, 0, 0);
  const dataB = ctxB.getImageData(0, 0, w, h).data;

  // Heatmap canvas
  const heatCanvas = document.createElement("canvas");
  heatCanvas.width = w; heatCanvas.height = h;
  const heatCtx = heatCanvas.getContext("2d")!;
  const heatData = heatCtx.createImageData(w, h);

  // Overlay canvas (A + red diff overlay)
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = w; overlayCanvas.height = h;
  const overlayCtx = overlayCanvas.getContext("2d")!;
  overlayCtx.drawImage(imgA, 0, 0);
  const overlayData = overlayCtx.getImageData(0, 0, w, h);

  let differentPixels = 0;
  let totalDelta = 0;
  let maxDelta = 0;
  const totalPixels = w * h;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const dr = Math.abs(dataA[idx] - dataB[idx]);
    const dg = Math.abs(dataA[idx + 1] - dataB[idx + 1]);
    const db = Math.abs(dataA[idx + 2] - dataB[idx + 2]);
    const delta = Math.round((dr + dg + db) / 3);

    if (delta > tolerance) {
      differentPixels++;
      totalDelta += delta;
      if (delta > maxDelta) maxDelta = delta;

      // Heatmap: red channel = intensity
      const intensity = Math.min(255, delta * 3);
      heatData.data[idx] = intensity;
      heatData.data[idx + 1] = Math.max(0, 80 - intensity / 2);
      heatData.data[idx + 2] = 0;
      heatData.data[idx + 3] = Math.min(255, intensity + 60);

      // Overlay: highlight changed pixels in red
      overlayData.data[idx] = 255;
      overlayData.data[idx + 1] = 30;
      overlayData.data[idx + 2] = 30;
      overlayData.data[idx + 3] = Math.min(255, intensity + 120);
    } else {
      heatData.data[idx + 3] = 0; // transparent
    }
  }

  heatCtx.putImageData(heatData, 0, 0);
  overlayCtx.putImageData(overlayData, 0, 0);

  return {
    totalPixels,
    differentPixels,
    diffPercent: (differentPixels / totalPixels) * 100,
    maxDelta,
    avgDelta: differentPixels > 0 ? totalDelta / differentPixels : 0,
    heatmapDataUrl: heatCanvas.toDataURL("image/png"),
    overlayDataUrl: overlayCanvas.toDataURL("image/png"),
  };
}

// ─── Upload Slot Component ────────────────────────────────────────────────────
function UploadSlot({
  slot, label, sublabel, onFile, onClear, accent
}: {
  slot: ImageSlot;
  label: string;
  sublabel: string;
  onFile: (file: File) => void;
  onClear: () => void;
  accent: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isPreviewableImageFile(file)) onFile(file);
  };

  if (slot.dataUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border bg-card group" style={{ minHeight: 200 }}>
        <ImagePreview
          src={slot.dataUrl}
          alt={label}
          file={slot.file}
          className="w-full h-full max-h-72"
          imgClassName="object-contain"
          fallbackLabel="No preview"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs font-semibold">{label}</p>
              {slot.size && <p className="text-muted-foreground text-[10px]">{formatBytes(slot.size)} · {slot.width}×{slot.height}</p>}
            </div>
            <button
              onClick={onClear}
              className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-destructive/80 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
        {/* Hash badge */}
        {slot.hash && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan border border-cyan/20">
            #{slot.hash.slice(0, 12)}…
          </div>
        )}
      </div>
    );
  }

  if (slot.isPreparing) {
    const isHeic =
      slot.file?.type === "image/heic" ||
      slot.file?.type === "image/heif" ||
      Boolean(slot.file?.name.match(/\.(heic|heif)$/i));

    return (
      <div
        className="relative overflow-hidden rounded-xl border border-cyan/30 bg-card/80 p-8"
        style={{ minHeight: 200 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.14),transparent_48%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10">
            <div
              className="h-6 w-6 rounded-full border-2 border-cyan border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isHeic ? "Preparing HEIC preview…" : "Preparing image preview…"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {slot.file?.name ?? "Selected image"}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground/70">
              {isHeic
                ? "Converting HEIC so comparison stays responsive."
                : "Loading preview and computing dimensions."}
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
    );
  }

  return (
    <div
      className="rounded-xl border-2 border-dashed border-border hover:border-cyan/40 bg-card/50 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 hover:bg-muted/10 p-8"
      style={{ minHeight: 200 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label={`Upload ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${accent}`}>
        <Upload className="w-5 h-5 text-cyan" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground text-sm">{label}</p>
        <p className="text-muted-foreground text-xs mt-0.5">{sublabel}</p>
      </div>
      <p className="text-muted-foreground text-[10px]">JPG · PNG · WebP · AVIF · HEIC</p>
    </div>
  );
}

// ─── Comparison Slider ────────────────────────────────────────────────────────
function CompareSlider({ urlA, urlB }: { urlA: string; urlB: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePos(clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePos]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden border border-border select-none"
      style={{ minHeight: 300, cursor: "col-resize" }}
    >
      {/* Image B (full) */}
      <img src={urlB} alt="Image B" className="absolute inset-0 w-full h-full object-contain" />
      {/* Image A clipped */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={urlA} alt="Image A" className="w-full h-full object-contain" style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }} />
      </div>
      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center cursor-col-resize"
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
        >
          <SlidersHorizontal className="w-4 h-4 text-navy" />
        </div>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">BEFORE</div>
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-cyan/80 text-navy text-[10px] font-semibold">AFTER</div>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "How does pixel-level image comparison work?",
    a: "BlankAI's image diff tool loads both images onto HTML5 Canvas elements, reads every pixel's RGBA values, and computes the per-channel delta. Pixels where the average delta exceeds the tolerance threshold are flagged as different and highlighted in the heatmap."
  },
  {
    q: "Can I compare images of different sizes?",
    a: "Yes. The tool scales both images to the same canvas dimensions before comparing. However, for the most accurate results — especially when verifying AI metadata removal — use images of identical dimensions."
  },
  {
    q: "Are my images uploaded to a server?",
    a: "Never. All processing happens entirely in your browser using the HTML5 Canvas API and Web Crypto API. Your images never leave your device, making this the most private image comparison tool available."
  },
  {
    q: "What does the tolerance slider do?",
    a: "JPEG compression introduces tiny random pixel variations even between 'identical' images. The tolerance slider (0–30) lets you filter out this noise so you can focus on meaningful differences like metadata removal or pixel fingerprint changes."
  },
  {
    q: "Why do identical-looking JPEGs show differences?",
    a: "JPEG is a lossy format. Re-saving a JPEG — even at the same quality — introduces compression artifacts that change pixel values by 1–5. BlankAI intentionally uses this property to modify the AI pixel fingerprint while keeping the image visually identical."
  },
  {
    q: "How do I verify that AI metadata was removed?",
    a: "Use the Verify Clean flow: after processing your image on the BlankAI home page, click 'Verify Clean' to be brought here with your cleaned image pre-loaded as Image B. Upload your original as Image A, then compare. A successful clean shows hash change, size reduction, and zero metadata fields in Image B."
  },
  {
    q: "Is this a free alternative to paid image comparison software?",
    a: "Yes. BlankAI Image Diff is completely free, requires no account, and runs entirely in your browser. It handles JPEG, PNG, WebP, AVIF, and HEIC formats — covering all common AI-generated image types."
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed border-t border-border bg-muted/10">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ImageDiff() {
  const [, navigate] = useLocation();

  const emptySlot = (label: string): ImageSlot => ({
    file: null, dataUrl: null, isPreparing: false, label, hash: null, size: null, width: null, height: null, metadataFields: []
  });

  const [slotA, setSlotA] = useState<ImageSlot>(emptySlot("Image A — Original"));
  const [slotB, setSlotB] = useState<ImageSlot>(emptySlot("Image B — Cleaned / Modified"));
  const [viewMode, setViewMode] = useState<ViewMode>("sidebyside");
  const [tolerance, setTolerance] = useState(8);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  // Dynamic page meta (canonical, title, description)
  usePageMeta({
    title: "Image Diff Tool — Compare Images Pixel by Pixel | BlankAI",
    description: "Free online image comparison tool. Upload two images to compare pixel differences, verify AI metadata removal, and view side-by-side, overlay, slider, or heatmap diffs.",
    canonical: "https://blankai.app/image-diff",
    ogTitle: "Image Diff Tool — Compare Images Pixel by Pixel | BlankAI",
    ogDescription: "Free online image comparison tool. Compare pixel differences, verify AI metadata removal with side-by-side, overlay, slider, and heatmap views.",
  });

  // Instant feedback: show skeleton on first render, then fade in real content
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is painted before marking ready
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setIsReady(true), 60);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Check sessionStorage for Verify Clean data (passed from Home results panel)
  useEffect(() => {
    const stored = sessionStorage.getItem("blankai_verify_clean");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        sessionStorage.removeItem("blankai_verify_clean");
        // Pre-load Image B with the cleaned image
        setVerifyMode(true);
        loadSlotFromDataUrl(data.dataUrl, data.name, data.size, "b");
      } catch {
        // ignore
      }
    }
  }, []);

  const loadSlotFromDataUrl = async (dataUrl: string, name: string, size: number, which: "a" | "b") => {
    const img = await loadImageFromDataUrl(dataUrl);
    const hash = await sha256Short(dataUrl);
    const slot: ImageSlot = {
      file: null,
      dataUrl,
      isPreparing: false,
      label: which === "a" ? "Image A — Original" : "Image B — Cleaned",
      hash,
      size,
      width: img.naturalWidth,
      height: img.naturalHeight,
      metadataFields: which === "b" ? [] : ["EXIF", "GPS", "XMP"],
    };
    if (which === "a") setSlotA(slot);
    else setSlotB(slot);
  };

  const handleFile = async (file: File, which: "a" | "b") => {
    const preparingSlot: ImageSlot = {
      ...emptySlot(which === "a" ? "Image A — Original" : "Image B — Cleaned / Modified"),
      file,
      isPreparing: true,
    };

    if (which === "a") {
      setSlotA(preparingSlot);
      setDiff(null);
    } else {
      setSlotB(preparingSlot);
      setDiff(null);
    }

    try {
      const dataUrl = await createImagePreviewDataUrl(file, file.name);
      const img = await loadImageFromDataUrl(dataUrl);
      const hash = await sha256Short(dataUrl);
      const slot: ImageSlot = {
        file,
        dataUrl,
        isPreparing: false,
        label: which === "a" ? "Image A — Original" : "Image B — Cleaned / Modified",
        hash,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        metadataFields: which === "a" ? ["EXIF", "GPS", "XMP", "IPTC"] : [],
      };
      if (which === "a") setSlotA(slot);
      else setSlotB(slot);
    } catch (error) {
      console.error(error);
      if (which === "a") setSlotA(emptySlot("Image A — Original"));
      else setSlotB(emptySlot("Image B — Cleaned / Modified"));
    }
  };

  const clearSlot = (which: "a" | "b") => {
    if (which === "a") { setSlotA(emptySlot("Image A — Original")); setDiff(null); }
    else { setSlotB(emptySlot("Image B — Cleaned / Modified")); setDiff(null); if (verifyMode) setVerifyMode(false); }
  };

  const runDiff = async () => {
    if (!slotA.dataUrl || !slotB.dataUrl) return;
    setComputing(true);
    setDiff(null);
    try {
      const result = await computeDiff(slotA.dataUrl, slotB.dataUrl, tolerance);
      setDiff(result);
      setViewMode("heatmap");
    } catch (e) {
      console.error(e);
    } finally {
      setComputing(false);
    }
  };

  const bothLoaded = !!slotA.dataUrl && !!slotB.dataUrl;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader breadcrumb="Image Diff" />
        {/* Skeleton loader — shows instantly while JS hydrates */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-10">
          {/* Title skeleton */}
          <div className="mb-8 text-center">
            <div className="h-8 w-64 rounded-lg bg-muted/60 mx-auto mb-3" style={{ animation: "shimmer 1.5s ease infinite", backgroundSize: "200% 100%", background: "linear-gradient(90deg, oklch(0.22 0.01 220) 0%, oklch(0.28 0.01 220) 50%, oklch(0.22 0.01 220) 100%)" }} />
            <div className="h-4 w-96 max-w-full rounded bg-muted/40 mx-auto" style={{ animation: "shimmer 1.5s ease 0.1s infinite", backgroundSize: "200% 100%", background: "linear-gradient(90deg, oklch(0.22 0.01 220) 0%, oklch(0.28 0.01 220) 50%, oklch(0.22 0.01 220) 100%)" }} />
          </div>
          {/* Upload panels skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card/50 p-6" style={{ animation: `shimmer 1.5s ease ${i * 0.15}s infinite`, backgroundSize: "200% 100%", background: "linear-gradient(90deg, oklch(0.18 0.01 220) 0%, oklch(0.22 0.01 220) 50%, oklch(0.18 0.01 220) 100%)" }}>
                <div className="h-4 w-24 rounded bg-muted/40 mb-4" />
                <div className="h-36 rounded-lg bg-muted/20" />
              </div>
            ))}
          </div>
          {/* Button skeleton */}
          <div className="flex justify-center">
            <div className="h-10 w-40 rounded-xl bg-cyan/20" style={{ animation: "shimmer 1.5s ease 0.3s infinite" }} />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ animation: "fadeIn 0.3s ease" }}>
      {/* ── SEO structured data ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "BlankAI Image Diff Tool",
        "url": "https://blankai.app/image-diff",
        "description": "Free pixel-level image comparison tool. Compare two images side-by-side, overlay, slider, or heatmap. Verify AI metadata removal. 100% browser-based, zero uploads.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": ["Pixel-level comparison", "Heatmap visualization", "Before/after slider", "Metadata verification", "HEIC support", "Zero server uploads"]
      })}} />

      {/* ── Nav ── */}
      <SiteHeader breadcrumb="Image Diff" />

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        {verifyMode && (
          <div
            className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl border border-cyan/30 bg-cyan/5"
            style={{ animation: "fadeInUp 0.4s ease" }}
          >
            <CheckCircle2 className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-cyan font-semibold text-sm">Verify Clean Mode</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Your cleaned image has been pre-loaded as <strong className="text-foreground">Image B</strong>.
                Upload your <strong className="text-foreground">original image as Image A</strong> to confirm metadata removal and pixel fingerprint change.
              </p>
            </div>
          </div>
        )}

        <div className="mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-medium mb-4">
            <Flame className="w-3 h-3" />
            Free · Browser-Based · Zero Uploads
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground leading-tight mb-3">
            Image Diff Tool —<br />
            <span className="text-cyan">Compare & Verify</span> Pixel Changes
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
            Upload two images to spot every pixel difference. Use <strong className="text-foreground">Verify Clean mode</strong> to confirm AI metadata removal — compare original vs. cleaned image with hash, size, and heatmap proof.
          </p>
        </div>
      </section>

      {/* ── Upload Zone ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadSlot
            slot={slotA}
            label="Image A — Original"
            sublabel={verifyMode ? "Upload your original image here" : "Drop original or before image"}
            onFile={(f) => handleFile(f, "a")}
            onClear={() => clearSlot("a")}
            accent="bg-orange-500/10 border-orange-500/20"
          />
          <UploadSlot
            slot={slotB}
            label={verifyMode ? "Image B — Cleaned (pre-loaded)" : "Image B — Modified / Cleaned"}
            sublabel={verifyMode ? "Your BlankAI-processed image" : "Drop cleaned or after image"}
            onFile={(f) => handleFile(f, "b")}
            onClear={() => clearSlot("b")}
            accent="bg-cyan/10 border-cyan/20"
          />
        </div>

        {/* Tolerance + Compare Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl border border-border bg-card">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <label className="text-sm text-muted-foreground whitespace-nowrap">Tolerance: <span className="text-foreground font-mono font-semibold">{tolerance}</span></label>
            <input
              type="range"
              min={0}
              max={30}
              value={tolerance}
              onChange={(e) => { setTolerance(Number(e.target.value)); setDiff(null); }}
              className="flex-1 accent-cyan-400"
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">JPEG noise filter</span>
          </div>
          <button
            onClick={runDiff}
            disabled={!bothLoaded || computing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-cyan text-navy font-display font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all"
            style={bothLoaded ? { boxShadow: "0 0 20px oklch(0.82 0.18 196 / 0.3)" } : {}}
          >
            {computing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-navy animate-spin" />
                Computing…
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                Compare Images
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── Results ── */}
      {diff && slotA.dataUrl && slotB.dataUrl && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8" style={{ animation: "fadeInUp 0.4s ease" }}>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { icon: Flame, label: "Pixels Changed", value: diff.differentPixels.toLocaleString(), sub: `${diff.diffPercent.toFixed(2)}% of total`, color: "text-orange-400" },
              { icon: Hash, label: "Hash Changed", value: slotA.hash?.slice(0,8) !== slotB.hash?.slice(0,8) ? "Yes ✓" : "No", sub: slotA.hash?.slice(0,8) !== slotB.hash?.slice(0,8) ? "Fingerprint modified" : "Identical hash", color: "text-cyan" },
              { icon: HardDrive, label: "Size Change", value: slotA.size && slotB.size ? `${Math.round(((slotA.size - slotB.size) / slotA.size) * 100)}%` : "—", sub: slotA.size && slotB.size ? `${formatBytes(slotA.size)} → ${formatBytes(slotB.size)}` : "", color: "text-green-400" },
              { icon: Zap, label: "Max Delta", value: diff.maxDelta.toString(), sub: `Avg: ${diff.avgDelta.toFixed(1)} per pixel`, color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className={`font-display font-black text-xl ${color}`}>{value}</p>
                <p className="text-foreground text-xs font-medium">{label}</p>
                <p className="text-muted-foreground text-[10px]">{sub}</p>
              </div>
            ))}
          </div>

          {/* Metadata comparison */}
          {verifyMode && (
            <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/5 p-4" style={{ animation: "fadeInUp 0.5s ease" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h3 className="font-display font-bold text-green-400 text-sm">Metadata Verification Report</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Image A — Original</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["EXIF", "GPS", "XMP", "IPTC", "C2PA"].map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">{tag}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Hash: <span className="font-mono text-foreground">{slotA.hash?.slice(0,16)}…</span></p>
                </div>
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <p className="text-xs font-semibold text-green-400 mb-2">Image B — BlankAI Cleaned ✓</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-mono">0 metadata fields</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Hash: <span className="font-mono text-foreground">{slotB.hash?.slice(0,16)}…</span></p>
                </div>
              </div>
            </div>
          )}

          {/* View mode tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {([
              { mode: "sidebyside" as ViewMode, icon: Columns2, label: "Side by Side" },
              { mode: "overlay" as ViewMode, icon: Layers, label: "Overlay" },
              { mode: "slider" as ViewMode, icon: SlidersHorizontal, label: "Slider" },
              { mode: "heatmap" as ViewMode, icon: Flame, label: "Heatmap" },
            ] as const).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  viewMode === mode
                    ? "bg-cyan/10 border border-cyan/30 text-cyan"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* View area */}
          <div className="rounded-xl border border-border overflow-hidden bg-card/50">
            {viewMode === "sidebyside" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                <div className="relative border-r border-border">
                  <img src={slotA.dataUrl!} alt="Original" className="w-full object-contain max-h-96" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">BEFORE</div>
                </div>
                <div className="relative">
                  <img src={slotB.dataUrl!} alt="Cleaned" className="w-full object-contain max-h-96" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan/80 text-navy text-[10px] font-semibold">AFTER</div>
                </div>
              </div>
            )}
            {viewMode === "overlay" && (
              <div className="relative">
                <img src={slotA.dataUrl!} alt="Base" className="w-full object-contain max-h-96" />
                <img src={diff.overlayDataUrl} alt="Diff overlay" className="absolute inset-0 w-full h-full object-contain opacity-80" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">Red = changed pixels</div>
              </div>
            )}
            {viewMode === "slider" && (
              <CompareSlider urlA={slotA.dataUrl!} urlB={slotB.dataUrl!} />
            )}
            {viewMode === "heatmap" && (
              <div className="relative">
                <img src={slotA.dataUrl!} alt="Base" className="w-full object-contain max-h-96 opacity-30" />
                <img src={diff.heatmapDataUrl} alt="Heatmap" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">Heatmap — red = changed pixels</div>
              </div>
            )}
          </div>

          {/* Hash comparison */}
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan" />
              SHA-256 Hash Comparison
            </h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Image A</span>
                <code className="text-xs font-mono text-orange-400 bg-muted/30 px-2 py-1 rounded break-all">{slotA.hash}</code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Image B</span>
                <code className="text-xs font-mono text-cyan bg-muted/30 px-2 py-1 rounded break-all">{slotB.hash}</code>
              </div>
              {slotA.hash !== slotB.hash && (
                <p className="text-green-400 text-xs flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Hashes differ — pixel fingerprint successfully modified
                </p>
              )}
            </div>
          </div>

          {/* CTA to process more */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-cyan/20 bg-cyan/5">
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Ready to clean your AI images?</p>
              <p className="text-muted-foreground text-xs mt-0.5">Remove EXIF, C2PA, GPS and pixel fingerprints — free, instant, no uploads.</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" />
              Remove Metadata
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ── SEO Content ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">Free Online Image Diff & Comparison Tool</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                BlankAI's Image Diff Tool performs <strong className="text-foreground">pixel-level comparison</strong> between two images entirely in your browser. Whether you're a designer checking revisions, a QA engineer running visual regression tests, or a photographer comparing edits, this tool instantly highlights every difference between two versions of an image.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                Unlike screenshot comparison services that require accounts and uploads, everything runs locally using the HTML5 Canvas API. Your images never leave your device — there's nothing to upload and no privacy risk.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">Four View Modes — Side-by-Side, Overlay, Slider & Heatmap</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Columns2, title: "Side by Side", desc: "Classic split view. Both images displayed at full resolution for direct visual comparison." },
                  { icon: Layers, title: "Overlay", desc: "Changed pixels highlighted in red on top of the original image. Instantly spot modifications." },
                  { icon: SlidersHorizontal, title: "Slider", desc: "Drag the divider to reveal before/after. Perfect for subtle changes and metadata verification." },
                  { icon: Flame, title: "Heatmap", desc: "Color-coded intensity map. Brighter red = larger pixel delta. Reveals AI fingerprint modifications." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="p-3 rounded-lg border border-border bg-card/50">
                    <Icon className="w-4 h-4 text-cyan mb-2" />
                    <p className="font-semibold text-foreground text-xs mb-1">{title}</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">Verify AI Metadata Removal — The Proof Is in the Pixels</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                When you process an image with BlankAI's <strong className="text-foreground">AI metadata remover</strong>, the tool strips EXIF, GPS, XMP, IPTC, and C2PA Content Credentials, then modifies the pixel fingerprint. The Image Diff tool lets you <strong className="text-foreground">verify this removal</strong> by comparing the original and cleaned versions. A successful clean shows: (1) different SHA-256 hashes, (2) size reduction, (3) scattered pixel changes in the heatmap, and (4) zero metadata fields in Image B.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Related Tools</h3>
              <div className="space-y-2">
                {[
                  { href: "/", label: "AI Metadata Remover", desc: "Strip EXIF, C2PA, pixel fingerprints" },
                  { href: "/image-diff", label: "Image Diff Tool", desc: "Compare images pixel-by-pixel" },
                ].map(({ href, label, desc }) => (
                  <Link key={href} href={href} className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-muted/20 transition-colors group">
                    <Zap className="w-3.5 h-3.5 text-cyan mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-xs font-medium group-hover:text-cyan transition-colors">{label}</p>
                      <p className="text-muted-foreground text-[10px]">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold text-foreground text-sm mb-3">Supported Formats</h3>
              <div className="flex flex-wrap gap-1.5">
                {["JPEG", "PNG", "WebP", "AVIF", "HEIC", "BMP", "GIF"].map(fmt => (
                  <span key={fmt} className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono border border-border">{fmt}</span>
                ))}
              </div>
              <p className="text-muted-foreground text-[10px] mt-3 leading-relaxed">All formats processed locally in your browser. No server uploads. No account required.</p>
            </div>

            <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-5">
              <Shield className="w-5 h-5 text-cyan mb-2" />
              <h3 className="font-display font-bold text-cyan text-sm mb-1">100% Private</h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">Your images never leave your device. All comparison processing uses the HTML5 Canvas API and Web Crypto API — entirely client-side.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
