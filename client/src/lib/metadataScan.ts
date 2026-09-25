/**
 * metadataScan: a small, dependency-light scanner for the metadata containers
 * that travel with image files.
 *
 * It walks the real container structure (JPEG segments, PNG chunks, WebP RIFF
 * chunks) and falls back to exifr for HEIF/AVIF. The result is used to:
 *   1. show an honest "found in this file" list before and after cleaning, and
 *   2. re-scan the cleaned output to verify nothing carried over.
 *
 * It does NOT detect invisible pixel watermarks (SynthID, Meta's watermark,
 * etc.). Those live in the pixels, not in metadata containers. `hints.watermarkLikely`
 * only reports watermark families that the file's own provenance data says
 * the generator uses.
 */

export type FindingCategory = "privacy" | "provenance" | "ai" | "technical";

export interface MetadataFinding {
  /** Stable id, e.g. "gps", "c2pa", "exif". */
  id: string;
  label: string;
  detail?: string;
  category: FindingCategory;
}

export interface ProvenanceHints {
  c2pa: boolean;
  /** Organisation or product names mentioned inside the C2PA manifest. */
  c2paMentions: string[];
  /** IPTC digital source type code, e.g. "trainedAlgorithmicMedia". */
  aiSourceType?: string;
  /** AI tool names spotted in Software, CreatorTool, XMP or PNG text. */
  aiTools: string[];
  /** China GB 45438-2025 implicit AIGC label present in metadata. */
  cnAigcLabel: boolean;
  /** Invisible watermark families the detected generator is known to apply. */
  watermarkLikely: string[];
}

export type ScannedFormat = "jpeg" | "png" | "webp" | "heif" | "avif" | "unknown";

export interface MetadataScan {
  format: ScannedFormat;
  findings: MetadataFinding[];
  hints: ProvenanceHints;
}

// ─── Known names ───────────────────────────────────────────────────────────────

const PROVENANCE_NAMES: [RegExp, string][] = [
  [/OpenAI|ChatGPT|DALL.?E|gpt-image/i, "OpenAI"],
  [/Gemini|Imagen|Nano Banana|Google/i, "Google"],
  [/Firefly|Photoshop|Lightroom|Adobe Inc/i, "Adobe"],
  [/Microsoft|Bing Image Creator|Copilot/i, "Microsoft"],
  [/Meta Platforms|Meta AI|Muse Image/i, "Meta"],
  [/TikTok|ByteDance|Dreamina|CapCut|Jimeng|Seedream/i, "ByteDance"],
  [/Black Forest Labs|FLUX[.\- ]?(1|2|3|dev|schnell|pro|kontext)/i, "Black Forest Labs"],
  [/Anthropic|\bClaude\b/i, "Anthropic"],
  [/Midjourney/i, "Midjourney"],
  [/Stability AI/i, "Stability AI"],
  [/\bCanva\b/i, "Canva"],
  [/Samsung/i, "Samsung"],
  [/\bSony\b/i, "Sony"],
  [/\bLeica\b/i, "Leica"],
  [/\bNikon\b/i, "Nikon"],
  [/\bCanon\b/, "Canon"],
  [/Fujifilm/i, "Fujifilm"],
  [/Truepic/i, "Truepic"],
];

const AI_TOOL_NAMES: [RegExp, string][] = [
  [/Midjourney/i, "Midjourney"],
  [/Stable Diffusion|stable-diffusion|\bSDXL\b/i, "Stable Diffusion"],
  [/ComfyUI/i, "ComfyUI"],
  [/AUTOMATIC1111|\bA1111\b/i, "AUTOMATIC1111"],
  [/InvokeAI/i, "InvokeAI"],
  [/Fooocus/i, "Fooocus"],
  [/NovelAI/i, "NovelAI"],
  [/DALL.?E ?\d|DALL.?E/, "DALL-E"],
  [/ChatGPT|gpt-image/i, "ChatGPT Images"],
  [/Adobe Firefly|Firefly Image/i, "Adobe Firefly"],
  [/Google Imagen|Imagen ?\d/i, "Google Imagen"],
  [/Gemini (app|image|\d)|Nano Banana|Made with Google AI/i, "Google Gemini"],
  [/Leonardo\.?Ai/i, "Leonardo.Ai"],
  [/Ideogram/i, "Ideogram"],
  [/FLUX[.\- ]?(1|2|3|dev|schnell|pro|kontext)|Black Forest Labs|AI generated;[^\n]*flux/i, "FLUX"],
  [/Grok Imagine|xAI Grok/i, "Grok Imagine"],
  [/Seedream|Dreamina|Jimeng/i, "ByteDance Seedream"],
  [/Kling AI|Kuaishou Kling/i, "Kling"],
  [/Runway ?(ML|Gen-?\d)/i, "Runway"],
  [/Qwen-Image|Qwen Image/i, "Qwen-Image"],
  [/Image Playground/i, "Apple Image Playground"],
  [/Apple Photos Clean Up/i, "Apple Photos Clean Up"],
  [/Bing Image Creator|Microsoft Designer/i, "Microsoft Designer"],
];

