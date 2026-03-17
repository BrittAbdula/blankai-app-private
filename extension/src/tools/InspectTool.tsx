import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Cpu,
  Download,
  Eye,
  File,
  FileText,
  ImagePlus,
  Info,
  Layers,
  MapPin,
  Palette,
  Pencil,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { extractExif, type ExifResult, type MetaGroup } from "@blankai-core/lib/exifReader";
import {
  buildDisplayMetadataGroups,
  buildMetadataEditDraft,
  createBrowserJpegMetadataWriter,
  normalizeMetadataEditDraft,
  validateMetadataEditDraft,
  type DisplayMetaField,
  type EditableFieldDefinition,
  type MetadataEditDraft,
  type MetadataEditKey,
  type MetadataFieldErrors,
} from "@extension/lib/metadataEditor";
import { EXTENSION_IMAGE_ACCEPT, createSafeImagePreviewDataUrl } from "@extension/lib/imagePreview";
import { cn } from "@extension/lib/utils";
import type { CleanSeed } from "@extension/types";

const INSPECT_ACCEPT = `${EXTENSION_IMAGE_ACCEPT},image/heic,image/heif,.heic,.heif`;

const ICON_MAP: Record<string, ReactNode> = {
  Aperture: <Eye className="h-4 w-4" />,
  Camera: <Camera className="h-4 w-4" />,
  Clock: <Info className="h-4 w-4" />,
  Cpu: <Cpu className="h-4 w-4" />,
  File: <File className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Image: <Sparkles className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  MapPin: <MapPin className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
};

function fileBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function overallRisk(result: ExifResult) {
  const totalRisk = result.sensitiveCount + result.aiRelatedCount;
  if (totalRisk === 0) {
    return {
      color: "text-emerald-300",
      icon: <Shield className="h-4 w-4" />,
      label: "No Sensitive Data",
      tone: "border-emerald-500/20 bg-emerald-500/10",
    };
  }
  if (totalRisk <= 3) {
    return {
      color: "text-blue-300",
      icon: <Info className="h-4 w-4" />,
      label: "Low Risk",
      tone: "border-blue-500/20 bg-blue-500/10",
    };
  }
  if (totalRisk <= 8) {
    return {
      color: "text-amber-300",
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Medium Risk",
      tone: "border-amber-500/20 bg-amber-500/10",
    };
  }
  return {
    color: "text-red-300",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "High Risk",
    tone: "border-red-500/20 bg-red-500/10",
  };
}

function riskTone(level: MetaGroup["riskLevel"]) {
  if (level === "high") return "border-red-500/20 bg-red-500/10 text-red-300";
  if (level === "medium") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  if (level === "low") return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
}

function riskLabel(level: MetaGroup["riskLevel"]) {
  if (level === "high") return "High";
  if (level === "medium") return "Medium";
  if (level === "low") return "Low";
  return "None";
}

