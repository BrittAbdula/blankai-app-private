/**
 * HubPage: comparison hubs that link the generator and platform pages.
 */
import { Link } from "wouter";
import { ArrowRight, CalendarCheck, CircleHelp, ExternalLink } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RemovalScope from "@/components/RemovalScope";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  HUBS,
  landingPages,
  type HubKey,
  type LayerKey,
  type LayerRow,
  type LayerStatus,
  type PlatformFacts,
} from "@/data/landingPages";
import {
  CONTENT_REVIEWED_ISO,
  CONTENT_REVIEWED_LABEL,
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/site";

const STATUS_TEXT: Record<LayerStatus, string> = {
  yes: "Yes",
  no: "No",
  varies: "Sometimes",
  unknown: "Not documented",
  announced: "Announced",
};

const STATUS_CLASS: Record<LayerStatus, string> = {
  yes: "text-foreground font-medium",
  no: "text-muted-foreground",
  varies: "text-amber-200",
  unknown: "text-muted-foreground/70",
  announced: "text-amber-200",
};

const GENERATOR_COLUMNS: { key: LayerKey; label: string }[] = [
  { key: "c2pa", label: "C2PA manifest" },
  { key: "metadata", label: "Readable metadata (EXIF, XMP, IPTC, PNG text)" },
  { key: "invisible", label: "Invisible watermark" },
  { key: "visible", label: "Visible mark" },
];

const PLATFORM_COLUMNS: { key: keyof PlatformFacts; label: string }[] = [
  { key: "labelName", label: "Label shown" },
  { key: "readsC2pa", label: "Reads C2PA" },
  { key: "readsIptc", label: "Reads IPTC" },
  { key: "ownDetection", label: "Own detection" },
  { key: "keepsMetadata", label: "Keeps metadata after upload" },
];

const STATUS_RANK: LayerStatus[] = ["no", "unknown", "announced", "varies", "yes"];

function columnStatus(layers: LayerRow[] | undefined, key: LayerKey): LayerStatus | undefined {
  const keys: LayerKey[] = key === "metadata" ? ["metadata", "text", "exif"] : [key];
  const statuses = (layers ?? []).filter((row) => row.key && keys.includes(row.key)).map((row) => row.status);
  if (!statuses.length) return undefined;
  return statuses.sort((a, b) => STATUS_RANK.indexOf(b) - STATUS_RANK.indexOf(a))[0];
}

function StatusCell({ status }: { status?: LayerStatus }) {
  if (!status) return <span className="text-muted-foreground/60">–</span>;
  return <span className={STATUS_CLASS[status]}>{STATUS_TEXT[status]}</span>;
}

export default function HubPage({ hubKey }: { hubKey: HubKey }) {
  const hub = HUBS[hubKey];
  const pages = landingPages.filter((p) => p.hub === hubKey);

  usePageMeta({
    title: hub.title,
    description: hub.description,
    canonical: hub.path,
    jsonLd: [
      {
        "@type": "CollectionPage",
        url: absoluteUrl(hub.path),
        name: hub.title,
        description: hub.description,
        dateModified: CONTENT_REVIEWED_ISO,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
        hasPart: pages.map((p) => ({ "@type": "WebPage", name: p.h1, url: absoluteUrl(`/${p.slug}`) })),
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: hub.name, path: hub.path },
      ]),
      faqJsonLd(hub.faqs),
    ],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader breadcrumb={hub.name} />
      <main>
        <section className="border-b border-border/50 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.08),transparent_55%)]">
          <div className="container pt-28 pb-12 md:pt-32">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-mono-custom uppercase tracking-[0.18em] text-cyan">
                {hub.eyebrow}
              </p>
              <h1 className="font-display text-4xl font-black leading-tight text-foreground md:text-5xl">{hub.h1}</h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{hub.intro}</p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarCheck className="w-3.5 h-3.5 text-cyan" /> Reviewed{" "}
                <time dateTime={CONTENT_REVIEWED_ISO}>{CONTENT_REVIEWED_LABEL}</time>
              </p>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{hub.tableTitle}</h2>
          <p className="text-muted-foreground max-w-3xl mb-6 leading-relaxed">{hub.tableIntro}</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="p-4 font-display font-semibold text-foreground">{hubKey === "generators" ? "Generator" : "Platform"}</th>
                  {(hubKey === "generators" ? GENERATOR_COLUMNS : PLATFORM_COLUMNS).map((col) => (
                    <th key={col.key} className="p-4 font-display font-semibold text-foreground">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.slug} className="border-b border-border/50 last:border-b-0 align-top">
                    <td className="p-4">
                      <Link href={`/${p.slug}`} className="font-medium text-cyan hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    {hubKey === "generators"
                      ? GENERATOR_COLUMNS.map((col) => (
                          <td key={col.key} className="p-4">
                            <StatusCell status={columnStatus(p.layers, col.key)} />
                          </td>
                        ))
                      : PLATFORM_COLUMNS.map((col) => {
                          const value = p.platform?.[col.key];
                          return (
                            <td key={col.key} className="p-4 text-muted-foreground">
                              {col.key === "labelName" || col.key === "ownDetection" ? (
                                <span className="text-foreground">{value as string}</span>
                              ) : (
                                <StatusCell status={value as LayerStatus} />
                              )}
                            </td>
                          );
                        })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{hub.tableNote}</p>
        </section>

        <section className="container py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="group rounded-xl border border-border bg-card/40 p-5 hover:border-cyan/30 transition-colors"
              >
                <p className="font-display font-semibold text-foreground group-hover:text-cyan">{p.h1}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-cyan">
                  Read and clean <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="container py-12 space-y-10 max-w-3xl">
          {hub.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">{section.heading}</h2>
              <div className="space-y-4 text-base leading-8 text-muted-foreground">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="container py-10">
          <RemovalScope title="What a metadata cleaner can and cannot change" />
        </section>

        <section className="container max-w-3xl py-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CircleHelp className="w-6 h-6 text-cyan" /> Questions
          </h2>
          <div className="space-y-4">
            {hub.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border/60 bg-card/30 p-5">
                <h3 className="font-display text-base font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {hub.sources.length > 0 && (
          <section className="container max-w-3xl pb-16">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Sources</h2>
            <ul className="space-y-1.5 text-sm">
              {hub.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-muted-foreground hover:text-cyan">
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
