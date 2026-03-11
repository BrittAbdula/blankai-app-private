/**
 * BlogSection — SEO-rich content section for BlankAI
 * Targets long-tail keywords around AI metadata removal, undetectable AI images
 */

import { ArrowRight, Clock, Tag } from "lucide-react";

const posts = [
  {
    slug: "how-to-remove-ai-metadata",
    title: "How to Remove AI Metadata from Images in 2025 (Complete Guide)",
    excerpt:
      "AI-generated images carry hidden metadata — EXIF data, C2PA credentials, and pixel fingerprints — that reveal their AI origins. Learn how to strip all AI metadata and make your images undetectable using BlankAI's free browser-based tool.",
    tags: ["remove ai metadata", "ai metadata remover", "exif removal"],
    readTime: "5 min read",
    date: "Mar 2025",
  },
  {
    slug: "undetectable-ai-images-guide",
    title: "Make AI Images Undetectable: Remove Pixel Fingerprints & AI Tags",
    excerpt:
      "Pinterest, Instagram, and other platforms use AI detection algorithms to flag AI-generated content. This guide explains how AI pixel fingerprints work and how BlankAI's pixel-level hash modification makes images truly undetectable.",
    tags: ["undetectable ai image", "ai pixel remover", "ai detection bypass"],
    readTime: "7 min read",
    date: "Mar 2025",
  },
  {
    slug: "c2pa-metadata-remover",
    title: "What is C2PA Metadata and How to Remove It from AI Images",
    excerpt:
      "C2PA (Coalition for Content Provenance and Authenticity) credentials are embedded by Adobe Firefly, Photoshop, and other tools. They trigger 'Made with AI' labels on social media. Learn how to remove C2PA metadata with BlankAI.",
    tags: ["c2pa remover", "remove ai tags", "adobe firefly metadata"],
    readTime: "4 min read",
    date: "Feb 2025",
  },
];

export default function BlogSection() {
  return (
    <section className="py-20" aria-label="Blog and resources about AI metadata removal">
      <div className="container">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
            <span className="w-6 h-px bg-cyan" />
            GUIDES & RESOURCES
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Learn About AI Metadata Removal
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl">
            In-depth guides on removing AI metadata, making images undetectable, and protecting your privacy when using AI image generators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-card border border-border rounded-xl overflow-hidden card-hover group"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono-custom mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                  <span>·</span>
                  <time dateTime="2025-03">{post.date}</time>
                </div>

                <h3
                  className="font-display font-bold text-foreground text-base mb-3 leading-snug group-hover:text-cyan transition-colors"
                  itemProp="headline"
                >
                  {post.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4" itemProp="description">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-mono-custom"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="flex items-center gap-1.5 text-cyan text-sm font-medium hover:gap-2.5 transition-all">
                  Read Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
