import piexif from "piexifjs";
import type { ExifResult, MetaField, MetaGroup } from "@/lib/exifReader";

export interface MetadataEditDraft {
  title: string;
  description: string;
  note: string;
  author: string;
  keywords: string;
  copyright: string;
  software: string;
  cameraMake: string;
  cameraModel: string;
  lensMake: string;
  lensModel: string;
  dateTaken: string;
  dateDigitized: string;
  dateModified: string;
  utcOffset: string;
  latitude: string;
  longitude: string;
  altitude: string;
}

export type MetadataEditKey = keyof MetadataEditDraft;
export type MetadataFieldErrors = Partial<Record<MetadataEditKey, string>>;
export type EditableInputType = "text" | "textarea" | "datetime-local" | "number";

export interface EditableFieldDefinition {
  key: MetadataEditKey;
  fieldKey: string;
  groupId: MetaGroup["id"];
  label: string;
  inputType: EditableInputType;
  matchKeys: string[];
  placeholder?: string;
  helperText?: string;
  rows?: number;
  step?: string;
}

export interface DisplayMetaField extends MetaField {
  editableDefinition?: EditableFieldDefinition;
  isPlaceholder?: boolean;
}

export interface DisplayMetaGroup extends Omit<MetaGroup, "fields"> {
  fields: DisplayMetaField[];
}

export interface MetadataWriterInput {
  draft: MetadataEditDraft;
  file: File;
}

export interface MetadataWriterResult {
  dataUrl: string;
  file: File;
}

export interface MetadataWriter {
  kind: "browser-jpeg" | "server";
  write(input: MetadataWriterInput): Promise<MetadataWriterResult>;
}

const GROUP_ORDER: MetaGroup["id"][] = [
  "file",
  "ai",
  "gps",
  "camera",
  "exposure",
  "datetime",
  "iptc",
  "xmp",
  "color",
  "thumbnail",
];

const GROUP_META: Record<
  string,
  Pick<MetaGroup, "label" | "icon" | "color" | "riskLevel">
> = {
  gps: {
    label: "GPS Location",
    icon: "MapPin",
    color: "text-red-400",
    riskLevel: "high",
  },
  camera: {
    label: "Camera & Device",
    icon: "Camera",
    color: "text-violet-400",
    riskLevel: "low",
  },
  datetime: {
    label: "Date & Time",
    icon: "Clock",
    color: "text-green-400",
    riskLevel: "low",
  },
  iptc: {
    label: "IPTC / Copyright",
    icon: "FileText",
    color: "text-orange-400",
    riskLevel: "low",
  },
};

