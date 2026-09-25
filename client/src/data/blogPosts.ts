/**
 * BlankAI blog posts.
 *
 * Rewritten on 2026-09-25 for accuracy: the earlier versions described a
 * "pixel fingerprint modification" step the tool no longer performs and that
 * never defeated AI detection. Every factual claim below is sourced at the
 * end of its article. Keep this file free of browser-only imports; the
 * prerender script reads it in Node.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateISO: string;
  /** Last substantive update. */
  dateModified?: string;
  dateModifiedISO?: string;
  author: {
    name: string;
    title: string;
    bio: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  featured: boolean;
  coverGradient: string;
  coverImage?: string;
  sections: BlogSection[];
  relatedSlugs: string[];
  sources?: { label: string; href: string }[];
}

export interface BlogSection {
  type: "h2" | "h3" | "p" | "ul" | "ol" | "blockquote" | "callout" | "table" | "cta";
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  variant?: "info" | "warning" | "success" | "tool";
  ctaText?: string;
  ctaHref?: string;
}

const AUTHOR_TEAM: BlogPost["author"] = {
  name: "BlankAI Team",
  title: "The people who build BlankAI",
  bio: "BlankAI builds browser-based tools for inspecting and cleaning image metadata. These guides are written by the same team, checked against vendor documentation, standards and independent tests, and updated when those change. Sources are listed at the end of each article. Corrections: support@blankai.app.",
  avatar: "BA",
};

const UPDATED = { dateModified: "September 25, 2026", dateModifiedISO: "2026-09-25" };

const cover = (slug: string) => `/images/blog/${slug}.webp`;

