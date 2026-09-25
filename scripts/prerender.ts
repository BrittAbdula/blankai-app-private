/**
 * Prerender every route of the SPA into static HTML.
 *
 * Runs after `vite build`. It serves dist/public locally, opens each route in
 * headless Chrome, lets React render (including usePageMeta head tags and
 * JSON-LD), and writes the resulting DOM to dist/public/<route>.html.
 * Cloudflare Pages serves /route from route.html, so crawlers and AI bots get
 * the full page, the right <title>, canonical and H1 without running JS.
 *
 * It also writes sitemap.xml, llms.txt and 404.html, and fails the build when
 * a page is missing its H1, has the wrong canonical, or duplicates a title.
 *
 * Chrome: set CHROME_PATH, or it tries the usual macOS/Linux install paths.
 */
import { createServer, type Server } from "node:http";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { HUBS, landingPages } from "../client/src/data/landingPages";
import { blogPosts } from "../client/src/data/blogPosts";
import { CONTENT_REVIEWED_ISO } from "../client/src/lib/site";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist/public");
const SITE = "https://blankai.app";

interface RouteSpec {
  path: string;
  out: string;
  lastmod: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: number;
  sitemap: boolean;
  noindex?: boolean;
}

function outFile(routePath: string): string {
  if (routePath === "/") return "index.html";
  return `${routePath.replace(/^\//, "")}.html`;
}

function buildRoutes(): RouteSpec[] {
  const r = (
    p: string,
    priority: number,
    changefreq: RouteSpec["changefreq"] = "monthly",
    lastmod = CONTENT_REVIEWED_ISO,
  ): RouteSpec => ({ path: p, out: outFile(p), lastmod, changefreq, priority, sitemap: true });

  const routes: RouteSpec[] = [
    r("/", 1.0, "weekly"),
    r("/exif-viewer", 0.8),
    r("/image-diff", 0.7),
    ...Object.values(HUBS).map((hub) => r(hub.path, 0.8)),
    ...landingPages.map((page) => r(`/${page.slug}`, page.kind === "core" ? 0.9 : 0.8)),
    r("/blog", 0.7, "weekly"),
    ...blogPosts.map((post) => r(`/blog/${post.slug}`, 0.6, "monthly", post.dateModifiedISO ?? post.dateISO)),
    r("/privacy", 0.2, "yearly", "2026-09-25"),
    r("/terms", 0.2, "yearly", "2026-09-25"),
  ];
  routes.push({ path: "/404", out: "404.html", lastmod: CONTENT_REVIEWED_ISO, changefreq: "yearly", priority: 0, sitemap: false, noindex: true });
  return routes;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
};

