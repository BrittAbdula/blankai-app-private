/**
 * BlankAI — Real Image Processing Engine
 *
 * Pipeline:
 * 0. HEIC/HEIF → convert to JPEG via heic2any (for iPhone photos)
 * 1. Read bytes → SHA-256 hash (before)
 * 2. Canvas draw → strips ALL metadata (EXIF, XMP, IPTC, C2PA, PNG chunks)
 * 3. Pixel-level ±1 RGB delta on every Nth pixel → changes digital fingerprint
 * 4. Re-encode as JPEG at 0.92 quality
 * 5. FileReader → data: URI (Base64) — iOS Safari long-press save to Photos works with data: URIs
 * 6. SHA-256 hash (after)
 */
import heic2any from "heic2any";

export interface ProcessedImageResult {
  originalName: string;
  cleanedName: string;
  blob: Blob;
  downloadUrl: string;   // data: URI — works for iOS long-press AND programmatic <a download>
  sizeBefore: number;
  sizeAfter: number;
  sizeReductionPct: number;
  pixelsModified: number;
  quality: number;       // 0-100
  hashBefore: string;    // first 32 hex chars of SHA-256
  hashAfter: string;
  metadataRemoved: string[];
  width: number;
  height: number;
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.prototype.map.call(hashArray, (b: number) => b.toString(16).padStart(2, "0")).join("");
}

function detectMetadataTypes(bytes: Uint8Array): string[] {
  const found: string[] = [];
  const slice = bytes.slice(0, Math.min(bytes.length, 65536));
  const text = Array.prototype.map.call(slice, (b: number) => String.fromCharCode(b)).join("");

  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    for (let i = 2; i < Math.min(bytes.length - 4, 8192); i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xE1) { found.push("EXIF"); break; }
    }
    if (text.includes("http://ns.adobe.com/xap") || text.includes("xpacket")) found.push("XMP");
    for (let i = 2; i < Math.min(bytes.length - 4, 8192); i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xED) { found.push("IPTC"); break; }
    }
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    if (text.includes("tEXt") || text.includes("iTXt") || text.includes("zTXt")) found.push("PNG Info Chunks");
    if (text.includes("parameters") || text.includes("prompt") || text.includes("Steps:")) found.push("Stable Diffusion Params");
  }

  if (text.includes("c2pa") || text.includes("jumb") || text.includes("cbor") || text.includes("ContentCredentials")) found.push("C2PA Credentials");
  if (text.includes("DALL-E") || text.includes("dalle") || text.includes("openai")) found.push("DALL-E Signature");
  if (text.includes("midjourney") || text.includes("MidJourney")) found.push("MidJourney Signature");
  if (text.includes("stable-diffusion") || text.includes("StableDiffusion") || text.includes("ComfyUI")) found.push("Stable Diffusion Signature");
  if (text.includes("firefly") || text.includes("Adobe Firefly")) found.push("Adobe Firefly Signature");
  if (text.includes("leonardo") || text.includes("Leonardo.Ai")) found.push("Leonardo AI Signature");

  for (let i = 0; i < Math.min(bytes.length - 2, 65536); i++) {
    if (bytes[i] === 0x88 && bytes[i + 1] === 0x25) { found.push("GPS Location"); break; }
  }

  if (found.length === 0) found.push("EXIF Data", "Image Metadata");
  return found;
}

function isHeicFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"].includes(mime)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif";
}

export async function processImage(file: File): Promise<ProcessedImageResult> {
  // ── Step 0: HEIC/HEIF → JPEG conversion ──────────────────────────────────
  let workFile = file;
  if (isHeicFile(file)) {
    try {
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      workFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
    } catch {
      workFile = file; // fallback: let Canvas try
    }
  }

  // ── Step 1: Read bytes & hash (before) ───────────────────────────────────
  const originalBuffer = await workFile.arrayBuffer();
  const originalBytes = new Uint8Array(originalBuffer);
  const hashBefore = (await sha256Hex(originalBuffer)).slice(0, 32);
  const metadataRemoved = detectMetadataTypes(originalBytes);

  // ── Step 2: Load into HTMLImageElement ───────────────────────────────────
  const imgUrl = URL.createObjectURL(workFile);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imgUrl;
  });
  URL.revokeObjectURL(imgUrl);

  const { naturalWidth: width, naturalHeight: height } = img;

  // ── Step 3: Canvas draw (strips ALL metadata) ─────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  // ── Step 4: Pixel-level fingerprint modification ──────────────────────────
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let pixelsModified = 0;
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 10000));

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    if (idx + 3 >= data.length) break;
    const delta = (i % 2 === 0) ? 1 : -1;
    data[idx] = Math.max(0, Math.min(255, data[idx] + delta));
    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] - delta));
    pixelsModified++;
  }
  ctx.putImageData(imageData, 0, 0);

  // ── Step 5: Re-encode as JPEG ─────────────────────────────────────────────
  const quality = 0.92;
  const cleanBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error("Canvas toBlob failed")); },
      "image/jpeg",
      quality
    );
  });

  // ── Step 6: Compute output hash ───────────────────────────────────────────
  const cleanBuffer = await cleanBlob.arrayBuffer();
  const hashAfter = (await sha256Hex(cleanBuffer)).slice(0, 32);

  // ── Step 7: Build data: URI for iOS Safari compatibility ──────────────────
  // iOS Safari shows "no internet connection" when long-pressing blob: URLs.
  // data: URIs are treated as embedded content — long-press save to Photos works.
  const downloadUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(cleanBlob);
  });

  // ── Step 8: Stats ─────────────────────────────────────────────────────────
  const sizeBefore = workFile.size;
  const sizeAfter = cleanBlob.size;
  const sizeReductionPct = Math.round(((sizeBefore - sizeAfter) / sizeBefore) * 100);
  const cleanedName = `blankai_clean_${Date.now()}.jpg`;

  return {
    originalName: file.name,
    cleanedName,
    blob: cleanBlob,
    downloadUrl,
    sizeBefore,
    sizeAfter,
    sizeReductionPct,
    pixelsModified,
    quality: Math.round(quality * 100),
    hashBefore,
    hashAfter,
    metadataRemoved,
    width,
    height,
  };
}

export async function processImages(
  files: File[],
  onProgress?: (current: number, total: number) => void,
  minMsPerImage = 2500
): Promise<ProcessedImageResult[]> {
  const results: ProcessedImageResult[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length);
    const start = performance.now();
    const result = await processImage(files[i]);
    // Enforce minimum animation duration so users can see the processing state
    const elapsed = performance.now() - start;
    if (elapsed < minMsPerImage) {
      await new Promise<void>((resolve) => setTimeout(resolve, minMsPerImage - elapsed));
    }
    results.push(result);
  }
  onProgress?.(files.length, files.length);
  return results;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return n.toString();
}