/** Watermark families generators say they apply (see sources on /blog). */
const WATERMARK_BY_VENDOR: Record<string, string> = {
  OpenAI: "SynthID (OpenAI adds it to ChatGPT and API images)",
  Google: "SynthID (Google's invisible watermark)",
  Meta: "Meta's invisible watermark",
  ByteDance: "ByteDance invisible watermark",
};

const AI_SOURCE_TYPES = [
  "compositeWithTrainedAlgorithmicMedia",
  "trainedAlgorithmicMedia",
  "algorithmicMedia",
  "compositeSynthetic",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const latin1 = new TextDecoder("latin1");
const utf8 = new TextDecoder("utf-8", { fatal: false });

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let s = "";
  const end = Math.min(bytes.length, start + length);
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function startsWith(bytes: Uint8Array, offset: number, text: string): boolean {
  if (offset + text.length > bytes.length) return false;
  for (let i = 0; i < text.length; i++) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

function indexOfAscii(bytes: Uint8Array, text: string, from = 0, to = bytes.length): number {
  const first = text.charCodeAt(0);
  const last = Math.min(to, bytes.length) - text.length;
  for (let i = from; i <= last; i++) {
    if (bytes[i] !== first) continue;
    let ok = true;
    for (let j = 1; j < text.length; j++) {
      if (bytes[i + j] !== text.charCodeAt(j)) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

function uniq(list: string[]): string[] {
  return Array.from(new Set(list.filter(Boolean)));
}

function matchNames(text: string, table: [RegExp, string][]): string[] {
  const names: string[] = [];
  for (const [re, name] of table) if (re.test(text)) names.push(name);
  return names;
}

function truncate(value: string, max = 60): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

// ─── TIFF / EXIF ───────────────────────────────────────────────────────────────

interface ExifSummary {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  hasGps: boolean;
  hasMakerNote: boolean;
  hasSerial: boolean;
  userComment?: string;
  description?: string;
}

function parseTiff(bytes: Uint8Array, start: number, length: number): ExifSummary | null {
  const summary: ExifSummary = { hasGps: false, hasMakerNote: false, hasSerial: false };
  try {
    const end = Math.min(bytes.length, start + length);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const order = view.getUint16(start);
    const le = order === 0x4949;
    if (!le && order !== 0x4d4d) return null;
    if (view.getUint16(start + 2, le) !== 42) return null;

    const readIfd = (offset: number, visit: (tag: number, type: number, count: number, entryPos: number) => void) => {
      const pos = start + offset;
      if (offset <= 0 || pos + 2 > end) return;
      const count = view.getUint16(pos, le);
      if (count > 1000) return;
      for (let i = 0; i < count; i++) {
        const entryPos = pos + 2 + i * 12;
        if (entryPos + 12 > end) break;
        visit(view.getUint16(entryPos, le), view.getUint16(entryPos + 2, le), view.getUint32(entryPos + 4, le), entryPos);
      }
    };

    const readAscii = (count: number, entryPos: number): string => {
      if (count <= 4) return ascii(bytes, entryPos + 8, count).replace(/\0+$/, "");
      const valueOffset = view.getUint32(entryPos + 8, le);
      const pos = start + valueOffset;
      if (pos + count > end) return "";
      return latin1.decode(bytes.subarray(pos, pos + Math.min(count, 512))).replace(/\0+$/, "");
    };

    const readUndefinedText = (count: number, entryPos: number): string => {
      if (count <= 8) return "";
      const pos = start + view.getUint32(entryPos + 8, le);
      if (pos + count > end) return "";
      // UserComment starts with an 8-byte character code prefix.
      return utf8.decode(bytes.subarray(pos + 8, pos + Math.min(count, 2048))).replace(/\0+/g, "").trim();
    };

    let exifIfd = 0;
    let gpsIfd = 0;
    readIfd(view.getUint32(start + 4, le), (tag, type, count, entryPos) => {
      if (tag === 0x010f && type === 2) summary.make = readAscii(count, entryPos);
      else if (tag === 0x0110 && type === 2) summary.model = readAscii(count, entryPos);
      else if (tag === 0x0131 && type === 2) summary.software = readAscii(count, entryPos);
      else if (tag === 0x0132 && type === 2) summary.dateTime = readAscii(count, entryPos);
      else if (tag === 0x010e && type === 2) summary.description = readAscii(count, entryPos);
      else if (tag === 0x8769) exifIfd = view.getUint32(entryPos + 8, le);
      else if (tag === 0x8825) gpsIfd = view.getUint32(entryPos + 8, le);
    });

    if (exifIfd) {
      readIfd(exifIfd, (tag, type, count, entryPos) => {
        if (tag === 0x9003 && type === 2) summary.dateTime = readAscii(count, entryPos) || summary.dateTime;
        else if (tag === 0x927c) summary.hasMakerNote = true;
        else if (tag === 0xa431) summary.hasSerial = true;
        else if (tag === 0x9286 && type === 7) summary.userComment = readUndefinedText(count, entryPos);
      });
    }

    if (gpsIfd) {
      readIfd(gpsIfd, (tag) => {
        // GPSLatitude (2) or GPSLongitude (4) means real coordinates are stored.
        if (tag === 0x0002 || tag === 0x0004) summary.hasGps = true;
      });
    }
    return summary;
  } catch {
    return summary;
  }
}

// ─── Collector ─────────────────────────────────────────────────────────────────

class Collector {
  findings = new Map<string, MetadataFinding>();
  c2pa = false;
  c2paText = "";
  toolText: string[] = [];
  xmpText: string[] = [];
  cnAigc = false;

  add(finding: MetadataFinding) {
    const existing = this.findings.get(finding.id);
    if (existing) {
      if (finding.detail && !existing.detail) existing.detail = finding.detail;
      return;
    }
    this.findings.set(finding.id, finding);
  }

  addExif(summary: ExifSummary | null) {
    const device = [summary?.make, summary?.model].filter(Boolean).join(" ");
    const detail = [device, summary?.dateTime].filter(Boolean).join(" · ");
    this.add({
      id: "exif",
      label: "EXIF (camera, device and capture settings)",
      detail: detail ? truncate(detail) : undefined,
      category: "privacy",
    });
    if (!summary) return;
    if (summary.hasGps) {
      this.add({ id: "gps", label: "GPS location coordinates", category: "privacy" });
    }
    if (summary.hasSerial) {
      this.add({ id: "serial", label: "Device serial number", category: "privacy" });
    }
    if (summary.hasMakerNote) {
      this.add({ id: "makernote", label: "Maker notes (vendor-specific camera data)", category: "privacy" });
    }
    if (summary.software) this.toolText.push(summary.software);
    if (summary.make) this.toolText.push(summary.make);
    if (summary.userComment) this.toolText.push(summary.userComment);
    if (summary.description) this.toolText.push(summary.description);
  }

  addXmp(text: string) {
    this.xmpText.push(text);
    const creatorTool =
      /CreatorTool(?:="([^"]*)"|>([^<]*)<)/.exec(text)?.slice(1).find(Boolean) ?? "";
    this.add({
      id: "xmp",
      label: "XMP packet (editing history, creator tool, rights)",
      detail: creatorTool ? truncate(`Creator tool: ${creatorTool}`) : undefined,
      category: "provenance",
    });
    if (creatorTool) this.toolText.push(creatorTool);
    if (/AIGC/.test(text) && /(ContentProducer|TC260|tc260)/.test(text)) this.cnAigc = true;
  }

  addC2pa(payload: Uint8Array) {
    this.c2pa = true;
    this.c2paText += latin1.decode(payload.subarray(0, Math.min(payload.length, 2_000_000)));
  }

  addPngText(keyword: string, value: string) {
    const key = keyword.trim();
    if (key === "parameters") {
      this.add({
        id: "sd-params",
        label: "Stable Diffusion generation parameters",
        detail: "Prompt, negative prompt, seed, sampler and model",
        category: "ai",
      });
      this.toolText.push("Stable Diffusion");
    } else if (key === "workflow" || key === "prompt") {
      this.add({
        id: "comfy-workflow",
        label: "ComfyUI workflow and prompt graph",
        detail: "Full node graph, models and prompt text",
        category: "ai",
      });
      this.toolText.push("ComfyUI");
    }
    if (value) this.toolText.push(value.slice(0, 4000));
    if (/AIGC/.test(key) || (/AIGC/.test(value) && /ContentProducer/.test(value))) this.cnAigc = true;
  }

  finish(format: ScannedFormat): MetadataScan {
    const allText = this.toolText.join("\n");
    const sourceText = `${this.c2paText}\n${this.xmpText.join("\n")}`;
    const aiSourceType = AI_SOURCE_TYPES.find((type) => sourceText.includes(type));
    const c2paMentions = this.c2pa ? uniq(matchNames(this.c2paText, PROVENANCE_NAMES)) : [];
    const aiTools = uniq(matchNames(allText, AI_TOOL_NAMES));

    if (this.c2pa) {
      const parts: string[] = [];
      if (c2paMentions.length) parts.push(`Mentions ${c2paMentions.slice(0, 3).join(", ")}`);
      if (aiSourceType) parts.push(`source type: ${aiSourceType}`);
      this.add({
        id: "c2pa",
        label: "C2PA Content Credentials manifest",
        detail: parts.length ? truncate(parts.join(" · "), 90) : undefined,
        category: "provenance",
      });
    } else if (aiSourceType) {
      this.add({
        id: "ai-source-type",
        label: "IPTC digital source type (AI label)",
        detail: aiSourceType,
        category: "provenance",
      });
    }
    if (this.cnAigc) {
      this.add({
        id: "cn-aigc",
        label: "China AIGC implicit label (GB 45438-2025)",
        category: "provenance",
      });
    }
    if (aiTools.length && !this.findings.has("sd-params") && !this.findings.has("comfy-workflow")) {
      this.add({
        id: "ai-tool",
        label: "AI tool name in metadata",
        detail: aiTools.slice(0, 3).join(", "),
        category: "ai",
      });
    }

    const vendors = uniq([...c2paMentions, ...aiTools.map(toolVendor)]);
    // Only point at watermarks when the file itself says it is AI-generated or
    // AI-edited. A camera photo with Content Credentials is not a SynthID case.
    const aiSignal =
      (aiSourceType !== undefined && /Trained/i.test(aiSourceType)) || aiTools.length > 0 || this.cnAigc;
    const watermarkLikely = aiSignal
      ? uniq(vendors.map((vendor) => WATERMARK_BY_VENDOR[vendor]).filter(Boolean))
      : [];

    const order: FindingCategory[] = ["privacy", "provenance", "ai", "technical"];
    const findings = Array.from(this.findings.values()).sort(
      (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
    );

    return {
      format,
      findings,
      hints: {
        c2pa: this.c2pa,
        c2paMentions,
        aiSourceType,
        aiTools,
        cnAigcLabel: this.cnAigc,
        watermarkLikely,
      },
    };
  }
}

function toolVendor(tool: string): string {
  if (/ChatGPT|DALL/.test(tool)) return "OpenAI";
  if (/Google/.test(tool)) return "Google";
  if (/Firefly/.test(tool)) return "Adobe";
  if (/Microsoft/.test(tool)) return "Microsoft";
  if (/ByteDance/.test(tool)) return "ByteDance";
  return tool;
}

// ─── Format walkers ────────────────────────────────────────────────────────────

function scanJpeg(bytes: Uint8Array, c: Collector) {
  let i = 2;
  const app11: Uint8Array[] = [];
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break;
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2) break;
    const start = i + 4;
    const size = length - 2;
    const end = Math.min(bytes.length, start + size);

    if (marker === 0xe1) {
      if (startsWith(bytes, start, "Exif\0")) {
        c.addExif(parseTiff(bytes, start + 6, size - 6));
      } else if (startsWith(bytes, start, "http://ns.adobe.com/xap/1.0/\0")) {
        c.addXmp(utf8.decode(bytes.subarray(start + 29, end)));
      } else if (startsWith(bytes, start, "http://ns.adobe.com/xmp/extension/\0")) {
        c.addXmp(utf8.decode(bytes.subarray(start + 75, end)));
      }
    } else if (marker === 0xed && startsWith(bytes, start, "Photoshop 3.0")) {
      if (indexOfAscii(bytes, "8BIM\u0004\u0004", start, end) !== -1) {
        c.add({ id: "iptc", label: "IPTC (captions, keywords, credits)", category: "provenance" });
      } else {
        c.add({ id: "photoshop-irb", label: "Photoshop resource block", category: "technical" });
      }
    } else if (marker === 0xeb) {
      app11.push(bytes.subarray(start, end));
    } else if (marker === 0xe2) {
      if (startsWith(bytes, start, "ICC_PROFILE")) {
        c.add({ id: "icc", label: "ICC color profile", category: "technical" });
      } else if (startsWith(bytes, start, "MPF")) {
        c.add({ id: "mpf", label: "Multi-picture data (HDR gain map or depth map)", category: "technical" });
      }
    } else if (marker === 0xfe) {
      const text = latin1.decode(bytes.subarray(start, Math.min(end, start + 200)));
      c.add({ id: "comment", label: "JPEG comment", detail: truncate(text), category: "technical" });
      c.toolText.push(text);
    }
    i = start + size;
  }

  if (app11.length) {
    const joined = new Uint8Array(app11.reduce((n, part) => n + part.length, 0));
    let offset = 0;
    for (const part of app11) {
      joined.set(part, offset);
      offset += part.length;
    }
    if (indexOfAscii(joined, "c2pa") !== -1 || indexOfAscii(joined, "jumb") !== -1) {
      c.addC2pa(joined);
    } else {
      c.add({ id: "jumbf", label: "JUMBF metadata box", category: "provenance" });
    }
  }
}

function scanPng(bytes: Uint8Array, c: Collector) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 8;
  const textKeys: string[] = [];
  while (i + 8 <= bytes.length) {
    const length = view.getUint32(i);
    const type = ascii(bytes, i + 4, 4);
    const start = i + 8;
    const end = Math.min(bytes.length, start + length);
    if (type === "IEND") break;

    if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      const nul = bytes.indexOf(0, start);
      const keyword = nul > start && nul < end ? latin1.decode(bytes.subarray(start, nul)) : "";
      let value = "";
      if (type === "tEXt") {
        value = latin1.decode(bytes.subarray(nul + 1, Math.min(end, nul + 1 + 20000)));
      } else if (type === "iTXt" && bytes[nul + 1] === 0) {
        // keyword\0 compressionFlag compressionMethod language\0 translated\0 text
        let p = nul + 3;
        const lang = bytes.indexOf(0, p);
        const translated = lang >= 0 ? bytes.indexOf(0, lang + 1) : -1;
        if (translated >= 0 && translated < end) {
          p = translated + 1;
          value = utf8.decode(bytes.subarray(p, Math.min(end, p + 200000)));
        }
      }
      if (keyword === "XML:com.adobe.xmp") {
        if (value) c.addXmp(value);
        else c.add({ id: "xmp", label: "XMP packet (editing history, creator tool, rights)", category: "provenance" });
      } else if (keyword) {
        textKeys.push(keyword);
        c.addPngText(keyword, value);
      }
    } else if (type === "eXIf") {
      c.addExif(parseTiff(bytes, start, length));
    } else if (type === "caBX") {
      c.addC2pa(bytes.subarray(start, end));
    } else if (type === "iCCP") {
      c.add({ id: "icc", label: "ICC color profile", category: "technical" });
    } else if (type === "tIME") {
      c.add({ id: "png-time", label: "PNG modification timestamp", category: "technical" });
    }
    i = start + length + 4;
  }
  if (textKeys.length) {
    c.add({
      id: "png-text",
      label: "PNG text chunks",
      detail: truncate(`Keys: ${uniq(textKeys).join(", ")}`),
      category: "ai",
    });
  }
}

function scanWebp(bytes: Uint8Array, c: Collector) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 12;
  while (i + 8 <= bytes.length) {
    const type = ascii(bytes, i, 4);
    const size = view.getUint32(i + 4, true);
    const start = i + 8;
    const end = Math.min(bytes.length, start + size);
    if (type === "EXIF") {
      const tiffStart = startsWith(bytes, start, "Exif\0") ? start + 6 : start;
      c.addExif(parseTiff(bytes, tiffStart, end - tiffStart));
    } else if (type === "XMP ") {
      c.addXmp(utf8.decode(bytes.subarray(start, end)));
    } else if (type === "ICCP") {
      c.add({ id: "icc", label: "ICC color profile", category: "technical" });
    } else if (type === "C2PA") {
      c.addC2pa(bytes.subarray(start, end));
    }
    i = start + size + (size % 2);
  }
}

