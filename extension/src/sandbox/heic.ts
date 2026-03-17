import heic2any from "heic2any";

interface ConvertRequest {
  file?: Blob;
  quality?: number;
  requestId?: string;
  source?: string;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read converted HEIC image."));
    reader.readAsDataURL(blob);
  });
}

function toReadableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Failed to convert HEIC image in sandbox.";
}

window.addEventListener("message", (event) => {
  const data = event.data as ConvertRequest | undefined;
  if (!data || data.source !== "blankai-heic-request" || !data.requestId || !data.file) {
    return;
  }
  const file = data.file;
  const requestId = data.requestId;
  const quality = data.quality;

  void (async () => {
    try {
      const converted = await heic2any({
        blob: file,
        quality: quality ?? 0.92,
        toType: "image/jpeg",
      });
      const blob = (Array.isArray(converted) ? converted[0] : converted) as Blob;
      const dataUrl = await blobToDataUrl(blob);

      window.parent.postMessage(
        {
          dataUrl,
          requestId,
          source: "blankai-heic-response",
        },
        "*",
      );
    } catch (error) {
      window.parent.postMessage(
        {
          error: toReadableError(error),
          requestId,
          source: "blankai-heic-response",
        },
        "*",
      );
    }
  })();
});
