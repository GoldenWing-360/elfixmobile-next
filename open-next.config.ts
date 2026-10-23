import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// The site is fully prerendered (generateStaticParams, no ISR). Serve the
// prerendered pages from the Workers static assets instead of rendering
// every request inside the Worker.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
