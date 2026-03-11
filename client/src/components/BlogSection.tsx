/**
 * BlogSection — Homepage blog preview section for BlankAI
 * Uses real blog data with cover images, proper /blog/:slug links, and rich EEAT content
 * Target keywords: remove ai metadata, undetectable ai image, c2pa remover, exif removal
 */

import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { blogPosts } from "@/data/blogPosts";

// Show the 3 featured posts, or first 3 if fewer than 3 featured
const displayPosts = blogPosts.filter((p) => p.featured).slice(0, 3).length >= 3
  ? blogPosts.filter((p) => p.featured).slice(0, 3)
  : blogPosts.slice(0, 3);

export default function BlogSection() {
  return (
    <section className="py-20" aria-label="Blog and resources about AI metadata removal">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
              <span className="w-6 h-px bg-cyan" />
              GUIDES & RESOURCES
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learn About AI Metadata Removal
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl">
              Expert guides on removing EXIF data, C2PA credentials, and pixel fingerprints from AI-generated images. Written by researchers and engineers with hands-on experience.
            </p>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-2 text-cyan text-sm font-semibold hover:gap-3 transition-all whitespace-nowrap flex-shrink-0"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured article (large) + 2 smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Large featured card */}
          {displayPosts[0] && (
            <Link href={`/blog/${displayPosts[0].slug}`} className="lg:col-span-3">
              <article
                className="group h-full rounded-2xl border border-border/60 bg-card/40 hover:border-cyan/40 hover:bg-card/70 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                {/* Cover image */}
                <div
                  className="w-full h-52 relative overflow-hidden flex-shrink-0"
                  style={{ background: displayPosts[0].coverGradient }}
                >
                  {displayPosts[0].coverImage && (
                    <img
                      src={displayPosts[0].coverImage}
                      alt={displayPosts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="text-xs font-mono-custom text-white/80 bg-black/50 px-2.5 py-1 rounded-full border border-white/20">
                      {displayPosts[0].category}
                    </span>
                    <span className="text-xs text-white/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {displayPosts[0].readTime} min read
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <time
                    dateTime={displayPosts[0].dateISO}
                    className="text-xs text-muted-foreground font-mono-custom mb-3 block"
                    itemProp="datePublished"
                  >
                    {displayPosts[0].date}
                  </time>

                  <h3
                    className="font-display font-bold text-foreground text-xl leading-snug mb-3 group-hover:text-cyan transition-colors"
                    itemProp="headline"
                  >
                    {displayPosts[0].title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1" itemProp="description">
                    {displayPosts[0].description}
                  </p>

                  {/* Author + CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan/30 to-cyan/10 border border-cyan/30 flex items-center justify-center text-[10px] font-bold text-cyan">
                        {displayPosts[0].author.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{displayPosts[0].author.name}</p>
                        <p className="text-[10px] text-muted-foreground">{displayPosts[0].author.title.split(",")[0]}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-cyan text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Read article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Two smaller cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {displayPosts.slice(1, 3).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="flex-1">
                <article
                  className="group h-full rounded-2xl border border-border/60 bg-card/40 hover:border-cyan/40 hover:bg-card/70 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                  itemScope
                  itemType="https://schema.org/BlogPosting"
                >
                  {/* Cover image */}
                  <div
                    className="w-full h-32 relative overflow-hidden flex-shrink-0"
                    style={{ background: post.coverGradient }}
                  >
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-mono-custom text-white/70 bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <time
                        dateTime={post.dateISO}
                        className="text-[11px] text-muted-foreground font-mono-custom"
                        itemProp="datePublished"
                      >
                        {post.date}
                      </time>
                      <span className="text-muted-foreground/40 text-[11px]">·</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {post.readTime} min
                      </span>
                    </div>

                    <h3
                      className="font-display font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-cyan transition-colors flex-1"
                      itemProp="headline"
                    >
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2" itemProp="description">
                      {post.description}
                    </p>

                    <span className="flex items-center gap-1.5 text-cyan text-xs font-semibold group-hover:gap-2.5 transition-all">
                      Read article
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row: 3 more articles in compact list */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogPosts.filter((p) => !displayPosts.includes(p)).slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group flex gap-4 p-4 rounded-xl border border-border/60 bg-card/30 hover:border-cyan/40 hover:bg-card/60 transition-all duration-200 cursor-pointer">
                <div
                  className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ background: post.coverGradient }}
                >
                  {post.coverImage && (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono-custom text-cyan/70">{post.category}</span>
                    <span className="text-muted-foreground/40 text-[10px]">·</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {post.readTime}m
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-foreground text-xs leading-snug group-hover:text-cyan transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cyan/30 text-cyan text-sm font-semibold hover:bg-cyan/10 hover:border-cyan/50 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Browse all {blogPosts.length} articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
