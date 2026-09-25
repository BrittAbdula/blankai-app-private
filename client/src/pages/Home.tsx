/**
 * BlankAI home page.
 * Primary intent: "ai metadata remover" / "remove ai metadata" / "ai metadata cleaner".
 * Positioning: inspect, clean and verify image metadata, honestly scoped.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  ExternalLink,
  FileSearch,
  FileText,
  Github,
  Globe,
  Hash,
  Image,
  Layers,
  Lock,
  MapPin,
  ScanSearch,
  Shield,
  ShieldCheck,
  Tag,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import BlogSection from "@/components/BlogSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ImagePreview from "@/components/ImagePreview";
import RemovalScope from "@/components/RemovalScope";
import MetadataRemoverTool, { REMOVER_PENDING_UPLOAD_EVENT } from "@/components/remover/MetadataRemoverTool";
import { fetchPublicFile } from "@/lib/imagePreview";
import { stashPendingRemoverFile } from "@/lib/pendingImageRoute";
import { trackEvent } from "@/lib/analytics";
import { usePageMeta } from "@/hooks/usePageMeta";
import { HUBS, landingPages } from "@/data/landingPages";
import { EXTENSION_URL, REPO_URL, faqJsonLd, webAppJsonLd } from "@/lib/site";

const HOME_SAMPLE_PATH = "/sample.HEIC";
const HOME_SAMPLE_PREVIEW_PATH = "/sample.jpg";
const HOME_UPLOAD_HASH = "#upload";

function scrollToUploadSection(behavior: ScrollBehavior = "smooth") {
  const uploadSection = document.getElementById("upload");
  if (!uploadSection) return;
  const nav = document.querySelector("nav");
  const navHeight = nav instanceof HTMLElement ? Math.ceil(nav.getBoundingClientRect().height) : 0;
  const uploadTop = uploadSection.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(uploadTop - navHeight - 18, 0), behavior });
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: typeof Tag;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 card-hover relative overflow-hidden group">
      {badge && (
        <span className="absolute top-4 right-4 text-xs font-mono-custom font-medium px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">
          {badge}
        </span>
      )}
      <div className="w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
        <Icon className="w-5 h-5 text-cyan" />
      </div>
      <h3 className="font-display font-semibold text-foreground mb-2 text-base">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseCard({ icon: Icon, title, description }: { icon: typeof Tag; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-5 bg-card border border-border rounded-lg card-hover">
      <div className="w-9 h-9 rounded-md bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-cyan" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-foreground text-sm mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-foreground text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-cyan flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* Answers stay in the DOM so crawlers and screen readers can read them. */}
      <div className={`px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4 ${open ? "" : "hidden"}`}>
        {a}
      </div>
    </div>
  );
}

const HOME_TITLE = "AI Metadata Remover: Remove AI Metadata from Photos | BlankAI";
const HOME_DESCRIPTION =
  "Free AI metadata remover and cleaner. See and remove EXIF, GPS, C2PA Content Credentials and AI prompts from images in your browser. No upload, output verified.";

const FAQS = [
  {
    q: "What does an AI metadata remover remove?",
    a: "BlankAI removes the data stored alongside the pixels: EXIF (camera, device, time), GPS coordinates, XMP and IPTC fields including the AI digital source type, C2PA Content Credentials, and PNG text chunks such as Stable Diffusion prompts and ComfyUI workflows. After cleaning it re-scans the new file and tells you if anything is left.",
  },
  {
    q: "Does it remove SynthID or other invisible watermarks?",
    a: "No. Invisible watermarks such as Google's SynthID, which Google and OpenAI add to their images, are part of the pixels. BlankAI does not alter pixels to defeat them, and no metadata tool can remove them. The companies' own checkers can still recognize their images after cleaning.",
  },
  {
    q: "Are my images uploaded to a server?",
    a: "No. Files are read and processed in your browser. BlankAI records anonymous page events, such as how many images were cleaned, but never the images or their metadata.",
  },
  {
    q: "Which formats are supported?",
    a: "JPG, PNG, WebP, AVIF and iPhone HEIC. By default the clean copy keeps the original format, so PNG transparency and WebP stay intact. HEIC and AVIF are saved as JPEG, or PNG for transparent images, because browsers cannot encode those formats.",
  },
  {
    q: "Will removing metadata affect image quality?",
    a: "PNG output is lossless. JPEG and WebP are re-encoded at quality 92 by default, and you can choose 100. Colors are converted to sRGB and extra HDR data in phone photos is not kept.",
  },
  {
    q: "Will platforms still label my image as AI?",
    a: "Possibly. Removing metadata removes the IPTC and C2PA signals some platforms read, but platforms also use watermarks, classifiers and your own disclosure. If your content is AI-generated and a platform asks you to label it, removing metadata does not change that.",
  },
  {
    q: "Is removing AI metadata legal?",
    a: "Removing metadata from your own files is generally legal in the US and EU; current rules place duties on AI providers and large platforms rather than individuals. China's labeling measures prohibit removing AI labels, and some generators' terms forbid removing provenance data. This is general information, not legal advice.",
  },
  {
    q: "Why is there no GPS data when I pick photos from my iPhone's library?",
    a: "The iOS photo picker can convert photos and remove location before a website receives them, depending on the Options setting in the share sheet. To inspect the original, choose the file from the Files app instead.",
  },
];