async function scanIsoBmff(file: Blob, bytes: Uint8Array, c: Collector) {
  try {
    const exifr = (await import("exifr")).default;
    const out = (await exifr.parse(file, {
      tiff: true,
      ifd0: true,
      exif: true,
      gps: true,
      xmp: true,
      iptc: true,
      icc: false,
      mergeOutput: false,
      translateValues: false,
    } as never)) as Record<string, Record<string, unknown> | string | undefined> | undefined;
    if (out) {
      const ifd0 = (out.ifd0 ?? {}) as Record<string, unknown>;
      const exif = (out.exif ?? {}) as Record<string, unknown>;
      const gps = (out.gps ?? {}) as Record<string, unknown>;
      if (Object.keys(ifd0).length || Object.keys(exif).length) {
        c.addExif({
          make: typeof ifd0.Make === "string" ? ifd0.Make : undefined,
          model: typeof ifd0.Model === "string" ? ifd0.Model : undefined,
          software: typeof ifd0.Software === "string" ? ifd0.Software : undefined,
          dateTime: typeof exif.DateTimeOriginal === "string" ? exif.DateTimeOriginal : undefined,
          hasGps: gps.GPSLatitude != null || gps.latitude != null,
          hasMakerNote: exif.MakerNote != null,
          hasSerial: exif.BodySerialNumber != null,
        });
      }
      if (out.xmp) {
        c.addXmp(typeof out.xmp === "string" ? out.xmp : JSON.stringify(out.xmp));
      }
      if (out.iptc && Object.keys(out.iptc as object).length) {
        c.add({ id: "iptc", label: "IPTC (captions, keywords, credits)", category: "provenance" });
      }
    }
  } catch {
    // exifr could not read the container; fall through to byte search.
  }
  const jumb = indexOfAscii(bytes, "jumb");
  if (jumb !== -1 && indexOfAscii(bytes, "c2pa", Math.max(0, jumb - 64), jumb + 4096) !== -1) {
    c.addC2pa(bytes.subarray(Math.max(0, jumb - 64), Math.min(bytes.length, jumb + 1_000_000)));
  }
}

