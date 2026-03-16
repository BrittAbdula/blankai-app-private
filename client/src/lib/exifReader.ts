/**
 * exifReader.ts — BlankAI EXIF Viewer
 * Browser-based metadata extraction using exifr library.
 * Supports JPEG, PNG, WebP, HEIC, AVIF, TIFF.
 *
 * Key fixes for iPhone/HEIC photos:
 * - firstChunkSize: 512KB (HEIC metadata can be deep in the file)
 * - chunkLimit: 20 (allow reading more chunks for large files)
 * - makerNote: true (Apple MakerNote contains device info)
 * - userComment: true (some apps write here)
 * - Dual parse strategy: mergeOutput:false for segments + mergeOutput:true for flat lookup
 * - GPS: use exifr.gps() as primary source (handles N/S/E/W sign correctly)
 * - HEIC fallback: if parse fails, try with chunked:false (read entire file)
 * - DMS-to-decimal manual conversion as last resort
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
  gpsLat?: number;
  gpsLon?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") {
    // Avoid scientific notation for small numbers
    if (Math.abs(val) < 1e-4 && val !== 0) return val.toFixed(8);
    return String(val);
  }
  if (typeof val === "string") return val.trim() || "—";
  if (val instanceof Date) return val.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  if (Array.isArray(val)) {
    if (val.length <= 4) return val.map(fmt).join(", ");
    return `[${val.slice(0, 4).map(fmt).join(", ")} … +${val.length - 4} more]`;
  }
  if (typeof val === "object") return JSON.stringify(val).slice(0, 120);
  return String(val);
}

/** Convert DMS array [degrees, minutes, seconds] to decimal degrees */
function dmsToDecimal(dms: unknown, ref?: string): number | null {
  if (typeof dms === "number") {
    // Already decimal — apply sign from ref
    const sign = (ref === "S" || ref === "W") ? -1 : 1;
    return dms * sign;
  }
  if (Array.isArray(dms) && dms.length >= 3) {
    const [d, m, s] = dms.map(Number);
    if (isNaN(d) || isNaN(m) || isNaN(s)) return null;
    const decimal = d + m / 60 + s / 3600;
    const sign = (ref === "S" || ref === "W") ? -1 : 1;
    return decimal * sign;
  }
  return null;
}

/** Format decimal degrees to DMS string */
function decimalToDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(2);
  const dir = isLat
    ? (decimal >= 0 ? "N" : "S")
    : (decimal >= 0 ? "E" : "W");
  return `${deg}° ${min}' ${sec}" ${dir}`;
}

