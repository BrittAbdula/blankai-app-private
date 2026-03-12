/**
 * BlankAI — Shared Site Footer
 * Used by: Home, ImageDiff, PrivacyPolicy, TermsOfService
 */

import { Link } from "wouter";
import { EyeOff, Mail, Shield, Github, Twitter } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group w-fit">
              <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
                <EyeOff className="w-4 h-4 text-navy" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                blank<span className="text-cyan">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-[200px]">
              The most advanced free AI metadata remover. 100% browser-based, zero server uploads.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://twitter.com/blankaiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-all"
                aria-label="BlankAI on Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:support@blankai.app"
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-cyan hover:border-cyan/30 transition-all"
                aria-label="Email BlankAI support"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-cyan/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2v8M4 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 13h12" strokeLinecap="round" />
                  </svg>
                  AI Metadata Remover
                </Link>
              </li>
              <li>
                <Link href="/image-diff" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-cyan/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="3" width="6" height="10" rx="1" />
                    <rect x="9" y="3" width="6" height="10" rx="1" />
                    <path d="M7 8h2" strokeLinecap="round" />
                  </svg>
                  Image Diff Tool
                </Link>
              </li>
              <li>
                <Link href="/exif-viewer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-cyan/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="5" />
                    <circle cx="8" cy="8" r="2" />
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2" strokeLinecap="round" />
                  </svg>
                  EXIF Viewer
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-cyan/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4h12M2 8h8M2 12h6" strokeLinecap="round" />
                  </svg>
                  Blog & Guides
                </Link>
              </li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@blankai.app" className="hover:text-cyan transition-colors flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-cyan/60" />
                  support@blankai.app
                </a>
              </li>
              <li>
                <a href="https://blankai.app" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-cyan/60" />
                  blankai.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} BlankAI. All rights reserved. Free{" "}
            <Link href="/" className="text-cyan/70 hover:text-cyan transition-colors">AI metadata remover</Link>{" · "}
            <Link href="/image-diff" className="text-cyan/70 hover:text-cyan transition-colors">Image Diff Tool</Link>{" · "}
            <Link href="/exif-viewer" className="text-cyan/70 hover:text-cyan transition-colors">EXIF Viewer</Link>{" · "}
            <Link href="/blog" className="text-cyan/70 hover:text-cyan transition-colors">Blog</Link>.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono-custom">100% client-side · zero uploads</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