export const EDITABLE_FIELD_DEFINITIONS: EditableFieldDefinition[] = [
  {
    key: "cameraMake",
    fieldKey: "edit_camera_make",
    groupId: "camera",
    label: "Camera Make",
    inputType: "text",
    matchKeys: ["Make"],
    placeholder: "Apple",
  },
  {
    key: "cameraModel",
    fieldKey: "edit_camera_model",
    groupId: "camera",
    label: "Camera Model",
    inputType: "text",
    matchKeys: ["Model"],
    placeholder: "iPhone 15 Pro Max",
  },
  {
    key: "lensMake",
    fieldKey: "edit_lens_make",
    groupId: "camera",
    label: "Lens Make",
    inputType: "text",
    matchKeys: ["LensMake"],
    placeholder: "Apple",
  },
  {
    key: "lensModel",
    fieldKey: "edit_lens_model",
    groupId: "camera",
    label: "Lens Model",
    inputType: "text",
    matchKeys: ["LensModel", "LensInfo"],
    placeholder: "Lens model",
  },
  {
    key: "software",
    fieldKey: "edit_software",
    groupId: "camera",
    label: "Software",
    inputType: "text",
    matchKeys: ["Software"],
    placeholder: "17.5.1",
  },
  {
    key: "latitude",
    fieldKey: "edit_latitude",
    groupId: "gps",
    label: "Latitude",
    inputType: "number",
    matchKeys: ["lat"],
    step: "0.0000001",
    placeholder: "22.6329028",
    helperText: "Decimal degrees. Leave latitude and longitude both empty to remove GPS.",
  },
  {
    key: "longitude",
    fieldKey: "edit_longitude",
    groupId: "gps",
    label: "Longitude",
    inputType: "number",
    matchKeys: ["lon"],
    step: "0.0000001",
    placeholder: "114.9210278",
    helperText: "Decimal degrees. Leave latitude and longitude both empty to remove GPS.",
  },
  {
    key: "altitude",
    fieldKey: "edit_altitude",
    groupId: "gps",
    label: "Altitude",
    inputType: "number",
    matchKeys: ["alt"],
    step: "0.1",
    placeholder: "123.4",
  },
  {
    key: "dateTaken",
    fieldKey: "edit_date_taken",
    groupId: "datetime",
    label: "Date Taken",
    inputType: "datetime-local",
    matchKeys: ["DateTimeOriginal", "CreateDate"],
  },
  {
    key: "dateDigitized",
    fieldKey: "edit_date_digitized",
    groupId: "datetime",
    label: "Date Digitized",
    inputType: "datetime-local",
    matchKeys: ["DateTimeDigitized"],
  },
  {
    key: "dateModified",
    fieldKey: "edit_date_modified",
    groupId: "datetime",
    label: "Date Modified",
    inputType: "datetime-local",
    matchKeys: ["DateTime", "ModifyDate"],
  },
  {
    key: "utcOffset",
    fieldKey: "edit_utc_offset",
    groupId: "datetime",
    label: "UTC Offset",
    inputType: "text",
    matchKeys: ["OffsetTime", "OffsetTimeOriginal", "OffsetTimeDigitized"],
    placeholder: "+08:00",
    helperText: "Format: +08:00 or -05:00",
  },
  {
    key: "title",
    fieldKey: "edit_title",
    groupId: "iptc",
    label: "Title",
    inputType: "text",
    matchKeys: ["XPTitle", "ObjectName"],
    placeholder: "Image title",
  },
  {
    key: "description",
    fieldKey: "edit_description",
    groupId: "iptc",
    label: "Description",
    inputType: "textarea",
    matchKeys: ["ImageDescription", "Caption", "LocalCaption"],
    rows: 3,
    placeholder: "Short description",
  },
  {
    key: "note",
    fieldKey: "edit_note",
    groupId: "iptc",
    label: "Note",
    inputType: "textarea",
    matchKeys: ["XPComment", "UserComment"],
    rows: 3,
    placeholder: "Internal note",
  },
  {
    key: "author",
    fieldKey: "edit_author",
    groupId: "iptc",
    label: "Author",
    inputType: "text",
    matchKeys: ["XPAuthor", "Artist", "Byline", "By-line"],
    placeholder: "Photographer or creator",
  },
  {
    key: "keywords",
    fieldKey: "edit_keywords",
    groupId: "iptc",
    label: "Keywords",
    inputType: "text",
    matchKeys: ["XPKeywords", "Keywords"],
    placeholder: "portrait, editorial, summer",
    helperText: "Separate keywords with commas.",
  },
  {
    key: "copyright",
    fieldKey: "edit_copyright",
    groupId: "iptc",
    label: "Copyright",
    inputType: "text",
    matchKeys: ["Copyright", "CopyrightNotice"],
    placeholder: "© 2026 Your Name",
  },
];

const DEFINITIONS_BY_GROUP = EDITABLE_FIELD_DEFINITIONS.reduce<
  Record<string, EditableFieldDefinition[]>
>((acc, definition) => {
  (acc[definition.groupId] ||= []).push(definition);
  return acc;
}, {});

