/** Site-wide constants and JSON-LD helpers. */

export const SITE_URL = "https://blankai.app";
export const SITE_NAME = "BlankAI";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-blankai.png`;
export const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/blankai/bkodmfkejebfejdiochiihcmddbldipd";
export const REPO_URL = "https://github.com/BrittAbdula/blankai-app";
export const SUPPORT_EMAIL = "support@blankai.app";

/** Date the landing pages and refreshed guides were last reviewed. */
export const CONTENT_REVIEWED_ISO = "2026-09-25";
export const CONTENT_REVIEWED_LABEL = "September 25, 2026";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type Json = Record<string, unknown>;

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function webAppJsonLd(opts: { name: string; path: string; description: string }): Json {
  return {
    "@type": "WebApplication",
    name: opts.name,
    url: absoluteUrl(opts.path),
    description: opts.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in the browser)",
    browserRequirements: "Requires JavaScript and HTML5 canvas",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}
