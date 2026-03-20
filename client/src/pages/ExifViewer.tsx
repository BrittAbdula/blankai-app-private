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

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Upload, MapPin, FileText, AlertTriangle, Shield, Download, RefreshCw,
  ChevronDown, ChevronRight, ExternalLink, Zap,
  Eye, Info, X, Search
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import MetadataViewerPanel from "@/components/MetadataViewerPanel";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { extractExif, type ExifResult } from "@/lib/exifReader";
import { createImagePreviewDataUrl, fetchPublicFile } from "@/lib/imagePreview";
import {
  buildDisplayMetadataGroups,
  buildMetadataEditDraft,
  createBrowserJpegMetadataWriter,
  normalizeMetadataEditDraft,
  type MetadataEditDraft,
  type MetadataEditKey,
  type MetadataFieldErrors,
  validateMetadataEditDraft,
} from "@/lib/metadataEditor";
import {
  createPendingExifTransferChannel,
  EXIF_TRANSFER_ERROR,
  EXIF_TRANSFER_FILE,
  EXIF_TRANSFER_RECEIVED,
  EXIF_TRANSFER_READY,
  openPendingRemover,
  takePendingExifViewerFile,
} from "@/lib/pendingImageRoute";

function buildGoogleMapsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(7)},${lon.toFixed(7)}`;
}

function buildAppleMapsUrl(lat: number, lon: number) {
  const coord = `${lat.toFixed(7)},${lon.toFixed(7)}`;
  return `https://maps.apple.com/?q=${coord}&ll=${coord}`;
}