// piexifjs does not ship the OffsetTime tags, but it supports custom tag metadata.
piexif.TAGS.Exif[36880] = { name: "OffsetTime", type: "Ascii" };
piexif.TAGS.Exif[36881] = { name: "OffsetTimeOriginal", type: "Ascii" };
piexif.TAGS.Exif[36882] = { name: "OffsetTimeDigitized", type: "Ascii" };
piexif.ExifIFD.OffsetTime = 36880;
piexif.ExifIFD.OffsetTimeOriginal = 36881;
piexif.ExifIFD.OffsetTimeDigitized = 36882;

function trimString(value: string) {
  return value.trim();
}

function firstValue(...values: unknown[]) {
  return values.find(value => {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });
}

function firstText(...values: unknown[]) {
  const value = firstValue(...values);
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean).join(", ");
  }
  return String(value).trim();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateForInput(date: Date, offset: string) {
  const adjusted = new Date(date.getTime() + offsetToMinutes(offset) * 60_000);
  return [
    adjusted.getUTCFullYear(),
    pad(adjusted.getUTCMonth() + 1),
    pad(adjusted.getUTCDate()),
  ].join("-") + `T${pad(adjusted.getUTCHours())}:${pad(adjusted.getUTCMinutes())}:${pad(adjusted.getUTCSeconds())}`;
}

function parseDateSource(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const normalized = value.includes(":")
      ? value.replace(/^(\d{4}):(\d{2}):(\d{2})\s/, "$1-$2-$3T")
      : value;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function offsetToMinutes(offset: string) {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function toDateTimeInput(value: unknown, offset: string) {
  const parsed = parseDateSource(value);
  if (!parsed) return "";
  return formatDateForInput(parsed, offset);
}

function toExifDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return "";
  return `${match[1]}:${match[2]}:${match[3]} ${match[4]}:${match[5]}:${match[6] ?? "00"}`;
}

function isValidDateTimeInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "00");

  const date = new Date(year, month - 1, day, hour, minute, second);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
  );
}

function normalizeKeywords(value: string) {
  return value
    .split(/[;,]/)
    .map(part => part.trim())
    .filter(Boolean)
    .join(", ");
}

function encodeXpUnicode(value: string) {
  const bytes: number[] = [];
  for (const char of `${value}\u0000`) {
    const code = char.charCodeAt(0);
    bytes.push(code & 0xff, (code >> 8) & 0xff);
  }
  return bytes;
}

function toAltitudeValue(value: number) {
  const abs = Math.abs(value);
  return [Math.round(abs * 100), 100] as [number, number];
}

function toGpsRational(value: number) {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 10000);
  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 10000],
  ] as [number, number][];
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob as data URL."));
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "image/jpeg",
    lastModified: Date.now(),
  });
}

async function maybeConvertHeicForCanvas(file: File) {
  const mime = file.type.toLowerCase();
  const isHeic =
    mime === "image/heic" ||
    mime === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name);

  if (!isHeic) return file;

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.95,
  });

  return (Array.isArray(converted) ? converted[0] : converted) as Blob;
}

async function loadRenderableImage(file: File) {
  const canvasSource = await maybeConvertHeicForCanvas(file);
  const objectUrl = URL.createObjectURL(canvasSource);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This image format cannot be rendered to a new JPEG in this browser."));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function renderFileToJpegDataUrl(file: File, quality = 0.95) {
  const image = await loadRenderableImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not initialize canvas to render the edited JPEG.");
  }

  context.drawImage(image, 0, 0);

  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not export the edited image as JPEG."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });

  return blobToDataUrl(jpegBlob);
}

function createEmptyDraft(): MetadataEditDraft {
  return {
    title: "",
    description: "",
    note: "",
    author: "",
    keywords: "",
    copyright: "",
    software: "",
    cameraMake: "",
    cameraModel: "",
    lensMake: "",
    lensModel: "",
    dateTaken: "",
    dateDigitized: "",
    dateModified: "",
    utcOffset: "",
    latitude: "",
    longitude: "",
    altitude: "",
  };
}

