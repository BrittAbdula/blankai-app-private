/**
 * BlankAI — Shared Site Header
 * Used by: Home, ImageDiff, PrivacyPolicy, TermsOfService
 *
 * Mobile: hamburger → slide-down drawer with all nav links
 * Desktop: horizontal nav with Image Diff tool link
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  EyeOff,
  Zap,
  Menu,
  X,
  ChevronRight,
  Github,
  ChevronDown,
  Shield,
  FileText,
  BookOpen,
} from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
  match?: "exact" | "prefix";
}

interface SiteHeaderProps {
  /** If true, anchor links (#features etc.) are shown (home page only) */
  showAnchorLinks?: boolean;
  /** Active tool label shown in breadcrumb on sub-pages */
  breadcrumb?: string;
}

const anchorLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Compare", href: "#comparison" },
  { label: "FAQ", href: "#faq" },
];

const toolLinks: NavLink[] = [
  { label: "Image Diff", href: "/image-diff", highlight: true },
  { label: "EXIF Viewer", href: "/exif-viewer", highlight: true },
];

const guideLinks: NavLink[] = [
  {
    label: "Remove AI Content Credentials",
    href: "/remove-ai-content-credentials",
  },
  { label: "Image Metadata Remover", href: "/image-metadata-remover" },
  { label: "Blog", href: "/blog", match: "prefix" },
];

const repoUrl = "https://github.com/BrittAbdula/blankai-app";

