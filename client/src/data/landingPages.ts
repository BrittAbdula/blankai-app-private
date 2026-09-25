/**
 * Landing page content for generator, platform, format and core intents.
 *
 * Facts were checked against vendor documentation and independent tests on
 * 2026-09-25 (see each page's `sources`). Where a vendor has not documented
 * something, the page says so instead of guessing.
 *
 * This file is imported by the SPA and by scripts/prerender.ts, so it must stay
 * free of browser-only imports.
 */
import type { OutputFormat } from "@/lib/imageProcessor";

export type LayerStatus = "yes" | "no" | "varies" | "unknown" | "announced";
export type LayerKey = "c2pa" | "metadata" | "invisible" | "visible" | "text" | "exif" | "other";
export type HubKey = "generators" | "platforms";

export interface LayerRow {
  key?: LayerKey;
  layer: string;
  status: LayerStatus;
  detail: string;
  action: "removed" | "not-removed" | "n/a";
}

export interface PlatformFacts {
  labelName: string;
  readsC2pa: LayerStatus;
  readsIptc: LayerStatus;
  ownDetection: string;
  keepsMetadata: LayerStatus;
}

export interface Section {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface LinkRef {
  label: string;
  href: string;
}

export interface LandingPageData {
  slug: string;
  kind: "core" | "generator" | "platform" | "format";
  hub?: HubKey;
  /** Short label for navigation and tables. */
  name: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  toolHeading: string;
  toolIntro: string;
  defaultFormat?: OutputFormat;
  dropLabel?: string;
  layersTitle?: string;
  layersIntro?: string;
  layers?: LayerRow[];
  platform?: PlatformFacts;
  sections: Section[];
  steps?: { title: string; items: string[] };
  faqs: Faq[];
  checkers?: (LinkRef & { note: string })[];
  sources: LinkRef[];
  related: string[];
}

export interface HubData {
  key: HubKey;
  path: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  tableTitle: string;
  tableIntro: string;
  tableNote: string;
  sections: Section[];
  faqs: Faq[];
  sources: LinkRef[];
}

// ─── Shared references ─────────────────────────────────────────────────────────

const CHECK_CONTENT_CREDENTIALS = {
  label: "Content Credentials Verify",
  href: "https://contentcredentials.org/verify",
  note: "Shows any C2PA manifest in a file",
};
const CHECK_GEMINI = {
  label: "Gemini app SynthID check",
  href: "https://gemini.google.com/",
  note: "Upload and ask “Is this AI-generated?”",
};
const CHECK_OPENAI = {
  label: "OpenAI content provenance",
  href: "https://openai.com/index/advancing-content-provenance/",
  note: "OpenAI's C2PA and SynthID verification",
};

const SRC = {
  openaiProvenance: { label: "OpenAI: Advancing content provenance (May 2026)", href: "https://openai.com/index/advancing-content-provenance/" },
  openaiImages25: { label: "OpenAI: Introducing ChatGPT Images 2.5 (September 2026)", href: "https://openai.com/index/introducing-chatgpt-images-2-5/" },
  petapixelOpenai: { label: "PetaPixel: OpenAI gets serious about detecting fake images (May 2026)", href: "https://petapixel.com/2026/05/20/openai-gets-serious-about-detecting-fake-images/" },
  googleIdentify: { label: "Google: New ways to identify AI-generated media (May 2026)", href: "https://blog.google/innovation-and-ai/products/identifying-ai-generated-media-online/" },
  googleGeminiVerify: { label: "Google: AI image verification in the Gemini app", href: "https://blog.google/innovation-and-ai/products/ai-image-verification-gemini-app/" },
  geminiHelp: { label: "Gemini Apps Help: watermarks and Content Credentials", href: "https://support.google.com/gemini/answer/17405358" },
  c2paSpec: { label: "C2PA Technical Specification 2.4", href: "https://spec.c2pa.org/specifications/specifications/2.4/specs/_attachments/C2PA_Specification.pdf" },
  c2paConformance: { label: "C2PA conformance program and trust list", href: "https://c2pa.org/conformance/" },
  euArticle50: { label: "Cooley: EU AI Act transparency obligations take effect (August 2026)", href: "https://www.cooley.com/news/insight/2026/2026-08-03-eu-ai-act-transparency-obligations-take-effect-2-august-2026" },
  euCode: { label: "European Commission: Code of Practice on AI-generated content", href: "https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content" },
  caSb942: { label: "Morgan Lewis: California AI disclosure rules become operative (August 2026)", href: "https://www.morganlewis.com/pubs/2026/08/new-california-ai-disclosure-rules-become-operative" },
  chinaMeasures: { label: "Bird & Bird: China's measures for labeling AI-generated content", href: "https://www.lexology.com/library/detail.aspx?g=5f3028e6-300b-4ac1-8f7a-cf9a0de62378" },
  iptcDst: { label: "IPTC Digital Source Type vocabulary", href: "https://cv.iptc.org/newscodes/digitalsourcetype/" },
  iptcSocial: { label: "IPTC: AI disclosure on social media, a work in progress (2026)", href: "https://iptc.org/news/ai-disclosure-on-social-media-a-work-in-progress/" },
  iptcPhoto: { label: "IPTC Photo Metadata Standard", href: "https://iptc.org/standards/photo-metadata/" },
  exiftoolTags: { label: "ExifTool: EXIF tag reference", href: "https://exiftool.org/TagNames/EXIF.html" },
  metaLabels: { label: "Meta: Our approach to labeling AI-generated content", href: "https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/" },
};

// ─── Hubs ──────────────────────────────────────────────────────────────────────

export const HUBS: Record<HubKey, HubData> = {
  generators: {
    key: "generators",
    path: "/ai-generator-metadata",
    name: "AI generators",
    title: "AI Image Metadata by Generator (2026 Comparison) | BlankAI",
    description:
      "A side-by-side table of the C2PA credentials, metadata labels, invisible watermarks and visible marks added by ChatGPT, Gemini, Midjourney, Meta AI, FLUX and more.",
    h1: "What Each AI Image Generator Puts in Your Files (2026)",
    eyebrow: "Generator comparison",
    intro:
      "AI image generators now mark their output in up to four ways: a signed C2PA manifest, plain metadata labels such as the IPTC digital source type, an invisible watermark in the pixels, and a visible logo. They do not all use the same layers. This table shows what each one documents, and each linked page explains the details and lets you check and clean a file.",
    tableTitle: "Which layers each generator uses",
    tableIntro:
      "BlankAI can remove the first two columns, because they are file metadata. The last two are part of the image and stay after cleaning.",
    tableNote:
      "“Not documented” means the vendor has not said either way. “Sometimes” depends on the product, plan or settings. Reviewed September 25, 2026.",
    sections: [
      {
        heading: "Why generators mark their output in 2026",
        body: [
          "Marking is no longer optional for the large providers. Article 50 of the EU AI Act has applied since 2 August 2026 and requires providers of generative AI to mark output in a machine-readable, detectable way; systems already on the market have until 2 December 2026. The Commission's Code of Practice, signed by Google, OpenAI, Meta, Microsoft, Anthropic, Black Forest Labs and others, asks for at least two layers: signed metadata plus an imperceptible watermark.",
          "California's AI Transparency Act became operative the same day and requires covered providers to embed a latent disclosure in images, video and audio. China has required implicit metadata labels since September 2025, South Korea's AI Basic Act took effect in January 2026, and India's amended IT Rules require labels and permanent identifiers where feasible.",
        ],
      },
      {
        heading: "SynthID is becoming the shared watermark",
        body: [
          "Google's SynthID is now used beyond Google. OpenAI adds it to ChatGPT and API images since May 2026, and Apple has said Apple Intelligence images will carry it after a software update later this year. Google reports more than 100 billion images and videos marked. Meta went its own way with Content Seal, and TikTok and ByteDance use their own watermarks.",
          "The practical result: removing metadata no longer makes an image from these services unrecognizable to the company that made it. Their checkers read the watermark, not the file's metadata.",
        ],
      },
      {
        heading: "Why the metadata layer still matters to you",
        body: [
          "Metadata is where the personal details are. Midjourney writes your username and prompt into the file. Local Stable Diffusion and FLUX tools save prompts, seeds and whole workflows. Phone photos carry GPS coordinates and serial numbers. That is the part a metadata cleaner is for, and it is the part you can check yourself before you share a file.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which AI image generators add C2PA Content Credentials?",
        a: "As of September 2026: OpenAI (ChatGPT, Codex and the API), Google (the Gemini app, Vertex AI and Google Ads), Adobe Firefly and Photoshop generative edits, Microsoft Copilot, Designer and Bing Image Creator, Black Forest Labs' FLUX API, and ByteDance's Dreamina. Midjourney and xAI's Grok Imagine do not document C2PA.",
      },
      {
        q: "Which generators add an invisible watermark?",
        a: "Google and OpenAI use SynthID. Meta uses Content Seal on Muse Image. ByteDance says Dreamina output carries an invisible watermark. Some local pipelines, such as Stability's SDXL scripts and the FLUX.1 reference code, add a DWT-DCT watermark. Apple has announced SynthID for a later iOS 27 update.",
      },
      {
        q: "Can BlankAI remove invisible watermarks?",
        a: "No. BlankAI removes file metadata: EXIF, GPS, XMP, IPTC, C2PA and PNG text chunks. Invisible watermarks are part of the pixels, and BlankAI does not alter pixels to defeat them.",
      },
    ],
    sources: [SRC.euArticle50, SRC.euCode, SRC.caSb942, SRC.googleIdentify, SRC.openaiProvenance, SRC.chinaMeasures],
  },
  platforms: {
    key: "platforms",
    path: "/platform-ai-labels",
    name: "Platform labels",
    title: "How Social Platforms Label AI Images (2026) | BlankAI",
    description:
      "Which platforms read C2PA or IPTC, which run their own detection, and which keep your metadata after upload. A 2026 comparison with each platform's rules.",
    h1: "How Instagram, TikTok, LinkedIn and Pinterest Label AI Images",
    eyebrow: "Platform comparison",
    intro:
      "Each platform decides for itself when to call an image AI-generated. Some read C2PA Content Credentials, some read the IPTC digital source type, some run their own classifiers, and all of them rely on creators to disclose. This page compares what each one reads, and links to a guide for each.",
    tableTitle: "What each platform reads",
    tableIntro:
      "Metadata signals are the ones a cleaner can change. Watermarks, classifiers and your own disclosure are not.",
    tableNote:
      "“Sometimes” marks cases where the platform's statement and independent tests disagree, or where behavior depends on the upload path. Reviewed September 25, 2026.",
    sections: [
      {
        heading: "Three kinds of signal",
        body: [
          "Metadata signals are the IPTC digital source type and C2PA manifests written by the tool that made or edited the file. They are easy to read and easy to lose: any re-encode drops them. Watermarks sit in the pixels and survive screenshots and compression. Classifiers judge an image by how it looks. On top of these, every major platform asks creators to label realistic AI content themselves.",
          "That is why removing metadata can change an automatic label caused by an editing tool, but does not change a platform's rules. If your content is AI-generated and the platform asks you to disclose it, you still need to.",
        ],
      },
      {
        heading: "What changes in 2027",
        body: [
          "From 1 January 2027, California requires large online platforms to detect and display standards-compliant provenance data on uploads and not to knowingly strip it. Expect more platforms to show Content Credentials the way LinkedIn does, and to note when a file that should carry them does not.",
        ],
      },
      {
        heading: "The privacy side of uploads",
        body: [
          "Most large platforms strip EXIF and GPS from the copy the public sees, but they still receive the original file. Messages, document uploads and marketplace listings often keep metadata intact. Cleaning a file before you upload it is the only way to be sure your location and device details stay with you.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which platforms show Content Credentials to viewers?",
        a: "LinkedIn shows a CR icon and a details panel on images and videos with C2PA credentials. TikTok and Meta use C2PA to apply their own AI labels rather than showing the credential itself.",
      },
      {
        q: "Does removing metadata stop AI labels?",
        a: "It removes the metadata signals only. Platforms also use watermarks, classifiers and your own disclosure, and their rules on labeling realistic AI content still apply.",
      },
      {
        q: "Do platforms remove my photo's location?",
        a: "Instagram, Facebook and public LinkedIn posts do not show EXIF or GPS to other users, according to independent tests, but the platform still receives the original upload. Clean the file first if you do not want to hand over that data at all.",
      },
    ],
    sources: [SRC.metaLabels, SRC.iptcSocial, SRC.caSb942, { label: "LinkedIn Help: Content Credentials", href: "https://www.linkedin.com/help/linkedin/answer/a6282984" }],
  },
};

// ─── Pages ─────────────────────────────────────────────────────────────────────

export const landingPages: LandingPageData[] = [
  // ── Core: C2PA ────────────────────────────────────────────────────────────────
  {
    slug: "remove-ai-content-credentials",
    kind: "core",
    name: "Remove Content Credentials",
    title: "Remove AI Content Credentials (C2PA) from Images | BlankAI",
    description:
      "Remove C2PA Content Credentials and AI provenance metadata from images in your browser. See what the manifest contained, clean it, and verify the result.",
    h1: "Remove AI Content Credentials (C2PA) from Images",
    eyebrow: "C2PA remover",
    intro:
      "Content Credentials are signed C2PA manifests that record which app made or edited a file. ChatGPT, Gemini, Adobe Firefly, Microsoft Copilot and a growing list of cameras add them. BlankAI reads the manifest, shows which organizations it names, and writes a fresh copy without it. It does not touch invisible watermarks, which are a separate layer inside the pixels.",
    toolHeading: "Check and remove Content Credentials",
    toolIntro:
      "Drop a file to see whether it carries a C2PA manifest and which names it mentions. Cleaning writes a new copy; your original stays as it is.",
    layersTitle: "What a C2PA manifest can contain",
    layersIntro:
      "A manifest is a set of signed statements, called assertions, stored in a JUMBF box inside the file: an APP11 segment in JPEG, a caBX chunk in PNG, a C2PA chunk in WebP, or a uuid box in HEIF and AVIF.",
    layers: [
      { key: "c2pa", layer: "Claim and signature", status: "yes", detail: "The app or device that signed the file, when it signed, and the certificate chain that proves it.", action: "removed" },
      { layer: "Actions", status: "varies", detail: "Created, edited, cropped, AI-generated. Actions can carry the IPTC digital source type, such as trainedAlgorithmicMedia for fully AI-generated images.", action: "removed" },
      { layer: "Ingredients", status: "varies", detail: "Earlier versions of the file and their own manifests, so an edit history can be followed back.", action: "removed" },
      { layer: "Thumbnails", status: "varies", detail: "Small previews of the claim and of each ingredient.", action: "removed" },
      { key: "invisible", layer: "Soft binding to a watermark", status: "varies", detail: "Durable Content Credentials pair the manifest with an invisible watermark so the manifest can be looked up again from a cloud copy.", action: "not-removed" },
    ],
    sections: [
      {
        heading: "What Content Credentials are",
        body: [
          "C2PA is an open standard from the Coalition for Content Provenance and Authenticity. “Content Credentials” is the consumer name for the same thing, shown as a small CR icon in apps that display it. The current specification is version 2.4, dated April 2026, and a conformance program now certifies which apps and devices may sign credentials.",
          "A manifest does not change how the image looks. It is extra data stored next to the pixels, signed so that tampering is detectable. Because it is file data, re-encoding the pixels into a new file leaves it behind. That is what BlankAI does.",
        ],
      },
      {
        heading: "Who adds them in 2026",
        body: [
          "Most major AI image services now sign their output. OpenAI signs every ChatGPT, Codex and API image. Google says all media made in the Gemini app carries credentials. Adobe adds them to Firefly images and to Photoshop exports that used generative features. Microsoft adds them in Copilot, Designer and Bing Image Creator, Black Forest Labs in the FLUX API, TikTok for content made with its own AI tools, and Anthropic for image files Claude creates.",
          "Cameras and phones sign real photos too: recent Sony, Leica, Canon and Fujifilm bodies and the Google Pixel 10 can add capture credentials. So a manifest does not always mean AI. Drop a file above and BlankAI will show what its manifest mentions.",
        ],
      },
      {
        heading: "Reasons to remove them",
        body: [
          "Manifests can carry more than a label. They can include timestamps, the software and version you used, thumbnails of earlier versions, and in some apps the account name you signed with. A photographer may not want to publish a whole editing history, and a small AI fix in Photoshop can mark an otherwise ordinary photo as AI-edited.",
        ],
      },
      {
        heading: "What removing them does not do",
        body: [
          "It does not remove invisible watermarks. Images from Google and OpenAI also carry SynthID, and their checkers will still recognize them. Durable Content Credentials can be looked up again from a watermark. And it does not change your obligations: platforms that ask you to disclose realistic AI content still expect you to.",
          "Some rules apply to removal itself. China's labeling measures prohibit deleting AI labels from generated content. Several generators, including Black Forest Labs and xAI, forbid removing provenance data in their terms. If you publish an AI-generated image, the simplest honest path is to keep its label.",
        ],
      },
    ],
    steps: {
      title: "How to remove Content Credentials from an image",
      items: [
        "Drop the image into the tool above. BlankAI scans it and lists the C2PA manifest and the names it mentions.",
        "Pick an output format. “Same as original” keeps PNG transparency and WebP files as they are.",
        "Select Remove Metadata. Your browser redraws the pixels into a new file that has no manifest.",
        "Read the report. It re-scans the new file, and you can confirm at contentcredentials.org/verify that no credentials are found.",
      ],
    },
    faqs: [
      {
        q: "Does removing Content Credentials remove the AI watermark?",
        a: "No. Content Credentials are metadata. SynthID and similar watermarks are embedded in the pixels and survive re-encoding. Google's and OpenAI's checkers can still identify their images after the credentials are gone.",
      },
      {
        q: "Can someone tell that credentials were removed?",
        a: "The cleaned file itself holds no trace of the missing manifest. But if the generator also added an invisible watermark, a checker can find the watermark, and some verifiers treat a watermark with no matching manifest as a sign that credentials were stripped.",
      },
      {
        q: "Is it legal to remove C2PA data?",
        a: "In the US and EU, the current rules place duties on AI providers and, in California from 2027, on large platforms. They do not penalize individuals for cleaning their own files. China's labeling measures do prohibit removing AI labels, and some generators' terms forbid it. This is general information, not legal advice.",
      },
      {
        q: "Does it work with PNG, WebP, HEIC and AVIF?",
        a: "Yes. PNG and WebP keep their format by default. HEIC and AVIF are saved as JPEG, or PNG when the image has transparency, because browsers cannot encode those formats.",
      },
      {
        q: "Will Instagram or LinkedIn still label my image?",
        a: "LinkedIn shows its CR icon only when a manifest is present. Instagram reads metadata signals too, but it also relies on your own disclosure and on Meta's rules. See the platform guides for details.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS, CHECK_OPENAI, CHECK_GEMINI],
    sources: [SRC.c2paSpec, SRC.c2paConformance, SRC.openaiProvenance, SRC.googleIdentify, SRC.euCode, SRC.chinaMeasures],
    related: [
      "/ai-generator-metadata",
      "/remove-metadata-from-chatgpt-images",
      "/remove-metadata-from-firefly-images",
      "/linkedin-content-credentials-cr-icon",
      "/blog/how-to-remove-c2pa-metadata",
      "/exif-viewer",
    ],
  },

  // ── Core: EXIF / GPS privacy ──────────────────────────────────────────────────
  {
    slug: "image-metadata-remover",
    kind: "core",
    name: "Image Metadata Remover",
    title: "Image Metadata Remover: Remove EXIF & GPS Online | BlankAI",
    description:
      "Remove EXIF, GPS location, camera serial numbers and other hidden metadata from photos in your browser. Works with JPG, PNG, WebP, AVIF and iPhone HEIC.",
    h1: "Image Metadata Remover: Remove EXIF and GPS from Photos",
    eyebrow: "EXIF and GPS remover",
    intro:
      "A phone photo carries more than pixels: where it was taken, the device and sometimes its serial number, the time to the second, and the editing apps it passed through. BlankAI shows what each file contains, removes it in your browser, and re-checks the new copy before you share it.",
    toolHeading: "Remove metadata from photos",
    toolIntro: "Add up to 20 photos at once. They are processed on this device and never uploaded.",
    layersTitle: "What a typical phone photo contains",
    layers: [
      { key: "exif", layer: "GPS coordinates", status: "yes", detail: "Latitude, longitude, altitude and direction. On most phones this is accurate to a few meters.", action: "removed" },
      { layer: "Device and lens", status: "yes", detail: "Make, model and lens. Many cameras also record a body serial number.", action: "removed" },
      { layer: "Capture time", status: "yes", detail: "Original date and time, often with the time-zone offset.", action: "removed" },
      { layer: "Maker notes", status: "varies", detail: "Vendor-specific data. On some cameras it includes shutter counts and internal identifiers.", action: "removed" },
      { key: "metadata", layer: "XMP and IPTC", status: "varies", detail: "Editing history, captions, keywords, author and copyright added by editing apps.", action: "removed" },
      { layer: "HDR gain map and depth data", status: "varies", detail: "Extra images stored inside iPhone and Pixel photos. The clean copy does not include them, so the HDR brightness boost is lost.", action: "removed" },
    ],
    sections: [
      {
        heading: "Why remove photo metadata before sharing",
        body: [
          "GPS coordinates in a photo taken at home point to your home. A serial number links separate photos to the same camera. Capture times reveal routines. None of this is visible when you look at the picture, which is why it gets shared by accident.",
          "Large social networks hide EXIF from other users, but they still receive the original file. Email attachments, cloud share links, forums, marketplaces and messaging apps that send “as a file” usually pass the metadata along untouched.",
        ],
      },
      {
        heading: "iPhone photos and HEIC",
        body: [
          "iPhones save photos as HEIC by default. BlankAI decodes HEIC in the browser and writes the clean copy as JPEG. When you pick photos from the iOS photo library in Safari, iOS may already convert them and remove location, depending on the Options setting in the share sheet. Picking the file from the Files app keeps the original, so you can see exactly what it contains.",
        ],
      },
      {
        heading: "What changes in the image",
        body: [
          "The clean copy is re-encoded from the pixels. PNG output is lossless. JPEG and WebP use quality 92 by default, and you can choose 100. Rotation from the EXIF orientation tag is applied to the pixels, so the photo still displays the right way up. Colors are converted to sRGB, which can make very saturated wide-gamut photos slightly less vivid.",
        ],
      },
    ],
    steps: {
      title: "How to remove metadata from a photo",
      items: [
        "Drop up to 20 photos into the tool above, or tap to choose them.",
        "For a single photo, review the metadata BlankAI found, including any GPS location.",
        "Select Remove Metadata, then save the clean copies one by one or as a ZIP.",
        "Check the report: it lists what was removed and confirms the new files contain no metadata.",
      ],
    },
    faqs: [
      {
        q: "Do Instagram and Facebook remove GPS data?",
        a: "Independent tests show public downloads from Instagram and Facebook carry no EXIF or GPS. Meta still receives the original file when you upload it, so cleaning first keeps the location off its servers too.",
      },
      {
        q: "Does removing metadata reduce quality?",
        a: "PNG stays lossless. JPEG and WebP are re-encoded at quality 92 by default, which is visually very close to the original, or at 100 if you choose Maximum.",
      },
      {
        q: "Can I remove GPS but keep the date?",
        a: "The remover clears everything. To change individual fields, open the photo in the EXIF Viewer, which can edit common fields such as date and location and save a new JPEG copy.",
      },
      {
        q: "Is anything uploaded?",
        a: "No. The files are read and processed in your browser. BlankAI records anonymous page events, such as how many images were processed, but never the images or their metadata.",
      },
    ],
    sources: [SRC.exiftoolTags, SRC.iptcPhoto],
    related: ["/heic-to-jpg", "/exif-viewer", "/remove-metadata-from-png", "/blog/remove-exif-data-complete-guide", "/platform-ai-labels"],
  },

  // ── Generator: ChatGPT ────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-chatgpt-images",
    kind: "generator",
    hub: "generators",
    name: "ChatGPT Images",
    title: "Remove Metadata from ChatGPT Images: C2PA Explained | BlankAI",
    description:
      "ChatGPT and OpenAI API images carry a C2PA manifest and, since May 2026, a SynthID watermark. See what each layer holds, remove the metadata, and know what stays.",
    h1: "Remove Metadata from ChatGPT Images",
    eyebrow: "OpenAI · ChatGPT Images 2.5",
    intro:
      "Every image made with ChatGPT, Codex or the OpenAI API is saved with a signed C2PA manifest that names OpenAI's tools as the creator. Since 19 May 2026 OpenAI also adds Google's SynthID watermark to the pixels. BlankAI removes the manifest and any other metadata. It cannot remove SynthID, so OpenAI's and Google's checkers will still recognize the image.",
    toolHeading: "Check a ChatGPT image",
    toolIntro: "Drop a ChatGPT download to see its C2PA manifest, then save a clean copy in the same format.",
    layersTitle: "What OpenAI puts in ChatGPT images",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "A signed manifest identifying the OpenAI product that generated the image, with an AI-generated action. OpenAI joined the C2PA steering committee in May 2026.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "varies", detail: "Downloads carry little outside the manifest. The AI source type is recorded inside the C2PA data.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "yes", detail: "SynthID on ChatGPT, Codex and API images since 19 May 2026. It is designed to survive compression, resizing, cropping and screenshots.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "no", detail: "ChatGPT images have no visible mark.", action: "n/a" },
    ],
    sections: [
      {
        heading: "What OpenAI embeds, and why",
        body: [
          "OpenAI has attached C2PA credentials to its images since the DALL-E 3 era. In May 2026 it went further: every image from ChatGPT, Codex and the API now also carries SynthID, the invisible watermark Google developed, and OpenAI published a public verification tool. ChatGPT Images 2.5, released on 8 September 2026, keeps the same approach; OpenAI says ChatGPT and the API now produce more than 3 billion images a week.",
          "These marks are not going away. The EU AI Act's marking duty has applied since August 2026 and California's AI Transparency Act requires covered providers to embed latent disclosures. OpenAI signed the EU's Code of Practice on AI-generated content.",
        ],
      },
      {
        heading: "Why clean a ChatGPT image at all",
        body: [
          "If you publish the image as AI-generated, you do not need to remove anything. Cleaning is useful when the file itself is the problem: some print services, marketplaces and content systems reject or mishandle files with embedded manifests, and manifests record tool details and timestamps you may not want to pass along. Designers who place a generated element into a larger composition also end up with a new file anyway, and BlankAI shows exactly what the original carried.",
        ],
      },
      {
        heading: "What stays after cleaning",
        body: [
          "SynthID stays. It is part of the pixels, and because OpenAI uses Google's system, both OpenAI's verification tool and Google's SynthID checks in Gemini can recognize a cleaned ChatGPT image. Removing metadata does not make a ChatGPT image undetectable, and no honest tool can promise that.",
          "Platform rules also stay. TikTok, YouTube and Meta ask creators to label realistic AI content, whatever the file's metadata says.",
        ],
      },
    ],
    steps: {
      title: "How to remove metadata from a ChatGPT image",
      items: [
        "Download the image from ChatGPT and drop it into the tool above.",
        "Review the report: it should list a C2PA manifest that mentions OpenAI.",
        "Keep “Same as original” to stay in PNG or WebP, then select Remove Metadata.",
        "Save the clean copy. The report re-scans it and confirms the manifest is gone.",
      ],
    },
    faqs: [
      {
        q: "Does ChatGPT add a watermark to images?",
        a: "Not a visible one. Since 19 May 2026 ChatGPT images carry an invisible SynthID watermark, alongside the C2PA metadata OpenAI already added.",
      },
      {
        q: "Does removing metadata make a ChatGPT image undetectable?",
        a: "No. It removes the C2PA manifest, but SynthID remains in the pixels and OpenAI's and Google's checkers can still identify the image.",
      },
      {
        q: "What format are ChatGPT downloads?",
        a: "ChatGPT usually saves PNG files. BlankAI keeps PNG by default so the clean copy stays lossless.",
      },
      {
        q: "How can I check whether a ChatGPT image still has credentials?",
        a: "Drop it into BlankAI or the EXIF Viewer, or upload it to contentcredentials.org/verify. A cleaned copy shows no manifest.",
      },
    ],
    checkers: [CHECK_OPENAI, CHECK_GEMINI, CHECK_CONTENT_CREDENTIALS],
    sources: [SRC.openaiProvenance, SRC.openaiImages25, SRC.petapixelOpenai, SRC.googleIdentify, SRC.euCode],
    related: [
      "/ai-generator-metadata",
      "/blog/does-removing-metadata-remove-synthid",
      "/remove-ai-content-credentials",
      "/remove-metadata-from-gemini-images",
      "/exif-viewer",
    ],
  },

  // ── Generator: Gemini / Nano Banana ───────────────────────────────────────────
  {
    slug: "remove-metadata-from-gemini-images",
    kind: "generator",
    hub: "generators",
    name: "Gemini / Nano Banana",
    title: "Remove Metadata from Gemini & Nano Banana Images | BlankAI",
    description:
      "Gemini and Nano Banana images carry C2PA credentials, SynthID and sometimes a visible sparkle. See which layers a metadata cleaner removes and which stay.",
    h1: "Remove Metadata from Gemini and Nano Banana Images",
    eyebrow: "Google · Gemini app, Nano Banana",
    intro:
      "Google marks images from the Gemini app and its Nano Banana models in up to three ways: a signed C2PA manifest, the SynthID watermark inside the pixels, and on some accounts a visible sparkle in the corner. BlankAI removes the manifest and other metadata. SynthID and the sparkle are part of the image and stay.",
    toolHeading: "Check a Gemini image",
    toolIntro: "Drop a Gemini or Nano Banana download to see its Content Credentials before cleaning.",
    layersTitle: "What Google puts in Gemini images",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "Google says all media made in the Gemini app includes Content Credentials. Nano Banana Pro images from Vertex AI and Google Ads carry them too.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "varies", detail: "Little outside the manifest in most downloads. The AI source type is recorded in the C2PA actions.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "yes", detail: "SynthID is applied to all Google-generated media and cannot be turned off.", action: "not-removed" },
      { key: "visible", layer: "Visible sparkle", status: "varies", detail: "Since 14 August 2026 most users can turn it off for new images under Settings, Media Watermark. In India, South Korea and Vietnam only AI Ultra users can; work and school accounts cannot.", action: "not-removed" },
    ],
    sections: [
      {
        heading: "How Google labels Gemini images",
        body: [
          "SynthID is Google's invisible watermark. Google says more than 100 billion images and videos carry it, and in May 2026 it put SynthID checks into the Gemini app, where you can upload an image and ask whether it is AI-generated, with checks in Search and Chrome rolling out. Google reported more than 50 billion Nano Banana images at I/O 2026, and released the faster Nano Banana 2 Lite on 30 June 2026.",
          "C2PA credentials sit on top of the watermark. Google added them to Nano Banana Pro output in late 2025 and now says every image made in the Gemini app includes them.",
        ],
      },
      {
        heading: "The visible sparkle",
        body: [
          "The sparkle is drawn onto the image, so no metadata tool removes it. If your account allows it, turn off Media Watermark in Gemini's settings before you generate; the setting applies to new images only.",
        ],
      },
      {
        heading: "What cleaning is useful for",
        body: [
          "Cleaning removes the manifest and any other metadata, which matters for privacy and for workflows that expect plain files. It does not hide the image's origin: SynthID remains, and since OpenAI also uses SynthID, Google's checks recognize images from both companies.",
        ],
      },
    ],
    steps: {
      title: "How to remove metadata from a Gemini image",
      items: [
        "Download the image from the Gemini app or AI Studio and drop it into the tool above.",
        "Check the report for a C2PA manifest that mentions Google.",
        "Select Remove Metadata and save the clean copy.",
        "If you want to see what Google can still detect, upload the clean copy to the Gemini app and ask whether it is AI-generated.",
      ],
    },
    faqs: [
      {
        q: "Can I remove the Gemini watermark?",
        a: "There are two. The visible sparkle can be turned off in settings for new images on most accounts. The invisible SynthID watermark cannot be turned off or removed by a metadata tool.",
      },
      {
        q: "Does Nano Banana add metadata to images?",
        a: "Yes. Images made in the Gemini app carry C2PA Content Credentials, and all Google-generated images carry SynthID.",
      },
      {
        q: "Does BlankAI remove SynthID?",
        a: "No. BlankAI removes metadata only. SynthID is embedded in the pixels and survives cleaning.",
      },
    ],
    checkers: [CHECK_GEMINI, CHECK_CONTENT_CREDENTIALS],
    sources: [SRC.googleIdentify, SRC.googleGeminiVerify, SRC.geminiHelp, { label: "Google: Gemini Omni Flash and Nano Banana 2 Lite (June 2026)", href: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/" }],
    related: [
      "/ai-generator-metadata",
      "/remove-metadata-from-chatgpt-images",
      "/blog/does-removing-metadata-remove-synthid",
      "/remove-ai-content-credentials",
    ],
  },

  // ── Generator: Midjourney ─────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-midjourney-images",
    kind: "generator",
    hub: "generators",
    name: "Midjourney",
    title: "Remove Midjourney Metadata: Prompt, Job ID, Username | BlankAI",
    description:
      "Midjourney downloads store your prompt, parameters, Job ID and username in plain metadata, plus an IPTC AI label. Remove them in your browser before sharing.",
    h1: "Remove Metadata from Midjourney Images",
    eyebrow: "Midjourney V8",
    intro:
      "Images downloaded from midjourney.com carry readable metadata: the full prompt with every parameter, the Job ID, your Midjourney username as the author, the creation time, and an IPTC tag that marks the file as AI-generated. None of it is signed, and Midjourney does not add C2PA or a documented invisible watermark. BlankAI removes all of it.",
    toolHeading: "Clean a Midjourney image",
    toolIntro: "Drop a download from midjourney.com to see your prompt and username in the file, then remove them.",
    layersTitle: "What Midjourney writes into downloads",
    layersIntro:
      "Midjourney has not published documentation on this. The fields below come from independent tests of files downloaded from midjourney.com since about October 2025.",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "no", detail: "No C2PA manifest in tested downloads.", action: "n/a" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "yes", detail: "Description holds the prompt, parameters and Job ID. Author holds your username. A Digital Image GUID repeats the Job ID, and the IPTC digital source type is trainedAlgorithmicMedia.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "unknown", detail: "Midjourney has not documented one, and none is known from testing.", action: "n/a" },
      { key: "visible", layer: "Visible watermark", status: "no", detail: "No visible mark.", action: "n/a" },
    ],
    sections: [
      {
        heading: "Why Midjourney metadata is personal",
        body: [
          "Your username ties the file to your account and public gallery. The Job ID identifies the exact generation on Midjourney's servers. The prompt and parameters are your working method, which many artists treat as their own craft. Anyone who opens the file in a metadata viewer can read all of it.",
          "Images saved from Discord usually lose these fields because Discord re-processes uploads, so the same picture may carry very different metadata depending on where you saved it.",
        ],
      },
      {
        heading: "The IPTC AI label",
        body: [
          "The trainedAlgorithmicMedia tag is the standard way to say an image was made by AI. Instagram and Pinterest read it. Removing it removes that automatic signal, but platform rules still apply: Pinterest also uses its own classifiers, and Meta relies on your disclosure for realistic AI content.",
        ],
      },
      {
        heading: "What cleaning leaves behind",
        body: [
          "Nothing in the file's metadata. Because Midjourney does not document a watermark, the cleaned file has no known embedded marker. Platforms that use visual classifiers can still judge the image by how it looks.",
        ],
      },
    ],
    steps: {
      title: "How to remove metadata from a Midjourney image",
      items: [
        "Download the image from midjourney.com and drop it into the tool above.",
        "For a single file, the metadata panel shows the prompt, Job ID and author fields.",
        "Select Remove Metadata. PNG downloads stay PNG.",
        "Save the clean copy and keep the original if you want your prompt for reference.",
      ],
    },
    faqs: [
      {
        q: "Does Midjourney add C2PA Content Credentials?",
        a: "Not according to independent tests. Midjourney writes plain, unsigned metadata instead.",
      },
      {
        q: "Does Midjourney watermark its images?",
        a: "There is no visible watermark, and Midjourney has not documented an invisible one.",
      },
      {
        q: "Why does Instagram label my Midjourney image?",
        a: "Midjourney downloads include the IPTC digital source type trainedAlgorithmicMedia, which Meta reads as an AI signal. Meta also expects you to label realistic AI content yourself.",
      },
      {
        q: "Can other people see my prompt?",
        a: "Yes, anyone with the file and a metadata viewer. Clean the file before sharing if you want to keep the prompt private.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS],
    sources: [
      { label: "Numonic: Midjourney metadata, what survives", href: "https://www.numonic.ai/blog/midjourney-metadata-what-survives" },
      { label: "Lumethic: which AI generators use C2PA and watermarks", href: "https://www.lumethic.com/en/articles/ai-generators-c2pa-watermarks" },
      SRC.iptcDst,
    ],
    related: [
      "/blog/midjourney-metadata-removal",
      "/instagram-ai-info-label",
      "/pinterest-ai-modified-label",
      "/ai-generator-metadata",
      "/exif-viewer",
    ],
  },

  // ── Generator: Meta AI ────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-meta-ai-images",
    kind: "generator",
    hub: "generators",
    name: "Meta AI / Muse",
    title: "Remove Metadata from Meta AI Images (Muse, Imagine) | BlankAI",
    description:
      "Meta AI images use IPTC labels, visible marks on older Imagine output and the invisible Content Seal on Muse Image. See what metadata cleaning can and cannot change.",
    h1: "Remove Metadata from Meta AI Images",
    eyebrow: "Meta · Muse Image, Imagine",
    intro:
      "Meta has marked images from its AI tools since 2024. Older Imagine images carry IPTC metadata, an invisible watermark and a visible “Imagined with AI” mark. Muse Image, launched on 7 July 2026, adds an invisible watermark Meta calls Content Seal and no visible mark. BlankAI removes the metadata layer. Content Seal and any visible mark stay.",
    toolHeading: "Check a Meta AI image",
    toolIntro: "Drop an image saved from Meta AI, Instagram or WhatsApp to see what metadata it carries.",
    layersTitle: "What Meta puts in its AI images",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "unknown", detail: "Meta has not documented C2PA on Muse Image downloads.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "varies", detail: "IPTC metadata on Imagine images, per Meta's 2024 announcement. Not documented for Muse Image.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "yes", detail: "Content Seal on Muse Image, which Meta says survives cropping, resizing and screenshots. Imagine images carry an earlier invisible watermark.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "varies", detail: "“Imagined with AI” on older Imagine images. Muse Image has none.", action: "not-removed" },
    ],
    sections: [
      {
        heading: "Content Seal and Meta's detector",
        body: [
          "Meta launched a detector alongside Muse Image at meta.ai/identification. It is a preview, it only recognizes Muse Image output, and it does not read SynthID or C2PA, so it cannot check images from Google or OpenAI. Content Seal is not interoperable with those systems.",
        ],
      },
      {
        heading: "Labels on Instagram and Facebook",
        body: [
          "Meta labels content as “AI info” when it detects industry-standard AI signals or when you disclose AI use. Since September 2024, images that were only edited with AI show the label in the post menu rather than on the image. Images from Meta's own tools are identified by Meta directly.",
        ],
      },
      {
        heading: "What cleaning changes",
        body: [
          "Cleaning removes any IPTC or other metadata in the file you saved. It does not remove Content Seal, so Meta can still identify a Muse image after cleaning.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does Meta AI add a watermark to images?",
        a: "Yes. Muse Image output carries the invisible Content Seal. Older Imagine images also had a visible “Imagined with AI” mark.",
      },
      {
        q: "Can Meta tell an image came from Muse after I clean it?",
        a: "Yes. Content Seal is in the pixels, and Meta's detector reads it regardless of metadata.",
      },
      {
        q: "Does BlankAI remove Content Seal?",
        a: "No. BlankAI removes file metadata only.",
      },
    ],
    checkers: [
      { label: "Meta AI identification (preview)", href: "https://www.meta.ai/identification", note: "Checks for Content Seal on Muse Image output" },
      CHECK_CONTENT_CREDENTIALS,
    ],
    sources: [
      { label: "Meta AI: Introducing Muse Image and Muse Video", href: "https://ai.meta.com/blog/introducing-muse-image-muse-video-msl/" },
      { label: "Engadget: Meta built an AI detection tool for its new models (July 2026)", href: "https://www.engadget.com/2210223/meta-built-an-ai-detection-tool-to-id-images-and-video-created-with-its-new-models/" },
      SRC.metaLabels,
    ],
    related: ["/instagram-ai-info-label", "/ai-generator-metadata", "/blog/c2pa-vs-synthid-vs-iptc-ai-image-labels", "/exif-viewer"],
  },

  // ── Generator: Grok ───────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-grok-images",
    kind: "generator",
    hub: "generators",
    name: "Grok Imagine",
    title: "Remove Metadata from Grok Imagine Images | BlankAI",
    description:
      "Grok Imagine images carry a visible Grok watermark that cannot be turned off, and xAI documents no C2PA. See what a metadata cleaner does for Grok files.",
    h1: "Remove Metadata from Grok Imagine Images",
    eyebrow: "xAI · Grok Imagine 1.5",
    intro:
      "xAI marks Grok Imagine images and videos with a visible Grok watermark that users cannot switch off. It does not document C2PA credentials, IPTC labels or an invisible watermark. BlankAI shows what metadata a Grok file actually carries and removes it. It does not remove the visible watermark, and xAI's usage policy forbids removing provenance signals.",
    toolHeading: "Check a Grok image",
    toolIntro: "Drop a Grok Imagine download to see what metadata it really contains.",
    layersTitle: "What xAI documents for Grok Imagine",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "unknown", detail: "Not documented by xAI. Claims otherwise come mostly from third-party sites.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "unknown", detail: "Not documented. Drop a file into the tool to see what yours contains.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "unknown", detail: "Not documented by xAI.", action: "n/a" },
      { key: "visible", layer: "Visible watermark", status: "yes", detail: "A Grok watermark on generated images and videos. It cannot be turned off.", action: "not-removed" },
    ],
    sections: [
      {
        heading: "What xAI says about marking",
        body: [
          "xAI's FAQ says generated images and videos carry a visible Grok watermark, and its usage policy treats removing provenance signals as a violation. Grok Imagine 1.5 went into wide release on 17 June 2026 with image-to-video generation, and the same marking applies.",
          "Because xAI documents no C2PA manifest, images posted on X are not labeled automatically by systems that read Content Credentials.",
        ],
      },
      {
        heading: "Why check a Grok file anyway",
        body: [
          "Files pick up metadata as they move: an editing app may add XMP, a phone may add EXIF when you save to the gallery. BlankAI reports exactly what is present, so you know what you are sharing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does Grok add C2PA Content Credentials?",
        a: "xAI does not document it. Scan a file with BlankAI to see whether yours has a manifest.",
      },
      {
        q: "Can BlankAI remove the Grok watermark?",
        a: "No. The visible watermark is part of the image. BlankAI only removes file metadata.",
      },
      {
        q: "Is it allowed to remove Grok's watermark?",
        a: "xAI's usage policy says removing provenance signals violates its terms.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS],
    sources: [
      { label: "xAI: Grok FAQ", href: "https://docs.x.ai/grok/faq" },
      { label: "xAI: Grok Imagine 1.5", href: "https://x.ai/news/grok-imagine-1-5" },
      { label: "Lumethic: which AI generators use C2PA and watermarks", href: "https://www.lumethic.com/en/articles/ai-generators-c2pa-watermarks" },
    ],
    related: ["/ai-generator-metadata", "/remove-ai-content-credentials", "/exif-viewer"],
  },

  // ── Generator: FLUX ───────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-flux-images",
    kind: "generator",
    hub: "generators",
    name: "FLUX",
    title: "Remove Metadata from FLUX Images (API & Local) | BlankAI",
    description:
      "FLUX API images carry signed C2PA; local FLUX runs can write your prompt into EXIF and add an invisible watermark. See what each setup embeds and what BlankAI removes.",
    h1: "Remove Metadata from FLUX Images",
    eyebrow: "Black Forest Labs · FLUX.2, FLUX 3",
    intro:
      "What a FLUX image carries depends on how you ran it. Black Forest Labs' API adds signed C2PA Content Credentials. The FLUX.1 reference code writes your prompt into EXIF and adds an invisible watermark; the FLUX.2 command-line script writes a short EXIF tag; the diffusers pipeline adds nothing; ComfyUI saves its workflow. BlankAI removes every metadata layer. It cannot remove a pixel watermark.",
    toolHeading: "Check a FLUX image",
    toolIntro: "Drop a FLUX output to see which of these layers your setup added.",
    layersTitle: "What FLUX output carries, by setup",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "varies", detail: "Signed C2PA on FLUX.2 Pro, FLUX.2 klein and Kontext Pro API output. Black Forest Labs' terms forbid removing it.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "varies", detail: "FLUX.1 reference code: Software “AI generated;txt2img;flux”, Make “Black Forest Labs”, the model name, and your prompt in ImageDescription. FLUX.2 script: Software “AI generated;flux2” and Make.", action: "removed" },
      { key: "text", layer: "PNG workflow data", status: "varies", detail: "ComfyUI saves the prompt and full node graph in PNG text chunks.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "varies", detail: "A DWT-DCT watermark in the FLUX.1 reference code, on by default. Commented out in the FLUX.2 script. None in diffusers.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "no", detail: "No visible mark.", action: "n/a" },
    ],
    sections: [
      {
        heading: "API versus local generation",
        body: [
          "Through the API, Black Forest Labs signs output with C2PA, as a signatory to the EU Code of Practice would be expected to. Running open weights locally gives you control, but the reference scripts are not neutral: the FLUX.1 code writes your full prompt into the EXIF ImageDescription field by default, which is easy to overlook when you share a JPEG.",
          "FLUX 3, announced on 23 July 2026 as a unified image, video and audio model, did not describe its provenance approach at launch. Check a real file to see what it contains.",
        ],
      },
      {
        heading: "About the DWT-DCT watermark",
        body: [
          "The FLUX.1 reference code and several Stable Diffusion scripts embed a small invisible watermark using the invisible-watermark library. BlankAI does not alter pixels and does not try to remove it.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does FLUX add a watermark?",
        a: "The FLUX.1 reference code adds an invisible DWT-DCT watermark by default. The FLUX.2 script and the diffusers pipeline do not. API output is signed with C2PA.",
      },
      {
        q: "Where is my FLUX prompt stored?",
        a: "With the FLUX.1 reference code, in the EXIF ImageDescription field. With ComfyUI, in the PNG prompt and workflow chunks. BlankAI removes both.",
      },
      {
        q: "Can I remove C2PA from FLUX API images?",
        a: "Technically yes, but Black Forest Labs' terms forbid removing it from API output.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS],
    sources: [
      { label: "Black Forest Labs: FLUX.2 [dev] model card", href: "https://huggingface.co/black-forest-labs/FLUX.2-dev" },
      { label: "Black Forest Labs: FLUX.1 reference code (util.py)", href: "https://github.com/black-forest-labs/flux/blob/main/src/flux/util.py" },
      { label: "Black Forest Labs: Usage policy", href: "https://bfl.ai/legal/usage-policy" },
      { label: "Black Forest Labs: FLUX 3", href: "https://bfl.ai/blog/flux-3" },
    ],
    related: [
      "/remove-metadata-from-stable-diffusion-images",
      "/remove-metadata-from-png",
      "/ai-generator-metadata",
      "/exif-viewer",
    ],
  },

  // ── Generator: Adobe Firefly ──────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-firefly-images",
    kind: "generator",
    hub: "generators",
    name: "Adobe Firefly",
    title: "Remove Content Credentials from Adobe Firefly Images | BlankAI",
    description:
      "Adobe Firefly and Photoshop generative edits attach Content Credentials that mark a file as AI-made or AI-edited. See what they record and how to remove them.",
    h1: "Remove Content Credentials from Adobe Firefly and Photoshop AI Edits",
    eyebrow: "Adobe · Firefly Image 5, Generative Fill",
    intro:
      "Adobe attaches Content Credentials to images generated with Firefly and to Photoshop exports that used generative features such as Generative Fill or Generative Expand. The credentials record the AI action, and the IPTC data can say compositeWithTrainedAlgorithmicMedia. That is why a photo with one small AI fix can be labeled on social media. BlankAI removes these records from a copy of the file.",
    toolHeading: "Check a Firefly or Photoshop export",
    toolIntro: "Drop an export to see its Content Credentials and digital source type before cleaning.",
    layersTitle: "What Adobe adds",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "Added automatically to fully generated Firefly images and to exports that used generative features.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "yes", detail: "XMP editing history and the IPTC digital source type, for example compositeWithTrainedAlgorithmicMedia after a Generative Fill edit.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "unknown", detail: "Adobe's Content Authenticity app can add a durable watermark. Adobe does not document one on Firefly output by default.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "no", detail: "No visible mark.", action: "n/a" },
    ],
    sections: [
      {
        heading: "Why one small edit gets an AI label",
        body: [
          "Removing a stray object with Generative Fill counts as an AI edit, so Photoshop records it. Instagram and other platforms read those records. Photographers have complained since 2024 that ordinary photos get labeled after minor fixes, and a June 2026 Adobe community thread reports that credentials stay even after the AI layers are deleted.",
          "Since September 2024, Meta shows the label for AI-edited images in the post menu rather than on the image, which softened the problem but did not remove it.",
        ],
      },
      {
        heading: "When to keep the credentials",
        body: [
          "Content Credentials can work for you. They can carry your name as the creator and show a documented editing history, which matters for journalism, competitions and clients who ask how an image was made. Adobe's Content Authenticity app lets you attach your identity to your work. If that is your goal, keep the credentials and clean only copies meant for other uses.",
        ],
      },
      {
        heading: "Firefly in 2026",
        body: [
          "Firefly Image 5 has been generally available since March 2026. In June Adobe added a creative agent across Photoshop, Premiere, Illustrator and InDesign. Both follow the same Content Credentials approach.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why does Instagram say “AI info” on my edited photo?",
        a: "Photoshop's generative features write AI records into the file: C2PA credentials and an IPTC digital source type. Meta reads those signals. An independent 2026 test found Instagram reacted to the IPTC field.",
      },
      {
        q: "Can I turn off Content Credentials in Photoshop?",
        a: "Photoshop applies them automatically when generative features are used, and users report they persist even after the AI layer is deleted. Cleaning an export removes them from that copy.",
      },
      {
        q: "Does removing credentials affect my copyright?",
        a: "No. Copyright does not depend on metadata. You do lose the embedded record that names you as the creator.",
      },
    ],
    checkers: [
      CHECK_CONTENT_CREDENTIALS,
      { label: "Adobe Content Authenticity", href: "https://contentauthenticity.adobe.com/", note: "Adobe's app for inspecting and adding credentials" },
    ],
    sources: [
      { label: "PetaPixel: What makes Instagram flag a photo as made with AI (2024)", href: "https://petapixel.com/2024/06/25/this-is-what-makes-instagram-flag-your-photo-as-made-with-ai/" },
      { label: "Adobe Community: Photoshop forcing Content Credentials on exports (2026)", href: "https://community.adobe.com/questions-712/photoshop-forcing-content-credentials-on-all-exports-regardless-of-ai-usage-or-disabled-settings-1628305" },
      { label: "Adobe: Content Authenticity app overview", href: "https://helpx.adobe.com/creative-cloud/apps/adobe-content-authenticity/beta-overview.html" },
      SRC.iptcSocial,
    ],
    related: ["/instagram-ai-info-label", "/remove-ai-content-credentials", "/linkedin-content-credentials-cr-icon", "/ai-generator-metadata"],
  },

  // ── Generator: Stable Diffusion / ComfyUI ─────────────────────────────────────
  {
    slug: "remove-metadata-from-stable-diffusion-images",
    kind: "generator",
    hub: "generators",
    name: "Stable Diffusion / ComfyUI",
    title: "Remove Stable Diffusion PNG Info & ComfyUI Workflows | BlankAI",
    description:
      "AUTOMATIC1111, Forge and ComfyUI save prompts, seeds, models and full workflows inside PNG files. Remove that PNG info in your browser and keep transparency.",
    h1: "Remove Stable Diffusion and ComfyUI Metadata",
    eyebrow: "AUTOMATIC1111 · Forge · ComfyUI · SDXL",
    intro:
      "Local Stable Diffusion tools save everything needed to reproduce an image inside the file. AUTOMATIC1111 and Forge write a parameters text chunk with the prompt, negative prompt, seed, sampler and model. ComfyUI saves the whole node graph. Some pipelines also add an invisible watermark. BlankAI removes the text data and keeps PNG output lossless and transparent.",
    toolHeading: "Remove PNG info from your renders",
    toolIntro: "Drop up to 20 PNG, JPEG or WebP renders. PNG stays PNG, with transparency.",
    layersTitle: "What each tool writes",
    layers: [
      { key: "text", layer: "PNG text chunks", status: "yes", detail: "AUTOMATIC1111 and Forge: a “parameters” chunk. ComfyUI: “prompt” and “workflow” chunks with the full graph, unless started with --disable-metadata.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "varies", detail: "AUTOMATIC1111 and Forge write the same parameters into EXIF UserComment when saving JPEG or WebP.", action: "removed" },
      { key: "c2pa", layer: "C2PA Content Credentials", status: "no", detail: "Local tools do not sign their output.", action: "n/a" },
      { key: "invisible", layer: "Invisible watermark", status: "varies", detail: "DWT-DCT watermark by default in the original CompVis SD 1.x script, Stability's SDXL and SVD scripts, and the diffusers SDXL pipeline when invisible-watermark is installed. AUTOMATIC1111, Forge and ComfyUI do not add one.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "no", detail: "No visible mark.", action: "n/a" },
    ],
    sections: [
      {
        heading: "Why remove generation data",
        body: [
          "A parameters chunk or a ComfyUI workflow is a complete recipe. Anyone who drops your PNG into AUTOMATIC1111's PNG Info tab or onto a ComfyUI canvas gets your prompt, seed, model, LoRAs and settings, and can reproduce or build on your work. Workflows can also contain model file names and paths from your machine.",
        ],
      },
      {
        heading: "Keep a private copy",
        body: [
          "The metadata is useful to you. ComfyUI can reload a whole workflow from its PNG, so keep your originals and share clean copies. You can also stop writing it at the source: AUTOMATIC1111 has a setting to stop saving generation parameters as PNG chunks, and ComfyUI accepts a --disable-metadata flag.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does BlankAI keep transparency?",
        a: "Yes. With “Same as original”, PNG input is saved as lossless PNG with its alpha channel.",
      },
      {
        q: "Can other people read my prompt from a PNG?",
        a: "Yes. The PNG Info tab in AUTOMATIC1111, dragging the file into ComfyUI, or any metadata viewer shows it.",
      },
      {
        q: "Does BlankAI remove the SDXL invisible watermark?",
        a: "No. It is part of the pixels, and BlankAI does not alter pixels.",
      },
    ],
    sources: [
      { label: "diffusers: Stable Diffusion XL pipeline source", href: "https://github.com/huggingface/diffusers/blob/main/src/diffusers/pipelines/stable_diffusion_xl/pipeline_stable_diffusion_xl.py" },
      { label: "ComfyUI: nodes.py (SaveImage metadata)", href: "https://github.com/comfyanonymous/ComfyUI/blob/master/nodes.py" },
      { label: "AUTOMATIC1111 stable-diffusion-webui", href: "https://github.com/AUTOMATIC1111/stable-diffusion-webui" },
    ],
    related: [
      "/blog/stable-diffusion-metadata-guide",
      "/remove-metadata-from-png",
      "/remove-metadata-from-flux-images",
      "/ai-generator-metadata",
    ],
  },

  // ── Generator: Microsoft ──────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-copilot-images",
    kind: "generator",
    hub: "generators",
    name: "Microsoft Copilot / Bing",
    title: "Remove Metadata from Copilot & Bing Image Creator | BlankAI",
    description:
      "Microsoft Copilot, Designer and Bing Image Creator images carry C2PA Content Credentials, and visible watermarks are now opt-in. See what cleaning removes.",
    h1: "Remove Metadata from Microsoft Copilot and Bing Image Creator Images",
    eyebrow: "Microsoft · Copilot, Designer, Bing",
    intro:
      "Microsoft adds C2PA Content Credentials to images created with Copilot, Designer and Bing Image Creator, a practice it started in 2023. Microsoft 365 adds the credential data even when the visible watermark is off, and the visible watermark is now opt-in. BlankAI removes the credentials and other metadata from a copy.",
    toolHeading: "Check a Copilot or Bing image",
    toolIntro: "Drop an image from Copilot, Designer or Bing Image Creator to see its Content Credentials.",
    layersTitle: "What Microsoft adds",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "On Copilot-generated images and on Bing Image Creator images since 2023. Microsoft 365 adds C2PA-based metadata even with the visible watermark turned off.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "unknown", detail: "Microsoft documents C2PA; other fields vary by app.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "unknown", detail: "An independent analysis in August 2026 reported a watermark ID encoded in the pixels and repeated in the C2PA data. Microsoft has not documented it.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "varies", detail: "Opt-in. Designer, Word and PowerPoint use an account setting that is off by default; Bing Image Creator has a per-visit setting.", action: "not-removed" },
    ],
    sections: [
      {
        heading: "Images inside Word and PowerPoint",
        body: [
          "Images generated in Microsoft 365 apps carry the same credential data when you export them. If you save an image out of a document to reuse it elsewhere, check it first. BlankAI shows whether a manifest is present and what it mentions.",
        ],
      },
      {
        heading: "Models in 2026",
        body: [
          "Copilot and Bing Image Creator moved to Microsoft's MAI-Image-2 model in March 2026. The provenance approach did not change.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does Bing Image Creator still add a watermark?",
        a: "The visible watermark is now a per-visit setting. Content Credentials are added either way.",
      },
      {
        q: "Does Copilot add hidden data to images?",
        a: "Yes. Microsoft adds C2PA Content Credentials. BlankAI removes them from a copy.",
      },
      {
        q: "Does BlankAI remove an invisible watermark from Copilot images?",
        a: "No. If a pixel watermark is present, it stays. BlankAI removes metadata only.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS],
    sources: [
      { label: "Microsoft Learn: Watermarks and Content Credentials in Microsoft 365 Copilot", href: "https://learn.microsoft.com/en-us/microsoft-365/copilot/watermarks" },
      { label: "Bing Image Creator help", href: "https://www.bing.com/images/create/help" },
      { label: "Microsoft AI: Introducing MAI-Image-2", href: "https://microsoft.ai/news/introducing-mai-image-2/" },
    ],
    related: ["/remove-ai-content-credentials", "/ai-generator-metadata", "/linkedin-content-credentials-cr-icon"],
  },

  // ── Generator: ByteDance ──────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-dreamina-seedream-images",
    kind: "generator",
    hub: "generators",
    name: "Dreamina / Seedream",
    title: "Remove Metadata from Dreamina & Seedream Images | BlankAI",
    description:
      "ByteDance's Dreamina, Seedream and Jimeng mark images with visible AI labels, C2PA, invisible watermarks and China's AIGC metadata label. See what cleaning changes.",
    h1: "Remove Metadata from Dreamina, Seedream and Jimeng Images",
    eyebrow: "ByteDance · Seedream 5.0 Pro, Seedance 2.5",
    intro:
      "ByteDance uses every layer at once. CapCut says output from Dreamina's Seedream 5.0 Pro and Seedance 2.5 carries a visible AI label, C2PA Content Credentials and an invisible watermark. Jimeng, the Chinese service, shows an AI mark and a brand watermark, and services in China must write the GB 45438-2025 implicit label into file metadata. BlankAI removes the metadata layers only.",
    toolHeading: "Check a Dreamina or Seedream image",
    toolIntro: "BlankAI reports C2PA, XMP and China's AIGC label if the file carries them.",
    layersTitle: "What ByteDance adds",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "On Dreamina Seedream 5.0 Pro and Seedance 2.5 output, according to CapCut.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "varies", detail: "China's GB 45438-2025 implicit label: an XMP property TC260:AIGC whose JSON value has fields such as Label, ContentProducer and ProduceID. Required for services in China.", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "yes", detail: "Stated by CapCut for Dreamina output.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "yes", detail: "An “AI generated” corner mark. The Seedream API adds it by default through its watermark parameter; Jimeng also adds a brand watermark.", action: "not-removed" },
    ],
    sections: [
      {
        heading: "China's implicit AIGC label",
        body: [
          "Since 1 September 2025, China's Measures for Labeling AI-Generated Synthetic Content and the mandatory standard GB 45438-2025 require services to write an implicit label into file metadata. In images it is an XMP property in the namespace http://www.tc260.org.cn/ns/AIGC/1.0/, or a PNG text chunk named AIGC, holding the producer's name and a content ID.",
          "Article 10 of the Measures prohibits anyone from maliciously deleting, altering or hiding these labels, and from providing tools that help others do so. The Cyberspace Administration of China published enforcement cases in April and September 2026. If you are in mainland China, do not remove AI labels from generated content. BlankAI reports this label so you can see it; it is not a tool for removing it where that is prohibited.",
        ],
      },
      {
        heading: "The API watermark parameter",
        body: [
          "Developers using the Seedream API get the visible “AI generated” mark by default. The watermark parameter controls it. The C2PA and invisible watermark layers are separate from that setting.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is TC260:AIGC in my image's metadata?",
        a: "It is China's implicit AI label under GB 45438-2025, written by services operating in China. It records that the content is AI-generated and who produced it.",
      },
      {
        q: "Is it legal to remove the AIGC label?",
        a: "Not in mainland China: Article 10 of the labeling measures prohibits deleting or altering it. Elsewhere, generator terms may still forbid it.",
      },
      {
        q: "Does BlankAI remove the visible AI mark?",
        a: "No. BlankAI does not edit the image. Visible marks stay.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS],
    sources: [
      { label: "CapCut: Dreamina Seedance 2.5 and Seedream 5.0 Pro (July 2026)", href: "https://www.capcut.com/newsroom/giving-creators-more-control-with-dreamina-seedance-2-5-and-dola-seedream-5-0-pro" },
      SRC.chinaMeasures,
      { label: "Cyberspace Administration of China: enforcement cases (September 2026)", href: "https://www.cac.gov.cn/2026-09/15/c_1790876152357946.htm" },
      { label: "AigcTotal: GB 45438 implicit label parser", href: "https://github.com/StarPluckerZ/AigcTotal" },
    ],
    related: ["/ai-generator-metadata", "/tiktok-ai-generated-label", "/remove-ai-content-credentials"],
  },

  // ── Generator: Apple ──────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-apple-image-playground-images",
    kind: "generator",
    hub: "generators",
    name: "Apple Intelligence",
    title: "Remove Metadata from Apple Image Playground Photos | BlankAI",
    description:
      "Image Playground and Photos Clean Up write AI labels into image metadata, and Apple plans SynthID for iOS 27. See what is in your file and what cleaning changes.",
    h1: "Remove Metadata from Apple Image Playground and Clean Up Photos",
    eyebrow: "Apple Intelligence · iOS 27",
    intro:
      "Apple labels AI output in metadata. An independent forensic analysis found that Image Playground names itself in EXIF, and that photos edited with Clean Up get the IPTC credit “Apple Photos Clean Up” and the digital source type compositeWithTrainedAlgorithmicMedia, while camera model and GPS are dropped. Apple has also said a SynthID watermark is coming to Apple Intelligence images and most edits in a software update later this year.",
    toolHeading: "Check an Apple Intelligence image",
    toolIntro: "Pick the file from the Files app to see Apple's labels. The Photos picker may convert it first.",
    layersTitle: "What Apple adds",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "unknown", detail: "Apple has not documented C2PA for Image Playground or Clean Up.", action: "removed" },
      { key: "metadata", layer: "EXIF / XMP / IPTC label", status: "yes", detail: "Image Playground names itself in EXIF. Clean Up adds the credit “Apple Photos Clean Up” and compositeWithTrainedAlgorithmicMedia (independent analysis).", action: "removed" },
      { key: "invisible", layer: "Invisible watermark", status: "announced", detail: "Apple says generated images and most edited images will carry SynthID after a software update later in 2026.", action: "not-removed" },
      { key: "visible", layer: "Visible watermark", status: "no", detail: "No visible mark. Photos shows “Modified with Clean Up” in the info panel.", action: "n/a" },
    ],
    sections: [
      {
        heading: "Clean Up removes your location but adds an AI label",
        body: [
          "The forensic analysis found an unusual trade: a photo edited with Clean Up loses its camera model and GPS but gains an AI label. If you share the edited photo, the location is already gone, and the label says an AI edit was made.",
        ],
      },
      {
        heading: "SynthID on Apple devices",
        body: [
          "At WWDC in June 2026 Apple introduced a new Image Playground with a photorealistic model running on Private Cloud Compute, and said generated images and Apple Intelligence edits will include a hidden SynthID watermark. Its September 2026 announcement says the watermark arrives in a software update later this year. Once it ships, cleaning metadata will not stop Google's SynthID checks from recognizing these images.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does Clean Up leave a mark on my photo?",
        a: "It leaves metadata: an IPTC credit and an AI digital source type, according to independent analysis. There is no visible mark.",
      },
      {
        q: "Does Image Playground add a watermark?",
        a: "Not yet. Apple has announced SynthID for a software update later in 2026.",
      },
      {
        q: "Why is my photo's location missing after using Clean Up?",
        a: "The analysis found Clean Up drops camera model and GPS when it saves the edit.",
      },
    ],
    sources: [
      { label: "Apple Newsroom: Next generation of Apple Intelligence (September 2026)", href: "https://www.apple.com/ie/newsroom/2026/09/next-generation-of-apple-intelligence-available-today/" },
      { label: "Apple Newsroom: Apple Intelligence at WWDC (June 2026)", href: "https://www.apple.com/newsroom/2026/06/apple-intelligence-brings-powerful-ai-capabilities-into-everyday-experiences/" },
      { label: "malwr4n6: Apple Intelligence photo forensics", href: "https://www.malwr4n6.com/post/apple-intelligence-photo-forensics" },
    ],
    related: ["/heic-to-jpg", "/image-metadata-remover", "/ai-generator-metadata", "/blog/does-removing-metadata-remove-synthid"],
  },

  // ── Platform: Instagram / Facebook ────────────────────────────────────────────
  {
    slug: "instagram-ai-info-label",
    kind: "platform",
    hub: "platforms",
    name: "Instagram “AI info”",
    title: "Why Instagram Shows “AI info” on Your Photo | BlankAI",
    description:
      "Instagram and Facebook add “AI info” when a file carries IPTC or C2PA AI signals, even after a small AI edit. See what triggers it and check your file first.",
    h1: "Instagram “AI info” Label: Why It Appears and What You Can Control",
    eyebrow: "Instagram · Facebook · Threads",
    intro:
      "Meta shows an “AI info” label when it detects industry-standard AI signals in an upload or when you disclose AI use yourself. The signals are file metadata: the IPTC digital source type and C2PA Content Credentials that tools like Photoshop's Generative Fill add automatically. Since September 2024, images that were only edited with AI show the label in the post menu rather than on the photo.",
    toolHeading: "Check a photo before you post it",
    toolIntro: "See which AI signals and personal data a file carries before Instagram does.",
    layersTitle: "What Meta looks at",
    layers: [
      { key: "metadata", layer: "IPTC digital source type", status: "yes", detail: "Values such as trainedAlgorithmicMedia or compositeWithTrainedAlgorithmicMedia. An independent March 2026 test found Instagram reacted to this field.", action: "removed" },
      { key: "c2pa", layer: "C2PA Content Credentials", status: "varies", detail: "Meta says it reads C2PA. The same 2026 test found Instagram did not react to C2PA alone.", action: "removed" },
      { key: "invisible", layer: "Invisible watermarks", status: "varies", detail: "Meta identifies images from its own tools and has said it works on detecting other companies' invisible markers.", action: "not-removed" },
      { layer: "Your disclosure", status: "yes", detail: "The AI label option when you post. Meta requires it for photorealistic video and realistic audio.", action: "n/a" },
    ],
    platform: {
      labelName: "AI info",
      readsC2pa: "varies",
      readsIptc: "yes",
      ownDetection: "Own watermark on Meta AI images; self-disclosure",
      keepsMetadata: "no",
    },
    sections: [
      {
        heading: "False positives from small edits",
        body: [
          "A photographer removes a power line with Generative Fill, exports, and posts. Photoshop writes an AI record into the file, and Meta reads it. Since September 2024 such AI-edited images show the label in the menu rather than on the photo, but it is still there. If a label came from metadata an editing tool added, it is tied to that file's metadata.",
        ],
      },
      {
        heading: "What you can control",
        body: [
          "Check the file before you post it. BlankAI and the EXIF Viewer show whether it carries an IPTC AI source type or a C2PA manifest, and what else it holds. If the picture is essentially a photograph and the record came from a minor retouch, a clean copy no longer carries that record.",
          "If the image is AI-generated, Meta's rules expect you to say so, and it requires disclosure for photorealistic AI video and realistic audio. Removing metadata does not change those rules.",
        ],
      },
      {
        heading: "Your location and the original upload",
        body: [
          "Independent tests show Instagram's public copies carry no EXIF or GPS, but Meta receives the original file. If you do not want Meta to have your photo's location, device details or editing history, clean the file before uploading.",
        ],
      },
    ],
    faqs: [
      {
        q: "What triggers “AI info” on Instagram?",
        a: "Industry AI signals in the file, mainly the IPTC digital source type and C2PA credentials, images from Meta's own AI tools, and your own disclosure.",
      },
      {
        q: "Does Instagram detect AI images without metadata?",
        a: "Meta identifies its own AI images through its watermark and has said it is working on detecting other companies' invisible markers. It also relies on your disclosure and can add labels after review.",
      },
      {
        q: "Does Instagram remove location data?",
        a: "Other users cannot see your photo's EXIF or GPS, according to independent tests, but Meta still receives the original file you upload.",
      },
      {
        q: "Should I remove metadata from AI images before posting?",
        a: "Not to avoid a label you should have. If the content is AI-generated and realistic, Meta's rules expect a label regardless of metadata.",
      },
    ],
    sources: [
      SRC.metaLabels,
      SRC.iptcSocial,
      { label: "PetaPixel: What makes Instagram flag a photo as made with AI (2024)", href: "https://petapixel.com/2024/06/25/this-is-what-makes-instagram-flag-your-photo-as-made-with-ai/" },
    ],
    related: [
      "/remove-metadata-from-firefly-images",
      "/remove-metadata-from-meta-ai-images",
      "/platform-ai-labels",
      "/exif-viewer",
      "/blog/c2pa-vs-synthid-vs-iptc-ai-image-labels",
    ],
  },

  // ── Platform: TikTok ──────────────────────────────────────────────────────────
  {
    slug: "tiktok-ai-generated-label",
    kind: "platform",
    hub: "platforms",
    name: "TikTok “AI-generated”",
    title: "TikTok “AI-generated” Label: How Detection Works | BlankAI",
    description:
      "TikTok auto-labels uploads that carry C2PA Content Credentials and is adding invisible watermarks to AI content. See what it reads and what creators must disclose.",
    h1: "TikTok “AI-generated” Label: What TikTok Reads and What You Must Disclose",
    eyebrow: "TikTok",
    intro:
      "TikTok reads C2PA Content Credentials on upload and labels AI-generated content automatically, a system it started in May 2024. It attaches its own C2PA data to content made with TikTok's AI tools, says that data stays on downloads, and has been testing an invisible watermark since November 2025. By July 2026 TikTok had labeled more than 3 billion videos. Creators must also label realistic AI content themselves.",
    toolHeading: "Check images for a photo post",
    toolIntro: "BlankAI works on still images. Use it to see what your photo carousel files carry.",
    layersTitle: "What TikTok looks at",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "Read on upload to apply the AI-generated label automatically.", action: "removed" },
      { key: "invisible", layer: "TikTok's invisible watermark", status: "varies", detail: "In testing since November 2025 for content made with TikTok tools and for uploads that carry C2PA.", action: "not-removed" },
      { layer: "Creator label", status: "yes", detail: "TikTok requires creators to label AI-generated content that shows realistic scenes or people.", action: "n/a" },
    ],
    platform: {
      labelName: "AI-generated",
      readsC2pa: "yes",
      readsIptc: "unknown",
      ownDetection: "Own watermark (testing); creator labels",
      keepsMetadata: "yes",
    },
    sections: [
      {
        heading: "How the automatic label works",
        body: [
          "When an upload carries Content Credentials from an AI tool, TikTok applies its AI-generated label. TikTok joined the C2PA steering committee and reported in July 2026 that more than 3 billion videos had been labeled through credentials, its own watermark and creator labels.",
        ],
      },
      {
        heading: "Your responsibility as a creator",
        body: [
          "TikTok's rules require you to label realistic AI-generated content, and it can label or remove content that should have been disclosed. Removing credentials from a file removes one automatic trigger; it does not change the rule.",
        ],
      },
      {
        heading: "Where BlankAI helps",
        body: [
          "For photo posts, BlankAI shows what each image carries, including GPS from your phone, and writes clean copies. It does not process video yet.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does TikTok detect AI images without C2PA?",
        a: "TikTok watermarks content made with its own AI tools and relies on creator labels. It can also apply labels after review.",
      },
      {
        q: "Will removing C2PA stop TikTok's AI label?",
        a: "It removes the automatic C2PA trigger. TikTok still requires you to label realistic AI content and can apply the label itself.",
      },
      {
        q: "Do TikTok downloads contain C2PA?",
        a: "TikTok says the C2PA data it attaches to content made with its AI tools remains when the content is downloaded.",
      },
      {
        q: "Does BlankAI work on videos?",
        a: "Not yet. BlankAI currently cleans JPG, PNG, WebP, AVIF and HEIC images.",
      },
    ],
    sources: [
      { label: "TikTok: Partnering with our industry to advance AI transparency", href: "https://newsroom.tiktok.com/en-us/partnering-with-our-industry-to-advance-ai-transparency-and-literacy" },
      { label: "TikTok: More ways to spot, shape and understand AI content", href: "https://newsroom.tiktok.com/more-ways-to-spot-shape-and-understand-ai-content?lang=en" },
      { label: "TikTok: Helping people spot and understand AI-generated content (July 2026)", href: "https://newsroom.tiktok.com/helping-people-spot-and-understand-ai-generated-content-on-tiktok?lang=en-GB" },
    ],
    related: ["/platform-ai-labels", "/remove-ai-content-credentials", "/remove-metadata-from-dreamina-seedream-images", "/image-metadata-remover"],
  },

  // ── Platform: LinkedIn ────────────────────────────────────────────────────────
  {
    slug: "linkedin-content-credentials-cr-icon",
    kind: "platform",
    hub: "platforms",
    name: "LinkedIn “CR” icon",
    title: "LinkedIn “CR” Icon: Content Credentials on Posts | BlankAI",
    description:
      "LinkedIn shows a CR icon on images and videos with C2PA Content Credentials, and anyone can open the details. See what your file reveals before you post it.",
    h1: "LinkedIn's “CR” Content Credentials Icon: What It Shows",
    eyebrow: "LinkedIn",
    intro:
      "LinkedIn displays a small CR icon on images and videos that carry signed C2PA Content Credentials. Anyone who clicks it sees the details: the app or AI model that made the file, the recorded actions, and when it was signed. LinkedIn keeps the credential rather than stripping it, so what is in your file is what your network sees.",
    toolHeading: "See what your post image will show",
    toolIntro: "Drop the image you plan to post. If it has a manifest, LinkedIn will show a CR icon.",
    layersTitle: "What LinkedIn does with your file",
    layers: [
      { key: "c2pa", layer: "C2PA Content Credentials", status: "yes", detail: "Kept and shown through the CR icon and a details panel.", action: "removed" },
      { key: "exif", layer: "EXIF and GPS", status: "varies", detail: "Stripped from public posts and profile photos, kept in messages and document uploads, according to independent tests.", action: "removed" },
    ],
    platform: {
      labelName: "CR icon and details panel",
      readsC2pa: "yes",
      readsIptc: "unknown",
      ownDetection: "None documented",
      keepsMetadata: "varies",
    },
    sections: [
      {
        heading: "When the CR icon helps you",
        body: [
          "A camera-signed photo or a documented edit history can back up your work: a photojournalist's image, a product shot, a design with a clear record of how it was made. If that is why you post, keep the credential.",
        ],
      },
      {
        heading: "When you might not want it",
        body: [
          "A headshot retouched with an AI background tool will show that edit in the panel. A client graphic made with a generator will name the generator. If you would rather not publish the tool chain, check the file first and decide. If the image is AI-generated and presented as real, leave the label on.",
        ],
      },
      {
        heading: "Documents and messages keep EXIF",
        body: [
          "Independent tests show LinkedIn strips EXIF and GPS from public posts, but not from files sent in messages or uploaded as documents. Clean photos before sending them that way.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does the CR icon on LinkedIn mean?",
        a: "The image or video carries signed C2PA Content Credentials. Clicking it shows who or what created the file and how it was edited.",
      },
      {
        q: "Why does my LinkedIn post show a CR icon?",
        a: "The file you uploaded had a C2PA manifest, usually from an AI tool, a generative edit in Photoshop, or a camera that signs its photos.",
      },
      {
        q: "Does LinkedIn remove GPS from photos?",
        a: "From public posts and profile photos, yes, according to independent tests. Files in messages and document uploads keep it.",
      },
    ],
    checkers: [CHECK_CONTENT_CREDENTIALS],
    sources: [
      { label: "LinkedIn Help: Content Credentials", href: "https://www.linkedin.com/help/linkedin/answer/a6282984" },
      { label: "MetaClean: Does LinkedIn remove EXIF metadata?", href: "https://metaclean.app/blog/does-linkedin-remove-exif-metadata" },
    ],
    related: ["/remove-ai-content-credentials", "/platform-ai-labels", "/remove-metadata-from-firefly-images", "/image-metadata-remover"],
  },

  // ── Platform: Pinterest ───────────────────────────────────────────────────────
  {
    slug: "pinterest-ai-modified-label",
    kind: "platform",
    hub: "platforms",
    name: "Pinterest “AI modified”",
    title: "Pinterest “AI modified” Label: How It Works | BlankAI",
    description:
      "Pinterest labels Pins “AI modified” using IPTC metadata, its own classifiers and creator disclosure. See what triggers the label and what file metadata changes.",
    h1: "Pinterest “AI modified” Label: How It Works",
    eyebrow: "Pinterest",
    intro:
      "Since 30 April 2025 Pinterest has shown an “AI modified” label in the close-up view of Pins it identifies as AI-generated or AI-edited. It uses IPTC metadata, its own classifiers and creators' disclosures. Metadata is only one of the three signals, so a clean file does not guarantee an unlabeled Pin.",
    toolHeading: "Check a Pin image",
    toolIntro: "See whether your image carries the IPTC AI source type Pinterest reads.",
    layersTitle: "What Pinterest looks at",
    layers: [
      { key: "metadata", layer: "IPTC digital source type", status: "yes", detail: "Pinterest names IPTC metadata as a signal.", action: "removed" },
      { key: "c2pa", layer: "C2PA Content Credentials", status: "varies", detail: "Not named by Pinterest. An independent 2026 test found it caught OpenAI's C2PA but not Google's.", action: "removed" },
      { layer: "Classifiers", status: "yes", detail: "Pinterest's own models that judge the image itself.", action: "n/a" },
      { layer: "Creator disclosure", status: "yes", detail: "Creators can mark content as AI-generated or modified.", action: "n/a" },
    ],
    platform: {
      labelName: "AI modified",
      readsC2pa: "varies",
      readsIptc: "yes",
      ownDetection: "Classifiers",
      keepsMetadata: "unknown",
    },
    sections: [
      {
        heading: "Ads have their own disclosures",
        body: [
          "Promoted Pins use separate disclosures such as “modified with AI” or “AI-generated person”. The organic “AI modified” label appears at the bottom left of a Pin's close-up view.",
        ],
      },
      {
        heading: "Sellers and print-on-demand",
        body: [
          "Many shops pin product mockups made with AI tools. The IPTC field from your design app is the part you can see and control, so check the export before pinning. Pinterest's classifiers still judge the image itself.",
        ],
      },
    ],
    faqs: [
      {
        q: "How does Pinterest decide a Pin is AI modified?",
        a: "From IPTC metadata in the image, its own classifiers, and creator disclosure.",
      },
      {
        q: "Will removing metadata remove the label?",
        a: "Not necessarily. Pinterest's classifiers do not depend on metadata.",
      },
      {
        q: "Where does the label appear?",
        a: "At the bottom left of the Pin in close-up view.",
      },
    ],
    sources: [
      { label: "Pinterest Newsroom: Introducing gen AI labels (April 2025)", href: "https://newsroom.pinterest.com/news/introducing-gen-ai-labels/" },
      { label: "Pinterest Help: Gen AI labels", href: "https://help.pinterest.com/en/article/gen-ai-labels" },
      SRC.iptcSocial,
    ],
    related: ["/platform-ai-labels", "/remove-metadata-from-midjourney-images", "/instagram-ai-info-label"],
  },

  // ── Format: HEIC to JPG ───────────────────────────────────────────────────────
  {
    slug: "heic-to-jpg",
    kind: "format",
    name: "HEIC to JPG",
    title: "HEIC to JPG Converter: Private, No Upload | BlankAI",
    description:
      "Convert iPhone HEIC photos to JPG in your browser and remove GPS location and camera data at the same time. Batch up to 20 files. Nothing is uploaded.",
    h1: "HEIC to JPG Converter That Also Removes Location Data",
    eyebrow: "iPhone HEIC · HEIF",
    intro:
      "iPhones save photos as HEIC, which many websites and Windows apps still cannot open. Most converters upload your photos to a server and copy the metadata, including GPS, into the JPG. BlankAI decodes HEIC in your browser, writes a clean JPG, and lists the location and device fields it left out.",
    toolHeading: "Convert HEIC to JPG",
    toolIntro: "Add up to 20 HEIC or HEIF photos. Output is JPEG at quality 92 unless you choose otherwise.",
    defaultFormat: "jpeg",
    dropLabel: "Drop HEIC photos here or",
    layersTitle: "What an iPhone HEIC photo contains",
    layers: [
      { key: "exif", layer: "GPS location", status: "yes", detail: "Coordinates, altitude and direction, when location access is on for the Camera app.", action: "removed" },
      { layer: "Device and lens", status: "yes", detail: "iPhone model, lens and camera settings.", action: "removed" },
      { layer: "Capture time", status: "yes", detail: "Date, time and time-zone offset.", action: "removed" },
      { layer: "HDR gain map and depth", status: "varies", detail: "Auxiliary images for HDR display and Portrait depth. The JPG does not include them.", action: "removed" },
    ],
    sections: [
      {
        heading: "Why most converters keep your location",
        body: [
          "A typical converter decodes the HEIC and copies its EXIF block into the new JPG, because that is what photographers usually want. That means the GPS coordinates move to the JPG too. BlankAI writes the JPG from pixels only, so none of it carries over, and the report shows what was left behind.",
        ],
      },
      {
        heading: "Quality and color",
        body: [
          "HEIC is decoded once and encoded once as JPEG. Quality 92 is the default; choose Maximum for 100, or Smaller file for 82. Colors are converted to sRGB, which suits the web and most apps.",
        ],
      },
      {
        heading: "Converting on an iPhone",
        body: [
          "In Safari, tap the upload area and choose Browse to pick the original from the Files app. The Photo Library picker may convert the image to JPEG and drop the location before BlankAI sees it, depending on your Options setting. To stop saving HEIC at all, set Settings, Camera, Formats to Most Compatible.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is HEIC to JPG conversion lossless?",
        a: "No. JPEG is lossy. At the default quality 92 the difference is hard to see; choose Maximum for the highest quality or PNG for a lossless copy.",
      },
      {
        q: "Does the JPG keep the date the photo was taken?",
        a: "No. All metadata is removed. To add a date back, open the JPG in the EXIF Viewer and save a copy with the fields you want.",
      },
      {
        q: "Are my photos uploaded?",
        a: "No. HEIC decoding runs in your browser with a WebAssembly decoder.",
      },
      {
        q: "How many photos can I convert at once?",
        a: "Up to 20 per batch. Download them one by one or as a ZIP.",
      },
    ],
    sources: [{ label: "heic2any: in-browser HEIC decoder", href: "https://github.com/alexcorvi/heic2any" }],
    related: ["/image-metadata-remover", "/remove-metadata-from-apple-image-playground-images", "/exif-viewer", "/blog/remove-exif-data-complete-guide"],
  },

  // ── Format: PNG ───────────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-png",
    kind: "format",
    name: "PNG metadata",
    title: "Remove Metadata from PNG Files (tEXt, iTXt, eXIf) | BlankAI",
    description:
      "Strip PNG text chunks, EXIF, XMP and C2PA from PNG files in your browser. Output stays PNG with transparency. Useful for AI art, screenshots and exports.",
    h1: "Remove Metadata from PNG Files",
    eyebrow: "PNG chunks",
    intro:
      "PNG stores metadata in named chunks next to the image data: tEXt, zTXt and iTXt for text, eXIf for EXIF, iCCP for color profiles and caBX for C2PA Content Credentials. AI tools use these chunks for prompts and workflows, and screenshots use them to record that they are screenshots. BlankAI rewrites the PNG without them and keeps transparency.",
    toolHeading: "Clean PNG files",
    toolIntro: "PNG stays PNG, lossless and with its alpha channel.",
    defaultFormat: "png",
    layersTitle: "PNG metadata chunks",
    layers: [
      { key: "text", layer: "tEXt, zTXt, iTXt", status: "varies", detail: "Free-form text. Stable Diffusion prompts, ComfyUI workflows, author, software, comments.", action: "removed" },
      { key: "metadata", layer: "XMP (iTXt XML:com.adobe.xmp)", status: "varies", detail: "Editing history and IPTC fields written by Adobe and other apps.", action: "removed" },
      { key: "exif", layer: "eXIf", status: "varies", detail: "EXIF data, including the screenshot marker macOS and iOS add.", action: "removed" },
      { key: "c2pa", layer: "caBX", status: "varies", detail: "C2PA Content Credentials, used by ChatGPT and other generators.", action: "removed" },
      { layer: "iCCP, tIME", status: "varies", detail: "Color profile and last-modified time. The clean copy is sRGB.", action: "removed" },
    ],
    sections: [
      {
        heading: "Screenshots carry metadata too",
        body: [
          "Screenshots from macOS and iOS record that they are screenshots, when they were taken, and sometimes the device. That is harmless most of the time, and unwelcome when you post a screenshot you want to keep anonymous.",
        ],
      },
      {
        heading: "Lossless output",
        body: [
          "PNG compression is lossless, so the clean copy has exactly the same pixels. The file size can differ from the original because the browser uses its own compression settings.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does cleaning a PNG reduce quality?",
        a: "No. PNG output is lossless and keeps transparency.",
      },
      {
        q: "Can I convert a PNG to JPG while cleaning it?",
        a: "Yes. Choose JPEG as the output format. Transparent areas are filled with white.",
      },
      {
        q: "Why is my clean PNG larger than the original?",
        a: "The original may have used stronger compression. The pixels are identical; only the compression differs.",
      },
    ],
    sources: [{ label: "W3C: PNG Specification (Third Edition)", href: "https://www.w3.org/TR/png-3/" }],
    related: ["/remove-metadata-from-stable-diffusion-images", "/remove-metadata-from-chatgpt-images", "/remove-metadata-from-webp", "/exif-viewer"],
  },

  // ── Format: WebP ──────────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-webp",
    kind: "format",
    name: "WebP metadata",
    title: "Remove Metadata from WebP Images (EXIF, XMP, C2PA) | BlankAI",
    description:
      "Remove EXIF, XMP and C2PA chunks from WebP images in your browser. Chrome, Edge and Firefox save WebP; Safari saves a lossless PNG. No upload, up to 20 files.",
    h1: "Remove Metadata from WebP Images",
    eyebrow: "WebP RIFF chunks",
    intro:
      "WebP is a RIFF container, and its metadata sits in separate chunks: EXIF, XMP, ICCP for color, and C2PA for Content Credentials. BlankAI writes a fresh WebP without them. Safari cannot encode WebP from a canvas, so there the clean copy is a lossless PNG instead, and the report says so.",
    toolHeading: "Clean WebP images",
    toolIntro: "Output stays WebP in Chrome, Edge and Firefox.",
    layersTitle: "WebP metadata chunks",
    layers: [
      { key: "exif", layer: "EXIF chunk", status: "varies", detail: "Camera, time and GPS data carried over from the source photo.", action: "removed" },
      { key: "metadata", layer: "XMP chunk", status: "varies", detail: "Editing history and IPTC fields.", action: "removed" },
      { key: "c2pa", layer: "C2PA chunk", status: "varies", detail: "Content Credentials from generators and editors.", action: "removed" },
      { layer: "ICCP chunk", status: "varies", detail: "Color profile. The clean copy is sRGB.", action: "removed" },
    ],
    sections: [
      {
        heading: "Animated WebP",
        body: [
          "BlankAI draws a single frame, so an animated WebP becomes a still image of its first frame. Keep the original if you need the animation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why did I get a PNG instead of a WebP?",
        a: "Safari cannot encode WebP from a canvas and returns PNG. The PNG is lossless. Use Chrome, Edge or Firefox for WebP output.",
      },
      {
        q: "What quality is used?",
        a: "92 by default. You can choose 100 or 82 before processing.",
      },
      {
        q: "Does it keep transparency?",
        a: "Yes, WebP and PNG output both keep the alpha channel.",
      },
    ],
    sources: [{ label: "Google: WebP container specification", href: "https://developers.google.com/speed/webp/docs/riff_container" }],
    related: ["/remove-metadata-from-png", "/remove-metadata-from-avif", "/image-metadata-remover"],
  },

  // ── Format: AVIF ──────────────────────────────────────────────────────────────
  {
    slug: "remove-metadata-from-avif",
    kind: "format",
    name: "AVIF metadata",
    title: "Remove Metadata from AVIF Images (EXIF, XMP) | BlankAI",
    description:
      "Strip EXIF, XMP and C2PA from AVIF images in your browser. Browsers cannot encode AVIF, so BlankAI saves a clean JPEG, or a PNG for transparent images.",
    h1: "Remove Metadata from AVIF Images",
    eyebrow: "AVIF · ISO base media",
    intro:
      "AVIF stores EXIF and XMP as items inside its container, alongside the AV1-compressed image. BlankAI reads those items and saves a clean copy. Browsers can decode AVIF, but none can encode it from a canvas, so the copy is a JPEG, or a PNG when the image has transparency.",
    toolHeading: "Clean AVIF images",
    toolIntro: "Output is JPEG, or PNG for transparent images. Choose another format if you prefer.",
    layersTitle: "AVIF metadata items",
    layers: [
      { key: "exif", layer: "Exif item", status: "varies", detail: "Camera, time and GPS data.", action: "removed" },
      { key: "metadata", layer: "XMP item", status: "varies", detail: "Editing history and IPTC fields.", action: "removed" },
      { key: "c2pa", layer: "C2PA box", status: "varies", detail: "Content Credentials, where the source app added them.", action: "removed" },
    ],
    sections: [
      {
        heading: "Why the output is not AVIF",
        body: [
          "Encoding AVIF needs an AV1 encoder, which browsers do not expose to web pages. Rather than ship a large encoder, BlankAI saves a widely supported format. If you need AVIF, convert the clean copy with a desktop tool; it will not have the original's metadata to carry over.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can BlankAI output AVIF?",
        a: "No. Browsers cannot encode AVIF from a canvas. The clean copy is JPEG, PNG or WebP.",
      },
      {
        q: "Which browsers can open AVIF files?",
        a: "Current versions of Chrome, Edge, Firefox and Safari display AVIF.",
      },
    ],
    sources: [{ label: "AOMedia: AVIF specification", href: "https://aomediacodec.github.io/av1-avif/" }],
    related: ["/remove-metadata-from-webp", "/remove-metadata-from-png", "/image-metadata-remover"],
  },
];

export function getLandingPage(slug: string): LandingPageData | undefined {
  return landingPages.find((page) => page.slug === slug);
}
