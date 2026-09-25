/**
 * usePageMeta: sets title, description, canonical, robots, Open Graph,
 * Twitter tags and page JSON-LD for the current route.
 *
 * The prerender step (scripts/prerender.mjs) captures the result into static
 * HTML, so every URL ships its own head tags without waiting for JavaScript.
 */
import { useEffect } from "react";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/site";

type JsonLd = Record<string, unknown>;

interface PageMetaOptions {
  title: string;
  description: string;
  /** Absolute URL or site path such as "/exif-viewer". */
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  /** Defaults to indexable. Use "noindex, follow" for 404 pages. */
  robots?: string;
  /** One or more schema.org nodes. They are wrapped in a single @graph. */
  jsonLd?: JsonLd | JsonLd[];
}

const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const JSONLD_ID = "page-jsonld";

export function usePageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  robots = DEFAULT_ROBOTS,
  jsonLd,
}: PageMetaOptions) {
  const jsonLdText = jsonLd
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@graph": Array.isArray(jsonLd) ? jsonLd : [jsonLd],
      })
    : "";

  useEffect(() => {
    const url = absoluteUrl(canonical);
    const image = ogImage ? absoluteUrl(ogImage) : DEFAULT_OG_IMAGE;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);

    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = url;

    setMeta("property", "og:url", url);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:title", ogTitle ?? title);
    setMeta("property", "og:description", ogDescription ?? description);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:title", ogTitle ?? title);
    setMeta("name", "twitter:description", ogDescription ?? description);
    setMeta("name", "twitter:image", image);

    let script = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
    if (jsonLdText) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = JSONLD_ID;
        document.head.appendChild(script);
      }
      script.textContent = jsonLdText;
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, ogType, robots, jsonLdText]);
}

function setMeta(attrName: "name" | "property", attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