function formatGPS(lat: number, lon: number): string {
  return `${decimalToDMS(lat, true)}, ${decimalToDMS(lon, false)}`;
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

function formatISO(val: unknown): string {
  if (typeof val === "number") return String(val);
  if (Array.isArray(val) && val.length > 0) return String(val[0]);
  return fmt(val);
}

// ─── Parse options ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExifrOptions = any;

const PARSE_OPTS_BASE: ExifrOptions = {
  tiff: true,
  exif: true,
  gps: true,
  iptc: true,
  xmp: true,
  icc: true,
  jfif: true,
  ihdr: true,
  ifd0: true,
  ifd1: true,
  interop: true,
  makerNote: true,    // Apple MakerNote (device info)
  userComment: true,  // User comments
  translateValues: true,
  translateKeys: true,
  reviveValues: true,
  sanitize: true,
  // Large chunk size for HEIC/HEIF files (metadata can be far into file)
  firstChunkSize: 512 * 1024,  // 512 KB
  chunkSize: 256 * 1024,       // 256 KB
  chunkLimit: 20,              // Allow up to 20 chunks
};

// ─── Main extractor ───────────────────────────────────────────────────────────

export async function extractExif(file: File): Promise<ExifResult> {
  const isHeic = file.type === "image/heic" || file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name);

  // ── Strategy 1: Standard parse with large chunk size ──────────────────────
  let raw: Record<string, Record<string, unknown>> | null = null;
  let rawFlat: Record<string, unknown> = {};

  try {
    raw = await Exifr.parse(file, {
      ...PARSE_OPTS_BASE,
      mergeOutput: false,
    }) as Record<string, Record<string, unknown>> | null;
  } catch (e) {
    console.warn("[exifReader] parse (segmented) failed:", e);
  }

  // ── Strategy 2: If HEIC or raw is null, try reading entire file ───────────
  if (!raw && isHeic) {
    try {
      raw = await Exifr.parse(file, {
        ...PARSE_OPTS_BASE,
        mergeOutput: false,
        chunked: false,  // Read entire file for HEIC
      }) as Record<string, Record<string, unknown>> | null;
    } catch (e) {
      console.warn("[exifReader] parse (full file) failed:", e);
    }
  }

  // ── Flat parse for fallback lookups ───────────────────────────────────────
  try {
    rawFlat = await Exifr.parse(file, {
      ...PARSE_OPTS_BASE,
      mergeOutput: true,
      ...(isHeic ? { chunked: false } : {}),
    }) as Record<string, unknown> ?? {};
  } catch (e) {
    console.warn("[exifReader] parse (flat) failed:", e);
    rawFlat = {};
  }

  // ── GPS: use exifr.gps() as primary (handles N/S/E/W sign) ───────────────
  let gpsLat: number | undefined;
  let gpsLon: number | undefined;

  try {
    const gpsResult = await Exifr.gps(file);
    if (gpsResult?.latitude != null && gpsResult?.longitude != null) {
      gpsLat = gpsResult.latitude;
      gpsLon = gpsResult.longitude;
    }
  } catch (e) {
    console.warn("[exifReader] gps() failed:", e);
  }

  // Fallback GPS from flat parse
  if (gpsLat == null && rawFlat["latitude"] != null) {
    gpsLat = rawFlat["latitude"] as number;
    gpsLon = rawFlat["longitude"] as number;
  }

  // Manual DMS fallback from GPS segment
  const r = raw ?? {};
  const gps = r["gps"] ?? {};
  const tiff = r["tiff"] ?? {};
  const exifSeg = r["exif"] ?? {};
  const iptc = r["iptc"] ?? {};
  const xmp = r["xmp"] ?? {};
  const jfif = r["jfif"] ?? {};
  const icc = r["icc"] ?? {};
  const ihdr = r["ihdr"] ?? {};
  const ifd0 = r["ifd0"] ?? {};
  const ifd1 = r["ifd1"] ?? {};
  const photoshop = r["photoshop"] ?? {};

  if (gpsLat == null) {
    // Try raw GPS segment fields
    const rawLat = gps["GPSLatitude"] ?? gps["latitude"];
    const rawLon = gps["GPSLongitude"] ?? gps["longitude"];
    const latRef = (gps["GPSLatitudeRef"] ?? gps["latitudeRef"] ?? rawFlat["GPSLatitudeRef"]) as string | undefined;
    const lonRef = (gps["GPSLongitudeRef"] ?? gps["longitudeRef"] ?? rawFlat["GPSLongitudeRef"]) as string | undefined;

    if (rawLat != null) {
      gpsLat = dmsToDecimal(rawLat, latRef) ?? undefined;
      gpsLon = dmsToDecimal(rawLon, lonRef) ?? undefined;
    }

    // Try flat parse GPS fields
    if (gpsLat == null) {
      const flatLat = rawFlat["GPSLatitude"];
      const flatLon = rawFlat["GPSLongitude"];
      const flatLatRef = rawFlat["GPSLatitudeRef"] as string | undefined;
      const flatLonRef = rawFlat["GPSLongitudeRef"] as string | undefined;
      if (flatLat != null) {
        gpsLat = dmsToDecimal(flatLat, flatLatRef) ?? undefined;
        gpsLon = dmsToDecimal(flatLon, flatLonRef) ?? undefined;
      }
    }
  }

  // ── Image dimensions ──────────────────────────────────────────────────────
  const width = (
    tiff["ImageWidth"] ??
    ihdr["ImageWidth"] ??
    exifSeg["PixelXDimension"] ??
    rawFlat["ImageWidth"] ??
    rawFlat["PixelXDimension"] ??
    null
  ) as number | null;

  const height = (
    tiff["ImageHeight"] ??
    ihdr["ImageHeight"] ??
    exifSeg["PixelYDimension"] ??
    rawFlat["ImageHeight"] ??
    rawFlat["PixelYDimension"] ??
    null
  ) as number | null;

  // ── Helper: get field from multiple sources ───────────────────────────────
  // Searches: ifd0 (PNG/JPEG TIFF IFD), tiff, exif, xmp, iptc, photoshop, flat
  const get = (...keys: string[]): unknown => {
    for (const k of keys) {
      const v = ifd0[k] ?? tiff[k] ?? exifSeg[k] ?? xmp[k] ?? iptc[k] ?? photoshop[k] ?? rawFlat[k];
      if (v != null && v !== "" && v !== "—") return v;
    }
    return undefined;
  };

  // ── Screenshot detection ──────────────────────────────────────────────────
  const isScreenshot = (
    ifd0["ImageDescription"] === "Screenshot" ||
    rawFlat["ImageDescription"] === "Screenshot" ||
    (exifSeg["UserComment"] === "Screenshot") ||
    (rawFlat["UserComment"] === "Screenshot")
  );

  // ── Group: File Info ──────────────────────────────────────────────────────
  const fileGroup: MetaGroup = {
    id: "file",
    label: "File Information",
    icon: "File",
    color: "text-blue-400",
    riskLevel: "none",
    fields: [
      { key: "fileName", label: "File Name", value: file.name },
      { key: "fileSize", label: "File Size", value: formatFileSize(file.size) },
      { key: "fileType", label: "MIME Type", value: file.type || (isHeic ? "image/heic" : "unknown") },
      {
        key: "dimensions",
        label: "Dimensions",
        value: (() => {
          // Try multiple sources for width/height
          const w = width ?? (exifSeg["ExifImageWidth"] as number | null) ?? (rawFlat["ExifImageWidth"] as number | null);
          const h = height ?? (exifSeg["ExifImageHeight"] as number | null) ?? (rawFlat["ExifImageHeight"] as number | null);
          return w && h ? `${w} × ${h} px` : "—";
        })(),
      },
      { key: "lastModified", label: "Last Modified", value: new Date(file.lastModified).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC") },
      ...(isScreenshot ? [{
        key: "_screenshot_note",
        label: "Note",
        value: "This is a screenshot. Screenshots do not contain GPS or camera EXIF data. To see full metadata, upload a photo taken with your camera app.",
      }] : []),
    ],
  };

  // ── Group: Camera & Device ────────────────────────────────────────────────
  const cameraFields: MetaField[] = [];
  const camMap: [string[], string, boolean?][] = [
    [["Make"], "Camera Make"],
    [["Model"], "Camera Model"],
    [["LensMake"], "Lens Make"],
    [["LensModel", "LensInfo"], "Lens Model"],
    [["Software"], "Software"],
    [["HostComputer"], "Host Computer"],
    [["BodySerialNumber", "SerialNumber"], "Body Serial", true],
    [["LensSerialNumber"], "Lens Serial", true],
    [["CameraOwnerName", "OwnerName"], "Owner Name", true],
    [["Artist"], "Artist", true],
    [["Copyright"], "Copyright"],
  ];
  for (const [keys, label, sensitive] of camMap) {
    const v = get(...keys);
    if (v != null) {
      cameraFields.push({ key: keys[0], label, value: fmt(v), raw: v, sensitive: !!sensitive });
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

  // ── Group: Exposure Settings ──────────────────────────────────────────────
  const exposureFields: MetaField[] = [];
  const expMap: [string[], string, (v: unknown) => string][] = [
    [["ExposureTime", "ShutterSpeedValue"], "Shutter Speed", formatExposure],
    [["FNumber", "ApertureValue"], "Aperture", formatFStop],
    [["ISO", "ISOSpeedRatings", "PhotographicSensitivity"], "ISO", formatISO],
    [["FocalLength"], "Focal Length", formatFocalLength],
    [["FocalLengthIn35mmFormat", "FocalLengthIn35mmFilm"], "Focal (35mm eq.)", formatFocalLength],
    [["ExposureProgram"], "Exposure Program", fmt],
    [["ExposureMode"], "Exposure Mode", fmt],
    [["ExposureBiasValue"], "Exposure Bias", (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)} EV`],
    [["MeteringMode"], "Metering Mode", fmt],
    [["Flash"], "Flash", fmt],
    [["WhiteBalance"], "White Balance", fmt],
    [["SceneCaptureType"], "Scene Type", fmt],
    [["DigitalZoomRatio"], "Digital Zoom", fmt],
    [["SubjectDistance"], "Subject Distance", (v) => `${Number(v).toFixed(2)} m`],
    [["BrightnessValue"], "Brightness", (v) => `${Number(v).toFixed(2)} EV`],
    [["Contrast"], "Contrast", fmt],
    [["Saturation"], "Saturation", fmt],
    [["Sharpness"], "Sharpness", fmt],
    [["ColorSpace"], "Color Space", fmt],
    [["SensingMethod"], "Sensing Method", fmt],
  ];
  for (const [keys, label, formatter] of expMap) {
    const v = get(...keys);
    if (v != null) {
      exposureFields.push({ key: keys[0], label, value: formatter(v), raw: v });
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

  // ── Group: GPS Location ───────────────────────────────────────────────────
  const gpsFields: MetaField[] = [];

  if (gpsLat != null && gpsLon != null) {
    gpsFields.push({
      key: "coords_dms",
      label: "Coordinates (DMS)",
      value: formatGPS(gpsLat, gpsLon),
      sensitive: true,
    });
    gpsFields.push({
      key: "coords_decimal",
      label: "Coordinates (Decimal)",
      value: `${gpsLat.toFixed(7)}, ${gpsLon.toFixed(7)}`,
      sensitive: true,
    });
    gpsFields.push({
      key: "lat",
      label: "Latitude",
      value: `${Math.abs(gpsLat).toFixed(7)}° ${gpsLat >= 0 ? "N" : "S"}`,
      sensitive: true,
    });
    gpsFields.push({
      key: "lon",
      label: "Longitude",
      value: `${Math.abs(gpsLon).toFixed(7)}° ${gpsLon >= 0 ? "E" : "W"}`,
      sensitive: true,
    });
    // Map links (Apple Maps and Google Maps)
    gpsFields.push({
      key: "maps_link_google",
      label: "Google Maps",
      value: `https://maps.google.com/?q=${gpsLat.toFixed(7)},${gpsLon.toFixed(7)}`,
      sensitive: true,
    });
    gpsFields.push({
      key: "maps_link_apple",
      label: "Apple Maps",
      value: `https://maps.apple.com/?q=${gpsLat.toFixed(7)},${gpsLon.toFixed(7)}&ll=${gpsLat.toFixed(7)},${gpsLon.toFixed(7)}`,
      sensitive: true,
    });
  }

  // Altitude
  const altRaw = gps["GPSAltitude"] ?? gps["altitude"] ?? gps["Altitude"] ?? rawFlat["GPSAltitude"];
  const altRef = (gps["GPSAltitudeRef"] ?? rawFlat["GPSAltitudeRef"]) as number | undefined;
  if (altRaw != null) {
    const altVal = typeof altRaw === "number" ? altRaw : Number(altRaw);
    const sign = altRef === 1 ? -1 : 1;
    gpsFields.push({
      key: "alt",
      label: "Altitude",
      value: `${(altVal * sign).toFixed(1)} m ${altRef === 1 ? "(below sea level)" : "(above sea level)"}`,
      sensitive: true,
    });
  }

  // Extra GPS fields
  const gpsExtra: [string[], string][] = [
    [["GPSSpeed", "speed"], "Speed"],
    [["GPSSpeedRef", "speedRef"], "Speed Unit"],
    [["GPSImgDirection", "imgDirection"], "Direction"],
    [["GPSImgDirectionRef", "imgDirectionRef"], "Direction Ref"],
    [["GPSDateStamp", "dateStamp"], "GPS Date"],
    [["GPSTimeStamp", "timeStamp"], "GPS Time"],
    [["GPSProcessingMethod", "processingMethod"], "Processing Method"],
    [["GPSHPositioningError", "hPositioningError"], "Horizontal Accuracy"],
    [["GPSSatellites", "satellites"], "Satellites"],
    [["GPSMeasureMode", "measureMode"], "Measure Mode"],
    [["GPSDOP", "dop"], "DOP (Accuracy)"],
  ];
  for (const [keys, label] of gpsExtra) {
    const v = keys.reduce<unknown>((acc, k) => acc ?? gps[k] ?? rawFlat[k], undefined);
    if (v != null) gpsFields.push({ key: keys[0], label, value: fmt(v), sensitive: true });
  }

  const gpsGroup: MetaGroup = {
    id: "gps",
    label: "GPS Location",
    icon: "MapPin",
    color: "text-red-400",
    riskLevel: gpsFields.length > 0 ? "high" : "none",
    fields: gpsFields,
  };

  // ── Group: Date & Time ────────────────────────────────────────────────────
  const dateFields: MetaField[] = [];
  const dateMap: [string[], string][] = [
    [["DateTimeOriginal", "CreateDate"], "Date Taken"],
    [["DateTimeDigitized"], "Date Digitized"],
    [["DateTime", "ModifyDate"], "Date Modified"],
    [["OffsetTime", "OffsetTimeOriginal"], "UTC Offset"],
    [["SubSecTimeOriginal", "SubSecTime"], "Sub-Second"],
    [["GPSDateStamp"], "GPS Date"],
  ];
  for (const [keys, label] of dateMap) {
    const v = get(...keys) ?? keys.reduce<unknown>((acc, k) => acc ?? xmp[k], undefined);
    if (v != null) dateFields.push({ key: keys[0], label, value: fmt(v) });
  }

  const dateGroup: MetaGroup = {
    id: "datetime",
    label: "Date & Time",
    icon: "Clock",
    color: "text-green-400",
    riskLevel: dateFields.length > 0 ? "low" : "none",
    fields: dateFields,
  };

  // ── Group: AI & Generation Metadata ──────────────────────────────────────
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
  ];
  for (const k of aiXmpKeys) {
    const v = xmp[k] ?? rawFlat[k];
    if (v != null && v !== "") {
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
  const sw = fmt(get("Software") ?? "");
  const aiSoftware = ["midjourney", "stable diffusion", "dall-e", "firefly", "imagen", "runway", "leonardo", "canva ai", "adobe ai", "kling", "sora"];
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

  // ── Group: IPTC / Copyright ───────────────────────────────────────────────
  const iptcFields: MetaField[] = [];
  const iptcMap: [string[], string, boolean?][] = [
    [["ObjectName"], "Title"],
    [["Caption", "LocalCaption"], "Caption"],
    [["Headline"], "Headline"],
    [["Keywords"], "Keywords"],
    [["Byline", "By-line"], "Author", true],
    [["BylineTitle", "By-lineTitle"], "Author Title"],
    [["Credit"], "Credit"],
    [["Source"], "Source"],
    [["CopyrightNotice"], "Copyright"],
    [["City"], "City", true],
    [["State", "Province-State"], "State", true],
    [["Country", "Country-PrimaryLocationName"], "Country", true],
    [["SpecialInstructions"], "Instructions"],
    [["Category"], "Category"],
    [["Writer"], "Caption Writer"],
  ];
  for (const [keys, label, sensitive] of iptcMap) {
    const v = keys.reduce<unknown>((acc, k) => acc ?? iptc[k] ?? rawFlat[k], undefined);
    if (v != null) iptcFields.push({ key: keys[0], label, value: fmt(v), sensitive: !!sensitive });
  }

  const iptcGroup: MetaGroup = {
    id: "iptc",
    label: "IPTC / Copyright",
    icon: "FileText",
    color: "text-orange-400",
    riskLevel: iptcFields.some(f => f.sensitive) ? "medium" : iptcFields.length > 0 ? "low" : "none",
    fields: iptcFields,
  };

  // ── Group: XMP / Adobe ────────────────────────────────────────────────────
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

  // ── Group: Color & Technical ──────────────────────────────────────────────
  const colorFields: MetaField[] = [];
  const colorMap: [string[], string][] = [
    [["ColorSpace"], "Color Space"],
    [["BitsPerSample"], "Bits Per Sample"],
    [["Compression"], "Compression"],
    [["PhotometricInterpretation"], "Photometric Interp."],
    [["Orientation"], "Orientation"],
    [["ResolutionUnit"], "Resolution Unit"],
    [["XResolution"], "X Resolution"],
    [["YResolution"], "Y Resolution"],
    [["YCbCrPositioning"], "YCbCr Positioning"],
    [["SamplesPerPixel"], "Samples Per Pixel"],
    [["PlanarConfiguration"], "Planar Config"],
    [["ComponentsConfiguration"], "Components Config"],
  ];
  for (const [keys, label] of colorMap) {
    const v = get(...keys);
    if (v != null) colorFields.push({ key: keys[0], label, value: fmt(v) });
  }
  // ICC profile
  if (icc && typeof icc === "object") {
    const iccObj = icc as Record<string, unknown>;
    if (iccObj["ProfileDescription"]) colorFields.push({ key: "iccProfile", label: "ICC Profile", value: fmt(iccObj["ProfileDescription"]) });
    if (iccObj["ColorSpaceData"]) colorFields.push({ key: "iccColorSpace", label: "ICC Color Space", value: fmt(iccObj["ColorSpaceData"]) });
    if (iccObj["DeviceManufacturer"]) colorFields.push({ key: "iccMfr", label: "Device Manufacturer", value: fmt(iccObj["DeviceManufacturer"]) });
    if (iccObj["RenderingIntent"]) colorFields.push({ key: "iccIntent", label: "Rendering Intent", value: fmt(iccObj["RenderingIntent"]) });
  }

  const colorGroup: MetaGroup = {
    id: "color",
    label: "Color & Technical",
    icon: "Palette",
    color: "text-teal-400",
    riskLevel: "none",
    fields: colorFields,
  };

  // ── Group: Thumbnail ──────────────────────────────────────────────────────
  const thumbFields: MetaField[] = [];
  const thumbMap: [string[], string][] = [
    [["ThumbnailWidth"], "Thumbnail Width"],
    [["ThumbnailHeight"], "Thumbnail Height"],
    [["ThumbnailLength"], "Thumbnail Size"],
    [["ThumbnailOffset"], "Thumbnail Offset"],
  ];
  for (const [keys, label] of thumbMap) {
    const v = rawFlat[keys[0]];
    if (v != null) thumbFields.push({ key: keys[0], label, value: fmt(v) });
  }

  const thumbGroup: MetaGroup = {
    id: "thumbnail",
    label: "Embedded Thumbnail",
    icon: "Image",
    color: "text-slate-400",
    riskLevel: thumbFields.length > 0 ? "low" : "none",
    fields: thumbFields,
  };

  // ── Assemble ──────────────────────────────────────────────────────────────
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

  // Final width/height with ExifImageWidth/Height as fallback
  const finalWidth = width ?? (exifSeg["ExifImageWidth"] as number | null) ?? (rawFlat["ExifImageWidth"] as number | null);
  const finalHeight = height ?? (exifSeg["ExifImageHeight"] as number | null) ?? (rawFlat["ExifImageHeight"] as number | null);

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || (isHeic ? "image/heic" : "unknown"),
    width: finalWidth,
    height: finalHeight,
    groups,
    totalFields: allFields.length,
    sensitiveCount,
    aiRelatedCount,
    hasGPS: gpsGroup.fields.length > 0,
    hasCameraInfo: cameraGroup.fields.length > 0,
    hasAIMetadata: aiGroup.fields.length > 0,
    rawAll: rawFlat ?? {},
    gpsLat,
    gpsLon,
  };
}
