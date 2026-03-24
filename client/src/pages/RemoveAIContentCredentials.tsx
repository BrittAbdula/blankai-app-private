import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Shield,
  Sparkles,
  Upload,
  Eye,
  Layers,
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
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
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

export default function RemoveAIContentCredentials() {
  usePageMeta({
    title: "Remove AI Content Credentials from Images | BlankAI",
    description:
      "Remove AI content credentials, EXIF, XMP, IPTC, and C2PA metadata from images in your browser. Fast, private, and no uploads required.",
    canonical: "https://blankai.app/remove-ai-content-credentials",
    ogTitle: "Remove AI Content Credentials from Images | BlankAI",
    ogDescription:
      "Clean AI content credentials and image metadata locally in your browser with BlankAI.",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "remove-ai-content-credentials-sd";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: "BlankAI AI Content Credentials Remover",
          url: "https://blankai.app/remove-ai-content-credentials",
          description:
            "Remove AI content credentials and metadata from images in the browser.",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What are content credentials?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Content credentials are provenance records that can be embedded in image files to describe how the file was created or edited.",
              },
            },
            {
              "@type": "Question",
              name: "Does BlankAI keep my files local?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. The remover is browser-based and designed to process files locally without a server upload step.",
              },
            },
            {
              "@type": "Question",
              name: "Can I inspect or verify the result?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Use the EXIF Viewer to inspect the source file and Image Diff to compare the cleaned output.",
              },
            },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById("remove-ai-content-credentials-sd")?.remove();
    };
  }, []);

  const focusItems = [
    "AI content credentials and related provenance data",
    "C2PA manifests and other embedded authenticity signals",
    "EXIF, XMP, and IPTC metadata that travel with the file",
    "AI-related text chunks and generator tags where present",
  ];

  const steps = [
    {
      title: "Select the image",
      body: "Choose the file you want to clean. BlankAI reads the image locally so the workflow stays browser-only.",
    },
    {
      title: "Remove credentials",
      body: "The image is redrawn into a fresh file so the original metadata containers do not carry over into the output.",
    },
    {
      title: "Review and download",
      body: "Save the cleaned image, then inspect it with the EXIF Viewer or compare it in Image Diff if you want extra confidence.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader breadcrumb="Remove AI Content Credentials" />

      <main>
        <section className="border-b border-border/50">
          <div className="container py-24 md:py-28">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-mono-custom uppercase tracking-[0.2em] text-cyan">
                <Sparkles className="h-3.5 w-3.5" />
                Privacy-first tool
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-foreground md:text-6xl">
                Remove AI Content Credentials
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Clean AI content credentials and supporting image metadata from files in your browser. It is designed for privacy-sensitive publishing and cleaner file handling.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/#upload"
                  onClick={() =>
                    trackEvent("landing_page_cta_click", {
                      page: "remove-ai-content-credentials",
                      location: "hero",
                      target: "upload",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan px-5 py-3 text-sm font-bold text-navy transition-opacity hover:opacity-90"
                >
                  Start cleaning
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/image-metadata-remover"
                  onClick={() =>
                    trackEvent("landing_page_cta_click", {
                      page: "remove-ai-content-credentials",
                      location: "hero",
                      target: "image-metadata-remover",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-cyan/40"
                >
                  Broader metadata remover
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard icon={FileText} title="What it removes">
              <ul className="space-y-3">
                {focusItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={Layers} title="When to use it">
              <p>
                Use this flow when your main goal is to remove content credentials and export a cleaner file without digging through a longer tutorial first.
              </p>
            </SectionCard>
          </div>
        </section>

        <section className="container pb-16">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-cyan/8 to-transparent p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Built for browser-only removal
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  BlankAI uses a local canvas redraw workflow so the cleaned file is regenerated from pixels instead of carrying over embedded provenance data.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  <Shield className="mb-2 h-5 w-5 text-cyan" />
                  No server upload required for the normal flow
                </div>
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  <Upload className="mb-2 h-5 w-5 text-cyan" />
                  Clean common image formats in the browser
                </div>
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                  <Eye className="mb-2 h-5 w-5 text-cyan" />
                  Verify source and output with the supporting tools
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-16">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <h2 className="font-display text-xl font-bold text-foreground">How it works</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border/60 bg-card/30 p-5">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10 text-sm font-bold text-cyan">
                  {index + 1}
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container pb-16">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <h2 className="font-display text-xl font-bold text-foreground">FAQ</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FaqItem
              q="What are content credentials?"
              a="They are provenance records that describe how an image was created or edited. BlankAI is designed to clean those records from the file."
            />
            <FaqItem
              q="Does BlankAI upload my image?"
              a="No. The normal workflow is browser-based, so the file can be processed locally without a server upload."
            />
            <FaqItem
              q="Can I check the output afterward?"
              a="Yes. Open the EXIF Viewer to inspect the source and use Image Diff to compare the cleaned file."
            />
          </div>
        </section>

        <section className="container pb-20">
          <div className="flex flex-col gap-4 rounded-3xl border border-cyan/20 bg-gradient-to-r from-cyan/8 to-transparent p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Start with the focused remover
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                If you already know you want to remove AI content credentials, jump straight into the cleaner and verify the output only if you need to.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/#upload"
                onClick={() =>
                  trackEvent("landing_page_cta_click", {
                    page: "remove-ai-content-credentials",
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
                    page: "remove-ai-content-credentials",
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
