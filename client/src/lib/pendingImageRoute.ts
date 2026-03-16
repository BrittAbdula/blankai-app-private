type PendingFileWindow = Window & typeof globalThis & {
  __blankai_pending_exif_file?: File;
  __blankai_pending_file?: File;
};

export const EXIF_TRANSFER_READY = "blankai-exif-ready";
export const EXIF_TRANSFER_FILE = "blankai-exif-file";
export const EXIF_TRANSFER_RECEIVED = "blankai-exif-received";
export const EXIF_TRANSFER_ERROR = "blankai-exif-error";
const EXIF_TRANSFER_CHANNEL_PREFIX = "blankai-exif-transfer";

function getPendingWindow() {
  return window as PendingFileWindow;
}

function takePendingFile(key: keyof PendingFileWindow) {
  const pendingWindow = getPendingWindow();
  const file = pendingWindow[key];
  delete pendingWindow[key];
  return file instanceof File ? file : null;
}

export function stashPendingRemoverFile(file: File) {
  getPendingWindow().__blankai_pending_file = file;
}

export function takePendingRemoverFile() {
  return takePendingFile("__blankai_pending_file");
}

export function stashPendingExifViewerFile(file: File) {
  getPendingWindow().__blankai_pending_exif_file = file;
}

export function takePendingExifViewerFile() {
  return takePendingFile("__blankai_pending_exif_file");
}

export function createPendingExifTransferChannel(pendingId: string) {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(`${EXIF_TRANSFER_CHANNEL_PREFIX}-${pendingId}`);
}

export function openPendingRemover(
  file: File,
  navigate: (path: string) => void,
) {
  stashPendingRemoverFile(file);
  navigate("/#upload");
}

function paintPendingExifWindow(targetWindow: Window) {
  try {
    targetWindow.document.title = "Opening EXIF Viewer…";
    targetWindow.document.body.innerHTML = `
      <div style="margin:0;min-height:100vh;display:grid;place-items:center;background:#091018;color:#f8fafc;font-family:Inter,system-ui,sans-serif;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:32px;">
          <div style="width:42px;height:42px;border-radius:999px;border:3px solid rgba(255,255,255,0.14);border-top-color:#22d3ee;animation:blankai-spin 1s linear infinite;"></div>
          <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(248,250,252,0.66);">Opening EXIF Viewer</div>
          <div style="max-width:360px;font-size:15px;line-height:1.6;color:rgba(248,250,252,0.8);">Preparing the image preview and transferring metadata into a new tab.</div>
        </div>
      </div>
      <style>
        @keyframes blankai-spin {
          to { transform: rotate(360deg); }
        }
        body { margin: 0; }
      </style>
    `;
  } catch {
    // Ignore cross-window DOM access issues and continue with navigation.
  }
}

export async function openPendingExifViewer(
  file: File,
  preopenedWindow?: Window | null,
) {
  const pendingId = crypto.randomUUID();
  let targetWindow: Window | null = preopenedWindow ?? null;
  const origin = window.location.origin;
  const channel = createPendingExifTransferChannel(pendingId);
  const timeout = window.setTimeout(() => {
    window.removeEventListener("message", onWindowMessage);
    channel?.close();
  }, 45000);

  function cleanup() {
    window.clearTimeout(timeout);
    window.removeEventListener("message", onWindowMessage);
    channel?.close();
  }

  function handleTransferMessage(
    data:
      | {
          pendingId?: string;
          type?: string;
        }
      | undefined,
  ) {
    if (!data || data.pendingId !== pendingId) return;

    if (data.type === EXIF_TRANSFER_READY) {
      if (channel) {
        channel.postMessage({ file, pendingId, type: EXIF_TRANSFER_FILE });
        return;
      }

      if (!targetWindow) return;
      targetWindow.postMessage(
        { file, pendingId, type: EXIF_TRANSFER_FILE },
        origin,
      );
    }

    if (
      data.type === EXIF_TRANSFER_RECEIVED ||
      data.type === EXIF_TRANSFER_ERROR
    ) {
      cleanup();
    }
  }

  function onWindowMessage(event: MessageEvent) {
    if (event.origin !== origin) return;

    const data = event.data as
      | { pendingId?: string; type?: string }
      | undefined;

    handleTransferMessage(data);
  }

  if (channel) {
    channel.onmessage = event => {
      handleTransferMessage(
        event.data as { pendingId?: string; type?: string } | undefined,
      );
    };
  } else {
    window.addEventListener("message", onWindowMessage);
  }

  if (targetWindow) {
    paintPendingExifWindow(targetWindow);
    targetWindow.location.href = `/exif-viewer?pending=${encodeURIComponent(pendingId)}`;
  } else {
    targetWindow = window.open(
      `/exif-viewer?pending=${encodeURIComponent(pendingId)}`,
      "_blank",
    );
  }

  if (!targetWindow) {
    cleanup();
    stashPendingExifViewerFile(file);
    window.location.assign("/exif-viewer");
  }
}
