/**
 * LandingPage: data-driven page for generator, platform, format and core
 * intents. Content lives in client/src/data/landingPages.ts.
 */
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Lock,
  MinusCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RemovalScope from "@/components/RemovalScope";
import MetadataRemoverTool from "@/components/remover/MetadataRemoverTool";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  HUBS,
  getLandingPage,
  type LayerRow,
  type LayerStatus,
} from "@/data/landingPages";
import { getInternalLink } from "@/data/internalLinks";
import {
  CONTENT_REVIEWED_ISO,
  CONTENT_REVIEWED_LABEL,
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  webAppJsonLd,
} from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

const STATUS_UI: Record<LayerStatus, { label: string; className: string }> = {
  yes: { label: "Yes", className: "text-foreground" },
  no: { label: "No", className: "text-muted-foreground" },
  varies: { label: "Sometimes", className: "text-amber-200" },
  unknown: { label: "Not documented", className: "text-muted-foreground" },
  announced: { label: "Announced", className: "text-amber-200" },
};

function ActionCell({ action }: { action: LayerRow["action"] }) {
  if (action === "removed")
    return (
      <span className="inline-flex items-center gap-1.5 text-green-400 font-medium whitespace-nowrap">
        <CheckCircle2 className="w-4 h-4" /> Removed
      </span>
    );
  if (action === "not-removed")
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium whitespace-nowrap">
        <XCircle className="w-4 h-4" /> Not removed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
      <MinusCircle className="w-4 h-4" /> Nothing to remove
    </span>
  );
}

export default function LandingPage({ slug }: { slug: string }) {
  const page = getLandingPage(slug);
  if (!page) throw new Error(`Unknown landing page: ${slug}`);
  const path = `/${page.slug}`;
  const hub = page.hub ? HUBS[page.hub] : undefined;

  const crumbs = [
    { name: "Home", path: "/" },
    ...(hub ? [{ name: hub.name, path: hub.path }] : []),
    { name: page.name, path },
  ];

  usePageMeta({
    title: page.title,
    description: page.description,
    canonical: path,
    jsonLd: [
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl(path)}#webpage`,
        url: absoluteUrl(path),
        name: page.title,
        description: page.description,
        dateModified: CONTENT_REVIEWED_ISO,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
      },
      webAppJsonLd({ name: `${SITE_NAME}: ${page.h1}`, path, description: page.description }),
      breadcrumbJsonLd(crumbs),
      faqJsonLd(page.faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader breadcrumb={page.name} toolAnchor="#tool" />

      <main>
        {/* Hero */}
        <section className="border-b border-border/50 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.08),transparent_55%)]">
          <div className="container pt-28 pb-12 md:pt-32 md:pb-14">
            <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1.5">
                {crumbs.map((crumb, i) => (
                  <li key={crumb.path} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden>/</span>}
                    {i < crumbs.length - 1 ? (
                      <Link href={crumb.path} className="hover:text-foreground">
                        {crumb.name}
                      </Link>
                    ) : (
                      <span className="text-foreground">{crumb.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-mono-custom uppercase tracking-[0.18em] text-cyan">
                {page.eyebrow}
              </p>
              <h1 className="font-display text-4xl font-black leading-tight text-foreground md:text-5xl">{page.h1}</h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{page.intro}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan" /> Runs in your browser. Nothing is uploaded.
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-cyan" /> Reviewed{" "}
                  <time dateTime={CONTENT_REVIEWED_ISO}>{CONTENT_REVIEWED_LABEL}</time>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tool */}
        <section id="tool" className="container max-w-3xl py-12 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{page.toolHeading}</h2>
          <p className="text-sm text-muted-foreground mb-6">{page.toolIntro}</p>
          <MetadataRemoverTool page={page.slug} defaultFormat={page.defaultFormat} acceptPending={false} dropLabel={page.dropLabel} />
        </section>

        {/* What this source embeds */}
        {page.layers && page.layers.length > 0 && (
          <section className="container py-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{page.layersTitle}</h2>
            {page.layersIntro && <p className="text-muted-foreground max-w-3xl mb-6 leading-relaxed">{page.layersIntro}</p>}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-4 font-display font-semibold text-foreground">Layer</th>
                    <th className="p-4 font-display font-semibold text-foreground">Present</th>
                    <th className="p-4 font-display font-semibold text-foreground">Details</th>
                    <th className="p-4 font-display font-semibold text-foreground">BlankAI</th>
                  </tr>
                </thead>
                <tbody>
                  {page.layers.map((row) => (
                    <tr key={row.layer} className="border-b border-border/50 last:border-b-0 align-top">
                      <td className="p-4 font-medium text-foreground">{row.layer}</td>
                      <td className={`p-4 whitespace-nowrap ${STATUS_UI[row.status].className}`}>{STATUS_UI[row.status].label}</td>
                      <td className="p-4 text-muted-foreground leading-relaxed">{row.detail}</td>
                      <td className="p-4">
                        <ActionCell action={row.action} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Body */}
        <section className="container py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
            <article className="max-w-3xl space-y-10">
              {page.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">{section.heading}</h2>
                  <div className="space-y-4 text-base leading-8 text-muted-foreground">
                    {section.body.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets && (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-base leading-7 text-muted-foreground">
                          <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-cyan" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {page.steps && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">{page.steps.title}</h2>
                  <ol className="space-y-3">
                    {page.steps.items.map((step, i) => (
                      <li key={step} className="flex gap-3 text-base leading-7 text-muted-foreground">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan/25 bg-cyan/10 text-sm font-bold text-cyan">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              {page.checkers && page.checkers.length > 0 && (
                <div className="rounded-xl border border-border bg-card/40 p-5">
                  <p className="font-display text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan" /> Official checkers
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Use these to see what a platform or vendor can still detect.
                  </p>
                  <ul className="space-y-2">
                    {page.checkers.map((checker) => (
                      <li key={checker.href}>
                        <a
                          href={checker.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block rounded-lg border border-border/60 bg-background/40 px-3 py-2 hover:border-cyan/30"
                        >
                          <span className="flex items-center justify-between gap-2 text-sm text-foreground">
                            {checker.label}
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan" />
                          </span>
                          <span className="block text-xs text-muted-foreground">{checker.note}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card/40 p-5">
                <p className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan" /> Related
                </p>
                <ul className="space-y-2 text-sm">
                  {page.related.map((relPath) => {
                    const link = getInternalLink(relPath);
                    if (!link) return null;
                    return (
                      <li key={relPath}>
                        <Link
                          href={relPath}
                          onClick={() => trackEvent("related_link_click", { page: page.slug, target: relPath })}
                          className="flex items-start gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ArrowRight className="mt-1 w-3.5 h-3.5 shrink-0 text-cyan" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="container py-10">
          <RemovalScope
            title="What BlankAI removes, and what it does not"
            intro="The same rules apply to every file, whatever made it. BlankAI cleans the metadata that travels with a file. It cannot reach anything that is part of the image itself."
          />
        </section>

        {/* FAQ */}
        <section className="container max-w-3xl py-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CircleHelp className="w-6 h-6 text-cyan" /> Questions
          </h2>
          <div className="space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border/60 bg-card/30 p-5">
                <h3 className="font-display text-base font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sources */}
        {page.sources.length > 0 && (
          <section className="container max-w-3xl pb-16">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Sources</h2>
            <ul className="space-y-1.5 text-sm">
              {page.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 text-muted-foreground hover:text-cyan"
                  >
                    <ExternalLink className="mt-1 w-3 h-3 shrink-0" />
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
