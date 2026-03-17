function getSandboxUrl() {
  return new URL("./sandbox/heic.html", window.location.href).toString();
}
const REQUEST_TIMEOUT_MS = 30000;

let iframePromise: Promise<HTMLIFrameElement> | null = null;
let sandboxFrame: HTMLIFrameElement | null = null;
let listenerAttached = false;

const pending = new Map<
  string,
  {
    reject: (error: Error) => void;
    resolve: (dataUrl: string) => void;
    timeoutId: number;
  }
>();

function buildJpegName(name: string) {
  if (/\.(heic|heif)$/i.test(name)) {
    return name.replace(/\.(heic|heif)$/i, ".jpg");
  }
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "converted"}.jpg`;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",", 2);
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/jpeg";
  const binary = atob(payload ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function ensureMessageListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  window.addEventListener("message", (event) => {
    if (!sandboxFrame || event.source !== sandboxFrame.contentWindow) return;
    const data = event.data as { dataUrl?: string; error?: string; requestId?: string; source?: string } | undefined;
    if (!data || data.source !== "blankai-heic-response" || !data.requestId) return;

    const request = pending.get(data.requestId);
    if (!request) return;

    window.clearTimeout(request.timeoutId);
    pending.delete(data.requestId);

    if (data.error) {
      request.reject(new Error(data.error));
      return;
    }

    if (!data.dataUrl) {
      request.reject(new Error("HEIC conversion did not return a preview."));
      return;
    }

    request.resolve(data.dataUrl);
  });
}

async function ensureSandboxFrame() {
  if (sandboxFrame?.contentWindow) return sandboxFrame;
  if (iframePromise) return iframePromise;

  iframePromise = new Promise<HTMLIFrameElement>((resolve, reject) => {
    const mount = () => {
      const frame = document.createElement("iframe");
      frame.src = getSandboxUrl();
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.style.display = "none";

      frame.addEventListener("load", () => {
        sandboxFrame = frame;
        resolve(frame);
      });
      frame.addEventListener("error", () => {
        iframePromise = null;
        reject(new Error("Failed to initialize HEIC sandbox."));
      });

      (document.body ?? document.documentElement).appendChild(frame);
    };

    if (document.body || document.documentElement) {
      mount();
      return;
    }

    window.addEventListener(
      "DOMContentLoaded",
      () => {
        mount();
      },
      { once: true },
    );
  });

  return iframePromise;
}

export async function convertHeicToJpegDataUrl(file: Blob, quality = 0.92) {
  ensureMessageListener();
  const frame = await ensureSandboxFrame();

  return await new Promise<string>((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const timeoutId = window.setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("HEIC conversion timed out."));
    }, REQUEST_TIMEOUT_MS);

    pending.set(requestId, {
      reject,
      resolve,
      timeoutId,
    });

    frame.contentWindow?.postMessage(
      {
        file,
        quality,
        requestId,
        source: "blankai-heic-request",
      },
      "*",
    );
  });
}

export async function convertHeicToJpegFile(file: File, quality = 0.92) {
  const dataUrl = await convertHeicToJpegDataUrl(file, quality);
  const blob = dataUrlToBlob(dataUrl);

  return new File([blob], buildJpegName(file.name), {
    lastModified: Date.now(),
    type: "image/jpeg",
  });
}
