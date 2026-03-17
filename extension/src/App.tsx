import { Suspense, lazy, useState } from "react";
import {
  EyeOff,
  HelpCircle,
  ImageDown,
  ScanSearch,
  SplitSquareVertical,
  X,
} from "lucide-react";
import type { CleanSeed, CompareSeed, ToolKey } from "@extension/types";
import { cn } from "@extension/lib/utils";

const CleanTool = lazy(() => import("@extension/tools/CleanTool"));
const CompareTool = lazy(() => import("@extension/tools/CompareTool"));
const InspectTool = lazy(() => import("@extension/tools/InspectTool"));

interface ToolDefinition {
  icon: typeof ImageDown;
  key: ToolKey;
  label: string;
}

const TOOLS: ToolDefinition[] = [
  {
    key: "clean",
    label: "Clean",
    icon: ImageDown,
  },
  {
    key: "inspect",
    label: "Inspect",
    icon: ScanSearch,
  },
  {
    key: "compare",
    label: "Compare",
    icon: SplitSquareVertical,
  },
];

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-cyan/15 bg-[#0f162a] p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg text-white">How BlankAI works</h2>
            <p className="mt-1 text-sm text-slate-300">
              All processing runs inside the extension. Your images are not uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center border border-cyan/15 bg-[#0c1324] text-slate-300 transition-colors hover:border-cyan/35 hover:text-white"
            aria-label="Close help"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <div className="border border-cyan/10 bg-[#091120] p-3">
            <div className="font-medium text-white">1. Clean</div>
            <p className="mt-1">
              Re-encodes the image to remove EXIF, GPS, C2PA, and similar metadata traces.
            </p>
          </div>
          <div className="border border-cyan/10 bg-[#091120] p-3">
            <div className="font-medium text-white">2. Inspect</div>
            <p className="mt-1">
              Groups metadata into file, camera, location, and AI-related sections so you can review risk quickly.
            </p>
          </div>
          <div className="border border-cyan/10 bg-[#091120] p-3">
            <div className="font-medium text-white">3. Compare</div>
            <p className="mt-1">
              Shows original vs cleaned output side by side, plus optional slider and heatmap views.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-10 w-full items-center justify-center gradient-cyan px-4 text-sm font-medium text-[#0a0f1e] transition-opacity hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ToolLoadingState() {
  return (
    <div className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
      <div className="border border-dashed border-cyan/12 bg-[#091120] px-4 py-8 text-sm text-slate-300">
        Loading tool...
      </div>
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolKey>("inspect");
  const [cleanSeed, setCleanSeed] = useState<CleanSeed | null>(null);
  const [compareSeed, setCompareSeed] = useState<CompareSeed | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const openClean = (seed: CleanSeed) => {
    setCleanSeed(seed);
    setActiveTool("clean");
  };

  const openCompare = (seed: CompareSeed) => {
    setCompareSeed(seed);
    setActiveTool("compare");
  };

  return (
    <div className="brand-grid flex h-screen min-h-[640px] flex-col overflow-hidden bg-background text-foreground">
      <main className="relative flex min-h-0 flex-1 flex-col">
        <section className="brand-shell border-b border-cyan/12 px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <a
                href="https://blankai.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-90"
                aria-label="Open blankai.app"
              >
                <div className="gradient-cyan flex h-[3.25rem] w-[3.25rem] items-center justify-center">
                  <EyeOff className="h-7 w-7 text-[#0a0f1e]" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[1.875rem] leading-none text-white">
                    blank<span className="text-cyan">AI</span>
                  </div>
                </div>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-cyan/15 bg-[#0c1324] text-slate-200 transition-colors hover:border-cyan/35 hover:text-white"
              aria-label="Open help"
            >
              <HelpCircle className="h-4 w-4 text-cyan" />
            </button>
          </div>

          <div className="mt-3 flex gap-px overflow-x-auto border border-cyan/12 bg-[#08101d]">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.key === activeTool;

              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => setActiveTool(tool.key)}
                  className={cn(
                    "group inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-cyan/12 text-cyan"
                      : "bg-[#0b1222]/70 text-slate-300 hover:bg-[#0f172b] hover:text-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-cyan" : "text-slate-400 group-hover:text-cyan")} />
                  {tool.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense fallback={<ToolLoadingState />}>
            {activeTool === "clean" ? <CleanTool onUseInCompare={openCompare} seed={cleanSeed} /> : null}
            {activeTool === "inspect" ? <InspectTool onSendToClean={openClean} /> : null}
            {activeTool === "compare" ? <CompareTool seed={compareSeed} /> : null}
          </Suspense>
        </div>
      </main>

      {helpOpen ? <HelpDialog onClose={() => setHelpOpen(false)} /> : null}
    </div>
  );
}
