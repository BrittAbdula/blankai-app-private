/**
 * RemovalScope: the honest "what BlankAI removes vs. what stays" table.
 * Shown on the home page and on every landing page.
 */
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

type Action = "removed" | "kept" | "unaffected";

export const REMOVAL_ROWS: { layer: string; where: string; what: string; action: Action }[] = [
  {
    layer: "EXIF and GPS",
    where: "File metadata",
    what: "Camera or phone model, serial numbers, capture time and location coordinates.",
    action: "removed",
  },
  {
    layer: "XMP and IPTC",
    where: "File metadata",
    what: "Creator tool, edit history, captions, credits and the IPTC Digital Source Type AI label.",
    action: "removed",
  },
  {
    layer: "C2PA Content Credentials",
    where: "Signed manifest inside the file",
    what: "Who or what created the file and how it was edited, signed by the issuing app.",
    action: "removed",
  },
  {
    layer: "PNG text chunks",
    where: "File metadata",
    what: "Stable Diffusion prompts, seeds and model names, ComfyUI workflows.",
    action: "removed",
  },
  {
    layer: "Invisible watermarks",
    where: "The pixels",
    what: "SynthID (Google and OpenAI images), Meta's Content Seal, TikTok and ByteDance watermarks.",
    action: "kept",
  },
  {
    layer: "Visible watermarks",
    where: "The pixels",
    what: "Logos, sparkle icons and corner badges drawn onto the image.",
    action: "kept",
  },
  {
    layer: "AI classifiers",
    where: "The platform",
    what: "Models that judge an image by how it looks. File metadata plays no part.",
    action: "unaffected",
  },
];

const ACTION_UI: Record<Action, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  removed: { label: "Removed", className: "text-green-400", Icon: CheckCircle2 },
  kept: { label: "Not removed", className: "text-amber-300", Icon: XCircle },
  unaffected: { label: "Not affected", className: "text-muted-foreground", Icon: MinusCircle },
};

export default function RemovalScope({ title, intro }: { title?: string; intro?: string }) {
  return (
    <div>
      {title && <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h2>}
      {intro && <p className="text-muted-foreground text-base max-w-3xl mb-6 leading-relaxed">{intro}</p>}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="p-4 font-display font-semibold text-foreground">Layer</th>
              <th className="p-4 font-display font-semibold text-foreground hidden md:table-cell">Where it lives</th>
              <th className="p-4 font-display font-semibold text-foreground">What it holds</th>
              <th className="p-4 font-display font-semibold text-foreground">BlankAI</th>
            </tr>
          </thead>
          <tbody>
            {REMOVAL_ROWS.map((row) => {
              const ui = ACTION_UI[row.action];
              return (
                <tr key={row.layer} className="border-b border-border/50 last:border-b-0 align-top">
                  <td className="p-4 font-medium text-foreground whitespace-nowrap">{row.layer}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{row.where}</td>
                  <td className="p-4 text-muted-foreground leading-relaxed">{row.what}</td>
                  <td className={`p-4 font-medium whitespace-nowrap ${ui.className}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <ui.Icon className="w-4 h-4" />
                      {ui.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