export default function SiteHeader({
  showAnchorLinks = false,
  breadcrumb,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isHome = location === "/";
  const isLinkActive = (link: NavLink) =>
    link.match === "prefix" ? location.startsWith(link.href) : location === link.href;
  const guidesActive = guideLinks.some(isLinkActive);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "bg-background/95 shadow-lg shadow-black/20"
            : "bg-background/80"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
              aria-label="BlankAI Home"
            >
              <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-4 h-4 text-navy" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                blank<span className="text-cyan">AI</span>
              </span>
            </Link>
            {/* Breadcrumb for sub-pages */}
            {breadcrumb && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {breadcrumb}
                </span>
              </div>
            )}
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {showAnchorLinks &&
              anchorLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {link.label}
                </a>
              ))}
            {/* Tool links — always shown */}
            {toolLinks.map(link => {
              const isActive = isLinkActive(link);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                    isActive
                      ? "text-cyan bg-cyan/10"
                      : "text-cyan/70 hover:text-cyan hover:bg-cyan/5"
                  } font-medium`}
                >
                  {link.href === "/blog" ? (
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M2 4h12M2 8h8M2 12h6" strokeLinecap="round" />
                    </svg>
                  ) : link.href === "/exif-viewer" ? (
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="8" cy="8" r="5" />
                      <circle cx="8" cy="8" r="2" />
                      <path
                        d="M8 1v2M8 13v2M1 8h2M13 8h2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="1" y="3" width="6" height="10" rx="1" />
                      <rect x="9" y="3" width="6" height="10" rx="1" />
                      <path d="M7 8h2" strokeLinecap="round" />
                    </svg>
                  )}
                  {link.label}
                </Link>
              );
            })}
            <div className="relative group">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all font-medium ${
                  guidesActive
                    ? "text-cyan bg-cyan/10"
                    : "text-cyan/70 hover:text-cyan hover:bg-cyan/5"
                }`}
                aria-haspopup="true"
              >
                Guides
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
              <div className="pointer-events-none absolute right-0 top-full mt-2 w-72 translate-y-1 rounded-xl border border-border/70 bg-background/98 p-2 opacity-0 shadow-xl shadow-black/20 backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {guideLinks.map(link => {
                  const isActive = isLinkActive(link);
                  const Icon =
                    link.href === "/remove-ai-content-credentials"
                      ? Shield
                      : link.href === "/image-metadata-remover"
                        ? FileText
                        : BookOpen;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isActive
                          ? "bg-cyan/10 text-cyan"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-[11px] opacity-70">
                          {link.href === "/remove-ai-content-credentials"
                            ? "Focused page for content credentials"
                            : link.href === "/image-metadata-remover"
                              ? "Broader metadata cleaning guide"
                              : "Educational guides and explainers"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side: CTA + hamburger */}
          <div className="flex items-center gap-2">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan/20 bg-cyan/5 text-cyan/80 hover:text-cyan hover:border-cyan/40 hover:bg-cyan/10 transition-all"
              aria-label="View BlankAI on GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">Open Source</span>
            </a>

            {/* CTA */}
            {isHome ? (
              <a
                href="#upload"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Try Free</span>
                <span className="sm:hidden">Try</span>
              </a>
            ) : (
              <Link
                href="/#upload"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-cyan text-navy font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove Metadata</span>
                <span className="sm:hidden">Home</span>
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden border-b border-border bg-background/98 backdrop-blur-md transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="container py-4 space-y-1">
          {/* Anchor links (home only) */}
          {showAnchorLinks && (
            <div className="pb-2 mb-2 border-b border-border/50">
              <p className="text-[10px] font-mono-custom text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">
                Navigation
              </p>
              {anchorLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm"
                >
                  {link.label}
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </a>
              ))}
            </div>
          )}

          {/* Tools */}
          <div className="pb-2">
            <p className="text-[10px] font-mono-custom text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">
              Tools
            </p>
            <Link
              href="/#upload"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                isHome
                  ? "text-cyan bg-cyan/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M8 2v8M4 6l4-4 4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M2 13h12" strokeLinecap="round" />
                </svg>
                AI Metadata Remover
              </div>
              {isHome && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan/20 text-cyan font-bold">
                  ACTIVE
                </span>
              )}
            </Link>
            <Link
              href="/image-diff"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                location === "/image-diff"
                  ? "text-cyan bg-cyan/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="1" y="3" width="6" height="10" rx="1" />
                  <rect x="9" y="3" width="6" height="10" rx="1" />
                  <path d="M7 8h2" strokeLinecap="round" />
                </svg>
                Image Diff Tool
              </div>
              {location === "/image-diff" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan/20 text-cyan font-bold">
                  ACTIVE
                </span>
              )}
            </Link>
            <Link
              href="/exif-viewer"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                location === "/exif-viewer"
                  ? "text-cyan bg-cyan/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="8" cy="8" r="5" />
                  <circle cx="8" cy="8" r="2" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" strokeLinecap="round" />
                </svg>
                EXIF Viewer
              </div>
              {location === "/exif-viewer" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan/20 text-cyan font-bold">
                  ACTIVE
                </span>
              )}
            </Link>
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                location.startsWith("/blog")
                  ? "text-cyan bg-cyan/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 4h12M2 8h8M2 12h6" strokeLinecap="round" />
                </svg>
                Blog & Guides
              </div>
              {location.startsWith("/blog") && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan/20 text-cyan font-bold">
                  ACTIVE
                </span>
              )}
            </Link>
          </div>

          <div className="pt-2 pb-2 border-t border-border/50">
            <p className="text-[10px] font-mono-custom text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">
              Guides
            </p>
            {[
              {
                href: "/remove-ai-content-credentials",
                label: "Remove AI Content Credentials",
                icon: <Shield className="w-4 h-4" />,
                desc: "Focused C2PA and provenance page",
              },
              {
                href: "/image-metadata-remover",
                label: "Image Metadata Remover",
                icon: <FileText className="w-4 h-4" />,
                desc: "Broad metadata cleaning guide",
              },
            ].map(link => {
              const isActive = location === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? "text-cyan bg-cyan/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <div>
                      <div>{link.label}</div>
                      <div className="text-[10px] opacity-60">{link.desc}</div>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan/20 text-cyan font-bold">
                      ACTIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Legal */}
          <div className="pt-2 border-t border-border/50">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all mb-2"
            >
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-cyan/70" />
                Open source on GitHub
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </a>
            <div className="flex gap-4 px-3 text-xs text-muted-foreground">
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                onClick={() => setOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <a
                href="mailto:support@blankai.app"
                className="hover:text-cyan transition-colors"
              >
                support@blankai.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
