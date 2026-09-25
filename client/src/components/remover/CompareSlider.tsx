import { useRef, useState } from "react";

// Before/after comparison slider used in the results lightbox.
export default function CompareSlider({ before, after }: { before: string; after: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    setSliderPos(pct);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updatePos(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging.current) updatePos(e.clientX);
  };
  const onMouseUp = () => {
    dragging.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    updatePos(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-t-xl bg-black"
      style={{ maxHeight: "65vh", cursor: "col-resize" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After (base layer) */}
      <img
        src={after}
        alt="After"
        className="w-full h-auto max-h-[65vh] object-contain block"
        draggable={false}
      />
      {/* Before (clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={before}
          alt="Before"
          className="w-full h-auto max-h-[65vh] object-contain block"
          draggable={false}
        />
        {/* Before label */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
          BEFORE
        </div>
      </div>
      {/* After label */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-cyan/80 text-navy text-xs font-semibold backdrop-blur-sm">
        AFTER
      </div>
      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M4 7H1M1 7L3 5M1 7L3 9"
              stroke="#0A0F1E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 7H13M13 7L11 5M13 7L11 9"
              stroke="#0A0F1E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/50 text-white/70 text-[10px] pointer-events-none">
        ← drag to compare →
      </div>
    </div>
  );
}
