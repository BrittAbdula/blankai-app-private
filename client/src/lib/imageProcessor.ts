/**
 * BlankAI image cleaning engine (browser-only).
 *
 * Pipeline per file:
 *   1. Scan the original bytes for metadata containers (EXIF, GPS, XMP, IPTC,
 *      C2PA, PNG text chunks…) so the result lists what was really there.
 *   2. HEIC/HEIF → decode via heic2any (browsers cannot draw HEIC natively).
 *   3. Draw the decoded pixels onto a canvas. Canvas exports contain pixel data
 *      only, so no metadata container from the source is carried over.
 *   4. Encode a fresh file in the chosen format (same as source by default,
 *      so PNG transparency and WebP stay intact).
 *   5. Re-scan the output bytes to verify that no metadata survived.
 *
 * What this does not do: it does not alter pixels to defeat invisible
 * watermarks such as SynthID. Those are part of the image content itself.
 */
import {
  residualFindings,
  scanMetadata,
  type MetadataFinding,
  type ProvenanceHints,
} from "@/lib/metadataScan";

export type OutputFormat = "auto" | "jpeg" | "png" | "webp";
export type EncodedFormat = "jpeg" | "png" | "webp";

export interface ProcessOptions {
  format: OutputFormat;
  /** 0–1, used for JPEG and WebP. */
  quality: number;
}

export const DEFAULT_PROCESS_OPTIONS: ProcessOptions = { format: "auto", quality: 0.92 };

export interface ProcessedImageResult {
  originalName: string;
  cleanedName: string;
  blob: Blob;
  /** data: URI so iOS Safari long-press "Save to Photos" works. */
  downloadUrl: string;
  sizeBefore: number;
  sizeAfter: number;
  /** Positive when the output is smaller. */
  sizeChangePct: number;
  inputFormat: string;
  outputFormat: EncodedFormat;
  /** 0–100 for lossy output, null for PNG. */
  quality: number | null;
  hashBefore: string;
  hashAfter: string;
  width: number;
  height: number;
  /** Metadata found in the original file (and therefore not in the output). */
  found: MetadataFinding[];
  hints: ProvenanceHints;
  /** True when the output re-scan found no identifying metadata. */
  outputVerified: boolean;
  /** Anything the output re-scan still found (should be empty). */
  residual: MetadataFinding[];
  /** Set when the pixels were decoded from HEIC/AVIF and re-encoded. */
  convertedFrom?: string;
}

const MIME: Record<EncodedFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const EXT: Record<EncodedFormat, string> = { jpeg: "jpg", png: "png", webp: "webp" };

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isHeicFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"].includes(mime)) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

function inputFormatOf(file: File): string {
  if (isHeicFile(file)) return "heic";
  const mime = file.type.toLowerCase();
  if (mime === "image/jpeg" || /\.jpe?g$/i.test(file.name)) return "jpeg";
  if (mime === "image/png" || /\.png$/i.test(file.name)) return "png";
  if (mime === "image/webp" || /\.webp$/i.test(file.name)) return "webp";
  if (mime === "image/avif" || /\.avif$/i.test(file.name)) return "avif";
  return mime.replace("image/", "") || "unknown";
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (event) => {
      URL.revokeObjectURL(url);
      reject(event);
    };
    image.src = url;
  });
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      mime,
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function pickTarget(inputFormat: string, requested: OutputFormat): EncodedFormat {
  if (requested !== "auto") return requested;
  if (inputFormat === "png") return "png";
  if (inputFormat === "webp") return "webp";
  // JPEG stays JPEG. HEIC and AVIF cannot be encoded by browsers, so they
  // become JPEG (or PNG when the image has transparency, decided later).
  return "jpeg";
}

function cleanedFileName(originalName: string, format: EncodedFormat): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return `${base}-clean.${EXT[format]}`;
}

export async function processImage(
  file: File,
  options: ProcessOptions = DEFAULT_PROCESS_OPTIONS,
): Promise<ProcessedImageResult> {
  const inputFormat = inputFormatOf(file);
  const originalBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(originalBuffer);
  const [hashBefore, scanBefore] = await Promise.all([
    sha256Hex(originalBuffer),
    scanMetadata(file, originalBytes),
  ]);

  // Decode. HEIC needs a WASM decoder; everything else is native.
  let drawable: Blob = file;
  let convertedFrom: string | undefined;
  if (inputFormat === "heic") {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/png" });
    drawable = Array.isArray(converted) ? converted[0] : converted;
    convertedFrom = "HEIC";
  } else if (inputFormat === "avif") {
    convertedFrom = "AVIF";
  }

  const img = await loadImage(drawable);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("Canvas is not available in this browser");

  let target = pickTarget(inputFormat, options.format);

  // Draw, then check transparency so JPEG output gets a white matte instead
  // of black where the source was transparent.
  ctx.drawImage(img, 0, 0);
  const mayHaveAlpha = ["png", "webp", "avif"].includes(inputFormat);
  const transparent = mayHaveAlpha && hasTransparency(ctx, width, height);
  if (transparent && options.format === "auto" && target === "jpeg") target = "png";
  if (transparent && target === "jpeg") {
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const lossy = target !== "png";
  let blob = await canvasToBlob(canvas, MIME[target], lossy ? options.quality : undefined);
  // Some browsers silently return PNG when they cannot encode the requested
  // type (for example WebP on older Safari). Report what we actually produced.
  const produced = (Object.keys(MIME) as EncodedFormat[]).find((key) => MIME[key] === blob.type);
  if (produced && produced !== target) {
    target = produced;
  } else if (!produced) {
    blob = await canvasToBlob(canvas, "image/png");
    target = "png";
  }

  const cleanBuffer = await blob.arrayBuffer();
  const [hashAfter, scanAfter, downloadUrl] = await Promise.all([
    sha256Hex(cleanBuffer),
    scanMetadata(blob, new Uint8Array(cleanBuffer)),
    blobToDataUrl(blob),
  ]);
  const residual = residualFindings(scanAfter);

  return {
    originalName: file.name,
    cleanedName: cleanedFileName(file.name, target),
    blob,
    downloadUrl,
    sizeBefore: file.size,
    sizeAfter: blob.size,
    sizeChangePct: file.size ? Math.round(((file.size - blob.size) / file.size) * 100) : 0,
    inputFormat,
    outputFormat: target,
    quality: target === "png" ? null : Math.round(options.quality * 100),
    hashBefore,
    hashAfter,
    width,
    height,
    found: scanBefore.findings,
    hints: scanBefore.hints,
    outputVerified: residual.length === 0,
    residual,
    convertedFrom,
  };
}

export async function processImages(
  files: File[],
  options: ProcessOptions = DEFAULT_PROCESS_OPTIONS,
  onProgress?: (current: number, total: number) => void,
): Promise<ProcessedImageResult[]> {
  const results: ProcessedImageResult[] = [];
  const started = performance.now();
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length);
    results.push(await processImage(files[i], options));
  }
  onProgress?.(files.length, files.length);
  // Keep the progress panel on screen long enough to read (UI smoothing only;
  // the work itself is already finished).
  const elapsed = performance.now() - started;
  if (elapsed < 350) await new Promise((resolve) => setTimeout(resolve, 350 - elapsed));
  return results;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
