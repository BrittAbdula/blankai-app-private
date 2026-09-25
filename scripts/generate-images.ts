/**
 * Generate self-hosted brand images with headless Chrome:
 *   client/public/images/og-blankai.png          1200×630 default social image
 *   client/public/images/icon-192.png / icon-512.png / apple-touch-icon.png
 *   client/public/images/blog/<slug>.webp          1200×630 blog covers
 *
 * Run: pnpm run images   (re-run after adding or renaming blog posts)
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import puppeteer, { type Page } from "puppeteer-core";
import { blogPosts } from "../client/src/data/blogPosts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "client/public/images");

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    path.join(os.homedir(), ".cache/puppeteer/chrome/mac_arm-121.0.6167.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
  ].filter(Boolean) as string[];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const EYE_OFF = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 10C10 10 6 16 6 16C6 16 10 22 16 22C22 22 26 16 26 16C26 16 22 10 16 10Z" stroke="#0A0F1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="16" cy="16" r="3" fill="#0A0F1E"/>
  <line x1="8" y1="8" x2="24" y2="24" stroke="#0A0F1E" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=block');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0A0F1E; color: #F1F5F9;
         font-family: Inter, 'Helvetica Neue', Arial, sans-serif; }
  .frame { position: relative; width: 1200px; height: 630px; padding: 64px 72px;
           background:
             radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.20), transparent 55%),
             radial-gradient(ellipse at 100% 100%, rgba(56,189,248,0.10), transparent 50%),
             #0A0F1E; }
  .grid { position: absolute; inset: 0; opacity: 0.07;
          background-image: linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px);
          background-size: 48px 48px; }
  .brand { position: relative; display: flex; align-items: center; gap: 14px; }
  .logo { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg,#00D4FF,#0099CC);
          display: flex; align-items: center; justify-content: center; }
  .logo svg { width: 40px; height: 40px; }
  .wordmark { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 34px; letter-spacing: -0.5px; }
  .wordmark span { color: #00D4FF; }
  .eyebrow { position: relative; margin-top: 56px; font-family: 'JetBrains Mono', monospace; font-size: 22px;
             letter-spacing: 3px; text-transform: uppercase; color: #00D4FF; }
  h1 { position: relative; margin-top: 18px; font-family: 'Space Grotesk', sans-serif; font-weight: 700;
       line-height: 1.08; letter-spacing: -1.5px; max-width: 1020px; }
  p.sub { position: relative; margin-top: 22px; font-size: 28px; color: #94A3B8; max-width: 960px; line-height: 1.4; }
  .chips { position: absolute; left: 72px; bottom: 60px; display: flex; gap: 12px; }
  .chip { font-family: 'JetBrains Mono', monospace; font-size: 20px; padding: 8px 16px; border-radius: 10px;
          border: 1px solid rgba(0,212,255,0.35); color: #BAE6FD; background: rgba(0,212,255,0.08); }
  .url { position: absolute; right: 72px; bottom: 66px; font-family: 'JetBrains Mono', monospace; font-size: 22px; color: #64748B; }
`;

function cardHtml(opts: { eyebrow: string; title: string; sub?: string; chips?: string[]; titleSize: number }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>
  <div class="frame"><div class="grid"></div>
    <div class="brand"><div class="logo">${EYE_OFF}</div><div class="wordmark">blank<span>AI</span></div></div>
    <div class="eyebrow">${escapeHtml(opts.eyebrow)}</div>
    <h1 style="font-size:${opts.titleSize}px">${escapeHtml(opts.title)}</h1>
    ${opts.sub ? `<p class="sub">${escapeHtml(opts.sub)}</p>` : ""}
    ${opts.chips ? `<div class="chips">${opts.chips.map((c) => `<div class="chip">${escapeHtml(c)}</div>`).join("")}</div>` : ""}
    <div class="url">blankai.app</div>
  </div></body></html>`;
}

function iconHtml(size: number, rounded: boolean) {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  return `<!doctype html><html><head><style>
    * { margin:0; padding:0; } body { width:${size}px; height:${size}px; overflow:hidden; background:#0A0F1E; }
    .i { width:${size}px; height:${size}px; border-radius:${radius}px; background: linear-gradient(135deg,#00D4FF,#0099CC);
         display:flex; align-items:center; justify-content:center; }
    .i svg { width:${Math.round(size * 0.72)}px; height:${Math.round(size * 0.72)}px; }
  </style></head><body><div class="i">${EYE_OFF}</div></body></html>`;
}

async function shoot(page: Page, html: string, file: string, size: { width: number; height: number }, type: "png" | "webp") {
  await page.setViewport({ ...size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file as `${string}.png`, type, quality: type === "webp" ? 88 : undefined });
  console.log(`wrote ${path.relative(ROOT, file)}`);
}

async function main() {
  await mkdir(path.join(OUT, "blog"), { recursive: true });
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await shoot(
      page,
      cardHtml({
        eyebrow: "Free · In your browser · No upload",
        title: "AI Metadata Remover",
        sub: "Inspect, clean and verify what your images reveal: GPS, EXIF, C2PA Content Credentials and AI prompts.",
        chips: ["EXIF", "GPS", "XMP", "IPTC", "C2PA", "PNG text"],
        titleSize: 88,
      }),
      path.join(OUT, "og-blankai.png"),
      { width: 1200, height: 630 },
      "png",
    );
    for (const [size, name, rounded] of [
      [512, "icon-512.png", false],
      [192, "icon-192.png", true],
      [180, "apple-touch-icon.png", false],
    ] as const) {
      await shoot(page, iconHtml(size, rounded), path.join(OUT, name), { width: size, height: size }, "png");
    }
    for (const post of blogPosts) {
      const titleSize = post.title.length > 60 ? 58 : post.title.length > 42 ? 66 : 76;
      await shoot(
        page,
        cardHtml({ eyebrow: post.category, title: post.title, titleSize }),
        path.join(OUT, "blog", `${post.slug}.webp`),
        { width: 1200, height: 630 },
        "webp",
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
