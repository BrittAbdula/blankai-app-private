/**
 * ExifViewer.tsx — BlankAI EXIF Viewer Tool
 *
 * Design: Dark Technical Aesthetic (consistent with BlankAI design system)
 * - Deep navy background, electric cyan accents
 * - Space Grotesk display + Inter body
 * - Asymmetric layout: sidebar category nav + main content panel
 * - Risk indicators: color-coded badges (high/medium/low/none)
 * - Export: JSON + CSV download
 * - SEO: full meta, canonical, structured data, FAQ section
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import {
  Upload, File, Camera, MapPin, Clock, FileText, Layers, Palette,
  Image, Cpu, AlertTriangle, Shield, Download, RefreshCw,
  ChevronDown, ChevronRight, ExternalLink, Zap, Copy, Check,
  Eye, Info, X, Search
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { extractExif, type ExifResult, type MetaGroup } from "@/lib/exifReader";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  File: <File className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  MapPin: <MapPin className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Aperture: <Eye className="w-4 h-4" />,
};

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: MetaGroup["riskLevel"] }) {
  if (level === "none") return null;
  const map = {
    high: "bg-red-500/15 text-red-400 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const label = { high: "High Risk", medium: "Medium Risk", low: "Low Risk" };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${map[level]}`}>
      <AlertTriangle className="w-2.5 h-2.5" />
      {label[level]}
    </span>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
      title="Copy value"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ─── Metadata group panel ─────────────────────────────────────────────────────
function GroupPanel({ group, isActive }: { group: MetaGroup; isActive: boolean }) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = search
    ? group.fields.filter(f =>
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.value.toLowerCase().includes(search.toLowerCase())
      )
    : group.fields;

  return (
    <div
      id={`group-${group.id}`}
      className={`rounded-xl border transition-all duration-200 ${
        isActive
          ? "border-cyan/40 bg-navy-800/80"
          : "border-border/50 bg-navy-800/40"
      }`}
    >
      {/* Group header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`flex-shrink-0 ${group.color}`}>
            {ICON_MAP[group.icon] ?? <File className="w-4 h-4" />}
          </span>
          <span className="font-semibold text-foreground text-sm truncate">{group.label}</span>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full flex-shrink-0">
            {group.fields.length}
          </span>
          <RiskBadge level={group.riskLevel} />
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Group body */}
      {open && (
        <div className="px-4 pb-4">
          {/* Search within group (only if many fields) */}
          {group.fields.length > 6 && (
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter fields…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/30 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">No fields match your search.</p>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map((field) => (
                <div key={field.key} className="group flex items-start gap-3 py-2.5">
                  <div className="flex-shrink-0 w-36 sm:w-44">
                    <span className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {field.label}
                      {field.sensitive && (
                        <span className="ml-1 text-[9px] text-red-400 font-bold">●</span>
                      )}
                      {field.aiRelated && (
                        <span className="ml-1 text-[9px] text-cyan font-bold">AI</span>
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex items-start gap-1">
                    {field.key === 'maps_link' ? (
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan hover:text-cyan/80 underline underline-offset-2 break-all leading-relaxed flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        Open in Google Maps
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs text-foreground break-all leading-relaxed font-mono-custom">
                        {field.value}
                      </span>
                    )}
                    {field.key !== 'maps_link' && <CopyBtn text={field.value} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Summary risk card ────────────────────────────────────────────────────────
function RiskSummary({ result }: { result: ExifResult }) {
  const totalRisk = result.sensitiveCount + result.aiRelatedCount;
  const level = totalRisk === 0 ? "clean" : totalRisk <= 3 ? "low" : totalRisk <= 8 ? "medium" : "high";

  const config = {
    clean: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", label: "No Sensitive Data", icon: <Shield className="w-5 h-5" /> },
    low: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", label: "Low Risk", icon: <Info className="w-5 h-5" /> },
    medium: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Medium Risk", icon: <AlertTriangle className="w-5 h-5" /> },
    high: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "High Risk — Remove Metadata", icon: <AlertTriangle className="w-5 h-5" /> },
  };
  const c = config[level];

  return (
    <div className={`rounded-xl border p-4 ${c.bg}`}>
      <div className={`flex items-center gap-2 mb-3 ${c.color}`}>
        {c.icon}
        <span className="font-bold text-sm">{c.label}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Fields", value: result.totalFields, color: "text-foreground" },
          { label: "Sensitive", value: result.sensitiveCount, color: result.sensitiveCount > 0 ? "text-red-400" : "text-green-400" },
          { label: "AI Related", value: result.aiRelatedCount, color: result.aiRelatedCount > 0 ? "text-cyan" : "text-green-400" },
          { label: "Categories", value: result.groups.length, color: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {(level === "medium" || level === "high") && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-2">
            This image contains {result.sensitiveCount > 0 ? "sensitive personal data (GPS, device info)" : ""}
            {result.sensitiveCount > 0 && result.aiRelatedCount > 0 ? " and " : ""}
            {result.aiRelatedCount > 0 ? "AI generation metadata" : ""}.
            We recommend removing it before sharing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Zap className="w-3 h-3" />
            Remove All Metadata Free →
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExifViewer() {
  usePageMeta({
    title: "EXIF Viewer — Read Image Metadata Online Free | BlankAI",
    description: "Free online EXIF viewer. Instantly read GPS, camera, AI generation metadata from any image. No upload needed — 100% browser-based.",
    canonical: "https://blankai.app/exif-viewer",
    ogTitle: "EXIF Viewer — Read Image Metadata Online Free | BlankAI",
    ogDescription: "Instantly read GPS, camera, AI generation metadata from any image. Free, browser-based, no server upload.",
  });

  // Add structured data for this tool page
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "exif-viewer-sd";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "BlankAI EXIF Viewer",
          "url": "https://blankai.app/exif-viewer",
          "description": "Free browser-based EXIF metadata viewer. Read GPS, camera settings, AI generation data, IPTC, XMP and more from any image file.",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Read EXIF metadata from JPEG, PNG, WebP, HEIC",
            "GPS coordinates extraction",
            "AI generation metadata detection",
            "Camera settings viewer",
            "IPTC and XMP metadata reader",
            "Export metadata as JSON or CSV",
            "100% browser-based, no server upload"
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is EXIF data?",
              "acceptedAnswer": { "@type": "Answer", "text": "EXIF (Exchangeable Image File Format) data is metadata embedded in image files by cameras and editing software. It can include GPS location, camera model, lens settings, date/time, and even AI generation parameters." }
            },
            {
              "@type": "Question",
              "name": "Is my image uploaded to a server?",
              "acceptedAnswer": { "@type": "Answer", "text": "No. BlankAI EXIF Viewer runs entirely in your browser. Your image never leaves your device. All metadata extraction happens locally using JavaScript." }
            },
            {
              "@type": "Question",
              "name": "Can it detect AI-generated image metadata?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. BlankAI detects C2PA manifests, Stable Diffusion PNG text chunks (prompt, seed, model), Midjourney job IDs, Adobe Firefly tags, and other AI generation signatures." }
            },
            {
              "@type": "Question",
              "name": "How do I remove the metadata after viewing it?",
              "acceptedAnswer": { "@type": "Answer", "text": "Use BlankAI's free AI Metadata Remover tool on the homepage. It strips all EXIF, GPS, C2PA, and AI pixel fingerprints from your images in seconds." }
            }
          ]
        }
      ]
    });
    document.head.appendChild(script);
    return () => { document.getElementById("exif-viewer-sd")?.remove(); };
  }, []);

  const [result, setResult] = useState<ExifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("file");
  const [isReady, setIsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const processFile = useCallback(async (file: File) => {
    const isHeic = file.type === "image/heic" || file.type === "image/heif" ||
      /\.(heic|heif)$/i.test(file.name);
    const isRaw = /\.(dng|cr2|nef|arw|orf|rw2|pef|srw)$/i.test(file.name);

    if (!file.type.startsWith("image/") && !isHeic && !isRaw &&
        !file.name.match(/\.(tiff?|bmp|webp|avif)$/i)) {
      setError("Please upload an image file (JPEG, PNG, WebP, HEIC, TIFF, RAW).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await extractExif(file);
      // If no metadata found at all (not even file info fields beyond the basics)
      if (data.totalFields <= 5 && !data.hasGPS && !data.hasCameraInfo) {
        // Still show result, but with a note
        data.groups[0]?.fields.push({
          key: "_note",
          label: "Note",
          value: isHeic
            ? "HEIC file parsed. Some metadata may require iOS to embed EXIF — try sharing the photo via AirDrop or email first."
            : "Limited metadata found. This image may have been previously cleaned, or metadata may be in a non-standard location.",
        });
      }
      setResult(data);
      // Auto-scroll to GPS group if it has data
      const firstGroup = data.hasGPS ? "gps" : (data.hasCameraInfo ? "camera" : data.groups[0]?.id ?? "file");
      setActiveGroup(firstGroup);
    } catch (e) {
      console.error(e);
      setError(isHeic
        ? "Could not read HEIC metadata. Try converting to JPEG first, or ensure the photo was taken with location services enabled."
        : "Could not read metadata from this file. It may have no EXIF data or be an unsupported format."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  // Export helpers
  const exportJSON = () => {
    if (!result) return;
    const data = JSON.stringify(result.rawAll, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^.]+$/, "")}-metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!result) return;
    const rows = [["Category", "Field", "Value"]];
    for (const group of result.groups) {
      for (const field of group.fields) {
        rows.push([group.label, field.label, field.value.replace(/,/g, ";")]);
      }
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^.]+$/, "")}-metadata.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToGroup = (id: string) => {
    setActiveGroup(id);
    document.getElementById(`group-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader breadcrumb="EXIF Viewer" />
        <div className="pt-16">
          <div className="container py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted/30 rounded-xl w-2/3" />
              <div className="h-5 bg-muted/20 rounded w-1/2" />
              <div className="h-64 bg-muted/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SiteHeader breadcrumb="EXIF Viewer" />

      {/* Hidden file input — always in DOM */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif,.tiff,.tif,.dng,.cr2,.nef,.arw"
        className="hidden"
        onChange={handleChange}
      />

      <main className="pt-16">
        {/* ── Hero ── */}
        <section className="relative py-12 sm:py-16 border-b border-border/30 overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(0,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
          <div className="container relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-cyan transition-colors">BlankAI</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">EXIF Viewer</span>
            </nav>

            <div className="max-w-3xl">
              {/* Tool badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-xs font-semibold mb-4">
                <Eye className="w-3.5 h-3.5" />
                Free Online Tool · No Upload Required
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                EXIF Viewer —{" "}
                <span className="text-cyan">Read Image Metadata</span>{" "}
                Instantly
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                Inspect <strong className="text-foreground">GPS coordinates, camera settings, AI generation data, C2PA manifests,
                IPTC copyright</strong> and 100+ metadata fields from any image. 100% browser-based — your files never leave your device.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mt-5">
                {["JPEG / PNG / WebP", "HEIC / TIFF / RAW", "GPS Coordinates", "AI Metadata Detection", "C2PA / XMP / IPTC", "Export JSON & CSV"].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tool area ── */}
        <section className="py-10">
          <div className="container">
            {!result && !loading && (
              /* Upload zone */
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 p-12 sm:p-16 text-center group ${
                  isDragging
                    ? "border-cyan bg-cyan/5 scale-[1.01]"
                    : "border-border/50 hover:border-cyan/50 hover:bg-cyan/3"
                }`}
              >
                {/* Animated corner accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan/40 rounded-tl" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan/40 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan/40 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan/40 rounded-br" />

                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl gradient-cyan flex items-center justify-center transition-transform group-hover:scale-110 ${isDragging ? "scale-110" : ""}`}>
                    <Upload className="w-7 h-7 text-navy" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      {isDragging ? "Drop to read metadata" : "Drop an image or click to browse"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      JPEG · PNG · WebP · HEIC · TIFF · RAW · AVIF
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {["GPS Location", "Camera Model", "AI Metadata", "IPTC / XMP"].map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-[11px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    🔒 Zero server uploads · 100% private · Runs in your browser
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-[10px] text-muted-foreground">
                      📱 <strong className="text-foreground/70">iPhone users:</strong> Upload directly from Photos app. HEIC photos fully supported — GPS, camera model, and all EXIF fields will be extracted.
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md mx-auto">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {loading && (
              /* Loading state */
              <div className="rounded-2xl border border-border/50 bg-navy-800/40 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl gradient-cyan flex items-center justify-center">
                    <Search className="w-7 h-7 text-navy animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">Reading metadata…</p>
                    <p className="text-sm text-muted-foreground">Parsing EXIF, GPS, XMP, IPTC, C2PA segments</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">HEIC/large files may take a few seconds</p>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-cyan animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && (
              /* Results layout */
              <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out" }}>
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-foreground">
                      {result.fileName}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {result.width && result.height ? `${result.width} × ${result.height} px · ` : ""}
                      {(result.fileSize / 1024).toFixed(1)} KB · {result.fileType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={exportJSON}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-cyan/40 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export JSON
                    </button>
                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-cyan/40 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    <button
                      onClick={reset}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      New File
                    </button>
                  </div>
                </div>

                {/* GPS location banner — shown when GPS data found */}
                {result.hasGPS && result.gpsLat != null && result.gpsLon != null && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <MapPin className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold text-sm">GPS Location Detected</span>
                      </div>
                      <div className="flex-1 font-mono text-xs text-foreground bg-red-500/10 px-3 py-1.5 rounded-lg">
                        {result.gpsLat.toFixed(6)}, {result.gpsLon.toFixed(6)}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`https://maps.google.com/?q=${result.gpsLat.toFixed(7)},${result.gpsLon.toFixed(7)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Map
                        </a>
                        <Link
                          href="/"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          <Zap className="w-3 h-3" />
                          Remove GPS
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk summary */}
                <RiskSummary result={result} />

                {/* Main layout: sidebar + content */}
                <div className="flex gap-6 items-start">
                  {/* Sidebar category nav (desktop) */}
                  <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-20">
                    <p className="text-[10px] font-mono-custom text-muted-foreground/50 uppercase tracking-wider px-2 mb-2">Categories</p>
                    <nav className="space-y-0.5">
                      {result.groups.map(group => (
                        <button
                          key={group.id}
                          onClick={() => scrollToGroup(group.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm transition-all ${
                            activeGroup === group.id
                              ? "bg-cyan/10 text-cyan"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`flex-shrink-0 ${group.color}`}>
                              {ICON_MAP[group.icon] ?? <File className="w-4 h-4" />}
                            </span>
                            <span className="truncate text-xs font-medium">{group.label}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {group.riskLevel !== "none" && (
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                group.riskLevel === "high" ? "bg-red-400" :
                                group.riskLevel === "medium" ? "bg-amber-400" : "bg-blue-400"
                              }`} />
                            )}
                            <span className="text-[10px] text-muted-foreground">{group.fields.length}</span>
                          </div>
                        </button>
                      ))}
                    </nav>

                    {/* Remove CTA in sidebar */}
                    {(result.sensitiveCount > 0 || result.aiRelatedCount > 0) && (
                      <div className="mt-4 p-3 rounded-xl bg-cyan/5 border border-cyan/20">
                        <p className="text-xs text-muted-foreground mb-2">
                          Found {result.sensitiveCount + result.aiRelatedCount} sensitive fields
                        </p>
                        <Link
                          href="/"
                          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg gradient-cyan text-navy text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          <Zap className="w-3 h-3" />
                          Remove All Free
                        </Link>
                      </div>
                    )}
                  </aside>

                  {/* Metadata groups */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {result.groups.map(group => (
                      <GroupPanel
                        key={group.id}
                        group={group}
                        isActive={activeGroup === group.id}
                      />
                    ))}

                    {/* Bottom CTA */}
                    <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-5 mt-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-foreground text-sm mb-1">
                            Want to remove all this metadata?
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            BlankAI strips EXIF, GPS, C2PA, and AI pixel fingerprints in seconds — free, no account needed.
                          </p>
                        </div>
                        <Link
                          href="/"
                          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Remove Metadata Free
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Tool matrix ── */}
        <section className="py-8 border-t border-border/30">
          <div className="container">
            <p className="text-xs text-muted-foreground text-center mb-4">More BlankAI Tools</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: "/", label: "AI Metadata Remover", icon: <Zap className="w-3.5 h-3.5" />, desc: "Strip all metadata" },
                { href: "/image-diff", label: "Image Diff Tool", icon: <Eye className="w-3.5 h-3.5" />, desc: "Compare images" },
                { href: "/exif-viewer", label: "EXIF Viewer", icon: <Search className="w-3.5 h-3.5" />, desc: "Read metadata", active: true },
              ].map(tool => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    tool.active
                      ? "border-cyan/40 bg-cyan/10 text-cyan"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:border-cyan/30 hover:bg-cyan/5"
                  }`}
                >
                  {tool.icon}
                  <div>
                    <div className="font-medium text-xs">{tool.label}</div>
                    <div className="text-[10px] opacity-60">{tool.desc}</div>
                  </div>
                  {tool.active && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan/20 font-bold ml-1">ACTIVE</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEO content: What is EXIF ── */}
        <section className="py-14 border-t border-border/30">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-4">
                  What Is EXIF Data?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  <strong className="text-foreground">EXIF</strong> (Exchangeable Image File Format) is a standard that embeds metadata inside image files. Every time you take a photo with a smartphone or camera, dozens of data fields are silently written into the file — including your exact GPS coordinates, device model, serial number, and timestamp.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Modern AI image generators add their own metadata layer: Stable Diffusion writes the full prompt, seed, and model name into PNG text chunks. Midjourney embeds job IDs. Adobe Firefly and C2PA-compliant tools embed cryptographic manifests that prove AI origin.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  BlankAI's EXIF Viewer lets you inspect all of this data before deciding whether to share an image publicly.
                </p>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-4">
                  What Metadata Can BlankAI Read?
                </h2>
                <div className="space-y-2">
                  {[
                    { label: "GPS & Location", desc: "Latitude, longitude, altitude, speed, direction", risk: "high" },
                    { label: "Camera & Device", desc: "Make, model, lens, serial number, owner name", risk: "medium" },
                    { label: "AI Generation", desc: "Prompts, seeds, models, C2PA, Midjourney IDs", risk: "high" },
                    { label: "Date & Time", desc: "When and where the photo was taken", risk: "low" },
                    { label: "IPTC / Copyright", desc: "Author, caption, keywords, copyright notice", risk: "medium" },
                    { label: "XMP / Adobe", desc: "Editing history, color profiles, ratings", risk: "low" },
                    { label: "Exposure Settings", desc: "ISO, aperture, shutter speed, focal length", risk: "none" },
                    { label: "Color Profile", desc: "ICC profile, color space, bit depth", risk: "none" },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        item.risk === "high" ? "bg-red-400" :
                        item.risk === "medium" ? "bg-amber-400" :
                        item.risk === "low" ? "bg-blue-400" : "bg-muted-foreground"
                      }`} />
                      <div>
                        <span className="text-xs font-semibold text-foreground">{item.label}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14 border-t border-border/30" id="faq">
          <div className="container max-w-3xl">
            <h2 className="font-display font-bold text-2xl text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "Is my image uploaded to a server?",
                  a: "No. BlankAI EXIF Viewer runs entirely in your browser using JavaScript. Your image never leaves your device. All metadata extraction is performed locally — there is no server-side processing."
                },
                {
                  q: "Can it detect AI-generated image metadata?",
                  a: "Yes. BlankAI detects C2PA cryptographic manifests, Stable Diffusion PNG text chunks (prompt, negative prompt, seed, model, sampler, CFG scale), Midjourney job IDs, Adobe Firefly tags, DALL-E generation IDs, and AI-related XMP fields."
                },
                {
                  q: "What image formats are supported?",
                  a: "JPEG, PNG, WebP, HEIC/HEIF, TIFF, AVIF, and most RAW formats (DNG, CR2, NEF, ARW). EXIF data availability depends on the camera or software that created the file."
                },
                {
                  q: "How do I remove the metadata after viewing it?",
                  a: "Use BlankAI's free AI Metadata Remover on the homepage. It strips all EXIF, GPS, C2PA, and AI pixel fingerprints from your images in seconds — no account required."
                },
                {
                  q: "What is a C2PA manifest?",
                  a: "C2PA (Coalition for Content Provenance and Authenticity) is an industry standard that embeds cryptographically signed metadata into images to prove their origin — including whether they were AI-generated. Adobe, Microsoft, Google, and major AI platforms are adopting C2PA. BlankAI can detect and remove these manifests."
                },
                {
                  q: "Can I export the metadata?",
                  a: "Yes. After reading the metadata, you can export it as a JSON file (machine-readable, includes all raw values) or a CSV file (spreadsheet-friendly, organized by category and field name)."
                },
              ].map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-14 border-t border-border/30">
          <div className="container max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              Privacy First
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-3">
              Found metadata you want to remove?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              BlankAI's free metadata remover strips everything — EXIF, GPS, C2PA, AI pixel fingerprints — in seconds. No account, no upload limits, no watermarks.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Zap className="w-4 h-4" />
              Remove Metadata Free — blankai.app
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border/50 bg-navy-800/40 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-sm text-foreground pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}
