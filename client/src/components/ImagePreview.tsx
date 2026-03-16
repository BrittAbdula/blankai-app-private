import { type MouseEvent, useEffect, useState } from "react";
import { Eye, Image as ImageIcon, LoaderCircle } from "lucide-react";
import { useLocation } from "wouter";
import { openPendingExifViewer } from "@/lib/pendingImageRoute";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src?: string | null;
  alt: string;
  file?: File | null;
  showExifAction?: boolean;
  actionPlacement?: "top-right" | "bottom-right";
  actionVariant?: "full" | "compact";
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
}

export default function ImagePreview({
  src,
  alt,
  file,
  showExifAction = Boolean(file),
  actionPlacement = "top-right",
  actionVariant = "full",
  className,
  imgClassName,
  fallbackLabel = "Preview unavailable",
}: ImagePreviewProps) {
  const [hasError, setHasError] = useState(!src);
  const [isOpeningExif, setIsOpeningExif] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const canOpenExif =
    Boolean(file) && showExifAction && !location.startsWith("/exif-viewer");

  const handleOpenExif = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!file || isOpeningExif) return;

    const targetWindow = window.open("", "_blank");
    setIsOpeningExif(true);

    void openPendingExifViewer(file, targetWindow).finally(() => {
      setIsOpeningExif(false);
    });
  };

  const actionPlacementClass =
    actionPlacement === "bottom-right" ? "bottom-2 right-2" : "right-2 top-2";
  const isCompactAction = actionVariant === "compact";

  return (
    <div
      className={cn(
        "group/preview relative overflow-hidden rounded-[inherit] border border-white/5 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/55 via-black/15 to-transparent" />
      {canOpenExif && (
        <button
          type="button"
          onClick={handleOpenExif}
          disabled={isOpeningExif}
          aria-label={`Open ${alt} in EXIF Viewer`}
          title="Open in EXIF Viewer"
          className={cn(
            "absolute z-20 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/60 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-200 hover:border-cyan/30 hover:bg-black/70 hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 disabled:cursor-wait disabled:opacity-90",
            isCompactAction
              ? "h-8 w-8"
              : "min-h-9 gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em]",
            actionPlacementClass,
          )}
        >
          {isOpeningExif ? (
            <>
              <LoaderCircle className={cn("animate-spin", isCompactAction ? "h-3.5 w-3.5" : "h-3 w-3")} />
              {!isCompactAction && <span>Preparing…</span>}
            </>
          ) : (
            <>
              <Eye className={cn(isCompactAction ? "h-3.5 w-3.5" : "h-3 w-3")} />
              {!isCompactAction && <span>EXIF Viewer</span>}
            </>
          )}
        </button>
      )}
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300 group-hover/preview:scale-[1.02]",
            imgClassName,
          )}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/20 px-3 text-center text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ImageIcon className="h-5 w-5" />
          </div>
          <span className="text-[11px]">{fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}