export function detectFormat(bytes: Uint8Array): ScannedFormat {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (startsWith(bytes, 0, "\u0089PNG")) return "png";
  if (startsWith(bytes, 0, "RIFF") && startsWith(bytes, 8, "WEBP")) return "webp";
  if (startsWith(bytes, 4, "ftyp")) {
    const brands = ascii(bytes, 8, 24);
    if (/avif|avis/.test(brands)) return "avif";
    if (/heic|heix|heim|heis|hevc|mif1|msf1/.test(brands)) return "heif";
  }
  return "unknown";
}

/** Scan a file (or blob) for embedded metadata containers. */
export async function scanMetadata(file: Blob, preloaded?: Uint8Array): Promise<MetadataScan> {
  const bytes = preloaded ?? new Uint8Array(await file.arrayBuffer());
  const format = detectFormat(bytes);
  const c = new Collector();
  try {
    if (format === "jpeg") scanJpeg(bytes, c);
    else if (format === "png") scanPng(bytes, c);
    else if (format === "webp") scanWebp(bytes, c);
    else if (format === "heif" || format === "avif") await scanIsoBmff(file, bytes, c);
  } catch (error) {
    console.warn("metadata scan stopped early", error);
  }
  return c.finish(format);
}

/** Findings that should never survive a clean export. */
export function residualFindings(scan: MetadataScan): MetadataFinding[] {
  // Color profiles are color data, not identifying metadata. Canvas exports may
  // legitimately include one, so they do not count against the output.
  return scan.findings.filter((finding) => finding.id !== "icc");
}