function UploadSurface({
  file,
  previewUrl,
  onFile,
}: {
  file: File | null;
  previewUrl: string | null;
  onFile: (file: File) => void;
}) {
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) onFile(nextFile);
  };

  const hasPreview = Boolean(previewUrl);
  const hasSelection = Boolean(file);

  return (
    <label
      className="group flex min-h-[212px] cursor-pointer flex-col items-center justify-center border border-dashed border-cyan/14 bg-[#091120] px-6 py-8 text-center transition-colors hover:border-cyan/28 hover:bg-cyan/5"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={INSPECT_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) onFile(nextFile);
          event.target.value = "";
        }}
      />

      {hasPreview ? (
        <div className="flex w-full flex-col items-center gap-4">
          <img
            src={previewUrl!}
            alt={file?.name ?? "Selected image"}
            className="max-h-48 w-auto border border-cyan/10 bg-[#07101d] object-contain"
          />
          <div className="text-sm font-medium text-white">{file?.name}</div>
        </div>
      ) : hasSelection ? (
        <div className="flex w-full flex-col items-center gap-4">
          <span className="inline-flex h-16 w-16 items-center justify-center border border-cyan/12 bg-[#0d1528] text-cyan">
            <File className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <div className="break-all text-sm font-medium text-white">{file?.name}</div>
            <div className="text-xs text-slate-400">
              Preview unavailable.
            </div>
          </div>
        </div>
      ) : (
        <>
          <span className="inline-flex h-14 w-14 items-center justify-center border border-cyan/15 bg-[#0d1528] text-cyan">
            <ImagePlus className="h-6 w-6" />
          </span>
          <div className="mt-4 text-base font-medium text-white">Drop image or click to inspect</div>
          <div className="mt-1 text-xs text-slate-400">JPEG · PNG · WebP · AVIF · HEIC</div>
        </>
      )}
    </label>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-cyan/10 bg-[#0b1222] text-slate-400 transition-colors hover:border-cyan/25 hover:text-cyan"
      aria-label="Copy field value"
      title="Copy value"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function EditableFieldInput({
  definition,
  draft,
  errors,
  originalDraft,
  onChange,
}: {
  definition: EditableFieldDefinition;
  draft: MetadataEditDraft;
  errors: MetadataFieldErrors;
  originalDraft: MetadataEditDraft | null;
  onChange: (key: MetadataEditKey, value: string) => void;
}) {
  const value = draft[definition.key] ?? "";
  const error = errors[definition.key];
  const isDirty = value !== (originalDraft?.[definition.key] ?? "");

  const className = cn(
    "w-full border bg-[#08101d] px-3 py-2 text-sm text-white outline-none transition-colors",
    error
      ? "border-red-500/40"
      : isDirty
        ? "border-emerald-400/35 focus:border-emerald-400/50"
        : "border-cyan/12 focus:border-cyan/35",
  );

  return (
    <div className="space-y-1.5">
      {definition.inputType === "textarea" ? (
        <textarea
          rows={definition.rows ?? 3}
          value={value}
          placeholder={definition.placeholder}
          onChange={(event) => onChange(definition.key, event.target.value)}
          className={cn(className, "resize-y")}
        />
      ) : (
        <input
          type={definition.inputType}
          step={definition.step}
          value={value}
          placeholder={definition.placeholder}
          onChange={(event) => onChange(definition.key, event.target.value)}
          className={className}
        />
      )}

      {error ? <div className="text-[11px] text-red-300">{error}</div> : null}
      {!error && definition.helperText ? <div className="text-[11px] text-slate-500">{definition.helperText}</div> : null}
    </div>
  );
}

function MetadataFieldRow({
  editDraft,
  field,
  fieldErrors,
  isEditMode,
  originalDraft,
  onFieldChange,
}: {
  editDraft: MetadataEditDraft | null;
  field: DisplayMetaField;
  fieldErrors: MetadataFieldErrors;
  isEditMode: boolean;
  originalDraft: MetadataEditDraft | null;
  onFieldChange: (key: MetadataEditKey, value: string) => void;
}) {
  const isMapLink = field.key === "maps_link_google" || field.key === "maps_link_apple";
  const isEdited = Boolean(
    isEditMode &&
      field.editableDefinition &&
      originalDraft &&
      editDraft &&
      editDraft[field.editableDefinition.key] !== originalDraft[field.editableDefinition.key],
  );

  return (
    <div className={cn("border border-cyan/10 bg-[#0d1528] p-3", isEdited ? "bg-emerald-500/6" : undefined)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-slate-400">{field.label}</div>
            {field.sensitive ? <span className="text-[10px] font-semibold text-red-300">Sensitive</span> : null}
            {field.aiRelated ? <span className="text-[10px] font-semibold text-cyan">AI</span> : null}
            {isEdited ? (
              <span className="border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-emerald-300">
                Edited
              </span>
            ) : null}
          </div>

          {isMapLink ? (
            <a
              href={field.value}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex break-all text-sm text-cyan underline underline-offset-2"
            >
              {field.key === "maps_link_apple" ? "Open in Apple Maps" : "Open in Google Maps"}
            </a>
          ) : isEditMode && field.editableDefinition && editDraft ? (
            <div className="mt-2">
              <EditableFieldInput
                definition={field.editableDefinition}
                draft={editDraft}
                errors={fieldErrors}
                originalDraft={originalDraft}
                onChange={onFieldChange}
              />
            </div>
          ) : (
            <div className="mt-1 break-all text-sm text-white">{field.value}</div>
          )}
        </div>

        {!isEditMode && !isMapLink ? <CopyButton text={field.value} /> : null}
      </div>
    </div>
  );
}

export default function InspectTool({ onSendToClean }: { onSendToClean: (seed: CleanSeed) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState("file");
  const [groupSearch, setGroupSearch] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<MetadataEditDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<MetadataFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFile = async (nextFile: File) => {
    setFile(nextFile);
    setLoading(true);
    setError(null);
    setPreview(null);
    setResult(null);
    setSaveError(null);
    setSaveSuccess(null);
    setFieldErrors({});
    setIsEditMode(false);
    setEditDraft(null);
    setGroupSearch("");

    try {
      const [nextResult, nextPreview] = await Promise.all([
        extractExif(nextFile),
        createSafeImagePreviewDataUrl(nextFile).catch(() => null),
      ]);

      setPreview(nextPreview);
      setResult(nextResult);
      setEditDraft(buildMetadataEditDraft(nextResult));
    } catch (caughtError) {
      setPreview(null);
      setResult(null);
      setEditDraft(null);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to inspect metadata.");
    } finally {
      setLoading(false);
    }
  };

  const displayGroups = useMemo(() => {
    if (!result || !editDraft) return [];
    return buildDisplayMetadataGroups(result, editDraft, isEditMode);
  }, [editDraft, isEditMode, result]);

  const originalDraft = useMemo(() => (result ? buildMetadataEditDraft(result) : null), [result]);
  const currentGroup = displayGroups.find((group) => group.id === activeGroup) ?? displayGroups[0] ?? null;
  const summary = result ? overallRisk(result) : null;

  useEffect(() => {
    if (!result) {
      setActiveGroup("file");
      return;
    }

    setActiveGroup(result.hasGPS ? "gps" : result.hasCameraInfo ? "camera" : result.groups[0]?.id ?? "file");
  }, [result]);

  useEffect(() => {
    setGroupSearch("");
  }, [activeGroup]);

  const filteredFields = useMemo(() => {
    if (!currentGroup) return [];
    if (!groupSearch.trim()) return currentGroup.fields;
    const query = groupSearch.trim().toLowerCase();
    return currentGroup.fields.filter(
      (field) =>
        field.label.toLowerCase().includes(query) ||
        field.value.toLowerCase().includes(query) ||
        field.key.toLowerCase().includes(query),
    );
  }, [currentGroup, groupSearch]);

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.rawAll, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${fileBaseName(result.fileName)}-metadata.json`);
  };

  const exportCsv = () => {
    if (!result) return;
    const rows = [["Category", "Field", "Value"]];
    for (const group of result.groups) {
      for (const field of group.fields) {
        rows.push([group.label, field.label, field.value.replace(/,/g, ";")]);
      }
    }
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv" }), `${fileBaseName(result.fileName)}-metadata.csv`);
  };

  const enterEditMode = () => {
    if (!result) return;
    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    if (!result) return;
    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditMode(false);
  };

  const resetDraft = () => {
    if (!result) return;
    setEditDraft(buildMetadataEditDraft(result));
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleFieldChange = (key: MetadataEditKey, value: string) => {
    setEditDraft((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      return { ...current, [key]: undefined };
    });
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!file || !editDraft) return;

    const normalized = normalizeMetadataEditDraft(editDraft);
    const validationErrors = validateMetadataEditDraft(normalized);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaveError("Check the highlighted fields before saving a new JPEG.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const writer = createBrowserJpegMetadataWriter();
      const edited = await writer.write({ draft: normalized, file });
      downloadBlob(edited.file, edited.file.name);
      await handleFile(edited.file);
      setSaveSuccess("Saved a new JPEG copy and reloaded it.");
      setIsEditMode(false);
    } catch (caughtError) {
      setSaveError(caughtError instanceof Error ? caughtError.message : "Could not save the edited metadata.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
        <UploadSurface
          file={file}
          previewUrl={preview}
          onFile={(nextFile) => {
            void handleFile(nextFile);
          }}
        />

        {loading ? (
          <div className="mt-4 border border-cyan/10 bg-[#091120] px-4 py-3 text-sm text-slate-300">Reading metadata...</div>
        ) : null}

        {error ? (
          <div className="mt-4 border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}
      </section>

      {result && summary && editDraft ? (
        <section className="border-x border-b border-cyan/12 bg-[#0f162a] p-4">
          <div className="flex flex-wrap gap-3">
            {!isEditMode ? (
              <button
                type="button"
                onClick={enterEditMode}
                className="inline-flex h-10 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-3 text-sm text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
                Edit Metadata
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className={cn(
                    "gradient-cyan inline-flex h-10 items-center gap-2 px-3 text-sm font-medium text-[#0a0f1e] transition-opacity",
                    isSaving ? "cursor-wait opacity-70" : "hover:opacity-90",
                  )}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save New JPEG"}
                </button>
                <button
                  type="button"
                  onClick={resetDraft}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-3 text-sm text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={cancelEditMode}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-3 text-sm text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            )}

            <button
              type="button"
              onClick={exportJson}
              className="inline-flex h-10 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-3 text-sm text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-10 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-3 text-sm text-slate-200 transition-colors hover:border-cyan/28 hover:text-white"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => {
                if (!file) return;
                onSendToClean({ file, previewDataUrl: preview });
              }}
              className="inline-flex h-10 items-center gap-2 border border-cyan/14 bg-[#0b1222] px-3 text-sm text-cyan transition-colors hover:border-cyan/28 hover:text-white"
            >
              <Zap className="h-4 w-4" />
              Send To Clean
            </button>
          </div>

          {saveError ? (
            <div className="mt-4 border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">{saveError}</div>
          ) : null}

          {saveSuccess ? (
            <div className="mt-4 border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-200">
              {saveSuccess}
            </div>
          ) : null}

          <div className="mt-4 flex gap-px overflow-x-auto border border-cyan/12 bg-[#08101d]">
            {displayGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
                  currentGroup?.id === group.id
                    ? "bg-cyan/12 text-cyan"
                    : "bg-[#0b1222]/70 text-slate-300 hover:bg-[#0f172b] hover:text-white",
                )}
              >
                {ICON_MAP[group.icon] ?? <File className="h-4 w-4" />}
                <span>{group.label}</span>
                <span className={cn("border px-1.5 py-0.5 text-[10px]", riskTone(group.riskLevel))}>{riskLabel(group.riskLevel)}</span>
                <span className="text-[10px] text-slate-500">{group.fields.length}</span>
              </button>
            ))}
          </div>

          {currentGroup ? (
            <div className="mt-4 border border-cyan/10 bg-[#091120] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  {ICON_MAP[currentGroup.icon] ?? <File className="h-4 w-4" />}
                  {currentGroup.label}
                </div>
                <div className={cn("border px-2.5 py-1 text-xs font-medium", riskTone(currentGroup.riskLevel))}>
                  {riskLabel(currentGroup.riskLevel)}
                </div>
              </div>

              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={groupSearch}
                  onChange={(event) => setGroupSearch(event.target.value)}
                  placeholder="Filter fields..."
                  className="w-full border border-cyan/10 bg-[#0b1222] py-2 pl-9 pr-9 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan/28"
                />
                {groupSearch ? (
                  <button
                    type="button"
                    onClick={() => setGroupSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid gap-2">
                {filteredFields.length > 0 ? (
                  filteredFields.map((field) => (
                    <MetadataFieldRow
                      key={field.key}
                      editDraft={editDraft}
                      field={field}
                      fieldErrors={fieldErrors}
                      isEditMode={isEditMode}
                      originalDraft={originalDraft}
                      onFieldChange={handleFieldChange}
                    />
                  ))
                ) : (
                  <div className="border border-cyan/10 bg-[#0d1528] p-3 text-sm text-slate-300">No fields match your search.</div>
                )}
              </div>
            </div>
          ) : null}

          <div className={cn("mt-4 border p-4", summary.tone)}>
            <div className={cn("flex items-center gap-2 text-sm font-medium", summary.color)}>
              {summary.icon}
              {summary.label}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Fields", value: result.totalFields },
                { label: "Sensitive", value: result.sensitiveCount },
                { label: "AI", value: result.aiRelatedCount },
                { label: "Groups", value: result.groups.length },
                { label: "Size", value: formatFileSize(result.fileSize) },
                { label: "Dimensions", value: result.width && result.height ? `${result.width}×${result.height}` : "Unknown" },
              ].map((item) => (
                <div key={item.label} className="border border-white/8 bg-black/10 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{item.label}</div>
                  <div className="mt-1 truncate text-base font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
