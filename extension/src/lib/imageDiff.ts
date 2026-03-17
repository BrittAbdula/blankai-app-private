export interface DiffResult {
  avgDelta: number;
  diffPercent: number;
  differentPixels: number;
  heatmapDataUrl: string;
  maxDelta: number;
  overlayDataUrl: string;
  totalPixels: number;
}

export async function sha256ShortFromDataUrl(dataUrl: string): Promise<string> {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return "—";

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes.buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, (value) => value.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = dataUrl;
  });
}

export async function getImageDimensions(dataUrl: string): Promise<{ height: number; width: number }> {
  const image = await loadImageFromDataUrl(dataUrl);
  return {
    height: image.naturalHeight,
    width: image.naturalWidth,
  };
}

export async function computeDiff(dataUrlA: string, dataUrlB: string, tolerance: number): Promise<DiffResult> {
  const [imageA, imageB] = await Promise.all([
    loadImageFromDataUrl(dataUrlA),
    loadImageFromDataUrl(dataUrlB),
  ]);

  const width = Math.max(imageA.naturalWidth, imageB.naturalWidth);
  const height = Math.max(imageA.naturalHeight, imageB.naturalHeight);

  const canvasA = document.createElement("canvas");
  canvasA.width = width;
  canvasA.height = height;
  const contextA = canvasA.getContext("2d");
  if (!contextA) throw new Error("Canvas is unavailable.");
  contextA.drawImage(imageA, 0, 0);
  const dataA = contextA.getImageData(0, 0, width, height).data;

  const canvasB = document.createElement("canvas");
  canvasB.width = width;
  canvasB.height = height;
  const contextB = canvasB.getContext("2d");
  if (!contextB) throw new Error("Canvas is unavailable.");
  contextB.drawImage(imageB, 0, 0);
  const dataB = contextB.getImageData(0, 0, width, height).data;

  const heatCanvas = document.createElement("canvas");
  heatCanvas.width = width;
  heatCanvas.height = height;
  const heatContext = heatCanvas.getContext("2d");
  if (!heatContext) throw new Error("Canvas is unavailable.");
  const heatData = heatContext.createImageData(width, height);

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  const overlayContext = overlayCanvas.getContext("2d");
  if (!overlayContext) throw new Error("Canvas is unavailable.");
  overlayContext.drawImage(imageA, 0, 0);
  const overlayData = overlayContext.getImageData(0, 0, width, height);

  let differentPixels = 0;
  let totalDelta = 0;
  let maxDelta = 0;
  const totalPixels = width * height;

  for (let index = 0; index < totalPixels; index += 1) {
    const offset = index * 4;
    const redDelta = Math.abs(dataA[offset] - dataB[offset]);
    const greenDelta = Math.abs(dataA[offset + 1] - dataB[offset + 1]);
    const blueDelta = Math.abs(dataA[offset + 2] - dataB[offset + 2]);
    const delta = Math.round((redDelta + greenDelta + blueDelta) / 3);

    if (delta <= tolerance) {
      heatData.data[offset + 3] = 0;
      continue;
    }

    differentPixels += 1;
    totalDelta += delta;
    maxDelta = Math.max(maxDelta, delta);

    const intensity = Math.min(255, delta * 3);
    heatData.data[offset] = intensity;
    heatData.data[offset + 1] = Math.max(0, 80 - intensity / 2);
    heatData.data[offset + 2] = 0;
    heatData.data[offset + 3] = Math.min(255, intensity + 60);

    overlayData.data[offset] = 255;
    overlayData.data[offset + 1] = 30;
    overlayData.data[offset + 2] = 30;
    overlayData.data[offset + 3] = Math.min(255, intensity + 120);
  }

  heatContext.putImageData(heatData, 0, 0);
  overlayContext.putImageData(overlayData, 0, 0);

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
