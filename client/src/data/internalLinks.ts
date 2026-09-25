/** Resolve internal paths to human labels for "Related" lists. */
import { HUBS, landingPages } from "@/data/landingPages";
import { blogPosts } from "@/data/blogPosts";

const TOOLS: Record<string, string> = {
  "/": "AI Metadata Remover",
  "/exif-viewer": "EXIF Viewer: inspect metadata locally",
  "/image-diff": "Image Diff: compare original and cleaned files",
  "/blog": "All guides",
};

export function getInternalLink(path: string): { path: string; label: string } | null {
  if (TOOLS[path]) return { path, label: TOOLS[path] };
  const hub = Object.values(HUBS).find((h) => h.path === path);
  if (hub) return { path, label: hub.h1 };
  const landing = landingPages.find((p) => `/${p.slug}` === path);
  if (landing) return { path, label: landing.h1 };
  const post = blogPosts.find((p) => `/blog/${p.slug}` === path);
  if (post) return { path, label: post.title };
  return null;
}