const S = {
  googleIdentify: { label: "Google: New ways to identify AI-generated media (May 2026)", href: "https://blog.google/innovation-and-ai/products/identifying-ai-generated-media-online/" },
  openaiProvenance: { label: "OpenAI: Advancing content provenance (May 2026)", href: "https://openai.com/index/advancing-content-provenance/" },
  c2paSpec: { label: "C2PA Technical Specification 2.4", href: "https://spec.c2pa.org/specifications/specifications/2.4/specs/_attachments/C2PA_Specification.pdf" },
  c2paConformance: { label: "C2PA conformance program", href: "https://c2pa.org/conformance/" },
  iptcDst: { label: "IPTC Digital Source Type vocabulary", href: "https://cv.iptc.org/newscodes/digitalsourcetype/" },
  iptcSocial: { label: "IPTC: AI disclosure on social media, a work in progress (2026)", href: "https://iptc.org/news/ai-disclosure-on-social-media-a-work-in-progress/" },
  metaMuse: { label: "Meta AI: Introducing Muse Image and Muse Video", href: "https://ai.meta.com/blog/introducing-muse-image-muse-video-msl/" },
  metaLabels: { label: "Meta: Our approach to labeling AI-generated content", href: "https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/" },
  appleSept: { label: "Apple Newsroom: Next generation of Apple Intelligence (September 2026)", href: "https://www.apple.com/ie/newsroom/2026/09/next-generation-of-apple-intelligence-available-today/" },
  geminiHelp: { label: "Gemini Apps Help: watermarks and Content Credentials", href: "https://support.google.com/gemini/answer/17405358" },
  pixelForgery: { label: "David Buchanan: Forging C2PA credentials on Android (August 2026)", href: "https://www.da.vidbuchanan.co.uk/blog/android-c2pa.html" },
  linkedinCr: { label: "LinkedIn Help: Content Credentials", href: "https://www.linkedin.com/help/linkedin/answer/a6282984" },
  exiftool: { label: "ExifTool documentation", href: "https://exiftool.org/" },
  synthidPaper: { label: "SynthID-Image: image watermarking at internet scale (arXiv 2510.09263)", href: "https://arxiv.org/abs/2510.09263" },
  unmarker: { label: "University of Waterloo: Watermarks offer no defense against deepfakes (UnMarker)", href: "https://uwaterloo.ca/news/media/watermarks-offer-no-defense-against-deepfakes" },
  integrityClash: { label: "Integrity Clash: when provenance metadata and watermarks disagree (arXiv 2603.02378)", href: "https://arxiv.org/abs/2603.02378" },
  cooley: { label: "Cooley: EU AI Act transparency obligations take effect (August 2026)", href: "https://www.cooley.com/news/insight/2026/2026-08-03-eu-ai-act-transparency-obligations-take-effect-2-august-2026" },
  euCode: { label: "European Commission: Code of Practice on transparency of AI-generated content", href: "https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content" },
  euSignatories: { label: "European Commission: Strong backing for the Code of Practice (July 2026)", href: "https://digital-strategy.ec.europa.eu/en/news/strong-backing-code-practice-transparency-ai-generated-content" },
  euGuidelines: { label: "European Commission: Guidelines on AI transparency obligations", href: "https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations" },
  omnibus: { label: "White & Case: EU AI Omnibus enters into force", href: "https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act" },
  dlaPiper: { label: "DLA Piper: What the EU's new Code of Practice means (July 2026)", href: "https://www.dlapiper.com/en-us/insights/publications/2026/07/what-the-eus-new-code-of-practice-means" },
  morganLewis: { label: "Morgan Lewis: California AI disclosure rules become operative (August 2026)", href: "https://www.morganlewis.com/pubs/2026/08/new-california-ai-disclosure-rules-become-operative" },
  ab853: { label: "California AB 853 (bill text)", href: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB853" },
  sb1000: { label: "California SB 1000 (bill history)", href: "https://leginfo.legislature.ca.gov/faces/billHistoryClient.xhtml?bill_id=202520260SB1000" },
  ab2713: { label: "California AB 2713 (bill history)", href: "https://leginfo.legislature.ca.gov/faces/billHistoryClient.xhtml?bill_id=202520260AB2713" },
  chinaMeasures: { label: "Bird & Bird: China's measures for labeling AI-generated content", href: "https://www.lexology.com/library/detail.aspx?g=5f3028e6-300b-4ac1-8f7a-cf9a0de62378" },
  midjourneyTest: { label: "Numonic: Midjourney metadata, what survives", href: "https://www.numonic.ai/blog/midjourney-metadata-what-survives" },
  comfyNodes: { label: "ComfyUI: nodes.py (SaveImage metadata)", href: "https://github.com/comfyanonymous/ComfyUI/blob/master/nodes.py" },
  a1111: { label: "AUTOMATIC1111 stable-diffusion-webui", href: "https://github.com/AUTOMATIC1111/stable-diffusion-webui" },
  diffusersSdxl: { label: "diffusers: Stable Diffusion XL pipeline source", href: "https://github.com/huggingface/diffusers/blob/main/src/diffusers/pipelines/stable_diffusion_xl/pipeline_stable_diffusion_xl.py" },
  pngSpec: { label: "W3C: PNG Specification (Third Edition)", href: "https://www.w3.org/TR/png-3/" },
};

export const blogPosts: BlogPost[] = [
  // ─── 1 ────────────────────────────────────────────────────────────────────────
  {
    slug: "what-is-ai-metadata-and-why-it-matters",
    title: "What Is AI Metadata? The Four Layers Inside an AI Image in 2026",
    description:
      "AI images now carry up to four kinds of marks: plain metadata, C2PA manifests, invisible watermarks and visible logos. What each one holds, and which can be removed.",
    date: "January 8, 2026",
    dateISO: "2026-01-08",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Education",
    tags: ["ai metadata", "c2pa", "synthid", "iptc", "image privacy"],
    readTime: 8,
    featured: true,
    coverGradient: "linear-gradient(135deg, oklch(0.15 0.04 220) 0%, oklch(0.22 0.08 260) 100%)",
    coverImage: cover("what-is-ai-metadata-and-why-it-matters"),
    relatedSlugs: ["c2pa-vs-synthid-vs-iptc-ai-image-labels", "does-removing-metadata-remove-synthid", "what-are-content-credentials"],
    sections: [
      { type: "p", content: "An AI-generated image looks like any other JPEG or PNG. Inside, it can carry a surprising amount of information about how it was made. In 2026 that information comes in four layers, and they behave very differently: some are plain text anyone can read or delete, some are cryptographically signed, and some are woven into the pixels themselves." },
      { type: "p", content: "This guide explains each layer, who uses it, and what a metadata cleaner like BlankAI can and cannot change. The short version: file metadata is where your personal details live and it is easy to remove; invisible watermarks are where AI companies now put their durable marks, and they are not." },
      { type: "h2", content: "Layer 1: plain metadata (EXIF, XMP, IPTC, PNG text)" },
      { type: "p", content: "The oldest layer is ordinary file metadata. Cameras use EXIF for device and GPS data. Editing apps use XMP for history and IPTC for captions and credits. PNG files have free-form text chunks. AI tools reuse all of these." },
      { type: "ul", items: [
        "Midjourney writes the prompt, parameters and Job ID into the Description field, your username into Author, and the IPTC digital source type trainedAlgorithmicMedia.",
        "AUTOMATIC1111 and Forge save a “parameters” PNG chunk with prompt, seed, sampler and model. ComfyUI saves the whole workflow graph.",
        "The FLUX.1 reference code writes “AI generated;txt2img;flux” into EXIF Software and your prompt into ImageDescription.",
        "Photoshop exports that used Generative Fill carry the IPTC value compositeWithTrainedAlgorithmicMedia.",
      ] },
      { type: "p", content: "The IPTC digital source type is worth knowing by name. It is a controlled vocabulary: trainedAlgorithmicMedia means fully AI-generated, compositeWithTrainedAlgorithmicMedia means a real image with AI-edited parts. Instagram and Pinterest read it." },
      { type: "h2", content: "Layer 2: C2PA Content Credentials" },
      { type: "p", content: "C2PA manifests are signed records of how a file was made and edited. OpenAI, Google's Gemini app, Adobe Firefly, Microsoft Copilot, Black Forest Labs' API, TikTok's AI tools and Anthropic now sign their image output, as do some cameras and phones. The signature proves the record has not been altered, but the record itself sits in the file like any other metadata, so re-encoding the image leaves it behind." },
      { type: "h2", content: "Layer 3: invisible watermarks" },
      { type: "p", content: "Watermarks are the layer that changed most in 2026. Google's SynthID is embedded in the pixels of every image Google's models produce, and OpenAI has added it to ChatGPT and API images since 19 May 2026. Apple has announced SynthID for Apple Intelligence images in a later iOS 27 update. Meta uses its own Content Seal on Muse Image output, and TikTok and ByteDance use their own marks. Some local pipelines, including Stability's SDXL scripts and the FLUX.1 reference code, add a simpler DWT-DCT watermark." },
      { type: "p", content: "Watermarks are designed to survive compression, resizing, cropping and screenshots. Removing metadata does not affect them." },
      { type: "h2", content: "Layer 4: visible marks" },
      { type: "p", content: "Some services still draw a mark on the image: Grok Imagine's watermark cannot be turned off, Seedream's API adds an “AI generated” corner label by default, and the Gemini sparkle can now be switched off by most users for new images. Older Meta Imagine images carry “Imagined with AI”." },
      { type: "table", headers: ["Layer", "Stored in", "Examples", "Removed by a metadata cleaner"], rows: [
        ["Plain metadata", "EXIF, XMP, IPTC, PNG text", "Midjourney prompt and username, SD parameters, GPS", "Yes"],
        ["C2PA manifest", "JUMBF box in the file", "ChatGPT, Gemini, Firefly, Copilot", "Yes"],
        ["Invisible watermark", "The pixels", "SynthID, Content Seal, DWT-DCT", "No"],
        ["Visible mark", "The pixels", "Grok logo, Gemini sparkle, Seedream label", "No"],
      ] },
      { type: "h2", content: "Why the metadata layer still matters to you" },
      { type: "p", content: "Metadata is where the personal details are. A prompt is often a creator's working method. A username links a file to an account. Photos edited with AI still carry the GPS coordinates and device serial numbers of the original. Editing histories reveal the tools and steps behind client work. None of that is needed to show the picture, and all of it can be removed." },
      { type: "h2", content: "What metadata removal cannot do" },
      { type: "p", content: "It cannot remove watermarks, it does not affect classifiers that judge an image by its appearance, and it does not change any platform's disclosure rules. If you publish realistic AI content on TikTok, YouTube or Meta's apps, their rules expect a label. Some laws also address removal directly: China's labeling measures prohibit deleting AI labels, and several generators forbid removing provenance data in their terms." },
      { type: "callout", variant: "tool", content: "Want to see which layers a specific file carries? BlankAI's EXIF Viewer and remover read the file's structure in your browser and list what they find.", ctaText: "Inspect a file", ctaHref: "/exif-viewer" },
      { type: "h2", content: "Frequently asked questions" },
      { type: "h3", content: "Does every AI image contain metadata?" },
      { type: "p", content: "No. It depends on the tool and the path the file took. xAI documents no metadata for Grok Imagine, and platforms such as Discord re-process uploads, which often drops the original metadata. Check the actual file." },
      { type: "h3", content: "Can AI metadata be faked?" },
      { type: "p", content: "Plain metadata can be written by anyone. C2PA manifests are signed, which makes forgery harder, but in August 2026 a researcher showed that a rooted Pixel 10 could sign arbitrary images with valid camera credentials. Treat provenance data as evidence, not proof." },
      { type: "h3", content: "Is it legal to remove AI metadata?" },
      { type: "p", content: "Removing metadata from your own files is generally legal in the US and EU, where current rules place duties on AI providers and large platforms. China prohibits removing AI labels, and generators' terms may forbid it. This is general information, not legal advice." },
      { type: "cta", variant: "tool", content: "Check what your images carry, remove the metadata you do not want to share, and get a report that re-checks the result.", ctaText: "Open the remover", ctaHref: "/#upload" },
    ],
    sources: [S.iptcDst, S.c2paSpec, S.googleIdentify, S.openaiProvenance, S.metaMuse, S.appleSept, S.midjourneyTest, S.pixelForgery],
  },

  // ─── 2 ────────────────────────────────────────────────────────────────────────
  {
    slug: "what-are-content-credentials",
    title: "What Are Content Credentials? A Plain-English Guide to C2PA",
    description:
      "Content Credentials are signed C2PA records of how an image was made. What they contain, who adds them, where you see them, and their limits in 2026.",
    date: "January 15, 2026",
    dateISO: "2026-01-15",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Education",
    tags: ["content credentials", "c2pa", "provenance", "cr icon"],
    readTime: 7,
    featured: true,
    coverGradient: "linear-gradient(135deg, oklch(0.16 0.06 210) 0%, oklch(0.23 0.08 250) 100%)",
    coverImage: cover("what-are-content-credentials"),
    relatedSlugs: ["how-to-remove-c2pa-metadata", "c2pa-vs-synthid-vs-iptc-ai-image-labels", "what-is-ai-metadata-and-why-it-matters"],
    sections: [
      { type: "p", content: "Content Credentials are a way to attach a tamper-evident history to a file. They are built on C2PA, an open standard from the Coalition for Content Provenance and Authenticity, whose members include Adobe, Google, Microsoft, OpenAI, Sony and TikTok. When an app or camera supports it, it writes a signed manifest into the file that says what made it and what happened to it since." },
      { type: "h2", content: "What a manifest records" },
      { type: "ul", items: [
        "The claim generator: the app, model or device that signed the manifest.",
        "Actions such as created, edited, cropped or converted, with an IPTC digital source type when AI was involved.",
        "Ingredients: earlier versions of the file and their own manifests, so a chain of edits can be followed.",
        "A digital signature and certificate chain, which lets a verifier check that nothing was changed after signing.",
      ] },
      { type: "p", content: "The current specification is version 2.4, dated April 2026. The C2PA now runs a conformance program and an official trust list of certificate authorities, replacing the interim list it froze on 1 January 2026." },
      { type: "h2", content: "Where you see them" },
      { type: "p", content: "Most of the time you do not see them at all. LinkedIn is the main exception: it shows a CR icon on images and videos with credentials, and clicking it opens the details. You can inspect any file at contentcredentials.org/verify, with Adobe's Content Authenticity app, or with BlankAI's EXIF Viewer. Google added C2PA checks to the Gemini app in May 2026 and has said Search and Chrome will follow." },
      { type: "h2", content: "Who adds them in 2026" },
      { type: "p", content: "OpenAI signs every ChatGPT, Codex and API image. Google says all media made in the Gemini app carries them. Adobe adds them to Firefly images and to Photoshop exports that used generative features. Microsoft adds them in Copilot, Designer and Bing Image Creator. Black Forest Labs signs FLUX API output, TikTok signs content made with its AI tools, and Anthropic has signed image files created by Claude since August 2026. On the camera side, recent Sony, Leica, Canon and Fujifilm bodies and the Pixel 10 can sign photos at capture." },
      { type: "h2", content: "Durable Content Credentials" },
      { type: "p", content: "Because a manifest is file data, it is lost whenever a file is re-encoded, screenshotted or uploaded to a service that strips metadata. Durable Content Credentials address this by pairing the manifest with an invisible watermark or a fingerprint, so a verifier can look the manifest up again from a cloud copy. Removing the manifest from a file does not remove that watermark." },
      { type: "h2", content: "Their limits" },
      { type: "ul", items: [
        "Absence proves nothing: most images online have no credentials, and any re-encode removes them.",
        "Presence is evidence, not proof: in August 2026 a researcher forged valid camera credentials on a rooted Pixel 10, and Google classed the issue as won't fix.",
        "Credentials describe the file's history as recorded by the signing apps. They say nothing about whether the scene is true.",
      ] },
      { type: "h2", content: "Should you keep them?" },
      { type: "p", content: "Keep them when they work for you: a photojournalist's capture record, a portfolio that shows your process, a client who asks for provenance. Consider removing them from copies when they expose things you did not intend, such as a tool chain, account names or a minor AI retouch that triggers a label. If the image is AI-generated and presented as real, keep the label." },
      { type: "callout", variant: "tool", content: "BlankAI shows whether a file has a C2PA manifest and which organizations it mentions, without uploading the file.", ctaText: "Check a file", ctaHref: "/remove-ai-content-credentials" },
    ],
    sources: [S.c2paSpec, S.c2paConformance, S.linkedinCr, S.googleIdentify, S.openaiProvenance, S.pixelForgery],
  },

  // ─── 3 ────────────────────────────────────────────────────────────────────────
  {
    slug: "how-to-remove-c2pa-metadata",
    title: "How to Remove C2PA Metadata from Images (and What Stays)",
    description:
      "Where C2PA manifests live in JPEG, PNG, WebP and HEIC files, three ways to remove them, how to verify the result, and what removal does not change.",
    date: "January 22, 2026",
    dateISO: "2026-01-22",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Technical Guide",
    tags: ["remove c2pa", "content credentials", "jumbf", "c2pa remover"],
    readTime: 8,
    featured: true,
    coverGradient: "linear-gradient(135deg, oklch(0.14 0.05 240) 0%, oklch(0.20 0.10 200) 100%)",
    coverImage: cover("how-to-remove-c2pa-metadata"),
    relatedSlugs: ["what-are-content-credentials", "does-removing-metadata-remove-synthid", "c2pa-vs-synthid-vs-iptc-ai-image-labels"],
    sections: [
      { type: "p", content: "A C2PA manifest is stored inside the image file, in a container called JUMBF. Removing it means producing a file without that container. There are a few ways to do that, and each has trade-offs. Before you start, be clear about what you are removing: the manifest is only one of the layers AI companies use, and it is the only one this guide can help with." },
      { type: "h2", content: "Where C2PA lives in each format" },
      { type: "table", headers: ["Format", "Where the manifest is stored"], rows: [
        ["JPEG", "APP11 segments holding JUMBF boxes"],
        ["PNG", "A caBX chunk"],
        ["WebP", "A C2PA chunk in the RIFF container"],
        ["HEIC, AVIF", "A uuid box in the ISO base media container"],
        ["Any", "Or remotely: a URL in XMP pointing to a cloud manifest"],
      ] },
      { type: "h2", content: "Method 1: re-encode from pixels" },
      { type: "p", content: "Drawing the image onto a canvas and saving a new file keeps only the pixels. Every metadata container is left behind, including C2PA, EXIF, XMP and IPTC. This is what BlankAI does in your browser. It keeps PNG lossless and transparent, and re-encodes JPEG and WebP at the quality you choose. The trade-off is that you lose all metadata, not just the manifest, and lossy formats are compressed once more." },
      { type: "h2", content: "Method 2: delete the container" },
      { type: "p", content: "Command-line tools such as ExifTool can delete metadata blocks without touching the image data, which avoids re-compression. Support for deleting JUMBF differs by version and file format, so check the documentation for your version and verify the output afterwards." },
      { type: "h2", content: "Method 3: export without metadata" },
      { type: "p", content: "Some editors can export without metadata. Be careful with Photoshop: when generative features were used, it applies Content Credentials automatically, and users have reported in 2026 that credentials persist even after the AI layers are deleted. Screenshots also drop metadata, but they reduce quality and do nothing about watermarks." },
      { type: "h2", content: "Verify the result" },
      { type: "ol", items: [
        "Upload the cleaned file to contentcredentials.org/verify. It should report no Content Credentials.",
        "Or drop it into BlankAI's EXIF Viewer, which lists any C2PA manifest it finds.",
        "BlankAI's remover also re-scans each output automatically and reports anything that survived.",
      ] },
      { type: "h2", content: "What stays after removal" },
      { type: "p", content: "Invisible watermarks stay. ChatGPT and Gemini images carry SynthID, which both companies' checkers can still read. Durable Content Credentials can be looked up again from a watermark. Verifiers are also starting to cross-check layers: a 2026 paper describes how a watermark that says “AI” next to missing or contradicting credentials is itself a signal." },
      { type: "p", content: "Rules stay too. Platform disclosure rules for AI content apply regardless of metadata. China's labeling measures prohibit removing AI labels, and generators such as Black Forest Labs and xAI forbid removing provenance data in their terms." },
      { type: "cta", variant: "tool", content: "Remove C2PA manifests and other metadata in your browser, keep PNG and WebP formats, and get a verified report.", ctaText: "Remove Content Credentials", ctaHref: "/remove-ai-content-credentials" },
    ],
    sources: [S.c2paSpec, S.exiftool, S.integrityClash, S.openaiProvenance, S.chinaMeasures],
  },

  // ─── 4 ────────────────────────────────────────────────────────────────────────
  {
    slug: "remove-exif-data-complete-guide",
    title: "How to Remove EXIF Data from Photos: The 2026 Guide",
    description:
      "What EXIF reveals, which apps and platforms strip it, and how to remove it on iPhone, Android, Windows, Mac, in the browser or with ExifTool.",
    date: "February 5, 2026",
    dateISO: "2026-02-05",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Technical Guide",
    tags: ["remove exif data", "gps", "photo privacy", "exif remover"],
    readTime: 8,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.13 0.06 260) 0%, oklch(0.19 0.09 230) 100%)",
    coverImage: cover("remove-exif-data-complete-guide"),
    relatedSlugs: ["what-is-ai-metadata-and-why-it-matters", "how-to-remove-c2pa-metadata", "does-removing-metadata-remove-synthid"],
    sections: [
      { type: "p", content: "EXIF is the metadata cameras and phones write into every photo. It was designed to help photographers, and it still does, but it also records where a photo was taken, on which device, and when. This guide covers what is in it, when it leaks, and how to remove it on each platform." },
      { type: "h2", content: "What EXIF contains" },
      { type: "table", headers: ["Field", "Example", "Why it matters"], rows: [
        ["GPSLatitude / GPSLongitude", "Coordinates to a few meters", "Reveals home, work, routines"],
        ["Make / Model / LensModel", "Apple iPhone 15 Pro", "Identifies your device"],
        ["BodySerialNumber", "Camera serial", "Links photos to one camera"],
        ["DateTimeOriginal", "2026:09:12 18:04:11", "Reveals when you were somewhere"],
        ["Software", "Adobe Photoshop, AI tools", "Reveals your workflow"],
        ["MakerNote", "Vendor-specific data", "Can hold internal identifiers"],
      ] },
      { type: "p", content: "EXIF lives in an APP1 segment in JPEG, an eXIf chunk in PNG, an EXIF chunk in WebP, and an Exif item in HEIC and AVIF files." },
      { type: "h2", content: "When EXIF leaks" },
      { type: "p", content: "Large social networks such as Instagram, Facebook and public LinkedIn posts do not show EXIF to other users, according to independent tests, although the platform still receives your original file. The leaks happen elsewhere: email attachments, cloud share links, forums, marketplace listings, and messaging apps when you send a photo as a document or file rather than as a photo." },
      { type: "h2", content: "How to remove EXIF on each platform" },
      { type: "h3", content: "iPhone" },
      { type: "p", content: "In Photos, open a photo, swipe up or tap the info button, then Adjust next to the location and choose No Location. When sharing, tap Options at the top of the share sheet and turn off Location. This removes location but not the rest of EXIF." },
      { type: "h3", content: "Android" },
      { type: "p", content: "Turn off location tags in your camera app's settings to stop recording them. Google Photos can remove an estimated location from a photo's details, but a full clean needs a separate tool." },
      { type: "h3", content: "Windows" },
      { type: "p", content: "Right-click the file, open Properties, then Details, and choose Remove Properties and Personal Information. You can create a cleaned copy or remove selected properties." },
      { type: "h3", content: "Mac" },
      { type: "p", content: "In Preview, open Tools, Show Inspector, then the GPS tab and choose Remove Location Info. Other EXIF fields remain." },
      { type: "h3", content: "In the browser" },
      { type: "p", content: "BlankAI removes all of EXIF, plus XMP, IPTC, C2PA and PNG text, from up to 20 files at once, without uploading them. It shows what each file contained and re-checks the output." },
      { type: "h3", content: "Command line" },
      { type: "p", content: "ExifTool is the reference tool. Running exiftool -all= on a file removes writable metadata in place and keeps a backup copy of the original. It does not re-encode the image." },
      { type: "h2", content: "Keep a private original" },
      { type: "p", content: "EXIF is useful to you: it sorts your library by date and place and records the settings you used. Clean the copies you share, not your archive." },
      { type: "cta", variant: "tool", content: "Remove EXIF and GPS from photos in your browser. Works with iPhone HEIC files too.", ctaText: "Remove EXIF data", ctaHref: "/image-metadata-remover" },
    ],
    sources: [S.exiftool, { label: "ExifTool: EXIF tag reference", href: "https://exiftool.org/TagNames/EXIF.html" }],
  },

  // ─── 5 ────────────────────────────────────────────────────────────────────────
  {
    slug: "undetectable-ai-images-guide",
    title: "How to Remove AI Metadata: A Practical, Honest Guide (2026)",
    description:
      "What removing AI metadata does and does not do in 2026, when it makes sense, and how to do it in a few steps without uploading your files.",
    date: "February 18, 2026",
    dateISO: "2026-02-18",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Creator Guide",
    tags: ["remove ai metadata", "ai metadata remover", "c2pa", "synthid", "disclosure"],
    readTime: 7,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.16 0.07 280) 0%, oklch(0.22 0.09 240) 100%)",
    coverImage: cover("undetectable-ai-images-guide"),
    relatedSlugs: ["does-removing-metadata-remove-synthid", "what-is-ai-metadata-and-why-it-matters", "eu-ai-act-article-50-ai-labels-explained"],
    sections: [
      { type: "p", content: "An earlier version of this article described “pixel fingerprint modification” as a way to make AI images harder to detect. That was wrong, and BlankAI no longer does it: tiny pixel changes do not defeat watermarks or classifiers, and they are not what people need. This version explains what removing AI metadata actually achieves." },
      { type: "h2", content: "Start with the goal" },
      { type: "p", content: "People remove AI metadata for different reasons, and only some of them are achievable with a metadata tool." },
      { type: "ul", items: [
        "Keeping prompts, seeds, workflows and account names private: yes, metadata removal does this completely.",
        "Removing GPS and device data from photos that were retouched with AI: yes.",
        "Avoiding an automatic label caused by a minor AI edit in Photoshop: often, when the label comes from IPTC or C2PA metadata.",
        "Making an AI image undetectable: no. That is not achievable with metadata removal in 2026, and in many contexts it would break platform rules.",
      ] },
      { type: "h2", content: "Why “undetectable” is the wrong goal" },
      { type: "p", content: "The largest AI image services now mark output in the pixels as well as in metadata. Google applies SynthID to everything its models generate, OpenAI has added SynthID to ChatGPT and API images since May 2026, and Meta's Muse Image carries Content Seal. These watermarks survive compression, cropping and screenshots, and the companies offer checkers that read them. Platforms also run classifiers and ask creators to disclose AI content." },
      { type: "p", content: "The legal direction is the same. The EU AI Act requires providers to mark AI output, and deployers of deepfakes to disclose them. California's AI Transparency Act requires latent disclosures from large providers and, from 2027, stops large platforms from stripping provenance data. China prohibits removing AI labels." },
      { type: "h2", content: "How to remove AI metadata" },
      { type: "ol", items: [
        "Open the remover and drop in up to 20 images. Nothing is uploaded.",
        "Read what each file contains: C2PA manifests, IPTC AI labels, prompts, GPS and device data.",
        "Choose the output format. “Same as original” keeps PNG transparency and WebP.",
        "Select Remove Metadata and save the clean copies.",
        "Check the report. It re-scans every output and lists anything that survived.",
      ] },
      { type: "h2", content: "Before you publish" },
      { type: "p", content: "TikTok requires creators to label realistic AI-generated content. YouTube requires disclosure of realistic altered or synthetic content. Meta requires a label for photorealistic AI video and realistic audio and relies on your disclosure and detected signals for images. Removing metadata does not change any of these rules." },
      { type: "h2", content: "Ways to remove AI metadata compared" },
      { type: "table", headers: ["Method", "Removes", "Keeps quality", "Uploads files"], rows: [
        ["BlankAI (browser)", "EXIF, GPS, XMP, IPTC, C2PA, PNG text", "PNG lossless; JPEG/WebP at chosen quality", "No"],
        ["ExifTool (command line)", "Writable metadata; JUMBF support varies", "Yes, no re-encode", "No"],
        ["OS built-ins", "Mostly location or selected EXIF", "Yes", "No"],
        ["Screenshot", "All metadata", "No, lower quality", "No"],
        ["Upload-based websites", "Varies", "Varies", "Yes"],
      ] },
      { type: "cta", variant: "tool", content: "Remove AI metadata honestly: see what is in the file, clean it, and know what stays.", ctaText: "Open the remover", ctaHref: "/#upload" },
    ],
    sources: [S.googleIdentify, S.openaiProvenance, S.metaMuse, S.cooley, S.morganLewis, S.chinaMeasures],
  },

  // ─── 6 ────────────────────────────────────────────────────────────────────────
  {
    slug: "midjourney-metadata-removal",
    title: "Midjourney Metadata: What's in Your Downloads and How to Remove It",
    description:
      "Midjourney downloads carry your prompt, Job ID, username and an IPTC AI label in plain metadata. How to see it, what platforms read, and how to remove it.",
    date: "March 3, 2026",
    dateISO: "2026-03-03",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Tool-Specific Guide",
    tags: ["midjourney metadata", "midjourney job id", "iptc", "remove metadata"],
    readTime: 6,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.15 0.06 300) 0%, oklch(0.21 0.08 260) 100%)",
    coverImage: cover("midjourney-metadata-removal"),
    relatedSlugs: ["stable-diffusion-metadata-guide", "what-is-ai-metadata-and-why-it-matters", "c2pa-vs-synthid-vs-iptc-ai-image-labels"],
    sections: [
      { type: "p", content: "Midjourney has not published documentation about the metadata in its downloads, but independent tests of files from midjourney.com since about October 2025 show a consistent set of fields. All of it is plain, unsigned metadata that anyone can read." },
      { type: "h2", content: "What a Midjourney download contains" },
      { type: "table", headers: ["Field", "Contents"], rows: [
        ["Description", "Your full prompt, every parameter, and the Job ID"],
        ["Digital Image GUID", "The Job ID as a UUID"],
        ["Author", "Your Midjourney username"],
        ["Creation time", "When the image was generated"],
        ["IPTC Digital Source Type", "trainedAlgorithmicMedia (AI-generated)"],
      ] },
      { type: "p", content: "Midjourney adds no C2PA manifest and has not documented any invisible watermark. Images saved from Discord usually lose these fields, because Discord re-processes uploads." },
      { type: "h2", content: "Why it matters" },
      { type: "p", content: "Your username links the file to your account and public gallery, and the Job ID identifies the exact generation. The prompt is your working method. When you send a file to a client, post it on a forum or sell it as a print, all of this travels with it." },
      { type: "h2", content: "What platforms read" },
      { type: "p", content: "The IPTC digital source type is the field platforms look for. Instagram and Facebook treat it as an AI signal, and Pinterest names IPTC metadata as one of the inputs to its “AI modified” label, next to its own classifiers. Removing the field removes that automatic signal, but platform rules on disclosing AI content still apply." },
      { type: "h2", content: "How to see and remove it" },
      { type: "ol", items: [
        "Download the image from midjourney.com.",
        "Drop it into the EXIF Viewer to read the Description, Author and GUID fields.",
        "Open the Midjourney guide page or the main remover and select Remove Metadata.",
        "Keep your original if you want the prompt for your records.",
      ] },
      { type: "cta", variant: "tool", content: "Remove your prompt, Job ID and username from Midjourney images in your browser.", ctaText: "Clean Midjourney images", ctaHref: "/remove-metadata-from-midjourney-images" },
    ],
    sources: [S.midjourneyTest, S.iptcDst, S.iptcSocial],
  },

  // ─── 7 ────────────────────────────────────────────────────────────────────────
  {
    slug: "stable-diffusion-metadata-guide",
    title: "Stable Diffusion Metadata: PNG Text Chunks, Prompts and Workflows",
    description:
      "How AUTOMATIC1111, Forge and ComfyUI store prompts, seeds and workflows in your files, which pipelines add invisible watermarks, and how to remove the data.",
    date: "March 10, 2026",
    dateISO: "2026-03-10",
    ...UPDATED,
    author: AUTHOR_TEAM,
    category: "Tool-Specific Guide",
    tags: ["stable diffusion metadata", "png info", "comfyui workflow", "automatic1111"],
    readTime: 7,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.14 0.05 160) 0%, oklch(0.20 0.08 200) 100%)",
    coverImage: cover("stable-diffusion-metadata-guide"),
    relatedSlugs: ["midjourney-metadata-removal", "what-is-ai-metadata-and-why-it-matters", "how-to-remove-c2pa-metadata"],
    sections: [
      { type: "p", content: "Local Stable Diffusion interfaces are generous with metadata by design: they save everything needed to reproduce an image inside the image. That is convenient for you and revealing for anyone you share the file with." },
      { type: "h2", content: "AUTOMATIC1111 and Forge" },
      { type: "p", content: "Both write a PNG text chunk named “parameters”. It holds the prompt, the negative prompt, and a line with steps, sampler, CFG scale, seed, size, model hash and model name, plus any extras such as LoRAs and hires-fix settings. When saving JPEG or WebP, they put the same text in the EXIF UserComment field. A setting in AUTOMATIC1111 stops it from writing the PNG chunk." },
      { type: "h2", content: "ComfyUI" },
      { type: "p", content: "ComfyUI's SaveImage node writes two PNG chunks: “prompt”, the executed graph, and “workflow”, the full editable workflow. Dropping the PNG onto a ComfyUI canvas restores the whole graph, including node settings and model file names. Starting ComfyUI with --disable-metadata stops it." },
      { type: "h2", content: "Invisible watermarks in some pipelines" },
      { type: "p", content: "The original CompVis Stable Diffusion 1.x script, Stability's SDXL and SVD scripts, and the diffusers SDXL pipeline when the invisible-watermark package is installed all add a DWT-DCT watermark to the pixels by default. AUTOMATIC1111, Forge and ComfyUI do not. Metadata removal does not affect this watermark." },
      { type: "h2", content: "Data hidden in pixels" },
      { type: "p", content: "Some extensions store generation parameters in the lowest bits of the alpha channel instead of in text chunks. A lossless PNG copy keeps those pixel values, so it keeps that data. Saving as JPEG discards the alpha channel and the hidden bits with it." },
      { type: "h2", content: "How to remove Stable Diffusion metadata" },
      { type: "ol", items: [
        "Drop your renders into BlankAI. It lists parameters and workflow chunks by name.",
        "Keep “Same as original” to get lossless PNGs with transparency.",
        "Select Remove Metadata and save the clean copies.",
        "Keep your originals: they are the easiest way to reload a workflow later.",
      ] },
      { type: "cta", variant: "tool", content: "Remove PNG info and ComfyUI workflows from your renders, keeping lossless PNG output.", ctaText: "Clean your renders", ctaHref: "/remove-metadata-from-stable-diffusion-images" },
    ],
    sources: [S.a1111, S.comfyNodes, S.diffusersSdxl, S.pngSpec],
  },

  // ─── 8 (new) ──────────────────────────────────────────────────────────────────
  {
    slug: "does-removing-metadata-remove-synthid",
    title: "Does Removing Metadata Remove SynthID? No. Here's Why",
    description:
      "SynthID lives in the pixels, not the file's metadata, so metadata removers cannot touch it. How it works, who uses it in 2026, and how to check an image.",
    date: "September 25, 2026",
    dateISO: "2026-09-25",
    author: AUTHOR_TEAM,
    category: "Education",
    tags: ["synthid", "ai watermark", "remove synthid", "google", "openai"],
    readTime: 6,
    featured: true,
    coverGradient: "linear-gradient(135deg, oklch(0.16 0.06 200) 0%, oklch(0.22 0.09 170) 100%)",
    coverImage: cover("does-removing-metadata-remove-synthid"),
    relatedSlugs: ["c2pa-vs-synthid-vs-iptc-ai-image-labels", "what-is-ai-metadata-and-why-it-matters", "undetectable-ai-images-guide"],
    sections: [
      { type: "p", content: "No. SynthID is not metadata. It is a pattern embedded in the pixel values of an image, so any tool that only removes metadata, including BlankAI, leaves it exactly where it was. Here is how it works and what that means in practice." },
      { type: "h2", content: "What SynthID is" },
      { type: "p", content: "SynthID is an invisible watermark developed by Google DeepMind. A trained encoder adjusts the image in ways people cannot see, and a trained detector recognizes the pattern later. Google has published details of the image version and says it is built to survive common changes such as compression, resizing, cropping and screenshots. Google reports that more than 100 billion images and videos carry it." },
      { type: "h2", content: "Who uses it in 2026" },
      { type: "ul", items: [
        "Google: all media generated by its models, including Gemini and Nano Banana images.",
        "OpenAI: ChatGPT, Codex and API images since 19 May 2026, alongside C2PA.",
        "Apple: announced for Apple Intelligence images and most edits in a software update later this year.",
        "NVIDIA, ElevenLabs and Kakao have also adopted SynthID for their generated media.",
      ] },
      { type: "p", content: "Meta does not use SynthID. Its Muse Image output carries Meta's own Content Seal, which Meta's detector reads and Google's does not." },
      { type: "h2", content: "How to check an image" },
      { type: "p", content: "Upload the image to the Gemini app and ask whether it is AI-generated. Google announced SynthID checks for Search and Chrome in May 2026, and offers an AI content detection API on Google Cloud. OpenAI provides its own verification for ChatGPT images. Because OpenAI uses SynthID, Google's checks recognize both companies' images." },
      { type: "h2", content: "Why metadata removal cannot touch it" },
      { type: "p", content: "A metadata remover works on the file's containers: EXIF, XMP, IPTC, C2PA and text chunks. It either deletes them or, like BlankAI, writes a new file from the pixels. In both cases the pixels, and the watermark inside them, carry over. BlankAI does not alter pixels to interfere with watermarks." },
      { type: "h2", content: "What about SynthID removal tools?" },
      { type: "p", content: "Academic work shows that watermarks can be weakened. The UnMarker attack presented at IEEE S&P 2025 reduced SynthID detection substantially, and regeneration approaches redraw an image with a diffusion model. These methods change the image, sometimes visibly in faces and text, and none guarantees removal. Browser tools that claim to erase SynthID with imperceptible tweaks are not credible against a watermark trained to survive JPEG compression." },
      { type: "p", content: "There are also rules. The EU Code of Practice asks providers to prohibit removing markings in their terms and not to promote circumvention tools, China prohibits removing AI labels, and several generators' terms forbid removing provenance signals." },
      { type: "h2", content: "What this means for you" },
      { type: "p", content: "If an image came from Google or OpenAI, assume it can be identified as AI-generated no matter what you do to its metadata, and disclose it where platforms ask. Use metadata removal for what it does well: keeping your prompts, account details, location and editing history private." },
      { type: "cta", variant: "tool", content: "See exactly which metadata layers a file carries, and which watermark its generator uses, before you share it.", ctaText: "Check an image", ctaHref: "/#upload" },
    ],
    sources: [S.googleIdentify, S.synthidPaper, S.openaiProvenance, S.appleSept, S.unmarker, S.euCode],
  },

  // ─── 9 (new) ──────────────────────────────────────────────────────────────────
  {
    slug: "c2pa-vs-synthid-vs-iptc-ai-image-labels",
    title: "C2PA vs SynthID vs IPTC: The Three Ways AI Images Are Labeled",
    description:
      "IPTC tags, C2PA manifests and invisible watermarks label AI images in different ways. Where each lives, what survives a screenshot, and what can be removed.",
    date: "September 25, 2026",
    dateISO: "2026-09-25",
    author: AUTHOR_TEAM,
    category: "Education",
    tags: ["c2pa", "synthid", "iptc digital source type", "ai labels"],
    readTime: 6,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.15 0.05 230) 0%, oklch(0.22 0.08 290) 100%)",
    coverImage: cover("c2pa-vs-synthid-vs-iptc-ai-image-labels"),
    relatedSlugs: ["does-removing-metadata-remove-synthid", "what-are-content-credentials", "what-is-ai-metadata-and-why-it-matters"],
    sections: [
      { type: "p", content: "When a platform decides an image is AI-generated, it is usually reading one of three things: an IPTC tag, a C2PA manifest, or an invisible watermark. They were designed for different jobs, and they fail in different ways." },
      { type: "table", headers: ["", "IPTC digital source type", "C2PA manifest", "Invisible watermark (SynthID etc.)"], rows: [
        ["Stored in", "XMP or IPTC metadata", "JUMBF box in the file", "The pixels"],
        ["Signed", "No", "Yes", "No, but proprietary"],
        ["Survives re-encoding", "No", "No", "Yes"],
        ["Survives a screenshot", "No", "No", "Designed to"],
        ["Who writes it", "Midjourney, Photoshop, Apple, many apps", "OpenAI, Google, Adobe, Microsoft, TikTok, cameras", "Google, OpenAI, Meta, TikTok, ByteDance"],
        ["Who reads it", "Instagram, Pinterest", "LinkedIn, TikTok, Meta, verifiers", "The vendor's own checker"],
        ["Removed by a metadata cleaner", "Yes", "Yes", "No"],
      ] },
      { type: "h2", content: "IPTC: a simple, standard word" },
      { type: "p", content: "The IPTC digital source type is a field with a value from a fixed vocabulary. trainedAlgorithmicMedia means an image made by AI; compositeWithTrainedAlgorithmicMedia means a real image with AI-edited parts. It is easy to write and easy to read, which is why platforms adopted it first, and just as easy to lose." },
      { type: "h2", content: "C2PA: a signed history" },
      { type: "p", content: "A C2PA manifest describes what made a file and what was done to it, and it is signed, so tampering is detectable. It can carry the same digital source type inside its actions. But it is still file data: re-encoding or stripping the file removes it, and its absence proves nothing." },
      { type: "h2", content: "Watermarks: a mark that travels with the pixels" },
      { type: "p", content: "Watermarks exist because metadata is fragile. SynthID, Meta's Content Seal and ByteDance's watermarks sit in the pixel values and survive the things that remove metadata. The trade-off is that each vendor mostly detects its own: Meta's detector does not read SynthID, and Google's does not read Content Seal." },
      { type: "h2", content: "Why platforms combine them" },
      { type: "p", content: "The EU Code of Practice on AI-generated content asks providers for at least two layers, signed metadata plus an imperceptible watermark, precisely because each covers the other's weakness. Verifiers are starting to cross-check them: a 2026 paper describes how a watermark that contradicts a file's credentials, or appears where credentials are missing, is itself informative." },
      { type: "h2", content: "What you can control" },
      { type: "p", content: "The first two columns are file metadata, so you can see and remove them. The watermark is not in your control once the image is generated. If a label came from an editing tool's metadata on a genuine photo, cleaning a copy removes that signal. If the image is AI-generated, the watermark and the platforms' disclosure rules still apply." },
      { type: "cta", variant: "tool", content: "BlankAI reports IPTC source types and C2PA manifests in any file, and tells you which watermark its generator uses.", ctaText: "Check a file", ctaHref: "/exif-viewer" },
    ],
    sources: [S.iptcDst, S.c2paSpec, S.googleIdentify, S.metaMuse, S.iptcSocial, S.integrityClash, S.euCode],
  },

  // ─── 10 (new) ─────────────────────────────────────────────────────────────────
  {
    slug: "eu-ai-act-article-50-ai-labels-explained",
    title: "EU AI Act Article 50: What the AI Labeling Rules Mean for Creators",
    description:
      "Article 50 has applied since 2 August 2026. What AI providers must mark, what deepfake publishers must disclose, and what the Code of Practice adds.",
    date: "September 25, 2026",
    dateISO: "2026-09-25",
    author: AUTHOR_TEAM,
    category: "Regulation",
    tags: ["eu ai act", "article 50", "ai labeling", "code of practice"],
    readTime: 7,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.16 0.05 250) 0%, oklch(0.21 0.07 210) 100%)",
    coverImage: cover("eu-ai-act-article-50-ai-labels-explained"),
    relatedSlugs: ["california-ai-transparency-act-sb-942-explained", "c2pa-vs-synthid-vs-iptc-ai-image-labels", "does-removing-metadata-remove-synthid"],
    sections: [
      { type: "p", content: "The EU AI Act's transparency rules for AI-generated content became applicable on 2 August 2026. They mostly bind the companies that build AI systems, but one part applies to anyone who publishes deepfakes. This is a plain summary, not legal advice." },
      { type: "h2", content: "Providers must mark AI output" },
      { type: "p", content: "Article 50(2) requires providers of generative AI systems to mark synthetic audio, images, video and text in a machine-readable format so it can be detected as AI-generated. Fines can reach 15 million euros or 3% of worldwide turnover. The Digital Omnibus on AI, in force since late July 2026, gives systems already on the market before 2 August until 2 December 2026 to comply." },
      { type: "h2", content: "Deployers must disclose deepfakes" },
      { type: "p", content: "Article 50(4) is the part that reaches creators. If you use an AI system to generate or manipulate image, audio or video content that is a deepfake, meaning it resembles real people, places or events and could falsely appear authentic, you must disclose that it was artificially generated or manipulated. For evidently artistic, creative, satirical or fictional work, the disclosure can be made in a way that does not spoil the work." },
      { type: "h2", content: "The Code of Practice" },
      { type: "p", content: "The Commission's Code of Practice on transparency of AI-generated content was finalized on 10 June 2026. The first signatories, published on 31 July, included Google, OpenAI, Meta, Microsoft, Anthropic, Black Forest Labs, Mistral and others, and signing remains open. Its technical section asks providers to:" },
      { type: "ul", items: [
        "use at least two marking layers: signed, timestamped metadata and an imperceptible watermark, with fingerprinting optional;",
        "offer free detection through a public specification, software or API;",
        "preserve existing markings and prohibit removing or tampering with them in their terms of service;",
        "not market or promote tools whose purpose is to circumvent markings;",
        "make watermark detection interoperable by 2 February 2027.",
      ] },
      { type: "h2", content: "What is exempt" },
      { type: "p", content: "The Commission's guidelines of 20 July 2026 exempt assistive and standard editing that does not substantially alter content, among other cases. Resizing, format conversion and ordinary retouching are not what the marking duty is about." },
      { type: "h2", content: "What it means in practice" },
      { type: "ul", items: [
        "Expect nearly all images from major AI services to carry both a manifest and a watermark by December 2026.",
        "Generator terms of service will prohibit removing those markings.",
        "If you publish realistic AI content that could pass as real, disclose it. Removing metadata does not change that duty.",
        "Removing personal metadata, such as GPS or device details, from your own photos is unaffected.",
      ] },
      { type: "cta", variant: "tool", content: "See what a file already carries before you publish it in the EU.", ctaText: "Inspect a file", ctaHref: "/exif-viewer" },
    ],
    sources: [S.cooley, S.omnibus, S.euCode, S.euSignatories, S.euGuidelines, S.dlaPiper],
  },

  // ─── 11 (new) ─────────────────────────────────────────────────────────────────
  {
    slug: "california-ai-transparency-act-sb-942-explained",
    title: "California's AI Transparency Act (SB 942): What Changes for Images",
    description:
      "California's AI disclosure law has applied since August 2026. Latent and manifest disclosures, the 2027 duty on large platforms, penalties, and bills still pending.",
    date: "September 25, 2026",
    dateISO: "2026-09-25",
    author: AUTHOR_TEAM,
    category: "Regulation",
    tags: ["sb 942", "ab 853", "california ai transparency act", "ai disclosure"],
    readTime: 6,
    featured: false,
    coverGradient: "linear-gradient(135deg, oklch(0.17 0.06 60) 0%, oklch(0.21 0.07 20) 100%)",
    coverImage: cover("california-ai-transparency-act-sb-942-explained"),
    relatedSlugs: ["eu-ai-act-article-50-ai-labels-explained", "what-are-content-credentials", "c2pa-vs-synthid-vs-iptc-ai-image-labels"],
    sections: [
      { type: "p", content: "California's AI Transparency Act, SB 942 as amended by AB 853, became operative on 2 August 2026. It regulates AI providers first and large platforms from 2027. Here is what it requires and what it does not. This is a summary, not legal advice." },
      { type: "h2", content: "Who it covers" },
      { type: "p", content: "Covered providers are generative AI services with more than one million monthly users in California. They must embed a latent disclosure in the images, video and audio they generate, offer users an optional manifest disclosure, and provide a free public tool to detect their content." },
      { type: "h2", content: "Latent and manifest disclosures" },
      { type: "ul", items: [
        "A latent disclosure is present but not visible: machine-readable data that identifies the provider, the system and version, and when the content was made, and that is permanent or hard to remove as far as technically feasible.",
        "A manifest disclosure is a visible, clear label that the content is AI-generated. Providers must offer it as an option.",
      ] },
      { type: "h2", content: "Enforcement" },
      { type: "p", content: "Violations cost 5,000 dollars per violation per day, enforced by the Attorney General, city attorneys and county counsel. There is no private right of action. If a provider licenses its model to someone who disables the latent disclosure, the provider must revoke the license within 96 hours." },
      { type: "h2", content: "What changes in 2027 and 2028" },
      { type: "p", content: "From 1 January 2027, large online platforms must detect standards-compliant provenance data in uploaded content, make it available to users, and must not knowingly strip it. From 1 January 2028, capture device makers must offer provenance by default. Expect more platforms to display Content Credentials, and to preserve them on the copies they serve." },
      { type: "h2", content: "Bills still pending" },
      { type: "p", content: "Two bills reached the Governor in September 2026 and were awaiting action at the time of writing: SB 1000, which would drop the one-million-user threshold and shorten the revocation window, and AB 2713, which would extend the no-stripping duty to downloaded content. We will update this article when they are signed or vetoed." },
      { type: "h2", content: "What it means for you" },
      { type: "p", content: "The law places duties on providers, licensees and large platforms, not on individuals cleaning their own files. In practice, AI images from large services will carry latent disclosures, and platforms will increasingly show provenance. Removing personal metadata, such as the location in a photo, is unaffected." },
      { type: "cta", variant: "tool", content: "Check which latent disclosures and personal metadata a file carries, in your browser.", ctaText: "Inspect a file", ctaHref: "/exif-viewer" },
    ],
    sources: [S.morganLewis, S.ab853, S.sb1000, S.ab2713],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slugs: string[]): BlogPost[] {
  return slugs.map((slug) => getPostBySlug(slug)).filter((post): post is BlogPost => Boolean(post));
}

export const categories = Array.from(new Set(blogPosts.map((post) => post.category)));