const HERO_SAMPLE_PATH = "/sample.HEIC";
const HERO_SAMPLE_PREVIEW_PATH = "/sample.jpg";

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function toReadableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Could not save the edited metadata. Please try again.";
}
// ─── Summary risk card ────────────────────────────────────────────
function RiskSummary({ result, onRemove }: { result: ExifResult; onRemove?: () => void }) {
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
          <button
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Zap className="w-3 h-3" />
            Remove All Metadata Free →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExifViewer() {
  usePageMeta({
    title: "EXIF Viewer — Read & Edit Image Metadata Online Free | BlankAI",
    description: "Free online EXIF viewer and editor. Read GPS, camera, AI generation metadata and save common metadata changes as a new JPEG copy. 100% browser-based.",
    canonical: "https://blankai.app/exif-viewer",
    ogTitle: "EXIF Viewer — Read & Edit Image Metadata Online Free | BlankAI",
    ogDescription: "Read GPS, camera, AI generation metadata and save edited common metadata as a new JPEG copy. Free, browser-based, no server upload.",
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
          "description": "Free browser-based EXIF metadata viewer and editor. Read GPS, camera settings, AI generation data, IPTC, XMP and save common metadata edits as a new JPEG copy.",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Read EXIF metadata from JPEG, PNG, WebP, HEIC",
            "Edit common metadata fields in the browser",
            "Save a new JPEG copy with updated metadata",
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
              "name": "Can I edit the metadata and save a new file?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. BlankAI can edit common metadata fields like title, author, copyright, date/time, camera details, and GPS coordinates, then save the result as a new JPEG copy. Your original file stays unchanged." }
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
  const [isReady, setIsReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<MetadataEditDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<MetadataFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Navigate to home with current file pre-loaded into the metadata remover
  const goToRemover = useCallback((file: File | null) => {
    if (!file) {
      navigate("/#upload");
      return;
    }
    openPendingRemover(file, navigate);
  }, [navigate]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const scrollToResultsArea = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const resultsSection = document.getElementById("exif-tool");
        if (!resultsSection) return;

        const stickyHeaderOffset = 80;
        const nextTop = window.scrollY + resultsSection.getBoundingClientRect().top - stickyHeaderOffset;

        window.scrollTo({
          top: Math.max(nextTop, 0),
          behavior: "smooth",
        });
      }, 120);
    });
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
    setSaveError(null);
    setSaveSuccess(null);
    setFieldErrors({});
    setIsEditMode(false);
    setEditDraft(null);
    setResult(null);
    setCurrentFile(file);
    setPreviewUrl(null);
    try {
      const [data, nextPreviewUrl] = await Promise.all([
        extractExif(file),
        createImagePreviewDataUrl(file, file.name).catch(() => null),
      ]);
      setPreviewUrl(nextPreviewUrl);
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

  const normalizeTransferredFile = useCallback(async (value: unknown) => {
    if (value instanceof globalThis.File) return value;

    if (value instanceof Blob) {
      return new globalThis.File([value], "transferred-image", {
        type: value.type,
        lastModified: Date.now(),
      });
    }

    if (
      value &&
      typeof value === "object" &&
      "arrayBuffer" in value &&
      typeof (value as Blob).arrayBuffer === "function" &&
      "name" in value &&
      typeof (value as { name: unknown }).name === "string"
    ) {
      const candidate = value as {
        arrayBuffer: () => Promise<ArrayBuffer>;
        lastModified?: number;
        name: string;
        type?: string;
      };
      const buffer = await candidate.arrayBuffer();
      return new globalThis.File([buffer], candidate.name, {
        type: candidate.type,
        lastModified: candidate.lastModified,
      });
    }

    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pendingId = new URLSearchParams(window.location.search).get("pending");
    const sameTabPending = takePendingExifViewerFile();

    if (sameTabPending) {
      void processFile(sameTabPending).then(() => {
        if (!cancelled) scrollToResultsArea();
      });
      return () => {
        cancelled = true;
      };
    }

    if (!pendingId) return;

    const openPending = async () => {
      const channel = createPendingExifTransferChannel(pendingId);
      setPendingTransfer(true);
      setLoading(true);
      setError(null);
      setResult(null);

      const detachTransport = () => {
        window.removeEventListener("message", onWindowMessage);
        if (channel) channel.onmessage = null;
      };

      const closeTransport = () => {
        channel?.close();
      };

      const timeout = window.setTimeout(() => {
        if (cancelled) return;
        setPendingTransfer(false);
        setLoading(false);
        setError("Could not open this image in EXIF Viewer. Please try again.");
        detachTransport();
        if (channel) {
          channel.postMessage({ pendingId, type: EXIF_TRANSFER_ERROR });
          closeTransport();
        } else {
          window.opener?.postMessage(
            { pendingId, type: EXIF_TRANSFER_ERROR },
            window.location.origin,
          );
        }
      }, 15000);

      async function handleIncomingTransfer(
        data:
          | { file?: File; pendingId?: string; type?: string }
          | undefined,
      ) {

        if (!data || data.type !== EXIF_TRANSFER_FILE || data.pendingId !== pendingId) {
          return;
        }

        window.clearTimeout(timeout);
        detachTransport();

        const incomingFile = await normalizeTransferredFile(data.file);
        if (!incomingFile) {
          if (!cancelled) {
            setPendingTransfer(false);
            setLoading(false);
            setError("Could not open this image in EXIF Viewer. Please try again.");
          }
          if (channel) {
            channel.postMessage({ pendingId, type: EXIF_TRANSFER_ERROR });
            closeTransport();
          } else {
            window.opener?.postMessage(
              { pendingId, type: EXIF_TRANSFER_ERROR },
              window.location.origin,
            );
          }
          return;
        }

        try {
          window.history.replaceState({}, "", "/exif-viewer");
          await processFile(incomingFile);
          if (!cancelled) scrollToResultsArea();
          if (channel) {
            channel.postMessage({ pendingId, type: EXIF_TRANSFER_RECEIVED });
            closeTransport();
          } else {
            window.opener?.postMessage(
              { pendingId, type: EXIF_TRANSFER_RECEIVED },
              window.location.origin,
            );
          }
        } catch (pendingError) {
          console.error(pendingError);
          if (!cancelled) {
            setLoading(false);
            setError("Could not open this image in EXIF Viewer. Please try again.");
          }
          if (channel) {
            channel.postMessage({ pendingId, type: EXIF_TRANSFER_ERROR });
            closeTransport();
          } else {
            window.opener?.postMessage(
              { pendingId, type: EXIF_TRANSFER_ERROR },
              window.location.origin,
            );
          }
        } finally {
          if (!cancelled) {
            setPendingTransfer(false);
          }
        }
      }

      function onWindowMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) return;
        void handleIncomingTransfer(
          event.data as
            | { file?: File; pendingId?: string; type?: string }
            | undefined,
        );
      }

      if (channel) {
        channel.onmessage = event => {
          void handleIncomingTransfer(
            event.data as
              | { file?: File; pendingId?: string; type?: string }
              | undefined,
          );
        };
        channel.postMessage({ pendingId, type: EXIF_TRANSFER_READY });
      } else {
        window.addEventListener("message", onWindowMessage);
        window.opener?.postMessage(
          { pendingId, type: EXIF_TRANSFER_READY },
          window.location.origin,
        );
      }
    };

    void openPending();

    return () => {
      cancelled = true;
    };
  }, [normalizeTransferredFile, processFile, scrollToResultsArea]);

  const useHeroSample = useCallback(async () => {
    setSampleError(null);
    setSampleLoading(true);
    try {
      let file = sampleFile;

      if (!file) {
        file = await fetchPublicFile(HERO_SAMPLE_PATH);
        setSampleFile(file);
      }

      await processFile(file);
      scrollToResultsArea();
    } catch {
      setSampleError("Could not load the sample HEIC file.");
    } finally {
      setSampleLoading(false);
    }
  }, [processFile, sampleFile, scrollToResultsArea]);

  useEffect(() => {
    if (!result) {
      setEditDraft(null);
      setFieldErrors({});
      setSaveError(null);
      setIsEditMode(false);
      return;
    }

    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
    setIsEditMode(false);
  }, [result]);

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
    setCurrentFile(null);
    setPreviewUrl(null);
    setEditDraft(null);
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditMode(false);
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

  const displayGroups = useMemo(() => {
    if (!result) return [];
    if (!editDraft) return result.groups;
    return buildDisplayMetadataGroups(result, editDraft, isEditMode);
  }, [editDraft, isEditMode, result]);

  const originalEditDraft = useMemo(
    () => (result ? buildMetadataEditDraft(result) : null),
    [result],
  );

  const hasScreenshotNote = useMemo(
    () => displayGroups
      .find(group => group.id === "file")
      ?.fields.some(field => field.key === "_screenshot_note") ?? false,
    [displayGroups],
  );

  const enterEditMode = useCallback(() => {
    if (!result) return;
    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditMode(true);
  }, [result]);

  const resetEditDraft = useCallback(() => {
    if (!result) return;
    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
  }, [result]);

  const cancelEditMode = useCallback(() => {
    if (!result) return;
    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
    setIsEditMode(false);
  }, [result]);

  const handleFieldChange = useCallback((key: MetadataEditKey, value: string) => {
    setEditDraft(current => current ? { ...current, [key]: value } : current);
    setFieldErrors(current => {
      if (!current[key]) return current;
      return { ...current, [key]: undefined };
    });
    setSaveError(null);
  }, []);

  const handleSaveEditedMetadata = useCallback(async () => {
    if (!currentFile || !editDraft) return;

    const normalizedDraft = normalizeMetadataEditDraft(editDraft);
    const validationErrors = validateMetadataEditDraft(normalizedDraft);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaveError("Check the highlighted fields before saving a new JPEG.");
      return;
    }

    setIsSavingMetadata(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const writer = createBrowserJpegMetadataWriter();
      const editedResult = await writer.write({
        draft: normalizedDraft,
        file: currentFile,
      });

      downloadDataUrl(editedResult.dataUrl, editedResult.file.name);
      await processFile(editedResult.file);
      setSaveSuccess("Saved a new JPEG copy and reloaded it so you can verify the updated metadata.");
    } catch (saveMetadataError) {
      console.error(saveMetadataError);
      setSaveError(toReadableError(saveMetadataError));
    } finally {
      setIsSavingMetadata(false);
    }
  }, [currentFile, editDraft, processFile]);

  const gpsMapLinks = useMemo(() => {
    if (!result?.hasGPS || result.gpsLat == null || result.gpsLon == null) {
      return null;
    }

    return {
      google: buildGoogleMapsUrl(result.gpsLat, result.gpsLon),
      apple: buildAppleMapsUrl(result.gpsLat, result.gpsLon),
    };
  }, [result]);

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

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div className="max-w-3xl">
                {/* Tool badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-xs font-semibold mb-4">
                  <Eye className="w-3.5 h-3.5" />
                  Free Online Tool · Read + Edit Common Metadata
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  EXIF Viewer —{" "}
                  <span className="text-cyan">Read & Edit Metadata</span>{" "}
                  Instantly
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                  Inspect <strong className="text-foreground">GPS coordinates, camera settings, AI generation data, C2PA manifests,
                  IPTC copyright</strong> and 100+ metadata fields from any image, then save supported changes as a new JPEG copy. 100% browser-based — your files never leave your device.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {["JPEG / PNG / WebP", "HEIC / TIFF / RAW", "Edit Title / GPS / Copyright", "Save New JPEG Copy", "C2PA / XMP / IPTC", "Export JSON & CSV"].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={useHeroSample}
                disabled={loading || sampleLoading}
                className="group w-full rounded-3xl border border-cyan/20 bg-card/60 p-4 text-left transition-all duration-300 hover:border-cyan/40 hover:bg-card/80 disabled:cursor-wait disabled:opacity-80"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-mono-custom uppercase tracking-[0.22em] text-muted-foreground/70">
                      Sample Test Image
                    </p>
                    <p className="font-display text-lg font-bold text-foreground mt-1">
                      Try <code className="rounded bg-cyan/10 px-1.5 py-0.5 text-cyan text-sm">sample.HEIC</code>
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[10px] font-semibold text-cyan">
                    {loading ? "Reading..." : sampleLoading ? "Preparing..." : "Click to inspect"}
                  </span>
                </div>

                <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                  <ImagePreview
                    src={HERO_SAMPLE_PREVIEW_PATH}
                    alt="Bundled sample preview"
                    showExifAction={false}
                    className="h-full w-full"
                    imgClassName="object-cover"
                    fallbackLabel="Sample preview unavailable"
                  />
                </div>

                <div className="mt-3 flex items-start justify-between gap-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Load the bundled iPhone HEIC sample and immediately test GPS, camera metadata, HEIC preview support, and the new metadata editor flow.
                  </p>
                  <span className="shrink-0 text-xs font-semibold text-cyan transition-transform duration-300 group-hover:translate-x-0.5">
                    Open sample
                  </span>
                </div>

                {sampleError && (
                  <p className="mt-2 text-xs text-red-400">{sampleError}</p>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ── Tool area ── */}
        <section id="exif-tool" className="py-10">
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
                  <div className="mt-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-left max-w-sm">
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      🍎 <strong className="text-foreground/60">iPhone users:</strong> Choose from Photos app (not camera) to preserve GPS &amp; EXIF. iOS strips metadata when using camera directly in browser.
                    </p>
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
                    <Search className={`w-7 h-7 text-navy ${pendingTransfer ? "animate-spin" : "animate-pulse"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      {pendingTransfer ? "Opening image in EXIF Viewer…" : "Reading metadata…"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pendingTransfer
                        ? "Transferring the image into this tab and preparing the HEIC preview."
                        : "Parsing EXIF, GPS, XMP, IPTC, C2PA segments"}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {pendingTransfer
                        ? "The first HEIC open can take a few seconds, especially on larger files."
                        : "HEIC/large files may take a few seconds"}
                    </p>
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
              <MetadataViewerPanel
                result={result}
                previewUrl={previewUrl}
                groups={displayGroups}
                isEditMode={isEditMode}
                draft={editDraft}
                originalDraft={originalEditDraft}
                fieldErrors={fieldErrors}
                onFieldChange={handleFieldChange}
                stickyToolbar
                stickyBaseOffset={64}
                containerIdPrefix="exif"
                toolbarActions={
                  isEditMode ? (
                    <>
                      <button
                        onClick={handleSaveEditedMetadata}
                        disabled={isSavingMetadata || !editDraft}
                        className="flex items-center gap-1.5 rounded-lg gradient-cyan px-3 py-1.5 text-xs font-bold text-navy transition-opacity disabled:cursor-wait disabled:opacity-70"
                      >
                        <Download className={`w-3.5 h-3.5 ${isSavingMetadata ? "animate-pulse" : ""}`} />
                        {isSavingMetadata ? "Saving…" : "Save New JPEG"}
                      </button>
                      <button
                        onClick={resetEditDraft}
                        disabled={isSavingMetadata}
                        className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-cyan/40 hover:text-foreground disabled:opacity-60"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Changes
                      </button>
                      <button
                        onClick={cancelEditMode}
                        disabled={isSavingMetadata}
                        className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-border hover:text-foreground disabled:opacity-60"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={enterEditMode}
                        className="flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs text-cyan transition-all hover:border-cyan/40 hover:bg-cyan/15"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Edit Metadata
                      </button>
                      <button
                        onClick={exportJSON}
                        className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-cyan/40 hover:text-foreground"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export JSON
                      </button>
                      <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-cyan/40 hover:text-foreground"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                      <button
                        onClick={reset}
                        className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-border hover:text-foreground"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        New File
                      </button>
                    </>
                  )
                }
                notices={
                  <>
                    {hasScreenshotNote && (
                      <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <span className="flex-shrink-0 text-lg text-amber-400">📱</span>
                        <div>
                          <p className="mb-1 text-sm font-semibold text-amber-400">
                            Screenshot Detected
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            This file is a screenshot — screenshots do not contain GPS coordinates,
                            camera model, or lens data. To view full EXIF metadata, open your
                            iPhone <strong className="text-foreground">Camera app</strong>, take a
                            photo, then upload that photo (file name will be{" "}
                            <code className="rounded bg-cyan/10 px-1 text-xs text-cyan">
                              IMG_xxxx.HEIC
                            </code>{" "}
                            or{" "}
                            <code className="rounded bg-cyan/10 px-1 text-xs text-cyan">
                              IMG_xxxx.JPG
                            </code>
                            ).
                          </p>
                        </div>
                      </div>
                    )}

                    {isEditMode && (
                      <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-cyan">
                              Editing common metadata only
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              Save exports a new JPEG copy with the editable fields below. Your
                              original file stays unchanged, and unsupported metadata remains
                              read-only.
                            </p>
                          </div>
                          <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan">
                            JPEG copy export
                          </span>
                        </div>
                      </div>
                    )}

                    {saveError && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                        {saveError}
                      </div>
                    )}

                    {saveSuccess && (
                      <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-300">
                        {saveSuccess}
                      </div>
                    )}
                  </>
                }
                bottomContent={
                  <>
                    <div className="mt-2 rounded-xl border border-cyan/30 bg-cyan/5 p-5">
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1">
                          <h3 className="mb-1 text-sm font-bold text-foreground font-display">
                            Want to remove all this metadata?
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            BlankAI strips EXIF, GPS, C2PA, and AI pixel fingerprints in seconds
                            — free, no account needed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => goToRemover(currentFile)}
                          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg gradient-cyan px-4 py-2 text-sm font-bold text-navy transition-opacity hover:opacity-90"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Remove Metadata Free
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {result.hasGPS &&
                        result.gpsLat != null &&
                        result.gpsLon != null &&
                        gpsMapLinks && (
                          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2 text-red-400">
                                  <MapPin className="w-5 h-5 flex-shrink-0" />
                                  <span className="text-sm font-bold">GPS Location Detected</span>
                                </div>
                                <div className="flex-1 rounded-lg bg-red-500/10 px-3 py-1.5 font-mono text-xs text-foreground">
                                  {result.gpsLat.toFixed(6)}, {result.gpsLon.toFixed(6)}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={gpsMapLinks.apple}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Apple Maps
                                </a>
                                <a
                                  href={gpsMapLinks.google}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Google Maps
                                </a>
                                <button
                                  onClick={() => goToRemover(currentFile)}
                                  className="flex items-center gap-1.5 rounded-lg gradient-cyan px-3 py-1.5 text-xs font-bold text-navy transition-opacity hover:opacity-90"
                                >
                                  <Zap className="w-3 h-3" />
                                  Remove GPS
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      <RiskSummary
                        result={result}
                        onRemove={() => goToRemover(currentFile)}
                      />
                    </div>
                  </>
                }
              />
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
                { href: "/exif-viewer", label: "EXIF Viewer", icon: <Search className="w-3.5 h-3.5" />, desc: "Read + edit metadata", active: true },
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
                  BlankAI's EXIF Viewer lets you inspect all of this data, edit the most useful common fields, and export a new JPEG copy before deciding whether to share an image publicly.
                </p>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-4">
                  What Metadata Can BlankAI Read And Edit?
                </h2>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  BlankAI reads a broad range of EXIF, IPTC, XMP, AI, and technical metadata. Common scalar fields like title, author, copyright, date/time, camera details, and GPS coordinates can also be edited and saved into a new JPEG copy. Complex provenance blocks remain read-only.
                </p>
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
                  q: "Can I edit the metadata and save a new file?",
                  a: "Yes. BlankAI can edit common metadata such as title, description, author, copyright, camera make/model, date/time, and GPS coordinates. When you save, BlankAI exports a new JPEG copy with those updated fields. Your original file stays unchanged."
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
                  a: "Yes. After reading the metadata, you can export it as a JSON file (machine-readable, includes all raw values) or a CSV file (spreadsheet-friendly, organized by category and field name). If you edit common fields, you can also save a new JPEG copy with the updated metadata."
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
            <button
              type="button"
              onClick={() => goToRemover(currentFile)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Zap className="w-4 h-4" />
              Remove Metadata Free — blankai.app
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
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
