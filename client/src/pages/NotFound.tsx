import { Link } from "wouter";
import { ArrowRight, FileQuestion } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { HUBS } from "@/data/landingPages";

export default function NotFound() {
  usePageMeta({
    title: "Page not found | BlankAI",
    description: "This page does not exist. Try the AI metadata remover, the EXIF Viewer or the guides.",
    canonical: "/404",
    robots: "noindex, follow",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container max-w-2xl pt-36 pb-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10">
          <FileQuestion className="h-8 w-8 text-cyan" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you are looking for does not exist or has moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {[
            { href: "/", label: "AI Metadata Remover" },
            { href: "/exif-viewer", label: "EXIF Viewer" },
            { href: HUBS.generators.path, label: "Guides by AI generator" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:border-cyan/40"
            >
              {link.label} <ArrowRight className="h-4 w-4 text-cyan" />
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
