/**
 * ProvenanceSummary: what the container scanner found in a file, grouped by
 * kind, plus provenance hints (C2PA mentions, AI source type, watermark note).
 * Used by the EXIF Viewer and by the remover before cleaning.
 */
import { AlertTriangle, FileSearch, ShieldCheck } from "lucide-react";
import type { FindingCategory, MetadataScan } from "@/lib/metadataScan";

const CATEGORY_LABEL: Record<FindingCategory, string> = {
  privacy: "Personal data",
  provenance: "Provenance and AI labels",
  ai: "AI generation data",
  technical: "Technical",
};

const CATEGORY_STYLE: Record<FindingCategory, string> = {
  privacy: "border-red-500/25 bg-red-500/10 text-red-200",
  provenance: "border-amber-500/25 bg-amber-500/10 text-amber-100",
  ai: "border-violet-500/25 bg-violet-500/10 text-violet-100",
  technical: "border-border bg-muted/40 text-muted-foreground",
};

export default function ProvenanceSummary({ scan, title = "What this file carries" }: { scan: MetadataScan; title?: string }) {
  const categories = (Object.keys(CATEGORY_LABEL) as FindingCategory[]).filter((category) =>
    scan.findings.some((finding) => finding.category === category),
  );
  const { hints } = scan;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <FileSearch className="w-4 h-4 text-cyan" />
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Read from the file's own structure ({scan.format === "unknown" ? "unrecognized format" : scan.format.toUpperCase()}), in your browser.
      </p>

      {scan.findings.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-cyan" />
          No metadata containers found: no EXIF, GPS, XMP, IPTC, C2PA or text chunks.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category}>
              <p className="text-[11px] font-mono-custom uppercase tracking-[0.16em] text-muted-foreground/80 mb-1.5">
                {CATEGORY_LABEL[category]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scan.findings
                  .filter((finding) => finding.category === category)
                  .map((finding) => (
                    <span key={finding.id} className={`rounded-md border px-2 py-1 text-xs ${CATEGORY_STYLE[category]}`}>
                      {finding.label}
                      {finding.detail ? <span className="opacity-75"> · {finding.detail}</span> : null}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(hints.c2pa || hints.aiSourceType || hints.cnAigcLabel || hints.watermarkLikely.length > 0) && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" /> Provenance notes
          </p>
          <ul className="space-y-1">
            {hints.c2pa && (
              <li>
                Signed C2PA manifest present
                {hints.c2paMentions.length ? `; it mentions ${hints.c2paMentions.join(", ")}` : ""}.
              </li>
            )}
            {hints.aiSourceType && <li>IPTC digital source type: {hints.aiSourceType}.</li>}
            {hints.cnAigcLabel && (
              <li>China AIGC implicit label (GB 45438-2025). Removing it is prohibited in mainland China.</li>
            )}
            {hints.watermarkLikely.length > 0 && (
              <li>
                The generator named here also applies {hints.watermarkLikely.join("; ")}. That watermark is in the pixels and is
                not removed by cleaning metadata.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
