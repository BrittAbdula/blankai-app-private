import heic2any from "heic2any";

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

function getExtension(name?: string) {
  return name?.split(".").pop()?.toLowerCase() ?? "";
}

function guessMimeTypeFromName(name: string) {
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

export function isPreviewableImageFile(file: File) {
  if (file.type.toLowerCase().startsWith("image/")) return true;
  return /\.(avif|bmp|cr2|dng|gif|heic|heif|jpe?g|nef|orf|pef|png|raw|rw2|srw|tiff?|webp|arw)$/i.test(file.name);
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read preview blob"));
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
      const compatibleBrand = ASCII_DECODER.decode(
        header.slice(offset, offset + 4),
      ).toLowerCase();
      if (HEIC_BRANDS.has(compatibleBrand)) return true;
    }
  } catch {
    return false;
  }

  return false;
}

async function toPreviewBlob(file: Blob | File, fileName?: string) {
  const shouldConvert = isHeicLike(file, fileName) || await hasHeicSignature(file);
  if (!shouldConvert) return file;

  try {
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    return (Array.isArray(converted) ? converted[0] : converted) as Blob;
  } catch {
    return file;
  }
}

export async function createImagePreviewDataUrl(file: Blob | File, fileName?: string) {
  const previewBlob = await toPreviewBlob(file, fileName);
  return blobToDataUrl(previewBlob);
}

export async function fetchPublicFile(path: string) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch sample file: ${response.status}`);
  }

  const blob = await response.blob();
  const name = path.split("/").pop() || "sample-image";
  return new File([blob], name, {
    type: blob.type || guessMimeTypeFromName(name),
  });
}
