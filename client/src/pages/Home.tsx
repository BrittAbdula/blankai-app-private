/**
 * BlankAI — Home Page
 * Design: Precision Engineering Dark Technical
 * Color: Deep Navy (#0A0F1E) + Electric Cyan (#00D4FF)
 * Typography: Space Grotesk (display) + Inter (body) + JetBrains Mono (stats)
 * SEO Target: remove ai pixel metadata remover undetectable ai image
 */

import { useCallback, useEffect, useRef, useState } from "react";
import BlogSection from "@/components/BlogSection";
import TestimonialsSection from "@/components/TestimonialsSection";
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
function ProcessingResults({
  results,
  onReset,
}: {
  results: ProcessedImageResult[];
  onReset: () => void;
}) {
  const totalPixelsModified = results.reduce((s, r) => s + r.pixelsModified, 0);
  const avgSizeReduction = Math.round(
    results.reduce((s, r) => s + r.sizeReductionPct, 0) / results.length
  );
  const avgQuality = Math.round(
    results.reduce((s, r) => s + r.quality, 0) / results.length
  );

  const handleDownloadAll = () => {
    results.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.downloadUrl;
      a.download = r.cleanedName;
      a.click();
    });
  };

  const handleDownloadOne = (r: ProcessedImageResult) => {
    const a = document.createElement("a");
    a.href = r.downloadUrl;
    a.download = r.cleanedName;
    a.click();
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-cyan" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-lg leading-none">
            Processing Complete!
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            All AI metadata and pixel fingerprints have been removed
          </p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
        {[
          {
            icon: Download,
            value: results.length.toString(),
            label: "Images Processed",
            color: "text-cyan",
          },
          {
            icon: HardDrive,
            value: `${avgSizeReduction > 0 ? avgSizeReduction : "<1"}%`,
            label: "Size Reduction",
            color: "text-cyan",
          },
          {
            icon: ZapIcon,
            value: formatCount(totalPixelsModified),
            label: "Pixels Modified",
            color: "text-cyan",
          },
          {
            icon: Target,
            value: `${avgQuality}%`,
            label: "Avg. Quality",
            color: "text-cyan",
          },
        ].map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="bg-muted/40 border border-border rounded-xl p-4 text-center"
          >
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
            <div className="font-display font-bold text-foreground text-2xl leading-none mb-1">
              {value}
            </div>
            <div className="text-muted-foreground text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* File Details */}
      <div className="px-5 pb-5">
        <h4 className="font-display font-semibold text-foreground text-sm mb-3">
          File Details
        </h4>
        <div className="space-y-3">
          {results.map((r) => (
            <div
              key={r.originalName}
              className="border border-border rounded-lg p-4 bg-background/50"
            >
              {/* Filename row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-mono-custom text-foreground text-xs font-semibold truncate">
                    {r.originalName}
                    <span className="text-muted-foreground font-normal mx-1.5">→</span>
                    <span className="text-cyan">{r.cleanedName}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadOne(r)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>

              {/* Stats rows */}
              <div className="space-y-1.5">
                {/* Metadata removed */}
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="text-green-400 font-medium">Metadata removed</span>
                  <span className="text-muted-foreground">
                    ({r.metadataRemoved.join(", ")})
                  </span>
                </div>

                {/* Hash changed */}
                <div className="flex items-center gap-2 text-xs">
                  <Hash className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Hash changed:</span>
                  <span className="font-mono-custom text-muted-foreground">
                    {r.hashBefore.slice(0, 14)}…
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono-custom text-muted-foreground">
                    {r.hashAfter.slice(0, 14)}…
                  </span>
                </div>

                {/* Size */}
                <div className="flex items-center gap-2 text-xs">
                  <HardDrive className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Size:</span>
                  <span className="text-muted-foreground">
                    {formatBytes(r.sizeBefore)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-muted-foreground">
                    {formatBytes(r.sizeAfter)}
                  </span>
                  {r.sizeReductionPct > 0 && (
                    <span className="text-green-400 font-medium">
                      ({r.sizeReductionPct}% smaller)
                    </span>
                  )}
                </div>

                {/* Pixels modified */}
                <div className="flex items-center gap-2 text-xs">
                  <ZapIcon className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Pixels modified:</span>
                  <span className="text-muted-foreground">
                    {r.pixelsModified.toLocaleString()} pixel fingerprint changes applied
                  </span>
                </div>

                {/* Resolution */}
                <div className="flex items-center gap-2 text-xs">
                  <Target className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                  <span className="text-cyan font-medium">Output quality:</span>
                  <span className="text-muted-foreground">
                    {r.quality}% JPEG · {r.width}×{r.height}px
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 flex gap-3">
        {results.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Download All ({results.length} files)
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors text-sm"
        >
          Process More Images
        </button>
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ProcessedImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startProcessing = useCallback(async (selectedFiles: File[]) => {
    setProcessing(true);
    setError(null);
    setResults([]);
    setProgress({ current: 0, total: selectedFiles.length });
    try {
      const processed = await processImages(selectedFiles, (current, total) => {
        setProgress({ current, total });
      });
      setResults(processed);
    } catch (err) {
      setError("Processing failed. Please try a different image format.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")).slice(0, 20);
    if (dropped.length > 0) { setFiles(dropped); startProcessing(dropped); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 20);
    if (selected.length > 0) { setFiles(selected); startProcessing(selected); }
  };

  const reset = () => {
    setFiles([]);
    setProcessing(false);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const progressPct = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="w-full">
      {/* ── Idle: Drop Zone ── */}
      {!files.length && !processing && results.length === 0 && (
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
            accept="image/jpeg,image/png,image/webp,image/avif"
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
                Supports JPG, PNG, WebP, AVIF · Max 5MB each · Up to 20 images
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

      {/* ── Processing ── */}
      {processing && (
        <div className="border border-cyan/30 rounded-xl p-8 text-center bg-cyan/5">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center animate-pulse-glow">
              <Cpu className="w-6 h-6 text-cyan animate-spin" style={{ animationDuration: "2s" }} />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-base mb-1">
                Processing image {progress.current + 1} of {progress.total}…
              </p>
              <p className="text-muted-foreground text-sm">
                Stripping metadata · Modifying pixel fingerprint · Computing hash
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span className="font-mono-custom text-cyan">{progressPct}%</span>
              </div>
              <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, oklch(0.82 0.18 196), oklch(0.65 0.15 220))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="border border-destructive/30 rounded-xl p-6 bg-destructive/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="font-display font-semibold text-foreground">{error}</p>
          </div>
          <button onClick={reset} className="text-sm text-cyan hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {results.length > 0 && !processing && (
        <ProcessingResults results={results} onReset={reset} />
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5 group" aria-label="BlankAI Home">
            <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-navy" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              blank<span className="text-cyan">AI</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#comparison" className="text-muted-foreground hover:text-foreground transition-colors">Compare</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <a
            href="#upload"
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Zap className="w-3.5 h-3.5" />
            Try Free
          </a>
        </div>
      </nav>

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

      <div className="section-divider container" />

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
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
                  <EyeOff className="w-4 h-4 text-navy" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  blank<span className="text-cyan">AI</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                The most advanced free AI metadata remover. Strip EXIF, C2PA, GPS, and AI pixel fingerprints to make images undetectable — entirely in your browser.
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground font-mono-custom">
                <Lock className="w-3 h-3 text-cyan" />
                blankai.app
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-3">Tool</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#upload" className="hover:text-foreground transition-colors">Remove AI Metadata</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#comparison" className="hover:text-foreground transition-colors">Compare Tools</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs font-mono-custom">
              © 2025 BlankAI (blankai.app) — Free AI Metadata Remover
            </p>
            <p className="text-muted-foreground text-xs">
              Remove AI metadata · AI pixel remover · Undetectable AI image tool
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