export default function Home() {
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);

  usePageMeta({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: "/",
    ogTitle: "BlankAI: AI Metadata Remover",
    jsonLd: [
      webAppJsonLd({
        name: "BlankAI AI Metadata Remover",
        path: "/",
        description:
          "Browser-only tool that removes EXIF, GPS, XMP, IPTC, C2PA Content Credentials and PNG text metadata from images and verifies the output.",
      }),
      faqJsonLd(FAQS),
    ],
  });

  useEffect(() => {
    let timeoutId = 0;
    const alignUploadHash = (behavior: ScrollBehavior) => {
      if (window.location.hash !== HOME_UPLOAD_HASH) return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => scrollToUploadSection(behavior), 0);
    };
    const handleHashChange = () => alignUploadHash("smooth");
    alignUploadHash("auto");
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const loadHeroSample = useCallback(async () => {
    trackEvent("sample_load_clicked", { page: "home", sample: "sample.HEIC" });
    setSampleError(null);
    setSampleLoading(true);
    try {
      let file = sampleFile;
      if (!file) {
        file = await fetchPublicFile(HOME_SAMPLE_PATH);
        setSampleFile(file);
      }
      if (!file) throw new Error("Sample file unavailable");
      stashPendingRemoverFile(file);
      window.dispatchEvent(new Event(REMOVER_PENDING_UPLOAD_EVENT));
    } catch (error) {
      console.error(error);
      setSampleError("Could not load the sample HEIC file.");
    } finally {
      setSampleLoading(false);
    }
  }, [sampleFile]);

  const features = [
    {
      icon: MapPin,
      title: "GPS and location",
      description: "Coordinates, altitude and direction that phones write into every photo taken with location on.",
      badge: "GPS",
    },
    {
      icon: Tag,
      title: "EXIF device data",
      description: "Camera and phone model, lens, serial numbers, capture time and software.",
      badge: "EXIF",
    },
    {
      icon: Shield,
      title: "C2PA Content Credentials",
      description: "Signed manifests from ChatGPT, Gemini, Adobe Firefly, Microsoft Copilot and cameras that record how a file was made.",
      badge: "C2PA",
    },
    {
      icon: FileText,
      title: "XMP and IPTC",
      description: "Editing history, captions, credits and the IPTC digital source type that marks images as AI-generated or AI-edited.",
      badge: "XMP",
    },
    {
      icon: Cpu,
      title: "Prompts and workflows",
      description: "Stable Diffusion parameters, ComfyUI node graphs, and prompts written into EXIF by FLUX and Midjourney.",
      badge: "AI",
    },
    {
      icon: Layers,
      title: "PNG, WebP and AVIF chunks",
      description: "tEXt, iTXt and eXIf chunks in PNG, EXIF and XMP chunks in WebP, and metadata items in AVIF and HEIC.",
      badge: "PNG",
    },
    {
      icon: ScanSearch,
      title: "Output re-scan",
      description: "After cleaning, BlankAI scans the new file for the same containers and tells you if anything survived.",
      badge: "CHECK",
    },
    {
      icon: Hash,
      title: "Format kept",
      description: "PNG stays lossless with transparency, WebP stays WebP. JPEG quality is yours to choose.",
      badge: "FMT",
    },
  ];

  const useCases = [
    {
      icon: Lock,
      title: "Sharing photos privately",
      description: "Remove GPS and device details before sending photos by email, cloud links, marketplaces or messaging apps that keep metadata.",
    },
    {
      icon: Image,
      title: "Photographers and retouchers",
      description: "See whether a small AI fix wrote an AI label into your export, and decide what to keep before you post.",
    },
    {
      icon: Cpu,
      title: "AI artists",
      description: "Keep your prompts, seeds, workflows and username out of the files you share, while keeping your originals.",
    },
    {
      icon: Globe,
      title: "Social media managers",
      description: "Check what each platform will read from a file, including C2PA and IPTC signals, before scheduling posts.",
    },
    {
      icon: FileText,
      title: "Designers and agencies",
      description: "Hand clients clean deliverables without editing histories, file paths or tool metadata from your pipeline.",
    },
    {
      icon: Users,
      title: "Journalists and researchers",
      description: "Inspect provenance locally. BlankAI shows what a manifest mentions without sending the file anywhere.",
    },
  ];

  const generatorPages = landingPages.filter((p) => p.kind === "generator");
  const platformPages = landingPages.filter((p) => p.kind === "platform");
  const formatPages = landingPages.filter((p) => p.kind === "format");

  return (
    <div className="min-h-screen bg-background hex-grid-bg">
      <SiteHeader showAnchorLinks />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.06),transparent_50%)]">
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-mono-custom mb-6">
                <Shield className="w-3 h-3" />
                <span>Runs in your browser · Nothing uploaded · Free</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6">
                AI Metadata <span className="text-cyan glow-cyan-text">Remover</span>
              </h1>

              <p className="text-foreground/90 text-xl md:text-2xl font-display leading-snug mb-4 max-w-2xl">
                Inspect, clean and verify what your images reveal.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                See the{" "}
                <strong className="text-foreground">GPS location, device details, C2PA Content Credentials and AI prompts</strong>{" "}
                hidden in a photo or AI image, remove them, and get a report that re-checks the clean copy. Honest about limits:
                invisible watermarks like SynthID stay in the pixels.
              </p>

              <div className="flex flex-wrap gap-2 mb-10">
                {[
                  { icon: Lock, label: "No upload" },
                  { icon: ScanSearch, label: "Shows what it finds" },
                  { icon: Layers, label: "Up to 20 images" },
                  { icon: ShieldCheck, label: "Output re-scanned" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan" />
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#upload"
                  onClick={() => trackEvent("cta_click", { page: "home", location: "hero", target: "upload" })}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg gradient-cyan text-navy font-bold text-base hover:opacity-90 transition-opacity"
                >
                  <Upload className="w-4 h-4" />
                  Remove AI metadata
                </a>
                <Link
                  href="/exif-viewer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border text-foreground hover:border-cyan/40 hover:bg-muted/20 transition-colors text-base"
                >
                  <FileSearch className="w-4 h-4" />
                  Just inspect a file
                </Link>
              </div>

              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4 text-cyan" />
                <span>Open source on GitHub</span>
                <span className="text-cyan/70">MIT licensed</span>
              </a>
            </div>

            <div className="lg:justify-self-end lg:w-full lg:max-w-sm">
              <button
                type="button"
                onClick={loadHeroSample}
                disabled={sampleLoading}
                className="group w-full rounded-3xl border border-cyan/20 bg-card/60 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:border-cyan/40 hover:bg-card/80 disabled:cursor-wait disabled:opacity-80"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-mono-custom uppercase tracking-[0.22em] text-muted-foreground/70">Sample file</p>
                    <p className="font-display text-lg font-bold text-foreground mt-1">
                      Try <code className="rounded bg-cyan/10 px-1.5 py-0.5 text-cyan text-sm">sample.HEIC</code>
                    </p>
                  </div>
                  <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[10px] font-semibold text-cyan">
                    {sampleLoading ? "Loading…" : "Load into remover"}
                  </span>
                </div>
                <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                  <ImagePreview
                    src={HOME_SAMPLE_PREVIEW_PATH}
                    alt="Sample iPhone photo used to demonstrate metadata removal"
                    showExifAction={false}
                    className="h-full w-full"
                    imgClassName="object-cover"
                    fallbackLabel="Sample preview"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">See a real iPhone photo's metadata</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Loads an iPhone HEIC sample into the remover below so you can see what it carries before cleaning.
                    </p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
              {sampleError && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{sampleError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Facts bar */}
      <div className="border-y border-border bg-card/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { value: "0", label: "Files uploaded" },
              { value: "5", label: "Input formats, including HEIC" },
              { value: "20", label: "Images per batch" },
              { value: "100%", label: "Outputs re-scanned" },
            ].map((fact) => (
              <div key={fact.label} className="text-center px-6 py-4">
                <div className="font-display text-3xl font-bold text-cyan glow-cyan-text font-mono-custom">{fact.value}</div>
                <div className="text-muted-foreground text-sm mt-1 font-medium">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tool links */}
      <div className="border-b border-border bg-card/30">
        <div className="container py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono-custom text-cyan/60 mr-1">TOOLS:</span>
            <a href="#upload" className="px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan font-medium hover:bg-cyan/15 transition-colors">
              AI Metadata Remover
            </a>
            <Link href="/exif-viewer" className="px-3 py-1.5 rounded-full border border-border hover:border-cyan/30 hover:text-cyan transition-colors">
              EXIF Viewer
            </Link>
            <Link href="/image-diff" className="px-3 py-1.5 rounded-full border border-border hover:border-cyan/30 hover:text-cyan transition-colors">
              Image Diff
            </Link>
            <Link href="/heic-to-jpg" className="px-3 py-1.5 rounded-full border border-border hover:border-cyan/30 hover:text-cyan transition-colors">
              HEIC to JPG
            </Link>
            <a
              href={EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-cyan/30 hover:text-cyan transition-colors"
            >
              Chrome extension <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Tool */}
      <section id="upload" className="scroll-mt-24 py-20 lg:scroll-mt-28">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Remove AI metadata from your images</h2>
            <p className="text-muted-foreground text-base">
              Drop a photo or an AI image. BlankAI shows what is inside, writes a clean copy, and re-checks it. No account, no upload.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              {[
                { href: "/remove-ai-content-credentials", label: "Remove C2PA Content Credentials" },
                { href: "/image-metadata-remover", label: "Remove EXIF and GPS" },
                { href: HUBS.generators.path, label: "Metadata by AI generator" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => trackEvent("intent_page_click", { page: "home", target: link.href, location: "upload_intro" })}
                  className="rounded-full border border-border bg-card/40 px-3 py-1.5 text-muted-foreground transition-colors hover:border-cyan/30 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <MetadataRemoverTool page="home" />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3 text-cyan" />
            <span>Your images never leave your device. All processing happens in your browser.</span>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* What it removes */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              WHAT IT FINDS AND REMOVES
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">The data that travels with your files</h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              BlankAI walks the actual structure of each file, reports what it finds, and writes a new copy that contains only pixels.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* What stays */}
      <section id="what-stays" className="py-20 scroll-mt-24">
        <div className="container">
          <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
            <span className="w-6 h-px bg-cyan" />
            HONEST LIMITS
          </div>
          <RemovalScope
            title="What an AI metadata remover can and cannot do"
            intro="In 2026 most large AI services mark images in more than one layer. Metadata is the layer a cleaner can remove, and it is where personal details like your location and prompts live. Watermarks in the pixels stay, and so do platform rules on disclosure."
          />
          <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
            Want the details for a specific tool? See{" "}
            <Link href={HUBS.generators.path} className="text-cyan hover:underline">
              what each AI generator embeds
            </Link>{" "}
            and{" "}
            <Link href={HUBS.platforms.path} className="text-cyan hover:underline">
              how platforms label AI images
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="section-divider container" />

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
                <span className="w-6 h-px bg-cyan" />
                HOW IT WORKS
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">How BlankAI removes AI metadata</h2>
              <p className="text-muted-foreground text-base mb-8">
                Everything runs in your browser tab. A typical photo takes well under a second; large HEIC files take a little longer to decode.
              </p>
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Scan the original",
                    desc: "BlankAI reads the file's own structure (JPEG segments, PNG and WebP chunks, HEIC and AVIF items) and lists every metadata block it finds.",
                  },
                  {
                    step: "02",
                    title: "Redraw the pixels",
                    desc: "The image is decoded and drawn onto a canvas. A canvas holds pixels only, so no metadata container can come along.",
                  },
                  {
                    step: "03",
                    title: "Encode a fresh file",
                    desc: "The canvas is saved as a new file in the format you chose. PNG stays lossless; JPEG and WebP use the quality you set.",
                  },
                  {
                    step: "04",
                    title: "Re-scan the output",
                    desc: "The new file is scanned again. The report tells you it is clean, or exactly what is left.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="font-mono-custom text-3xl font-bold text-cyan/20 leading-none w-12 flex-shrink-0 pt-0.5">{step}</div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <p className="text-xs font-mono-custom uppercase tracking-[0.2em] text-muted-foreground mb-4">Example report</p>
              <div className="space-y-3 text-sm">
                {[
                  { label: "GPS location coordinates", tone: "text-red-300 border-red-500/25 bg-red-500/10" },
                  { label: "EXIF · Apple iPhone 15 Pro · 2026:09:12 18:04", tone: "text-red-300 border-red-500/25 bg-red-500/10" },
                  { label: "C2PA manifest · mentions Adobe", tone: "text-amber-200 border-amber-500/25 bg-amber-500/10" },
                  { label: "XMP · Creator tool: Adobe Photoshop", tone: "text-amber-200 border-amber-500/25 bg-amber-500/10" },
                  { label: "IPTC source type: compositeWithTrainedAlgorithmicMedia", tone: "text-amber-200 border-amber-500/25 bg-amber-500/10" },
                ].map((row) => (
                  <div key={row.label} className={`rounded-lg border px-3 py-2 ${row.tone}`}>
                    {row.label}
                  </div>
                ))}
                <div className="flex items-center gap-2 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-cyan">
                  <CheckCircle2 className="w-4 h-4" /> Output re-scan: no metadata containers in the new file
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Illustration of the report format. Your file's report lists what it actually contains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* Guides by generator and platform */}
      <section id="guides" className="py-20 scroll-mt-24">
        <div className="container">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              GUIDES
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">What your AI tool or platform does with metadata</h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              Each guide lists what a generator writes into its files, or what a platform reads from yours, with sources, and includes the remover.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">
                <Link href={HUBS.generators.path} className="hover:text-cyan">AI generators</Link>
              </h3>
              <ul className="space-y-2 text-sm">
                {generatorPages.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan" /> {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">
                <Link href={HUBS.platforms.path} className="hover:text-cyan">Platform labels</Link>
              </h3>
              <ul className="space-y-2 text-sm">
                {platformPages.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan" /> {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Formats and tasks</h3>
              <ul className="space-y-2 text-sm">
                {[...landingPages.filter((p) => p.kind === "core"), ...formatPages].map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan" /> {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* Use cases */}
      <section id="use-cases" className="py-20">
        <div className="container">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              WHO IT IS FOR
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Control what your files say about you</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc) => (
              <UseCaseCard key={uc.title} {...uc} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* FAQ */}
      <section id="faq" className="py-20 scroll-mt-24">
        <div className="container max-w-3xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              FAQ
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">AI metadata remover questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      <BlogSection />

      {/* Extension + CTA */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="rounded-2xl p-10 border border-cyan/20 text-center bg-[linear-gradient(135deg,oklch(0.15_0.025_240),oklch(0.12_0.03_200))]">
            <div className="w-14 h-14 rounded-2xl gradient-cyan flex items-center justify-center mx-auto mb-6">
              <Zap className="w-7 h-7 text-navy" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Check before you share</h2>
            <p className="text-muted-foreground text-base mb-8">
              Free, private and honest about what it can do. Use it here, or keep it one click away with the Chrome extension.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="#upload"
                onClick={() => trackEvent("cta_click", { page: "home", location: "final_cta", target: "upload" })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-cyan text-navy font-bold text-base hover:opacity-90 transition-opacity"
              >
                <Upload className="w-5 h-5" />
                Remove AI metadata
              </a>
              <a
                href={EXTENSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("extension_click", { page: "home", location: "final_cta" })}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-cyan/30 text-cyan hover:bg-cyan/5 transition-colors text-base"
              >
                Chrome extension <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
