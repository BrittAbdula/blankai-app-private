import { useState } from "react";
import { AlertTriangle, ImagePlus, MapPin, ScanSearch, Shield, Sparkles } from "lucide-react";
import { extractExif, type ExifResult, type MetaGroup } from "@blankai-core/lib/exifReader";
import { readFileAsDataUrl } from "@extension/lib/imageDiff";

function pickGroups(groups: MetaGroup[]) {
  const ids = new Set(["file", "camera", "gps", "ai"]);
  return groups.filter((group) => ids.has(group.id));
}

function riskTone(level: MetaGroup["riskLevel"]) {
  if (level === "high") return "border-amber-200 bg-amber-50 text-amber-700";
  if (level === "medium") return "border-orange-200 bg-orange-50 text-orange-700";
  if (level === "low") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function riskLabel(level: MetaGroup["riskLevel"]) {
  if (level === "high") return "High risk";
  if (level === "medium") return "Medium risk";
  if (level === "low") return "Low risk";
  return "No risk";
}

export default function InspectTool() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const [nextPreview, nextResult] = await Promise.all([readFileAsDataUrl(file), extractExif(file)]);
      setPreview(nextPreview);
      setResult(nextResult);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to inspect metadata.");
    } finally {
      setLoading(false);
    }
  };

  const focusGroups = result ? pickGroups(result.groups) : [];

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-slate-900">Inspect image metadata</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review privacy-sensitive fields before you share or publish an image.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <ScanSearch className="h-3.5 w-3.5" />
            Local scan
          </div>
        </div>

        <label className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              if (nextFile) {
                void handleFile(nextFile);
              }
            }}
          />
          {preview ? (
            <div className="flex w-full flex-col items-center gap-4">
              <img
                src={preview}
                alt={result?.fileName ?? "Selected image"}
                className="max-h-48 w-auto rounded-2xl border border-slate-200 object-contain"
              />
              <div className="text-sm font-medium text-slate-900">{result?.fileName}</div>
            </div>
          ) : (
            <>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-primary">
                <ImagePlus className="h-6 w-6" />
              </span>
              <div className="mt-4 text-base font-medium text-slate-900">Select an image to inspect</div>
              <div className="mt-1 text-sm text-slate-500">Supported: JPG, PNG, WebP, AVIF, and HEIC</div>
            </>
          )}
        </label>

        {loading ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Inspecting metadata locally...</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-slate-900">Metadata summary</h3>
            <p className="mt-1 text-sm text-slate-500">
              {result
                ? "Review the groups below to see what might reveal device, location, or generation history."
                : "Upload an image to see grouped risk cards for file, camera, location, and AI-related metadata."}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            All processing happens locally in your browser.
          </div>
        </div>

        {result ? (
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Sensitive fields</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{result.sensitiveCount}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">AI fields</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{result.aiRelatedCount}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Total fields</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{result.totalFields}</div>
              </div>
            </div>

            <div className="grid gap-3">
              {focusGroups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {group.id === "gps" ? (
                        <MapPin className="h-4 w-4 text-primary" />
                      ) : group.id === "ai" ? (
                        <Sparkles className="h-4 w-4 text-primary" />
                      ) : group.id === "camera" ? (
                        <AlertTriangle className="h-4 w-4 text-primary" />
                      ) : (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                      <div className="text-sm font-medium text-slate-900">{group.label}</div>
                    </div>
                    <div className={`rounded-full border px-2.5 py-1 text-xs font-medium ${riskTone(group.riskLevel)}`}>
                      {riskLabel(group.riskLevel)}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {group.fields.slice(0, 4).map((field) => (
                      <div key={field.key} className="rounded-xl border border-white bg-white p-3">
                        <div className="text-xs text-slate-500">{field.label}</div>
                        <div className="mt-1 break-all text-sm text-slate-900">{field.value}</div>
                      </div>
                    ))}
                    {group.fields.length === 0 ? (
                      <div className="rounded-xl border border-white bg-white p-3 text-sm text-slate-500">
                        No fields detected in this section.
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            BlankAI highlights the fields most likely to reveal device details, location, or AI generation history so you can decide whether to clean the image before sharing.
          </div>
        )}
      </section>
    </div>
  );
}
