import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  File,
  FileText,
  Image,
  Layers,
  MapPin,
  Palette,
  Search,
  X,
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import type { ExifResult, MetaGroup } from "@/lib/exifReader";
import type {
  DisplayMetaGroup,
  EditableFieldDefinition,
  MetadataEditDraft,
  MetadataEditKey,
  MetadataFieldErrors,
} from "@/lib/metadataEditor";

const ICON_MAP: Record<string, ReactNode> = {
  File: <File className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  MapPin: <MapPin className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Aperture: <Eye className="w-4 h-4" />,
};

function RiskBadge({ level }: { level: MetaGroup["riskLevel"] }) {
  if (level === "none") return null;

  const tone = {
    high: "bg-red-500/15 text-red-400 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const label = {
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${tone[level]}`}
    >
      <AlertTriangle className="w-2.5 h-2.5" />
      {label[level]}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 hover:text-foreground"
      title="Copy value"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function GroupPanel({
  group,
  groupId,
  isActive,
  isEditMode,
  draft,
  originalDraft,
  fieldErrors,
  onFieldChange,
}: {
  group: DisplayMetaGroup;
  groupId: string;
  isActive: boolean;
  isEditMode: boolean;
  draft: MetadataEditDraft | null;
  originalDraft: MetadataEditDraft | null;
  fieldErrors: MetadataFieldErrors;
  onFieldChange?: (key: MetadataEditKey, value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = search
    ? group.fields.filter(
        field =>
          field.label.toLowerCase().includes(search.toLowerCase()) ||
          field.value.toLowerCase().includes(search.toLowerCase()),
      )
    : group.fields;

  const renderEditableField = (definition: EditableFieldDefinition) => {
    const value = draft?.[definition.key] ?? "";
    const error = fieldErrors[definition.key];
    const isDirty = value !== (originalDraft?.[definition.key] ?? "");
    const sharedClassName = `w-full rounded-lg border px-3 py-2 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 ${
      error
        ? "border-red-500/50 bg-red-500/5 focus:border-red-500/60 focus:ring-red-500/20"
        : isDirty
          ? "border-emerald-400/45 bg-emerald-500/10 focus:border-emerald-400/55 focus:ring-emerald-400/20"
          : "border-cyan/35 bg-cyan/10 focus:border-cyan/50 focus:ring-cyan/20"
    }`;

    if (definition.inputType === "textarea") {
      return (
        <textarea
          value={value}
          rows={definition.rows ?? 3}
          placeholder={definition.placeholder}
          onChange={event => onFieldChange?.(definition.key, event.target.value)}
          className={`${sharedClassName} min-h-24 resize-y`}
        />
      );
    }

    return (
      <input
        type={definition.inputType}
        value={value}
        step={definition.step}
        placeholder={definition.placeholder}
        onChange={event => onFieldChange?.(definition.key, event.target.value)}
        className={sharedClassName}
      />
    );
  };

  return (
    <div
      id={groupId}
      data-group-id={group.id}
      className={`rounded-xl border transition-all duration-200 scroll-mt-44 lg:scroll-mt-24 ${
        isActive
          ? "border-cyan/40 bg-navy-800/80"
          : "border-border/50 bg-navy-800/40"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex-shrink-0 ${group.color}`}>
            {ICON_MAP[group.icon] ?? <File className="w-4 h-4" />}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {group.label}
          </span>
          <span className="flex-shrink-0 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
            {group.fields.length}
          </span>
          <RiskBadge level={group.riskLevel} />
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {group.fields.length > 6 && group.id !== "gps" && (
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter fields…"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-lg border border-border/50 bg-muted/30 py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan/50 focus:outline-none focus:ring-1 focus:ring-cyan/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="py-2 text-xs italic text-muted-foreground">
              No fields match your search.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map(field => {
                const isMapLink =
                  field.key === "maps_link_google" || field.key === "maps_link_apple";
                const editableDefinition = field.editableDefinition;
                const isEditable = isEditMode && Boolean(editableDefinition);
                const isDirty = editableDefinition
                  ? draft?.[editableDefinition.key] !==
                    (originalDraft?.[editableDefinition.key] ?? "")
                  : false;

                return (
                  <div
                    key={field.key}
                    className={`group flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors ${
                      isEditable ? (isDirty ? "bg-emerald-500/5" : "bg-cyan/5") : ""
                    }`}
                  >
                    <div className="w-36 flex-shrink-0 sm:w-44">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-xs font-medium leading-relaxed ${
                            isEditable
                              ? isDirty
                                ? "text-emerald-300"
                                : "text-cyan-200"
                              : "text-muted-foreground"
                          }`}
                        >
                          {field.label}
                        </span>
                        {field.sensitive && (
                          <span className="text-[9px] font-bold text-red-400">●</span>
                        )}
                        {field.aiRelated && (
                          <span className="text-[9px] font-bold text-cyan">AI</span>
                        )}
                        {isEditable && !isDirty && (
                          <span className="rounded-full border border-cyan/20 bg-cyan/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan/85">
                            Editable
                          </span>
                        )}
                        {isEditable && isDirty && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                            Edited
                          </span>
                        )}
                        {isEditMode && !field.editableDefinition && (
                          <span className="rounded-full border border-border/50 bg-muted/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                            Read-only
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 items-start gap-1">
                      {isMapLink ? (
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 break-all text-xs leading-relaxed text-cyan underline underline-offset-2 hover:text-cyan/80"
                          onClick={event => event.stopPropagation()}
                        >
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {field.key === "maps_link_apple"
                            ? "Open in Apple Maps"
                            : "Open in Google Maps"}
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      ) : isEditable && editableDefinition ? (
                        <div className="w-full space-y-1.5">
                          {renderEditableField(editableDefinition)}
                          {(fieldErrors[editableDefinition.key] ||
                            editableDefinition.helperText) && (
                            <p
                              className={`text-[11px] leading-relaxed ${
                                fieldErrors[editableDefinition.key]
                                  ? "text-red-400"
                                  : "text-muted-foreground/80"
                              }`}
                            >
                              {fieldErrors[editableDefinition.key] ??
                                editableDefinition.helperText}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="break-all font-mono-custom text-xs leading-relaxed text-foreground">
                          {field.value}
                        </span>
                      )}
                      {!isEditMode && !isMapLink && <CopyBtn text={field.value} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface MetadataViewerPanelProps {
  result: ExifResult;
  previewUrl?: string | null;
  groups: DisplayMetaGroup[];
  toolbarActions?: ReactNode;
  notices?: ReactNode;
  bottomContent?: ReactNode;
  isEditMode?: boolean;
  draft?: MetadataEditDraft | null;
  originalDraft?: MetadataEditDraft | null;
  fieldErrors?: MetadataFieldErrors;
  onFieldChange?: (key: MetadataEditKey, value: string) => void;
  stickyToolbar?: boolean;
  stickyBaseOffset?: number;
  containerIdPrefix?: string;
}

export default function MetadataViewerPanel({
  result,
  previewUrl = null,
  groups,
  toolbarActions,
  notices,
  bottomContent,
  isEditMode = false,
  draft = null,
  originalDraft = null,
  fieldErrors = {},
  onFieldChange,
  stickyToolbar = false,
  stickyBaseOffset = 0,
  containerIdPrefix = "metadata",
}: MetadataViewerPanelProps) {
  const [activeGroup, setActiveGroup] = useState("file");
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const resultToolbarRef = useRef<HTMLDivElement>(null);
  const mobileCategoryShellRef = useRef<HTMLDivElement>(null);
  const mobileCategoryNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextDefaultGroup = result.hasGPS
      ? "gps"
      : result.hasCameraInfo
        ? "camera"
        : groups[0]?.id ?? "file";

    setActiveGroup(current =>
      groups.some(group => group.id === current) ? current : nextDefaultGroup,
    );
  }, [groups, result.hasCameraInfo, result.hasGPS]);

  useEffect(() => {
    if (!stickyToolbar) {
      setToolbarHeight(0);
      return;
    }

    const node = resultToolbarRef.current;
    if (!node) {
      setToolbarHeight(0);
      return;
    }

    const updateHeight = () => {
      setToolbarHeight(node.getBoundingClientRect().height);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [groups, notices, stickyToolbar, toolbarActions]);

  useEffect(() => {
    if (groups.length === 0) return;

    const entries = groups
      .map(group => {
        const element = document.getElementById(
          `${containerIdPrefix}-group-${group.id}`,
        );
        return element instanceof HTMLElement ? { id: group.id, element } : null;
      })
      .filter((entry): entry is { id: string; element: HTMLElement } => Boolean(entry));

    if (entries.length === 0) return;

    const observer = new IntersectionObserver(
      observedEntries => {
        const visible = observedEntries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible?.target.id) return;

        const nextGroupId = (visible.target as HTMLElement).dataset.groupId;
        if (nextGroupId) setActiveGroup(nextGroupId);
      },
      {
        rootMargin: "-120px 0px -45% 0px",
        threshold: [0.2, 0.35, 0.5, 0.75],
      },
    );

    entries.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, [containerIdPrefix, groups]);

  useEffect(() => {
    const activeButton = mobileCategoryNavRef.current?.querySelector<HTMLButtonElement>(
      `[data-group-nav="${activeGroup}"]`,
    );
    activeButton?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeGroup]);

  const scrollToGroup = (id: string) => {
    setActiveGroup(id);

    const group = document.getElementById(`${containerIdPrefix}-group-${id}`);
    if (!group) return;

    const isDesktop = window.innerWidth >= 1024;
    const mobileNavHeight = stickyToolbar
      ? mobileCategoryShellRef.current?.getBoundingClientRect().height ?? 0
      : 0;
    const toolbarOffset = stickyBaseOffset + (stickyToolbar ? toolbarHeight : 0);
    const offset = isDesktop
      ? toolbarOffset + 24
      : toolbarOffset + mobileNavHeight + 24;
    const nextTop = window.scrollY + group.getBoundingClientRect().top - offset;

    window.scrollTo({
      top: Math.max(nextTop, 0),
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease-out" }}>
      <div
        ref={resultToolbarRef}
        className={`rounded-2xl border border-border/40 px-4 py-3 ${
          stickyToolbar
            ? "sticky z-30 bg-background/90 backdrop-blur-md shadow-[0_18px_48px_rgba(4,10,20,0.22)]"
            : "bg-background"
        }`}
        style={stickyToolbar ? { top: `${stickyBaseOffset}px` } : undefined}
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            {previewUrl && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/30">
                <ImagePreview
                  src={previewUrl}
                  alt={result.fileName}
                  showExifAction={false}
                  className="h-full w-full"
                  imgClassName="object-cover"
                  fallbackLabel="No preview"
                />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold text-foreground">
                {result.fileName}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {result.width && result.height ? `${result.width} × ${result.height} px · ` : ""}
                {(result.fileSize / 1024).toFixed(1)} KB · {result.fileType}
              </p>
            </div>
          </div>
          {toolbarActions ? (
            <div className="flex flex-wrap items-center gap-2">{toolbarActions}</div>
          ) : null}
        </div>
      </div>

      {notices}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div
          ref={mobileCategoryShellRef}
          className={`w-full lg:hidden ${
            stickyToolbar ? "sticky z-20 -mx-4 px-4 pb-2 pt-1" : ""
          }`}
          style={
            stickyToolbar
              ? { top: `${stickyBaseOffset + toolbarHeight + 8}px` }
              : undefined
          }
        >
          <div
            className={`rounded-2xl border border-border/40 ${
              stickyToolbar
                ? "bg-background/85 backdrop-blur-md shadow-[0_10px_40px_rgba(4,10,20,0.28)]"
                : "bg-muted/15"
            }`}
          >
            <div className="flex items-center justify-between px-4 pt-3">
              <p className="text-[10px] font-mono-custom uppercase tracking-[0.2em] text-muted-foreground/60">
                Categories
              </p>
              <span className="text-[10px] text-muted-foreground/50">Swipe to jump</span>
            </div>
            <div
              ref={mobileCategoryNavRef}
              className="flex gap-2 overflow-x-auto px-3 pb-3 pt-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
            >
              {groups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  data-group-nav={group.id}
                  onClick={() => scrollToGroup(group.id)}
                  className={`snap-start min-w-fit shrink-0 rounded-xl border px-3 py-2 text-left transition-all ${
                    activeGroup === group.id
                      ? "border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_0_1px_rgba(0,255,255,0.08)]"
                      : "border-border/50 bg-muted/20 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`flex-shrink-0 ${group.color}`}>
                      {ICON_MAP[group.icon] ?? <File className="w-4 h-4" />}
                    </span>
                    <span className="whitespace-nowrap text-xs font-medium">
                      {group.label}
                    </span>
                    {group.riskLevel !== "none" && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          group.riskLevel === "high"
                            ? "bg-red-400"
                            : group.riskLevel === "medium"
                              ? "bg-amber-400"
                              : "bg-blue-400"
                        }`}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside
          className={`hidden w-52 flex-shrink-0 lg:block ${
            stickyToolbar ? "sticky" : ""
          }`}
          style={stickyToolbar ? { top: `${stickyBaseOffset + toolbarHeight + 24}px` } : undefined}
        >
          <p className="mb-2 px-2 text-[10px] font-mono-custom uppercase tracking-wider text-muted-foreground/50">
            Categories
          </p>
          <nav className="space-y-0.5">
            {groups.map(group => (
              <button
                key={group.id}
                type="button"
                data-group-nav={group.id}
                onClick={() => scrollToGroup(group.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-all ${
                  activeGroup === group.id
                    ? "bg-cyan/10 text-cyan"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`flex-shrink-0 ${group.color}`}>
                    {ICON_MAP[group.icon] ?? <File className="w-4 h-4" />}
                  </span>
                  <span className="truncate text-xs font-medium">{group.label}</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {group.riskLevel !== "none" && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        group.riskLevel === "high"
                          ? "bg-red-400"
                          : group.riskLevel === "medium"
                            ? "bg-amber-400"
                            : "bg-blue-400"
                      }`}
                    />
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {group.fields.length}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-3">
          {groups.map(group => (
            <GroupPanel
              key={group.id}
              group={group}
              groupId={`${containerIdPrefix}-group-${group.id}`}
              isActive={activeGroup === group.id}
              isEditMode={isEditMode}
              draft={draft}
              originalDraft={originalDraft}
              fieldErrors={fieldErrors}
              onFieldChange={onFieldChange}
            />
          ))}

          {bottomContent}
        </div>
      </div>
    </div>
  );
}
