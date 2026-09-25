# BlankAI

BlankAI is an image metadata cleaner focused on privacy-first, browser-only processing.

- No uploads
- No server-side image processing
- Canvas redraw pipeline that strips embedded metadata by creating a fresh image
- Cloudflare Pages friendly deployment

Repository: [BrittAbdula/blankai-app](https://github.com/BrittAbdula/blankai-app)

## Features

- Scan images for metadata containers (EXIF, GPS, XMP, IPTC, C2PA manifests, PNG text chunks, China's AIGC label) by walking the real file structure
- Remove that metadata in the browser and re-scan every output to verify nothing carried over
- Keep the original format by default (PNG stays lossless with transparency, WebP stays WebP), or choose JPEG/PNG/WebP and quality
- EXIF Viewer for inspecting and editing metadata, with the same provenance scan
- Image Diff for comparing original and processed output
- Batch processing (up to 20 images) with ZIP download
- HEIC/HEIF input via client-side conversion
- Generator, platform and format landing pages plus a blog, all prerendered to static HTML

## What it does not do

- It does not remove invisible watermarks such as SynthID, Meta's Content Seal or DWT-DCT watermarks. They are part of the pixels.
- It does not remove visible watermarks.
- It does not change platform disclosure rules for AI content.

## Supported Formats

- Input: JPG, JPEG, PNG, WEBP, AVIF, HEIC, HEIF
- Output: same as input where the browser can encode it; HEIC and AVIF become JPEG (PNG if transparent); Safari returns PNG for WebP

## How It Works

1. The browser reads the selected image locally.
2. `client/src/lib/metadataScan.ts` lists the metadata containers in the file.
3. The image is decoded (HEIC via heic2any) and drawn onto a canvas.
4. The canvas is encoded into a fresh file, which contains pixels only.
5. The output is scanned again and the report shows what was removed and whether anything remains.

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS 4
- Wouter
- `exifr` for metadata inspection
- `heic2any` for client-side HEIC conversion
- `jszip` for multi-file ZIP export
- Express for the optional Node static server
- Cloudflare Pages for static hosting

## Local Development

```bash
pnpm install
pnpm run dev
```

Useful commands:

- `pnpm run dev` starts the Vite dev server
- `pnpm run build` builds the client, prerenders every route, and bundles the small Node server
- `pnpm run prerender` prerenders routes into `dist/public/<route>.html` and writes `sitemap.xml` and `llms.txt` (needs Chrome; set `CHROME_PATH` if it is not in the default location)
- `pnpm run images` regenerates the OG image, icons and blog covers in `client/public/images`
- `pnpm run preview` previews the Vite client locally
- `pnpm run start` serves the built app through `server/index.ts`
- `pnpm run check` runs TypeScript checks
- `pnpm run format` runs Prettier

## Cloudflare Deployment

The repository already includes [`wrangler.jsonc`](./wrangler.jsonc) for Cloudflare Pages.

```bash
pnpm run cf:build
pnpm run cf:deploy
```

`cf:build` runs `vite build` and the prerender step. `cf:deploy` publishes `dist/public` to the `blankai-app` Pages project on the `main` (production) branch.

Routing: each route is a static `<route>.html` file, which Cloudflare Pages serves at `/<route>`. Unknown URLs return `404.html` with a real 404 status. Landing page content lives in `client/src/data/landingPages.ts`; blog posts in `client/src/data/blogPosts.ts`. New entries are routed, prerendered and added to the sitemap automatically.

## Environment Variables

All environment variables are optional unless you are enabling a related integration.

- `VITE_ANALYTICS_ENDPOINT` Umami-compatible analytics endpoint
- `VITE_ANALYTICS_WEBSITE_ID` analytics website id
- `VITE_OAUTH_PORTAL_URL` auth portal URL used by some legacy UI paths
- `VITE_APP_ID` app identifier for external integrations
- `VITE_FRONTEND_FORGE_API_KEY` optional external API key
- `VITE_FRONTEND_FORGE_API_URL` optional external API base URL

## Project Structure

```text
client/
  public/              Static assets and Cloudflare redirects
  src/
    components/        Shared UI sections
    lib/               Image processing and metadata utilities
    pages/             Route-level pages
server/
  index.ts             Optional Express static server for Node hosting
extension/
  README.md            Browser extension build notes
wrangler.jsonc         Cloudflare Pages configuration
vite.config.ts         Main Vite config
```

## Key Routes

- `/` main metadata remover
- `/exif-viewer` metadata inspection tool
- `/image-diff` original vs processed comparison
- `/ai-generator-metadata` and `/platform-ai-labels` comparison hubs
- `/remove-metadata-from-*`, `/*-label`, `/heic-to-jpg` and similar landing pages (see `landingPages.ts`)
- `/blog` blog index
- `/privacy` privacy policy
- `/terms` terms of service

## Repository

This release is available as an open-source GitHub repository at the link above.

The extension build has its own notes in [`extension/README.md`](./extension/README.md).
