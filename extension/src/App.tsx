import { Suspense, lazy, useMemo, useState } from "react";
import {
  ArrowUpRight,
  HelpCircle,
  ImageDown,
  ScanSearch,
  SplitSquareVertical,
  X,
} from "lucide-react";
import type { CompareSeed, ToolKey } from "@extension/types";
import { cn } from "@extension/lib/utils";

const CleanTool = lazy(() => import("@extension/tools/CleanTool"));
const CompareTool = lazy(() => import("@extension/tools/CompareTool"));
const InspectTool = lazy(() => import("@extension/tools/InspectTool"));

interface ToolDefinition {
  description: string;
  icon: typeof ImageDown;
  key: ToolKey;
  label: string;
}

const TOOLS: ToolDefinition[] = [
  {
    key: "clean",
    label: "Clean",
    description: "Remove privacy-sensitive metadata and export a clean JPG.",
    icon: ImageDown,
  },
  {
    key: "inspect",
    label: "Inspect",
    description: "Review EXIF, GPS, camera, and AI-related metadata locally.",
    icon: ScanSearch,
  },
  {
    key: "compare",
    label: "Compare",
    description: "Compare original and cleaned images with diff visualizations.",
    icon: SplitSquareVertical,
  },
];

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg text-slate-900">How BlankAI works</h2>
            <p className="mt-1 text-sm text-slate-500">
              All processing runs inside the extension. Your images are not uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close help"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-medium text-slate-900">1. Clean</div>
            <p className="mt-1">
              Re-encodes the image to remove EXIF, GPS, C2PA, and similar metadata traces.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-medium text-slate-900">2. Inspect</div>
            <p className="mt-1">
              Groups metadata into file, camera, location, and AI-related sections so you can review risk quickly.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-medium text-slate-900">3. Compare</div>
            <p className="mt-1">
              Shows original vs cleaned output side by side, plus optional slider and heatmap views.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ToolLoadingState() {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        Loading tool...
      </div>
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolKey>("clean");
  const [compareSeed, setCompareSeed] = useState<CompareSeed | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const activeDefinition = useMemo(
    () => TOOLS.find((tool) => tool.key === activeTool) ?? TOOLS[0],
    [activeTool]
  );

  const openCompare = (seed: CompareSeed) => {
    setCompareSeed(seed);
    setActiveTool("compare");
  };

  return (
    <div className="flex h-screen min-h-[640px] flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4">
        <div>
          <div className="font-display text-[1.625rem] leading-none text-primary">BlankAI</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Local image privacy tools for Chrome and Edge.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open("https://blankai.app/", "_blank", "noopener,noreferrer")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowUpRight className="h-4 w-4" />
            Website
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Open help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[94px] shrink-0 flex-col gap-2 border-r border-border bg-[#f2f4fb] p-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.key === activeTool;

            return (
              <button
                key={tool.key}
                type="button"
                onClick={() => setActiveTool(tool.key)}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-all duration-150",
                  isActive
                    ? "border-primary/15 bg-primary/10 text-primary"
                    : "border-transparent bg-transparent text-slate-500 hover:border-border hover:bg-white hover:text-slate-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                    isActive
                      ? "border-primary/20 bg-white text-primary"
                      : "border-slate-200 bg-white text-slate-500 group-hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium">{tool.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#f7f8fc]">
          <div className="border-b border-border bg-[#eef1fb] px-4 py-3">
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-primary">
              {activeDefinition.label}
            </div>
            <p className="mt-2 text-sm text-slate-600">{activeDefinition.description}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <Suspense fallback={<ToolLoadingState />}>
              {activeTool === "clean" ? <CleanTool onUseInCompare={openCompare} /> : null}
              {activeTool === "inspect" ? <InspectTool /> : null}
              {activeTool === "compare" ? <CompareTool seed={compareSeed} /> : null}
            </Suspense>
          </div>
        </main>
      </div>

      {helpOpen ? <HelpDialog onClose={() => setHelpOpen(false)} /> : null}
    </div>
  );
}
