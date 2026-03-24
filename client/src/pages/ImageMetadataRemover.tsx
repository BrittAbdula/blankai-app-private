import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Shield,
  Upload,
  Layers,
  Sparkles,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trackEvent } from "@/lib/analytics";

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Shield;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/10 text-cyan">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-5">
      <h3 className="font-display text-base font-semibold text-foreground">{q}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{a}</p>
    </div>
  );
}

export default function ImageMetadataRemover() {
  usePageMeta({
    title: "Image Metadata Remover | Remove EXIF, XMP, C2PA | BlankAI",
    description:
      "Remove image metadata in your browser. Clean EXIF, XMP, IPTC, C2PA, and AI-related tags from images without uploads.",
    canonical: "https://blankai.app/image-metadata-remover",
    ogTitle: "Image Metadata Remover | BlankAI",
    ogDescription:
      "Clean EXIF, XMP, IPTC, C2PA, and AI-related metadata from images locally in your browser.",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "image-metadata-remover-sd";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: "BlankAI Image Metadata Remover",
          url: "https://blankai.app/image-metadata-remover",
          description:
            "Browser-based image metadata remover for EXIF, XMP, IPTC, C2PA, and AI-related metadata.",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Does BlankAI upload my files?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. BlankAI runs in your browser and processes images locally, so your files do not need to leave your device.",
              },
            },
            {
              "@type": "Question",
              name: "What metadata can it remove?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "BlankAI can remove EXIF, XMP, IPTC, C2PA, and other AI-related metadata from supported image formats.",
              },
            },
            {
              "@type": "Question",
              name: "How can I verify the result?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Use the EXIF Viewer to inspect the original file and the Image Diff tool to compare the cleaned output.",
              },
            },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById("image-metadata-remover-sd")?.remove();
    };
  }, []);

  const removedItems = [
    "EXIF fields such as camera model, timestamps, and GPS data",
    "XMP and IPTC metadata embedded by editing tools",
    "C2PA content credentials and other provenance signals",
    "AI-related text chunks and generator tags where present",
  ];

  const steps = [
    {
      title: "Upload locally",
      body: "Drop an image into the remover from your device. The browser reads the file locally, without a server upload step.",
    },
    {
      title: "Redraw the pixels",
      body: "BlankAI re-encodes the image from canvas data so the new file does not carry over the original metadata containers.",
    },
    {
      title: "Download the clean file",
      body: "Save the processed image, then inspect it with the EXIF Viewer or compare it in the Image Diff tool if you want verification.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader breadcrumb="Image Metadata Remover" />

      <main>
        <section className="border-b border-border/50">
          <div className="container py-24 md:py-28">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-mono-custom uppercase tracking-[0.2em] text-cyan">
                <Sparkles className="h-3.5 w-3.5" />
                Privacy-first tool
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-foreground md:text-6xl">
                Image Metadata Remover
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Clean EXIF, XMP, IPTC, C2PA, and AI-related metadata from images in your browser. No uploads, no account, and no extra software.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/#upload"
                  onClick={() =>
                    trackEvent("landing_page_cta_click", {
                      page: "image-metadata-remover",
                      location: "hero",
                      target: "upload",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan px-5 py-3 text-sm font-bold text-navy transition-opacity hover:opacity-90"
                >
                  Open remover
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/exif-viewer"
                  onClick={() =>
                    trackEvent("landing_page_cta_click", {
                      page: "image-metadata-remover",
                      location: "hero",
                      target: "exif-viewer",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-cyan/40"
                >
                  Inspect metadata
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard icon={ImageIcon} title="What it removes">
              <ul className="space-y-3">
                {removedItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={Layers} title="How it works">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10 text-xs font-bold text-cyan">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{step.title}</div>
                      <div className="mt-1">{step.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <section className="container pb-16">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-cyan/8 to-transparent p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Browser-only processing keeps your files private
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  BlankAI is designed to work locally in the browser. That means the image never needs to be sent to a server just to remove metadata.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  <Shield className="mb-2 h-5 w-5 text-cyan" />
                  No uploads required for the core workflow
                </div>
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  <Upload className="mb-2 h-5 w-5 text-cyan" />
                  Works with common browser-supported image formats
                </div>
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  <FileText className="mb-2 h-5 w-5 text-cyan" />
                  Pair with EXIF Viewer for inspection and Image Diff for verification
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-16">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <h2 className="font-display text-xl font-bold text-foreground">FAQ</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FaqItem
              q="Does this upload my image?"
              a="No. The remover is built to work in the browser, so the standard flow stays local."
            />
            <FaqItem
              q="What kinds of metadata are covered?"
              a="The page is aimed at EXIF, XMP, IPTC, C2PA, and AI-related metadata commonly embedded in image files."
            />
            <FaqItem
              q="How do I check the result?"
              a="Use the EXIF Viewer to inspect the file before and after, then compare the output in the Image Diff tool."
            />
          </div>
        </section>

        <section className="container pb-20">
          <div className="flex flex-col gap-4 rounded-3xl border border-cyan/20 bg-gradient-to-r from-cyan/8 to-transparent p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Remove metadata, then verify the output
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Start with the remover, inspect the source file if needed, and compare cleaned output when you want proof.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/#upload"
                onClick={() =>
                  trackEvent("landing_page_cta_click", {
                    page: "image-metadata-remover",
                    location: "final_cta",
                    target: "upload",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-cyan px-5 py-3 text-sm font-bold text-navy transition-opacity hover:opacity-90"
              >
                Try BlankAI Free
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/image-diff"
                onClick={() =>
                  trackEvent("landing_page_cta_click", {
                    page: "image-metadata-remover",
                    location: "final_cta",
                    target: "image-diff",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-cyan/40"
              >
                Open Image Diff
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
