import { assertExtensionImageSupported, convertHeicToJpegFile, isHeicLike } from "@extension/lib/imagePreview";
import { residualFindings, scanMetadata } from "@blankai-core/lib/metadataScan";

export interface ProcessedImageResult {
  originalName: string;
  cleanedName: string;
  blob: Blob;
  downloadUrl: string;
  sizeBefore: number;
  sizeAfter: number;
  sizeReductionPct: number;
  quality: number;
  hashBefore: string;
  hashAfter: string;
  metadataRemoved: string[];
  width: number;
  height: number;
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function loadImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("This image format cannot be decoded in the extension."));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function processImage(file: File): Promise<ProcessedImageResult> {
  assertExtensionImageSupported(file);

  // Scan the original bytes (before any HEIC conversion) so the report lists
  // what the user's file really contained.
  const scanBefore = await scanMetadata(file);
  const metadataRemoved = scanBefore.findings.map((finding) =>
    finding.detail ? `${finding.label} (${finding.detail})` : finding.label,
  );

  let workFile = file;
  if (isHeicLike(file)) {
    workFile = await convertHeicToJpegFile(file, 0.95);
  }

  const originalBuffer = await workFile.arrayBuffer();
  const hashBefore = (await sha256Hex(originalBuffer)).slice(0, 32);

  const image = await loadImage(workFile);
  const { naturalHeight: height, naturalWidth: width } = image;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  // JPEG has no alpha channel: paint white first so transparent areas do not
  // turn black. Pixels are otherwise copied as-is; nothing is altered.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0);

  const quality = 0.92;
  const cleanBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed."));
      },
      "image/jpeg",
      quality,
    );
  });

  const cleanBuffer = await cleanBlob.arrayBuffer();
  const hashAfter = (await sha256Hex(cleanBuffer)).slice(0, 32);
  const residual = residualFindings(await scanMetadata(cleanBlob));
  if (residual.length) {
    throw new Error(`Output still contains: ${residual.map((finding) => finding.label).join(", ")}`);
  }

  const downloadUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to prepare cleaned image."));
    reader.readAsDataURL(cleanBlob);
  });

  const sizeBefore = workFile.size;
  const sizeAfter = cleanBlob.size;
  const sizeReductionPct = Math.round(((sizeBefore - sizeAfter) / sizeBefore) * 100);
  const cleanedName = `${file.name.replace(/\.[^.]+$/, "") || "image"}-clean.jpg`;

  return {
    originalName: file.name,
    cleanedName,
    blob: cleanBlob,
    downloadUrl,
    sizeBefore,
    sizeAfter,
    sizeReductionPct,
    quality: Math.round(quality * 100),
    hashBefore,
    hashAfter,
    metadataRemoved,
    width,
    height,
  };
}
