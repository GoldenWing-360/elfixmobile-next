import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// While the rebuild lives on a test domain (bersaev.com) we want to keep
// Google away from it — otherwise the test version competes with the
// production WordPress site for the same queries. Once we cutover to the
// real elfixmobile.at, flip TEST_DOMAIN_MODE off (or just unset
// NEXT_PUBLIC_SITE_URL and the seo defaults pick the prod domain).
const TEST_DOMAIN_HOSTS = ["bersaev.com", "www.bersaev.com"];

function isTestDomain(): boolean {
  try {
    const host = new URL(SITE.url).host;
    return TEST_DOMAIN_HOSTS.includes(host);
  } catch {
    return false;
  }
}

export default function robots(): MetadataRoute.Robots {
  if (isTestDomain()) {
    // Hard block on the test domain so it never enters the Google index.
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      // AI/answer-engine crawlers are explicitly welcome: being cited in
      // ChatGPT/Claude/Perplexity answers is a customer-acquisition
      // channel for a local business, not a content-theft concern.
      // /llms.txt gives them a structured summary.
      ...["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "CCBot"].map(
        (bot) => ({
          userAgent: bot,
          allow: "/",
          disallow: ["/api/"],
        }),
      ),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