function parseGpsAltitude(rawAll: Record<string, unknown>) {
  const rawAltitude = firstValue(
    rawAll.GPSAltitude,
    rawAll.altitude,
    rawAll.Altitude,
  );
  if (rawAltitude == null) return "";

  const altitude = Number(rawAltitude);
  if (Number.isNaN(altitude)) return "";

  const ref = rawAll.GPSAltitudeRef;
  const isBelowSeaLevel = ref === 1 || ref === "1";
  return String(isBelowSeaLevel ? -altitude : altitude);
}

export function buildMetadataEditDraft(result: ExifResult): MetadataEditDraft {
  const rawAll = result.rawAll;
  const utcOffset = firstText(
    rawAll.OffsetTimeOriginal,
    rawAll.OffsetTime,
    rawAll.OffsetTimeDigitized,
  );

  return {
    ...createEmptyDraft(),
    title: firstText(rawAll.XPTitle, rawAll.ObjectName),
    description: firstText(rawAll.ImageDescription, rawAll.Caption, rawAll.LocalCaption),
    note: firstText(rawAll.XPComment, rawAll.UserComment),
    author: firstText(rawAll.XPAuthor, rawAll.Artist, rawAll.Byline, rawAll["By-line"]),
    keywords: normalizeKeywords(firstText(rawAll.XPKeywords, rawAll.Keywords)),
    copyright: firstText(rawAll.Copyright, rawAll.CopyrightNotice),
    software: firstText(rawAll.Software),
    cameraMake: firstText(rawAll.Make),
    cameraModel: firstText(rawAll.Model),
    lensMake: firstText(rawAll.LensMake),
    lensModel: firstText(rawAll.LensModel, rawAll.LensInfo),
    dateTaken: toDateTimeInput(
      firstValue(rawAll.DateTimeOriginal, rawAll.CreateDate),
      utcOffset,
    ),
    dateDigitized: toDateTimeInput(rawAll.DateTimeDigitized, utcOffset),
    dateModified: toDateTimeInput(
      firstValue(rawAll.DateTime, rawAll.ModifyDate),
      utcOffset,
    ),
    utcOffset,
    latitude: result.gpsLat != null ? result.gpsLat.toFixed(7) : "",
    longitude: result.gpsLon != null ? result.gpsLon.toFixed(7) : "",
    altitude: parseGpsAltitude(rawAll),
  };
}

export function normalizeMetadataEditDraft(draft: MetadataEditDraft): MetadataEditDraft {
  return {
    ...draft,
    title: trimString(draft.title),
    description: trimString(draft.description),
    note: trimString(draft.note),
    author: trimString(draft.author),
    keywords: normalizeKeywords(draft.keywords),
    copyright: trimString(draft.copyright),
    software: trimString(draft.software),
    cameraMake: trimString(draft.cameraMake),
    cameraModel: trimString(draft.cameraModel),
    lensMake: trimString(draft.lensMake),
    lensModel: trimString(draft.lensModel),
    dateTaken: trimString(draft.dateTaken),
    dateDigitized: trimString(draft.dateDigitized),
    dateModified: trimString(draft.dateModified),
    utcOffset: trimString(draft.utcOffset),
    latitude: trimString(draft.latitude),
    longitude: trimString(draft.longitude),
    altitude: trimString(draft.altitude),
  };
}

