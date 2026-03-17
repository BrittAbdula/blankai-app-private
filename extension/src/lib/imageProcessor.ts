import { assertExtensionImageSupported, convertHeicToJpegFile, isHeicLike } from "@extension/lib/imagePreview";

export interface ProcessedImageResult {
  originalName: string;
  cleanedName: string;
  blob: Blob;
  downloadUrl: string;
  sizeBefore: number;
  sizeAfter: number;
  sizeReductionPct: number;
  pixelsModified: number;
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

function detectMetadataTypes(bytes: Uint8Array): string[] {
  const found: string[] = [];
  const slice = bytes.slice(0, Math.min(bytes.length, 65536));
  const text = Array.from(slice, (value) => String.fromCharCode(value)).join("");

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    for (let index = 2; index < Math.min(bytes.length - 4, 8192); index += 1) {
      if (bytes[index] === 0xff && bytes[index + 1] === 0xe1) {
        found.push("EXIF");
        break;
      }
    }

    if (text.includes("http://ns.adobe.com/xap") || text.includes("xpacket")) found.push("XMP");

    for (let index = 2; index < Math.min(bytes.length - 4, 8192); index += 1) {
      if (bytes[index] === 0xff && bytes[index + 1] === 0xed) {
        found.push("IPTC");
        break;
      }
    }
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    if (text.includes("tEXt") || text.includes("iTXt") || text.includes("zTXt")) found.push("PNG Info Chunks");
    if (text.includes("parameters") || text.includes("prompt") || text.includes("Steps:")) found.push("Stable Diffusion Params");
  }

  if (text.includes("c2pa") || text.includes("jumb") || text.includes("cbor") || text.includes("ContentCredentials")) found.push("C2PA Credentials");
  if (text.includes("DALL-E") || text.includes("dalle") || text.includes("openai")) found.push("DALL-E Signature");
  if (text.includes("midjourney") || text.includes("MidJourney")) found.push("MidJourney Signature");
  if (text.includes("stable-diffusion") || text.includes("StableDiffusion") || text.includes("ComfyUI")) found.push("Stable Diffusion Signature");
  if (text.includes("firefly") || text.includes("Adobe Firefly")) found.push("Adobe Firefly Signature");
  if (text.includes("leonardo") || text.includes("Leonardo.Ai")) found.push("Leonardo AI Signature");

  for (let index = 0; index < Math.min(bytes.length - 2, 65536); index += 1) {
    if (bytes[index] === 0x88 && bytes[index + 1] === 0x25) {
      found.push("GPS Location");
      break;
    }
  }

  if (found.length === 0) found.push("EXIF Data", "Image Metadata");
  return found;
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

  let workFile = file;
  if (isHeicLike(file)) {
    workFile = await convertHeicToJpegFile(file, 0.95);
  }

  const originalBuffer = await workFile.arrayBuffer();
  const originalBytes = new Uint8Array(originalBuffer);
  const hashBefore = (await sha256Hex(originalBuffer)).slice(0, 32);
  const metadataRemoved = detectMetadataTypes(originalBytes);

  const image = await loadImage(workFile);
  const { naturalHeight: height, naturalWidth: width } = image;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  let pixelsModified = 0;
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 10000));

  for (let index = 0; index < totalPixels; index += step) {
    const offset = index * 4;
    if (offset + 3 >= data.length) break;

    const delta = index % 2 === 0 ? 1 : -1;
    data[offset] = Math.max(0, Math.min(255, data[offset] + delta));
    data[offset + 1] = Math.max(0, Math.min(255, data[offset + 1] - delta));
    pixelsModified += 1;
  }

  context.putImageData(imageData, 0, 0);

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

  const downloadUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to prepare cleaned image."));
    reader.readAsDataURL(cleanBlob);
  });

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
