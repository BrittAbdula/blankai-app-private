/**
 * BlankAI — /blog
 * Blog listing page: SEO-optimized, category filters, EEAT-compliant article cards
 * Target keywords: ai metadata removal, remove ai metadata, c2pa remover, undetectable ai image
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Clock, ArrowRight, BookOpen, Tag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts, categories } from "@/data/blogPosts";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    document.title = "Blog — AI Metadata Removal Guides & Tutorials | BlankAI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Expert guides on removing AI metadata, C2PA credentials, EXIF data, and pixel fingerprints from AI-generated images. Learn how to make images undetectable.");
  }, []);

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  const featured = blogPosts.filter((p) => p.featured);
  const allCategories = ["All", ...categories];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SEO structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "BlankAI Blog — AI Metadata Removal Guides",
        "url": "https://blankai.app/blog",
        "description": "Expert guides on removing AI metadata, C2PA credentials, EXIF data, and pixel fingerprints from AI-generated images.",
        "publisher": {
          "@type": "Organization",
          "name": "BlankAI",
          "url": "https://blankai.app",
          "logo": { "@type": "ImageObject", "url": "https://blankai.app/favicon.svg" }
        },
        "blogPost": blogPosts.map((p) => ({
          "@type": "BlogPosting",
          "headline": p.title,
          "description": p.description,
          "datePublished": p.dateISO,
          "author": { "@type": "Person", "name": p.author.name, "jobTitle": p.author.title },
          "url": `https://blankai.app/blog/${p.slug}`,
        }))
      })}} />

      <SiteHeader breadcrumb="Blog" />

      {/* ── Hero ── */}
      <section className="pt-28 pb-12 border-b border-border/50">
        <div className="container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-cyan" />
              <span className="text-cyan text-sm font-mono-custom tracking-wider uppercase">Knowledge Base</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-foreground leading-tight mb-4">
              AI Metadata Removal<br />
              <span className="text-cyan">Guides & Tutorials</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Expert guides on removing AI metadata, C2PA credentials, EXIF data, and pixel fingerprints from Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly images. Written by researchers and engineers with hands-on experience.
            </p>
          </div>
        </div>
      </section>

      {/* ── Featured Posts ── */}
      <section className="py-12 border-b border-border/30">
        <div className="container">
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-cyan inline-block" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group rounded-xl border border-border/60 bg-card/40 hover:border-cyan/40 hover:bg-card/70 transition-all duration-200 overflow-hidden cursor-pointer h-full flex flex-col">
                  {/* Cover gradient */}
                  <div className="h-32 w-full flex-shrink-0" style={{ background: post.coverGradient }}>
                    <div className="h-full w-full flex items-end p-4">
                      <span className="text-xs font-mono-custom text-white/60 bg-black/30 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-foreground text-base leading-snug mb-2 group-hover:text-cyan transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan/20 border border-cyan/30 flex items-center justify-center text-[10px] font-bold text-cyan">
                          {post.author.avatar}
                        </div>
                        <span className="text-xs text-muted-foreground">{post.author.name.split(" ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </span>
                        <span>{post.date.split(",")[0]}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Posts with Category Filter ── */}
      <section className="py-12">
        <div className="container">
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-cyan/20 text-cyan border border-cyan/40"
                    : "bg-card/40 text-muted-foreground border border-border/60 hover:border-cyan/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Post list */}
          <div className="space-y-4">
            {filtered.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-border/60 bg-card/30 hover:border-cyan/40 hover:bg-card/60 transition-all duration-200 cursor-pointer">
                  {/* Color swatch */}
                  <div
                    className="w-full sm:w-20 h-20 rounded-lg flex-shrink-0"
                    style={{ background: post.coverGradient }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono-custom text-cyan/70 bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.readTime} min read
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-base leading-snug mb-1.5 group-hover:text-cyan transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-cyan/20 border border-cyan/30 flex items-center justify-center text-[9px] font-bold text-cyan">
                          {post.author.avatar}
                        </div>
                        <span className="text-xs text-muted-foreground">{post.author.name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        Read article <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-12 border-t border-border/50">
        <div className="container">
          <div className="rounded-2xl border border-cyan/20 bg-gradient-to-r from-cyan/5 to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                Ready to remove AI metadata?
              </h2>
              <p className="text-muted-foreground text-sm">
                Apply what you've learned — strip EXIF, C2PA, and pixel fingerprints from your images free, instantly, in your browser.
              </p>
            </div>
            <a
              href="/#upload"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl gradient-cyan text-navy font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Try BlankAI Free
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
