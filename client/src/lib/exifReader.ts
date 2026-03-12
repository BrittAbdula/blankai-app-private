/**
 * exifReader.ts — BlankAI EXIF Viewer
 * Browser-based metadata extraction using exifr library.
 * Supports JPEG, PNG, WebP, HEIC, AVIF, TIFF.
 *
 * Returns structured metadata grouped by category for display.
 */

import * as Exifr from "exifr";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetaField {
  key: string;
  label: string;
  value: string;
  raw?: unknown;
  sensitive?: boolean; // GPS, device serial, etc.
  aiRelated?: boolean; // C2PA, AI generation params
}

export interface MetaGroup {
  id: string;
  label: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class for accent
  fields: MetaField[];
  riskLevel: "none" | "low" | "medium" | "high";
}

export interface ExifResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  width: number | null;
  height: number | null;
  groups: MetaGroup[];
  totalFields: number;
  sensitiveCount: number;
  aiRelatedCount: number;
  hasGPS: boolean;
  hasCameraInfo: boolean;
  hasAIMetadata: boolean;
  rawAll: Record<string, unknown>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val.trim() || "—";
  if (val instanceof Date) return val.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  if (Array.isArray(val)) {
    if (val.length <= 4) return val.map(fmt).join(", ");
    return `[${val.slice(0, 4).map(fmt).join(", ")} … +${val.length - 4} more]`;
  }
  if (typeof val === "object") return JSON.stringify(val).slice(0, 120);
  return String(val);
}