export function validateMetadataEditDraft(draft: MetadataEditDraft) {
  const errors: MetadataFieldErrors = {};
  const hasLatitude = draft.latitude.length > 0;
  const hasLongitude = draft.longitude.length > 0;

  if (draft.utcOffset && !/^[+-](0\d|1\d|2[0-3]):[0-5]\d$/.test(draft.utcOffset)) {
    errors.utcOffset = "Use a timezone offset like +08:00 or -05:00.";
  }

  if (hasLatitude !== hasLongitude) {
    errors.latitude = "Latitude and longitude must be provided together.";
    errors.longitude = "Latitude and longitude must be provided together.";
  }

  if (hasLatitude) {
    const latitude = Number(draft.latitude);
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90.";
    }
  }

  if (hasLongitude) {
    const longitude = Number(draft.longitude);
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180.";
    }
  }

  if (draft.altitude) {
    const altitude = Number(draft.altitude);
    if (Number.isNaN(altitude)) {
      errors.altitude = "Altitude must be a valid number.";
    }
  }

  for (const key of ["dateTaken", "dateDigitized", "dateModified"] as const) {
    if (draft[key] && (!toExifDateTime(draft[key]) || !isValidDateTimeInput(draft[key]))) {
      errors[key] = "Enter a valid date and time.";
    }
  }

  return errors;
}

function findEditableDefinition(field: MetaField) {
  return EDITABLE_FIELD_DEFINITIONS.find(definition =>
    definition.matchKeys.includes(field.key),
  );
}

function buildPlaceholderField(definition: EditableFieldDefinition, draft: MetadataEditDraft): DisplayMetaField {
  return {
    key: definition.fieldKey,
    label: definition.label,
    value: draft[definition.key],
    editableDefinition: definition,
    isPlaceholder: true,
  };
}

function mergeEditableFields(group: MetaGroup, draft: MetadataEditDraft): DisplayMetaGroup {
  const definitions = DEFINITIONS_BY_GROUP[group.id] ?? [];
  const fields: DisplayMetaField[] = group.fields.map(field => {
    const editableDefinition = findEditableDefinition(field);
    if (!editableDefinition) return field;
    return {
      ...field,
      value: draft[editableDefinition.key],
      editableDefinition,
    };
  });

  for (const definition of definitions) {
    const alreadyPresent = fields.some(field =>
      definition.matchKeys.includes(field.key) || field.key === definition.fieldKey,
    );
    if (!alreadyPresent) {
      fields.push(buildPlaceholderField(definition, draft));
    }
  }

  return {
    ...group,
    fields,
  };
}

export function buildDisplayMetadataGroups(
  result: ExifResult,
  draft: MetadataEditDraft,
  isEditMode: boolean,
): DisplayMetaGroup[] {
  const groups = new Map<string, DisplayMetaGroup>(
    result.groups.map(group => [
      group.id,
      isEditMode ? mergeEditableFields(group, draft) : { ...group, fields: [...group.fields] },
    ]),
  );

  if (isEditMode) {
    for (const [groupId, definitions] of Object.entries(DEFINITIONS_BY_GROUP)) {
      if (groups.has(groupId)) continue;
      const groupMeta = GROUP_META[groupId];
      if (!groupMeta) continue;
      const hasValue = definitions.some(definition => Boolean(draft[definition.key]));

      groups.set(groupId, {
        id: groupId,
        label: groupMeta.label,
        icon: groupMeta.icon,
        color: groupMeta.color,
        riskLevel: hasValue ? groupMeta.riskLevel : "none",
        fields: definitions.map(definition => buildPlaceholderField(definition, draft)),
      });
    }
  }

  return Array.from(groups.values())
    .filter(group => group.id === "file" || group.fields.length > 0)
    .sort((left, right) => {
      const leftIndex = GROUP_ORDER.indexOf(left.id);
      const rightIndex = GROUP_ORDER.indexOf(right.id);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });
}

function buildEditedFileName(name: string) {
  const baseName = name.replace(/\.[^.]+$/, "");
  return `${baseName}-metadata-edited.jpg`;
}

function setAsciiTag(ifd: Record<number, unknown>, tag: number, value: string) {
  if (value) {
    ifd[tag] = value;
    return;
  }
  delete ifd[tag];
}

