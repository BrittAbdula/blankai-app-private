/**
 * BlankAI — /blog/:slug
 * Individual blog post page: EEAT layout, author bio, structured data, related posts, CTAs
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import {
  Clock, ArrowLeft, ArrowRight, CheckCircle2,
  Shield, User, Tag, ChevronRight, ExternalLink, BookOpen
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPostBySlug, getRelatedPosts, type BlogPost, type BlogSection } from "@/data/blogPosts";

// ─── Section Renderer ─────────────────────────────────────────────────────────
function RenderSection({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="font-display font-bold text-2xl text-foreground mt-10 mb-4 flex items-center gap-3">
          <span className="w-1 h-6 rounded-full bg-cyan flex-shrink-0" />
          {section.content}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-display font-semibold text-lg text-foreground mt-7 mb-3">
          {section.content}
        </h3>
      );
    case "p":
      return (
        <p className="text-muted-foreground leading-relaxed mb-4 text-[15px]">
          {section.content}
        </p>
      );
    case "blockquote":
      return (
        <blockquote className="my-6 pl-5 border-l-2 border-cyan/50 italic text-foreground/80 text-[15px] leading-relaxed bg-cyan/5 py-3 pr-4 rounded-r-lg">
          {section.content}
        </blockquote>
      );
    case "ul":
      return (
        <ul className="space-y-2 mb-5 ml-1">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground text-[15px]">
              <CheckCircle2 className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-3 mb-5 ml-1">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground text-[15px]">
              <span className="w-6 h-6 rounded-full bg-cyan/20 border border-cyan/30 text-cyan text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-card/60">
                {section.headers?.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-display font-semibold text-foreground text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows?.map((row, ri) => (
                <tr key={ri} className="border-b border-border/30 last:border-0 hover:bg-card/40 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 text-[13px] ${ci === 0 ? "text-foreground font-medium font-mono-custom" : "text-muted-foreground"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div className="my-6 p-5 rounded-xl border border-cyan/30 bg-cyan/5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-foreground text-[14px] leading-relaxed mb-3">{section.content}</p>
              {section.ctaText && (
                <a
                  href={section.ctaHref || "/#upload"}
                  className="inline-flex items-center gap-1.5 text-cyan text-sm font-semibold hover:underline"
                >
                  {section.ctaText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="my-8 p-6 rounded-2xl border border-cyan/25 bg-gradient-to-r from-cyan/8 to-transparent">
          <p className="text-foreground font-medium mb-4 text-[15px] leading-relaxed">{section.content}</p>
          <a
            href={section.ctaHref || "/#upload"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity"
          >
            {section.ctaText || "Try BlankAI Free"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      );
    default:
      return null;
  }
}

// ─── Table of Contents ────────────────────────────────────────────────────────
function TableOfContents({ sections }: { sections: BlogSection[] }) {
  const headings = sections.filter((s) => s.type === "h2");
  if (headings.length < 3) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5 mb-8">
      <h4 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <Tag className="w-4 h-4 text-cyan" />
        In This Article
      </h4>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground hover:text-cyan transition-colors">
            <span className="font-mono-custom text-cyan/50 text-xs mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span>{h.content}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    const found = getPostBySlug(slug);
    setPost(found || null);
    if (found) {
      document.title = `${found.title} | BlankAI Blog`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", found.description);
    }
  }, [slug]);

  // Loading
  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader breadcrumb="Blog" />
        <div className="container pt-28 pb-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-8 w-3/4 rounded-lg bg-muted/40" style={{ animation: "shimmer 1.5s ease infinite" }} />
            <div className="h-4 w-1/2 rounded bg-muted/30" style={{ animation: "shimmer 1.5s ease 0.1s infinite" }} />
            <div className="h-64 rounded-xl bg-muted/20 mt-6" style={{ animation: "shimmer 1.5s ease 0.2s infinite" }} />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // 404
  if (post === null) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader breadcrumb="Blog" />
        <div className="container pt-28 pb-10 text-center">
          <h1 className="font-display font-bold text-3xl text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been moved.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-cyan hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(post.relatedSlugs);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SEO structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.description,
        "datePublished": post.dateISO,
        "dateModified": post.dateISO,
        "author": {
          "@type": "Person",
          "name": post.author.name,
          "jobTitle": post.author.title,
          "description": post.author.bio,
        },
        "publisher": {
          "@type": "Organization",
          "name": "BlankAI",
          "url": "https://blankai.app",
          "logo": { "@type": "ImageObject", "url": "https://blankai.app/favicon.svg" }
        },
        "url": `https://blankai.app/blog/${post.slug}`,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://blankai.app/blog/${post.slug}` },
        "keywords": post.tags.join(", "),
        "timeRequired": `PT${post.readTime}M`,
        "inLanguage": "en-US",
        "isPartOf": { "@type": "Blog", "name": "BlankAI Blog", "url": "https://blankai.app/blog" }
      })}} />

      <SiteHeader breadcrumb="Blog" />

      <article className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            {/* ── Main Content ── */}
            <div className="min-w-0">
              {/* Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs font-mono-custom text-cyan/80 bg-cyan/10 px-2.5 py-1 rounded-lg border border-cyan/20">
                    {post.category}
                  </span>
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground bg-card/60 px-2 py-0.5 rounded border border-border/50">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Cover gradient banner */}
                <div
                  className="w-full h-36 rounded-xl mb-6 flex items-end p-5"
                  style={{ background: post.coverGradient }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white/60 text-xs">{post.readTime} min read</span>
                    <span className="text-white/40 text-xs">·</span>
                    <span className="text-white/60 text-xs">{post.date}</span>
                  </div>
                </div>

                <h1 className="font-display font-black text-3xl md:text-4xl text-foreground leading-tight mb-5">
                  {post.title}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6 border-l-2 border-cyan/40 pl-4">
                  {post.description}
                </p>

                {/* Author card */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card/40">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan/30 to-cyan/10 border border-cyan/30 flex items-center justify-center text-sm font-bold text-cyan flex-shrink-0">
                    {post.author.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-semibold text-foreground text-sm">{post.author.name}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-muted-foreground text-xs">{post.date}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{post.author.title}</p>
                  </div>
                </div>
              </header>

              {/* Table of Contents */}
              <TableOfContents sections={post.sections} />

              {/* Article body */}
              <div className="prose-content">
                {post.sections.map((section, i) => (
                  <RenderSection key={i} section={section} />
                ))}
              </div>

              {/* Tags */}
              <div className="mt-10 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground bg-card/60 px-2.5 py-1 rounded-lg border border-border/50 hover:border-cyan/30 hover:text-foreground transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author bio (full) */}
              <div className="mt-8 p-6 rounded-2xl border border-border/60 bg-card/40">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-cyan" />
                  <span className="font-display font-semibold text-foreground text-sm">About the Author</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan/30 to-cyan/10 border border-cyan/30 flex items-center justify-center text-base font-bold text-cyan flex-shrink-0">
                    {post.author.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground mb-0.5">{post.author.name}</p>
                    <p className="text-cyan text-xs mb-3">{post.author.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Try BlankAI CTA */}
              <div className="rounded-xl border border-cyan/30 bg-gradient-to-b from-cyan/8 to-transparent p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-cyan" />
                  <span className="font-display font-bold text-foreground text-sm">Try BlankAI Free</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                  Remove EXIF, C2PA, and pixel fingerprints from your AI images — entirely in your browser, zero uploads.
                </p>
                <ul className="space-y-1.5 mb-4">
                  {["EXIF & GPS removal", "C2PA credential strip", "Pixel hash modification", "HEIC / PNG / JPEG / WebP", "Up to 20 images at once"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-cyan flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/#upload"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Remove Metadata Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Image Diff Tool */}
              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="w-4 h-4 text-cyan/70" />
                  <span className="font-display font-semibold text-foreground text-sm">Image Diff Tool</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                  Compare original vs. cleaned images pixel-by-pixel. Verify that metadata has been removed.
                </p>
                <Link
                  href="/image-diff"
                  className="flex items-center gap-1.5 text-cyan text-xs font-semibold hover:underline"
                >
                  Open Image Diff <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                  <h4 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan/70" />
                    Related Articles
                  </h4>
                  <div className="space-y-3">
                    {relatedPosts.map((related) => (
                      <Link key={related.slug} href={`/blog/${related.slug}`}>
                        <div className="group cursor-pointer">
                          <div
                            className="w-full h-10 rounded-lg mb-2"
                            style={{ background: related.coverGradient }}
                          />
                          <p className="text-foreground text-xs font-medium leading-snug group-hover:text-cyan transition-colors line-clamp-2">
                            {related.title}
                          </p>
                          <p className="text-muted-foreground text-[11px] mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {related.readTime} min · {related.date.split(",")[0]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>

      {/* ── Back to Blog ── */}
      <div className="border-t border-border/50 py-8">
        <div className="container flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <a href="/#upload" className="flex items-center gap-2 text-cyan text-sm font-semibold hover:underline">
            Try BlankAI Free <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}


