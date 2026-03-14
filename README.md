# BlankAI

BlankAI is an open-source image metadata cleaner focused on privacy-first, browser-only processing.

- No uploads
- No server-side image processing
- Canvas redraw pipeline that strips embedded metadata by creating a fresh image
- Cloudflare Pages friendly deployment

Repository: [BrittAbdula/blankai-app](https://github.com/BrittAbdula/blankai-app)

## Features

- Remove metadata from images directly in the browser
- EXIF viewer for inspecting image metadata before cleaning
- Image diff page for visually comparing original and processed output
- Batch processing with ZIP download in the web app
- HEIC/HEIF input support via client-side conversion
- Privacy/legal pages and blog routes included

## Supported Formats

- Cleaner input: JPG, JPEG, PNG, WEBP, HEIC, HEIF
- Metadata inspection: JPEG, PNG, WEBP, HEIC, HEIF, AVIF, TIFF
- Cleaner output: re-encoded JPEG generated from a fresh canvas render

## How It Works

1. The browser reads the selected image locally.
2. BlankAI can inspect metadata with `exifr` for the viewer flow.
3. The cleaner redraws the image onto an HTML canvas.
4. Canvas export produces a new file without the original EXIF, XMP, IPTC, C2PA, or PNG text chunks.
5. The user downloads the processed image without any upload to a server.

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
- `pnpm run build` creates the production build and bundles the small Node server
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

`cf:deploy` publishes `dist/public` to the `blankai-app` Pages project.

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
- `/blog` blog index
- `/privacy` privacy policy
- `/terms` terms of service

## Open Source

BlankAI is distributed under the MIT license. If you want to self-host, fork, or contribute, start with the GitHub repository:

[https://github.com/BrittAbdula/blankai-app](https://github.com/BrittAbdula/blankai-app)

The extension build has its own notes in [`extension/README.md`](./extension/README.md).