function setXpTag(ifd: Record<number, unknown>, tag: number, value: string) {
  if (value) {
    ifd[tag] = encodeXpUnicode(value);
    return;
  }
  delete ifd[tag];
}

function applyDraftToExif(draft: MetadataEditDraft) {
  const zeroth: Record<number, unknown> = {};
  const exif: Record<number, unknown> = {};
  const gps: Record<number, unknown> = {};

  setXpTag(zeroth, piexif.ImageIFD.XPTitle, draft.title);
  setAsciiTag(zeroth, piexif.ImageIFD.ImageDescription, draft.description);
  setXpTag(zeroth, piexif.ImageIFD.XPComment, draft.note);
  setAsciiTag(zeroth, piexif.ImageIFD.Artist, draft.author);
  setXpTag(zeroth, piexif.ImageIFD.XPAuthor, draft.author);
  setXpTag(zeroth, piexif.ImageIFD.XPKeywords, draft.keywords.replace(/,\s*/g, ";"));
  setAsciiTag(zeroth, piexif.ImageIFD.Copyright, draft.copyright);
  setAsciiTag(zeroth, piexif.ImageIFD.Software, draft.software);
  setAsciiTag(zeroth, piexif.ImageIFD.Make, draft.cameraMake);
  setAsciiTag(zeroth, piexif.ImageIFD.Model, draft.cameraModel);

  setAsciiTag(exif, piexif.ExifIFD.LensMake, draft.lensMake);
  setAsciiTag(exif, piexif.ExifIFD.LensModel, draft.lensModel);

  const dateTaken = toExifDateTime(draft.dateTaken);
  const dateDigitized = toExifDateTime(draft.dateDigitized);
  const dateModified = toExifDateTime(draft.dateModified);
  const offset = draft.utcOffset;

  setAsciiTag(zeroth, piexif.ImageIFD.DateTime, dateModified);
  setAsciiTag(exif, piexif.ExifIFD.DateTimeOriginal, dateTaken);
  setAsciiTag(exif, piexif.ExifIFD.DateTimeDigitized, dateDigitized);
  setAsciiTag(exif, piexif.ExifIFD.OffsetTime, offset);
  setAsciiTag(exif, piexif.ExifIFD.OffsetTimeOriginal, offset);
  setAsciiTag(exif, piexif.ExifIFD.OffsetTimeDigitized, offset);

  if (draft.latitude && draft.longitude) {
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    gps[piexif.GPSIFD.GPSLatitudeRef] = latitude >= 0 ? "N" : "S";
    gps[piexif.GPSIFD.GPSLatitude] = toGpsRational(latitude);
    gps[piexif.GPSIFD.GPSLongitudeRef] = longitude >= 0 ? "E" : "W";
    gps[piexif.GPSIFD.GPSLongitude] = toGpsRational(longitude);
  }

  if (draft.altitude) {
    const altitude = Number(draft.altitude);
    gps[piexif.GPSIFD.GPSAltitudeRef] = altitude < 0 ? 1 : 0;
    gps[piexif.GPSIFD.GPSAltitude] = toAltitudeValue(altitude);
  }

  return {
    "0th": zeroth,
    Exif: exif,
    GPS: gps,
    "1st": {},
    thumbnail: null,
  };
}

export function createBrowserJpegMetadataWriter(): MetadataWriter {
  return {
    kind: "browser-jpeg",
    async write({ draft, file }) {
      const renderedJpeg = await renderFileToJpegDataUrl(file);
      const exifBytes = piexif.dump(applyDraftToExif(draft));
      const withExif = piexif.insert(exifBytes, renderedJpeg);
      const editedFile = await dataUrlToFile(withExif, buildEditedFileName(file.name));

      return {
        dataUrl: withExif,
        file: editedFile,
      };
    },
  };
}

export function createServerMetadataWriter(): MetadataWriter {
  return {
    kind: "server",
    async write() {
      throw new Error("Server metadata writer is not configured in this build.");
    },
  };
}
