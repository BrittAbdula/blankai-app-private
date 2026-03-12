/**
 * usePageMeta — Dynamically sets canonical URL, og:url, page title, and meta description
 * for each page to ensure correct SEO signals on every route.
 *
 * Usage:
 *   usePageMeta({
 *     title: "Image Diff Tool | BlankAI",
 *     description: "Compare images pixel-by-pixel...",
 *     canonical: "https://blankai.app/image-diff",
 *   });
 */
import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function usePageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
}: PageMetaOptions) {
  useEffect(() => {
    // --- Title ---
    document.title = title;

    // --- Meta description ---
    setMeta("name", "description", description);

    // --- Canonical ---
    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical;

    // --- og:url ---
    setMeta("property", "og:url", canonical);

    // --- og:title ---
    if (ogTitle) setMeta("property", "og:title", ogTitle);

    // --- og:description ---
    if (ogDescription) setMeta("property", "og:description", ogDescription);

    // --- og:image ---
    if (ogImage) setMeta("property", "og:image", ogImage);

    // --- twitter:title ---
    if (ogTitle) setMeta("name", "twitter:title", ogTitle);

    // --- twitter:description ---
    if (ogDescription) setMeta("name", "twitter:description", ogDescription);

    // Cleanup: restore homepage defaults when unmounting
    return () => {
      document.title =
        "BlankAI — Remove AI Metadata & Make Images Undetectable | Free AI Pixel Remover";
      setMeta(
        "name",
        "description",
        "Free AI metadata remover. Strip EXIF, C2PA & AI pixel fingerprints from images instantly. Make AI images undetectable — 100% browser-based, zero uploads."
      );
      const el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (el) el.href = "https://blankai.app/";
      setMeta("property", "og:url", "https://blankai.app/");
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage]);
}

// Helper to find or create a meta tag and set its content
function setMeta(attrName: "name" | "property", attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