async function serve(template: string): Promise<{ server: Server; port: number }> {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const filePath = path.join(DIST, decodeURIComponent(url.pathname));
    const ext = path.extname(filePath);
    if (ext && filePath.startsWith(DIST) && existsSync(filePath)) {
      res.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream" });
      res.end(await readFile(filePath));
      return;
    }
    // Every page route renders from the untouched SPA template.
    res.writeHead(200, { "content-type": MIME[".html"] });
    res.end(template);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("server failed to start");
  return { server, port: address.port };
}

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    path.join(os.homedir(), ".cache/puppeteer/chrome/mac_arm-121.0.6167.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
  ].filter(Boolean) as string[];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.");
  return found;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sitemapXml(routes: RouteSpec[]): string {
  const urls = routes
    .filter((route) => route.sitemap)
    .map(
      (route) => `  <url>
    <loc>${xmlEscape(route.path === "/" ? `${SITE}/` : `${SITE}${route.path}`)}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function llmsTxt(): string {
  const lines: string[] = [
    "# BlankAI",
    "",
    "> BlankAI is a free, browser-only tool to inspect, clean and verify image metadata. It removes EXIF, GPS, XMP, IPTC, C2PA Content Credentials and PNG text chunks from JPG, PNG, WebP, AVIF and HEIC files without uploading them, then re-scans the output to confirm nothing carried over.",
    "",
    "Important limits, stated plainly:",
    "- BlankAI removes file metadata only. It does not remove invisible pixel watermarks such as Google's SynthID (used by Google, OpenAI and Apple), Meta's watermark, or visible logos.",
    "- Removing metadata does not change a platform's disclosure rules for AI-generated content.",
    "- Some generators' terms and some laws (for example China's AI labeling measures) prohibit removing AI labels from generated content. Users are responsible for how they use cleaned files.",
    "",
    "## Tools",
    "",
    `- [AI Metadata Remover](${SITE}/): Remove EXIF, GPS, XMP, IPTC, C2PA and PNG text metadata in the browser, with an output re-scan.`,
    `- [EXIF Viewer](${SITE}/exif-viewer): Inspect GPS, camera, AI generation and provenance fields locally.`,
    `- [Image Diff](${SITE}/image-diff): Compare an original and a cleaned image pixel by pixel.`,
    "",
    "## Guides by AI generator",
    "",
    `- [${HUBS.generators.h1}](${SITE}${HUBS.generators.path}): ${HUBS.generators.description}`,
    ...landingPages.filter((p) => p.kind === "generator").map((p) => `- [${p.h1}](${SITE}/${p.slug}): ${p.description}`),
    "",
    "## Guides by platform",
    "",
    `- [${HUBS.platforms.h1}](${SITE}${HUBS.platforms.path}): ${HUBS.platforms.description}`,
    ...landingPages.filter((p) => p.kind === "platform").map((p) => `- [${p.h1}](${SITE}/${p.slug}): ${p.description}`),
    "",
    "## Guides by format and task",
    "",
    ...landingPages.filter((p) => p.kind === "core" || p.kind === "format").map((p) => `- [${p.h1}](${SITE}/${p.slug}): ${p.description}`),
    "",
    "## Articles",
    "",
    ...blogPosts.map((post) => `- [${post.title}](${SITE}/blog/${post.slug}): ${post.description}`),
    "",
    "## Contact",
    "",
    "- Support: mailto:support@blankai.app",
    `- Privacy policy: ${SITE}/privacy`,
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const templatePath = path.join(DIST, "index.html");
  const template = await readFile(templatePath, "utf8");
  if (template.includes('data-prerendered="true"')) {
    throw new Error("dist/public/index.html is already prerendered. Run `vite build` first.");
  }

  const routes = buildRoutes();
  const { server, port } = await serve(template);
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const errors: string[] = [];
  const warnings: string[] = [];
  const titles = new Map<string, string>();

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = request.url();
        if (url.startsWith(`http://127.0.0.1:${port}`) || url.startsWith("data:") || url.startsWith("blob:")) {
          void request.continue();
        } else {
          void request.abort();
        }
      });
      const consoleErrors: string[] = [];
      page.on("pageerror", (error) => consoleErrors.push(String(error)));

      await page.goto(`http://127.0.0.1:${port}${route.path}`, { waitUntil: "networkidle0", timeout: 60_000 });
      await page.waitForSelector("h1", { timeout: 15_000 }).catch(() => undefined);

      // Scroll through the page so in-view animations and counters settle.
      await page.evaluate(async () => {
        const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 400));
      });

      const info = await page.evaluate(() => ({
        title: document.title,
        canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? "",
        robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? "",
        description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "",
        h1Count: document.querySelectorAll("h1").length,
        h1: document.querySelector("h1")?.textContent?.trim() ?? "",
      }));

      await page.evaluate(() => {
        document.documentElement.setAttribute("data-prerendered", "true");
      });
      const html = `<!doctype html>\n${await page.evaluate(() => document.documentElement.outerHTML)}`;
      await page.close();

      const expectedCanonical = route.path === "/" ? `${SITE}/` : `${SITE}${route.path}`;
      if (route.noindex) {
        if (!/noindex/.test(info.robots)) errors.push(`${route.path}: expected noindex robots, got "${info.robots}"`);
      } else {
        if (info.canonical !== expectedCanonical) errors.push(`${route.path}: canonical ${info.canonical} != ${expectedCanonical}`);
        if (titles.has(info.title)) errors.push(`${route.path}: duplicate title with ${titles.get(info.title)}: "${info.title}"`);
        titles.set(info.title, route.path);
        if (info.description.length < 70 || info.description.length > 170) {
          warnings.push(`${route.path}: description length ${info.description.length}`);
        }
        if (info.title.length > 70) warnings.push(`${route.path}: title length ${info.title.length}`);
      }
      if (info.h1Count !== 1) errors.push(`${route.path}: expected 1 <h1>, found ${info.h1Count}`);
      if (consoleErrors.length) errors.push(`${route.path}: page errors: ${consoleErrors.join(" | ")}`);

      const target = path.join(DIST, route.out);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html);
      console.log(`prerendered ${route.path.padEnd(52)} → ${route.out}  (${Math.round(html.length / 1024)} KB) ${info.h1.slice(0, 50)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  await writeFile(path.join(DIST, "sitemap.xml"), sitemapXml(routes));
  await writeFile(path.join(DIST, "llms.txt"), llmsTxt());
  console.log(`sitemap.xml: ${routes.filter((route) => route.sitemap).length} URLs`);

  for (const warning of warnings) console.warn(`warn: ${warning}`);
  if (errors.length) {
    for (const error of errors) console.error(`error: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