function formatGPS(lat?: number, lon?: number): string {
  if (lat == null || lon == null) return "—";
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatExposure(val: unknown): string {
  if (typeof val !== "number") return fmt(val);
  if (val < 1) return `1/${Math.round(1 / val)}s`;
  return `${val}s`;
}

function formatFStop(val: unknown): string {
  if (typeof val !== "number") return fmt(val);
  return `f/${val.toFixed(1)}`;
}

function formatFocalLength(val: unknown): string {
  if (typeof val !== "number") return fmt(val);
  return `${val}mm`;
}

// ─── Main extractor ───────────────────────────────────────────────────────────

export async function extractExif(file: File): Promise<ExifResult> {
  // Full parse — all segments
  const raw = await Exifr.parse(file, {
    tiff: true,
    exif: true,
    gps: true,
    iptc: true,
    xmp: true,
    icc: true,
    jfif: true,
    ihdr: true,
    translateValues: true,
    translateKeys: true,
    reviveValues: true,
    sanitize: true,
    mergeOutput: false,
  }).catch(() => null);

  const rawFlat = await Exifr.parse(file, {
    tiff: true, exif: true, gps: true, iptc: true, xmp: true,
    icc: true, jfif: true, ihdr: true,
    translateValues: true, translateKeys: true, reviveValues: true,
    sanitize: true, mergeOutput: true,
  }).catch(() => ({})) as Record<string, unknown>;

  const r = (raw as Record<string, Record<string, unknown>> | null) ?? {};

  // Image dimensions
  const tiff = r["tiff"] ?? {};
  const ihdr = r["ihdr"] ?? {};
  const exifSeg = r["exif"] ?? {};
  const gps = r["gps"] ?? {};
  const iptc = r["iptc"] ?? {};
  const xmp = r["xmp"] ?? {};
  const jfif = r["jfif"] ?? {};
  const icc = r["icc"] ?? {};

  const width = (tiff["ImageWidth"] ?? ihdr["ImageWidth"] ?? exifSeg["PixelXDimension"] ?? null) as number | null;
  const height = (tiff["ImageHeight"] ?? ihdr["ImageHeight"] ?? exifSeg["PixelYDimension"] ?? null) as number | null;

  // ── Group: File Info ────────────────────────────────────────────────────────
  const fileGroup: MetaGroup = {
    id: "file",
    label: "File Information",
    icon: "File",
    color: "text-blue-400",
    riskLevel: "none",
    fields: [
      { key: "fileName", label: "File Name", value: file.name },
      { key: "fileSize", label: "File Size", value: formatFileSize(file.size) },
      { key: "fileType", label: "MIME Type", value: file.type || "unknown" },
      { key: "dimensions", label: "Dimensions", value: width && height ? `${width} × ${height} px` : "—" },
      { key: "lastModified", label: "Last Modified", value: new Date(file.lastModified).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC") },
    ],
  };

  // ── Group: Camera & Device ──────────────────────────────────────────────────
  const cameraFields: MetaField[] = [];
  const camMap: [string, string, boolean?][] = [
    ["Make", "Camera Make"],
    ["Model", "Camera Model"],
    ["LensMake", "Lens Make"],
    ["LensModel", "Lens Model"],
    ["Software", "Software"],
    ["BodySerialNumber", "Body Serial", true],
    ["LensSerialNumber", "Lens Serial", true],
    ["CameraOwnerName", "Owner Name", true],
    ["OwnerName", "Owner Name", true],
  ];
  for (const [k, label, sensitive] of camMap) {
    const v = tiff[k] ?? exifSeg[k] ?? rawFlat[k];
    if (v != null && v !== "") {
      cameraFields.push({ key: k, label, value: fmt(v), raw: v, sensitive: !!sensitive });
    }
  }

  const cameraGroup: MetaGroup = {
    id: "camera",
    label: "Camera & Device",
    icon: "Camera",
    color: "text-violet-400",
    riskLevel: cameraFields.some(f => f.sensitive) ? "medium" : cameraFields.length > 0 ? "low" : "none",
    fields: cameraFields,
  };

  // ── Group: Exposure Settings ────────────────────────────────────────────────
  const exposureFields: MetaField[] = [];
  const expMap: [string, string, (v: unknown) => string][] = [
    ["ExposureTime", "Shutter Speed", formatExposure],
    ["FNumber", "Aperture", formatFStop],
    ["ISO", "ISO", fmt],
    ["ISOSpeedRatings", "ISO Speed", fmt],
    ["FocalLength", "Focal Length", formatFocalLength],
    ["FocalLengthIn35mmFormat", "Focal (35mm)", formatFocalLength],
    ["ExposureProgram", "Exposure Program", fmt],
    ["ExposureMode", "Exposure Mode", fmt],
    ["ExposureBiasValue", "Exposure Bias", (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)} EV`],
    ["MeteringMode", "Metering Mode", fmt],
    ["Flash", "Flash", fmt],
    ["WhiteBalance", "White Balance", fmt],
    ["SceneCaptureType", "Scene Type", fmt],
    ["BrightnessValue", "Brightness", (v) => `${Number(v).toFixed(2)} EV`],
    ["ShutterSpeedValue", "Shutter (APEX)", fmt],
    ["ApertureValue", "Aperture (APEX)", fmt],
  ];
  for (const [k, label, formatter] of expMap) {
    const v = exifSeg[k] ?? tiff[k] ?? rawFlat[k];
    if (v != null) {
      exposureFields.push({ key: k, label, value: formatter(v), raw: v });
    }
  }

  const exposureGroup: MetaGroup = {
    id: "exposure",
    label: "Exposure Settings",
    icon: "Aperture",
    color: "text-amber-400",
    riskLevel: "none",
    fields: exposureFields,
  };

  // ── Group: GPS Location ─────────────────────────────────────────────────────
  const gpsFields: MetaField[] = [];
  const lat = gps["latitude"] as number | undefined;
  const lon = gps["longitude"] as number | undefined;
  const alt = gps["Altitude"] ?? gps["altitude"] as number | undefined;

  if (lat != null && lon != null) {
    gpsFields.push({ key: "coords", label: "Coordinates", value: formatGPS(lat, lon), sensitive: true });
    gpsFields.push({ key: "lat", label: "Latitude", value: `${lat.toFixed(8)}°`, sensitive: true });
    gpsFields.push({ key: "lon", label: "Longitude", value: `${lon.toFixed(8)}°`, sensitive: true });
  }
  if (alt != null) {
    gpsFields.push({ key: "alt", label: "Altitude", value: `${Number(alt).toFixed(1)} m`, sensitive: true });
  }
  const gpsExtra: [string, string][] = [
    ["GPSSpeed", "Speed"], ["GPSSpeedRef", "Speed Unit"],
    ["GPSImgDirection", "Direction"], ["GPSImgDirectionRef", "Direction Ref"],
    ["GPSDateStamp", "GPS Date"], ["GPSTimeStamp", "GPS Time"],
    ["GPSProcessingMethod", "Processing Method"],
  ];
  for (const [k, label] of gpsExtra) {
    const v = gps[k] ?? rawFlat[k];
    if (v != null) gpsFields.push({ key: k, label, value: fmt(v), sensitive: true });
  }

  const gpsGroup: MetaGroup = {
    id: "gps",
    label: "GPS Location",
    icon: "MapPin",
    color: "text-red-400",
    riskLevel: gpsFields.length > 0 ? "high" : "none",
    fields: gpsFields,
  };

  // ── Group: Date & Time ──────────────────────────────────────────────────────
  const dateFields: MetaField[] = [];
  const dateMap: [string, string][] = [
    ["DateTimeOriginal", "Date Taken"],
    ["DateTimeDigitized", "Date Digitized"],
    ["DateTime", "Date Modified"],
    ["CreateDate", "Create Date"],
    ["ModifyDate", "Modify Date"],
    ["OffsetTime", "UTC Offset"],
    ["OffsetTimeOriginal", "UTC Offset (Original)"],
    ["SubSecTimeOriginal", "Sub-Second"],
  ];
  for (const [k, label] of dateMap) {
    const v = exifSeg[k] ?? tiff[k] ?? xmp[k] ?? rawFlat[k];
    if (v != null) dateFields.push({ key: k, label, value: fmt(v) });
  }

  const dateGroup: MetaGroup = {
    id: "datetime",
    label: "Date & Time",
    icon: "Clock",
    color: "text-green-400",
    riskLevel: dateFields.length > 0 ? "low" : "none",
    fields: dateFields,
  };

  // ── Group: AI & Generation Metadata ────────────────────────────────────────
  const aiFields: MetaField[] = [];

  // XMP AI fields (C2PA, Adobe Firefly, Stable Diffusion, Midjourney, etc.)
  const aiXmpKeys = [
    "c2pa", "C2PA", "c2paManifest", "c2paVersion",
    "AIGenerationInfo", "ai_generation_info",
    "prompt", "negative_prompt", "steps", "sampler", "cfg_scale", "seed",
    "model", "model_hash", "denoising_strength",
    "GeneratorName", "generatorName", "generator",
    "CreatorTool", "creator_tool",
    "StableDiffusionVersion", "sd_model_name",
    "MidjourneyJobId", "midjourney_job_id",
    "DalleGenerationId", "dalle_generation_id",
    "FireflyJobId", "firefly_job_id",
    "AdobeCreativeCloud", "adobe_creative_cloud",
    "photoshop:ICCProfile",
  ];
  for (const k of aiXmpKeys) {
    const v = xmp[k] ?? rawFlat[k];
    if (v != null) {
      aiFields.push({ key: k, label: k.replace(/([A-Z])/g, " $1").trim(), value: fmt(v), aiRelated: true });
    }
  }

  // PNG tEXt chunks (Stable Diffusion writes here)
  const sdKeys = ["parameters", "Parameters", "Comment", "comment", "Description", "description"];
  for (const k of sdKeys) {
    const v = rawFlat[k];
    if (v != null && typeof v === "string" && v.length > 0) {
      aiFields.push({ key: k, label: `PNG Text: ${k}`, value: v.slice(0, 500) + (v.length > 500 ? "…" : ""), aiRelated: true });
    }
  }

  // Software field — flag AI tools
  const sw = fmt(tiff["Software"] ?? rawFlat["Software"] ?? "");
  const aiSoftware = ["midjourney", "stable diffusion", "dall-e", "firefly", "imagen", "runway", "leonardo", "canva ai", "adobe ai"];
  if (aiSoftware.some(s => sw.toLowerCase().includes(s))) {
    aiFields.push({ key: "aiSoftware", label: "AI Software Detected", value: sw, aiRelated: true });
  }

  const aiGroup: MetaGroup = {
    id: "ai",
    label: "AI & Generation Metadata",
    icon: "Cpu",
    color: "text-cyan-400",
    riskLevel: aiFields.length > 0 ? "high" : "none",
    fields: aiFields,
  };

  // ── Group: IPTC / Copyright ─────────────────────────────────────────────────
  const iptcFields: MetaField[] = [];
  const iptcMap: [string, string, boolean?][] = [
    ["ObjectName", "Title"],
    ["Caption", "Caption"],
    ["Headline", "Headline"],
    ["Keywords", "Keywords"],
    ["By-line", "Author", true],
    ["By-lineTitle", "Author Title"],
    ["Credit", "Credit"],
    ["Source", "Source"],
    ["CopyrightNotice", "Copyright"],
    ["City", "City", true],
    ["Province-State", "State", true],
    ["Country-PrimaryLocationName", "Country", true],
    ["SpecialInstructions", "Instructions"],
    ["Category", "Category"],
  ];
  for (const [k, label, sensitive] of iptcMap) {
    const v = iptc[k] ?? rawFlat[k];
    if (v != null) iptcFields.push({ key: k, label, value: fmt(v), sensitive: !!sensitive });
  }

  const iptcGroup: MetaGroup = {
    id: "iptc",
    label: "IPTC / Copyright",
    icon: "FileText",
    color: "text-orange-400",
    riskLevel: iptcFields.some(f => f.sensitive) ? "medium" : iptcFields.length > 0 ? "low" : "none",
    fields: iptcFields,
  };

  // ── Group: XMP / Adobe ──────────────────────────────────────────────────────
  const xmpFields: MetaField[] = [];
  const skipXmpKeys = new Set([...aiXmpKeys, ...sdKeys]);
  for (const [k, v] of Object.entries(xmp)) {
    if (skipXmpKeys.has(k)) continue;
    if (v != null && v !== "") {
      xmpFields.push({ key: k, label: k.replace(/([A-Z])/g, " $1").trim(), value: fmt(v) });
    }
  }

  const xmpGroup: MetaGroup = {
    id: "xmp",
    label: "XMP / Adobe Metadata",
    icon: "Layers",
    color: "text-pink-400",
    riskLevel: xmpFields.length > 0 ? "low" : "none",
    fields: xmpFields,
  };

  // ── Group: Color Profile ────────────────────────────────────────────────────
  const colorFields: MetaField[] = [];
  const colorMap: [string, string][] = [
    ["ColorSpace", "Color Space"],
    ["ColorComponents", "Color Components"],
    ["YCbCrPositioning", "YCbCr Positioning"],
    ["BitsPerSample", "Bits Per Sample"],
    ["Compression", "Compression"],
    ["PhotometricInterpretation", "Photometric Interpretation"],
    ["Orientation", "Orientation"],
    ["ResolutionUnit", "Resolution Unit"],
    ["XResolution", "X Resolution"],
    ["YResolution", "Y Resolution"],
    ["SamplesPerPixel", "Samples Per Pixel"],
    ["PlanarConfiguration", "Planar Config"],
  ];
  for (const [k, label] of colorMap) {
    const v = tiff[k] ?? exifSeg[k] ?? jfif[k] ?? rawFlat[k];
    if (v != null) colorFields.push({ key: k, label, value: fmt(v) });
  }
  // ICC profile
  if (icc && typeof icc === "object") {
    const iccObj = icc as Record<string, unknown>;
    if (iccObj["ProfileDescription"]) colorFields.push({ key: "iccProfile", label: "ICC Profile", value: fmt(iccObj["ProfileDescription"]) });
    if (iccObj["ColorSpaceData"]) colorFields.push({ key: "iccColorSpace", label: "ICC Color Space", value: fmt(iccObj["ColorSpaceData"]) });
    if (iccObj["DeviceManufacturer"]) colorFields.push({ key: "iccMfr", label: "Device Manufacturer", value: fmt(iccObj["DeviceManufacturer"]) });
  }

  const colorGroup: MetaGroup = {
    id: "color",
    label: "Color & Technical",
    icon: "Palette",
    color: "text-teal-400",
    riskLevel: "none",
    fields: colorFields,
  };

  // ── Group: Thumbnail ────────────────────────────────────────────────────────
  const thumbFields: MetaField[] = [];
  const thumbMap: [string, string][] = [
    ["ThumbnailWidth", "Thumbnail Width"],
    ["ThumbnailHeight", "Thumbnail Height"],
    ["ThumbnailLength", "Thumbnail Size"],
    ["ThumbnailOffset", "Thumbnail Offset"],
  ];
  for (const [k, label] of thumbMap) {
    const v = rawFlat[k];
    if (v != null) thumbFields.push({ key: k, label, value: fmt(v) });
  }

  const thumbGroup: MetaGroup = {
    id: "thumbnail",
    label: "Embedded Thumbnail",
    icon: "Image",
    color: "text-slate-400",
    riskLevel: thumbFields.length > 0 ? "low" : "none",
    fields: thumbFields,
  };

  // ── Assemble ────────────────────────────────────────────────────────────────
  const groups = [
    fileGroup,
    aiGroup,
    gpsGroup,
    cameraGroup,
    exposureGroup,
    dateGroup,
    iptcGroup,
    xmpGroup,
    colorGroup,
    thumbGroup,
  ].filter(g => g.id === "file" || g.fields.length > 0);

  const allFields = groups.flatMap(g => g.fields);
  const sensitiveCount = allFields.filter(f => f.sensitive).length;
  const aiRelatedCount = allFields.filter(f => f.aiRelated).length;

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    width,
    height,
    groups,
    totalFields: allFields.length,
    sensitiveCount,
    aiRelatedCount,
    hasGPS: gpsGroup.fields.length > 0,
    hasCameraInfo: cameraGroup.fields.length > 0,
    hasAIMetadata: aiGroup.fields.length > 0,
    rawAll: rawFlat ?? {},
  };
}
