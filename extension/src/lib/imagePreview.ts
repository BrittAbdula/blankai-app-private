import { convertHeicToJpegDataUrl, convertHeicToJpegFile } from "@extension/lib/heicSandbox";

const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);
const ASCII_DECODER = new TextDecoder("ascii");
const SUPPORTED_IMAGE_PATTERN = /\.(avif|heic|heif|jpe?g|png|webp)$/i;

export const EXTENSION_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif";

function getExtension(name?: string) {
  return name?.split(".").pop()?.toLowerCase() ?? "";
}

export function guessMimeTypeFromName(name: string) {
  const ext = getExtension(name);
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  if (ext === "avif") return "image/avif";
  if (ext === "webp") return "image/webp";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

export function isHeicLike(file: Blob | File, fileName?: string) {
  if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;
  const name = file instanceof File ? file.name : fileName;
  const ext = getExtension(name);
  return ext === "heic" || ext === "heif";
}

export function isExtensionImageFile(file: File) {
  return file.type.toLowerCase().startsWith("image/") || SUPPORTED_IMAGE_PATTERN.test(file.name);
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to prepare image preview."));
    reader.readAsDataURL(blob);
  });
}

async function hasHeicSignature(file: Blob) {
  try {
    const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    if (header.length < 12) return false;

    const boxType = ASCII_DECODER.decode(header.slice(4, 8)).toLowerCase();
    if (boxType !== "ftyp") return false;

    const majorBrand = ASCII_DECODER.decode(header.slice(8, 12)).toLowerCase();
    if (HEIC_BRANDS.has(majorBrand)) return true;

    for (let offset = 16; offset + 4 <= header.length; offset += 4) {
      const compatibleBrand = ASCII_DECODER.decode(header.slice(offset, offset + 4)).toLowerCase();
      if (HEIC_BRANDS.has(compatibleBrand)) return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function assertExtensionImageSupported(file: File) {
  if (!isExtensionImageFile(file)) {
    throw new Error("Unsupported image format. Use JPG, PNG, WebP, AVIF, or HEIC.");
  }
}

export async function createSafeImagePreviewDataUrl(file: File) {
  assertExtensionImageSupported(file);

  if (isHeicLike(file) || (await hasHeicSignature(file))) {
    return await convertHeicToJpegDataUrl(file, 0.92);
  }

  return await blobToDataUrl(file);
}

export { convertHeicToJpegFile };
