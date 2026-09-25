/**
 * BlankAI shared site footer, used by every page.
 * Doubles as the site-wide internal link map for tools and guides.
 */
import { Link } from "wouter";
import { EyeOff, Github, Mail, Twitter } from "lucide-react";
import { HUBS, landingPages } from "@/data/landingPages";
import { EXTENSION_URL, REPO_URL, SUPPORT_EMAIL } from "@/lib/site";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-foreground text-sm mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  const generators = landingPages.filter((p) => p.kind === "generator");
  const platforms = landingPages.filter((p) => p.kind === "platform");
  const formats = landingPages.filter((p) => p.kind === "format" || p.kind === "core");

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group w-fit">
              <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
                <EyeOff className="w-4 h-4 text-navy" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                blank<span className="text-cyan">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              Inspect, clean and verify image metadata in your browser. BlankAI removes EXIF, GPS, XMP, IPTC, C2PA and PNG text
              data. It does not remove invisible watermarks such as SynthID.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-cyan hover:border-cyan/30 transition-all"
                aria-label="BlankAI on GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com/blankaiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-all"
                aria-label="BlankAI on X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-cyan hover:border-cyan/30 transition-all"
                aria-label="Email BlankAI support"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Tools"
            links={[
              { href: "/", label: "AI Metadata Remover" },
              { href: "/exif-viewer", label: "EXIF Viewer" },
              { href: "/image-diff", label: "Image Diff" },
              { href: "/heic-to-jpg", label: "HEIC to JPG" },
              { href: EXTENSION_URL, label: "Chrome extension", external: true },
            ]}
          />
          <FooterColumn
            title="AI generators"
            links={[
              { href: HUBS.generators.path, label: "Comparison table" },
              ...generators.map((p) => ({ href: `/${p.slug}`, label: p.name })),
            ]}
          />
          <FooterColumn
            title="Platforms"
            links={[
              { href: HUBS.platforms.path, label: "Comparison table" },
              ...platforms.map((p) => ({ href: `/${p.slug}`, label: p.name })),
            ]}
          />
          <FooterColumn
            title="Formats and guides"
            links={[
              ...formats.map((p) => ({ href: `/${p.slug}`, label: p.name })),
              { href: "/blog", label: "Blog" },
              { href: "/privacy", label: "Privacy policy" },
              { href: "/terms", label: "Terms of service" },
            ]}
          />
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} BlankAI. Free AI metadata remover. Contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-cyan/70 hover:text-cyan">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
          <div className="flex items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              MIT licensed
            </a>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-muted-foreground font-mono-custom">client-side · no uploads</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
