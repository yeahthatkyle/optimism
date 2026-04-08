/**
 * Cloudflare Worker: SEO, Meta Injection & Subdomain Proxy for optimismbh.com
 *
 * 1. Serves /llms.txt  — LLM-friendly site summary for AI-powered search
 * 2. Serves /robots.txt — updated to allow LLM indexing crawlers
 * 3. Injects <title>, <meta>, Open Graph, Twitter Card, JSON-LD, and
 *    canonical tags into every HTML response from the Lovable app,
 *    making all pages crawlable without touching the React source.
 * 4. Routes subdomain traffic to the correct path on the Lovable app:
 *      crm.optimismbh.com   →  optimismbh.com/crm
 *      brand.optimismbh.com →  optimismbh.com/brand
 */

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const MAIN_DOMAIN = "optimisim.lovable.app";
const SITE_URL = "https://optimismbh.com";
const SITE_NAME = "Optimism";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const SUBDOMAIN_MAP = {
  "crm.optimismbh.com": "/crm",
  "brand.optimismbh.com": "/brand",
};

// ─── PER-PAGE META DATA ───────────────────────────────────────────────────────

const PAGE_META = {
  "/": {
    title: "Optimism | Independent Creative Agency | San Francisco",
    description:
      "Optimism is an independent creative advertising agency in San Francisco. We build brands that resonate, campaigns that perform, and ideas that last. Formerly Barrett Hofherr.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Optimism",
      alternateName: "Barrett Hofherr",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description:
        "Independent creative advertising agency in San Francisco, CA.",
      foundingDate: "2010",
      address: {
        "@type": "PostalAddress",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        addressCountry: "US",
      },
      sameAs: [
        "https://www.linkedin.com/company/optimismbh",
        "https://www.instagram.com/optimismbh",
      ],
    },
  },
  "/about": {
    title: "About | Optimism Creative Agency",
    description:
      "Meet Optimism — an independent creative advertising agency founded on the belief that great work comes from optimistic thinking. Formerly Barrett Hofherr, reborn with a new name.",
  },
  "/work": {
    title: "Our Work | Optimism Creative Agency",
    description:
      "Case studies and campaigns from Optimism. Work for Habit Burger Grill, Golden State Warriors, DoorDash, Walmart, Marvel, Chime, eBay, and more.",
  },
  "/capabilities": {
    title: "Capabilities | Optimism Creative Agency",
    description:
      "Full-service creative agency capabilities: brand strategy, advertising, integrated production, media planning & buying, design, and data analytics.",
  },
  "/insights": {
    title: "Insights | Optimism Creative Agency",
    description:
      "Thinking on brand strategy, advertising, and culture from the team at Optimism.",
  },
  "/people": {
    title: "Our Team | Optimism Creative Agency",
    description:
      "Meet the team at Optimism — strategists, creatives, producers, and media experts building brands that last.",
  },
  "/terms": {
    title: "Terms of Use | Optimism",
    description: "Terms of use for optimismbh.com.",
  },
  "/privacy": {
    title: "Privacy Policy | Optimism",
    description: "Privacy policy for optimismbh.com.",
  },

  // — Capabilities —
  "/capabilities/brand-strategy": {
    title: "Brand Strategy | Optimism Creative Agency",
    description:
      "We build brands with purpose and clarity. Optimism's brand strategy practice helps companies find their voice, define their positioning, and grow with conviction.",
  },
  "/capabilities/advertising": {
    title: "Advertising | Optimism Creative Agency",
    description:
      "Campaigns that break through. Optimism creates advertising that earns attention and drives results — TV, digital, OOH, social, and beyond.",
  },
  "/capabilities/media-planning-buying": {
    title: "Media Planning & Buying | Optimism Creative Agency",
    description:
      "Smart media that amplifies great creative. Optimism plans and buys media across all channels to reach the right audiences at the right moment.",
  },
  "/capabilities/integrated-production": {
    title: "Integrated Production | Optimism Creative Agency",
    description:
      "From concept to delivery. Optimism's production team brings campaigns to life across video, photo, digital, and experiential formats.",
  },
  "/capabilities/design": {
    title: "Design | Optimism Creative Agency",
    description:
      "Visual storytelling at every scale. Optimism's design practice spans brand identity, campaigns, digital experiences, and environmental design.",
  },
  "/capabilities/data-analytics": {
    title: "Data & Analytics | Optimism Creative Agency",
    description:
      "Insights that fuel better work. Optimism uses data and analytics to inform strategy, optimize campaigns, and measure what matters.",
  },

  // — Team —
  "/matt-hofherr": {
    title: "Matt Hofherr | Founding Partner | Optimism",
    description:
      "Matt Hofherr is a Founding Partner at Optimism (formerly Barrett Hofherr), an independent creative advertising agency in San Francisco.",
  },
  "/jamie-barrett": {
    title: "Jamie Barrett | Partner | Optimism",
    description:
      "Jamie Barrett is a Partner at Optimism, the San Francisco independent creative advertising agency.",
  },
  "/kevin-albrecht": {
    title: "Kevin Albrecht | Strategist of the Year | Optimism",
    description:
      "Kevin Albrecht is a strategist at Optimism and was named Strategist of the Year. He leads brand strategy at the agency.",
  },
  "/kyle-duford": {
    title: "Kyle Duford | Associate Partner | Optimism",
    description:
      "Kyle Duford is Associate Partner and Director of Client Strategy Services at Optimism.",
  },
  "/conor-duignan": {
    title: "Conor Duignan | Optimism",
    description:
      "Conor Duignan is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },
  "/brad-kamal": {
    title: "Brad Kamal | Optimism",
    description:
      "Brad Kamal is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },
  "/charlotte-dugoni": {
    title: "Charlotte Dugoni | Optimism",
    description:
      "Charlotte Dugoni is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },
  "/stephanie-farmas": {
    title: "Stephanie Farmas | Optimism",
    description:
      "Stephanie Farmas is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },
  "/ted-bluey": {
    title: "Ted Bluey | Optimism",
    description:
      "Ted Bluey is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },
  "/krista-osol": {
    title: "Krista Osol | Optimism",
    description:
      "Krista Osol is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },
  "/todd-eisner": {
    title: "Todd Eisner | Optimism",
    description:
      "Todd Eisner is a member of the team at Optimism, the San Francisco creative advertising agency.",
  },

  // — Insights —
  "/insights/barrett-hofherr-is-now-optimism": {
    title: "Barrett Hofherr Is Now Optimism | Optimism Insights",
    description:
      "Barrett Hofherr, the San Francisco independent creative agency, has rebranded as Optimism. A new name, the same commitment to ideas that last.",
    ogType: "article",
  },
  "/insights/relevance-vs-resonance": {
    title: "Relevance vs. Resonance | Optimism Insights",
    description:
      "What's the difference between a brand that's relevant and one that resonates? Optimism explores the distinction that separates good brands from great ones.",
    ogType: "article",
  },
  "/insights/8-8-flips-the-script-on-b2b-marketing-with-ai-powered-hero-campaign": {
    title: "8x8 Flips the Script on B2B Marketing with AI | Optimism",
    description:
      "How Optimism and 8x8 used AI-powered creative to relaunch a B2B brand and cut through the noise in a crowded category.",
    ogType: "article",
  },
  "/insights/california-s-burger-wars-heat-up-as-habit-burger-grill-trolls-in-n-out-with-new-billboard": {
    title: "California's Burger Wars: Habit Burger Trolls In-N-Out | Optimism",
    description:
      "Optimism's work for Habit Burger Grill heats up California's burger wars with a cheeky billboard that took direct aim at In-N-Out.",
    ogType: "article",
  },
  "/insights/the-era-of-brand-awareness-is-over": {
    title: "The Era of Brand Awareness Is Over | Optimism Insights",
    description:
      "Brand awareness alone isn't enough anymore. Optimism makes the case for a new metric: brand conviction.",
    ogType: "article",
  },
  "/insights/albrecht-named-strategist-of-the-year": {
    title: "Kevin Albrecht Named Strategist of the Year | Optimism",
    description:
      "Optimism strategist Kevin Albrecht has been named Strategist of the Year, recognized for his work building brands that resonate.",
    ogType: "article",
  },
  "/insights/barrett-hofherr-names-kyle-duford-associate-partner-and-director-of-client-strategy-services": {
    title: "Kyle Duford Named Associate Partner at Optimism",
    description:
      "Barrett Hofherr (now Optimism) has named Kyle Duford Associate Partner and Director of Client Strategy Services.",
    ogType: "article",
  },
  "/insights/it-s-time-for-the-triumphant-return-of-brand": {
    title: "The Triumphant Return of Brand | Optimism Insights",
    description:
      "Performance marketing has dominated for a decade. Optimism argues it's time to bring brand back — and why the best companies never let it go.",
    ogType: "article",
  },

  // — Featured work —
  "/work/habit-burger/fresh-like-that": {
    title: "Habit Burger: Fresh Like That | Optimism",
    description:
      "Fresh Like That — Optimism's campaign for Habit Burger Grill celebrating fresh, never-frozen ingredients.",
  },
  "/work/habit-burger/better-by-char": {
    title: "Habit Burger: Better by Char | Optimism",
    description:
      "Better by Char — Optimism's charbroiler-focused campaign for Habit Burger Grill.",
  },
  "/work/habit-burger/winning-is-a-habit": {
    title: "Habit Burger: Winning Is a Habit | Optimism",
    description:
      "Winning Is a Habit — campaign by Optimism for Habit Burger Grill.",
  },
  "/work/golden-state-warriors/dub-nation": {
    title: "Golden State Warriors: Dub Nation | Optimism",
    description:
      "Dub Nation — Optimism's work for the Golden State Warriors celebrating the Bay Area fanbase.",
  },
  "/work/chime/happy-chime": {
    title: "Chime: Happy Chime | Optimism",
    description:
      "Happy Chime — Optimism's brand campaign for Chime, the fintech challenger bank.",
  },
  "/work/walmart/this-is-that-place": {
    title: "Walmart: This Is That Place | Optimism",
    description:
      "This Is That Place — Optimism's campaign for Walmart celebrating the store as a community hub.",
  },
  "/work/marvel/marvel-case-study": {
    title: "Marvel Case Study | Optimism",
    description:
      "Optimism's work with Marvel — creative advertising that brings the Marvel universe to life.",
  },
  "/work/doordash/cash-after-every-dash": {
    title: "DoorDash: Cash After Every Dash | Optimism",
    description:
      "Cash After Every Dash — Optimism's campaign for DoorDash promoting instant pay for dashers.",
  },
  "/work/ebay/magic-box": {
    title: "eBay: Magic Box | Optimism",
    description:
      "Magic Box — Optimism's campaign capturing the joy and surprise of finding treasure on eBay.",
  },
  "/work/meyer-sound/panther": {
    title: "Meyer Sound: Panther | Optimism",
    description:
      "Panther — Optimism's launch campaign for Meyer Sound's flagship large-scale speaker system.",
  },
  "/work/sutter-health/sutter-never-stops": {
    title: "Sutter Health: Sutter Never Stops | Optimism",
    description:
      "Sutter Never Stops — Optimism's brand campaign for Sutter Health showcasing round-the-clock care.",
  },
};

// ─── CLIENT NAME MAP (for dynamic work page titles) ───────────────────────────

const CLIENT_NAMES = {
  "1000-days": "1000 Days",
  "8x8": "8x8",
  ariat: "Ariat",
  "ars-x-machina": "ARS x Machina",
  asics: "ASICS",
  bachans: "Bachan's",
  "bleacher-report": "Bleacher Report",
  bolla: "Bolla",
  bonafide: "Bonafide",
  "california-coastal-commission": "California Coastal Commission",
  "california-drought-prevention": "California Drought Prevention",
  "campaign-monitor": "Campaign Monitor",
  "cbs-sports-hq": "CBS Sports HQ",
  "childrens-defense-fund": "Children's Defense Fund",
  chime: "Chime",
  coachart: "CoachArt",
  corpay: "Corpay",
  coupa: "Coupa",
  doordash: "DoorDash",
  dxl: "DXL",
  ebay: "eBay",
  "extra-space-storage": "Extra Space Storage",
  freshworks: "Freshworks",
  "friday-beers": "Friday Beers",
  "golden-state-warriors": "Golden State Warriors",
  golfnow: "GolfNow",
  gong: "Gong",
  "grass-roots-farmers-co-op": "Grass Roots Farmers' Co-op",
  "habit-burger": "Habit Burger Grill",
  hoteltonight: "HotelTonight",
  levis: "Levi's",
  lifestraw: "LifeStraw",
  "made-in-a-free-world": "Made In A Free World",
  marvel: "Marvel",
  "meta-prosper": "Meta Prosper",
  "meyer-sound": "Meyer Sound",
  mixt: "Mixt",
  "monster-hunter-now": "Monster Hunter Now",
  "omaha-steaks": "Omaha Steaks",
  "penny-golf": "Penny Golf",
  pipette: "Pipette",
  redbubble: "Redbubble",
  redwood: "Redwood",
  rubios: "Rubio's",
  sambazon: "Sambazon",
  "special-olypics": "Special Olympics",
  "stand-up-2-cancer": "Stand Up 2 Cancer",
  "sutter-health": "Sutter Health",
  telosa: "Telosa",
  toto: "Toto",
  walmart: "Walmart",
  "world-market": "World Market",
  "wwe-2k": "WWE 2K",
  yp: "YP",
  zappos: "Zappos",
};

// ─── STATIC FILES ─────────────────────────────────────────────────────────────

const ROBOTS_TXT = `User-agent: *
Allow: /

# Standard search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Applebot
Allow: /

# LLM-powered search/answering crawlers — allowed for indexing, not training
# These power ChatGPT Search, Perplexity, Claude, and similar tools.
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

# Training-only harvesters — disallowed
User-agent: CCBot
Disallow: /

Sitemap: https://optimismbh.com/sitemap.xml

# Content Signals per EU Directive 2019/790
# Content-Signal: search-indexing = yes
# Content-Signal: ai-training = no
# Content-Signal: ai-input = no
`;

const LLMS_TXT = `# Optimism

> Optimism is an independent creative advertising agency based in San Francisco, CA.
> Formerly known as Barrett Hofherr, the agency rebranded as Optimism in 2024.
> We build brands that resonate, campaigns that perform, and ideas that last.

## About

Optimism is a full-service, independent creative advertising agency headquartered in
San Francisco, California. Founded by Matt Hofherr and Jamie Barrett under the name
Barrett Hofherr, the agency rebranded as Optimism in 2024. The agency is known for
work that is honest, human, and culturally relevant — spanning major consumer brands,
tech companies, nonprofits, and sports franchises.

## Services

- **Brand Strategy** — Positioning, brand architecture, audience research, brand voice
- **Advertising** — TV, digital, social, OOH, print, and integrated campaigns
- **Media Planning & Buying** — Full-service media strategy, planning, and buying
- **Integrated Production** — Video, photo, digital, and experiential production
- **Design** — Brand identity, campaign design, digital, and environmental design
- **Data & Analytics** — Campaign measurement, audience insights, performance optimization

## Key Clients (selected)

Habit Burger Grill, Golden State Warriors, Chime, DoorDash, Walmart, eBay, Marvel,
Meyer Sound, Sutter Health, 8x8, Freshworks, Gong, Corpay, World Market, Levi's,
ASICS, DXL, Zappos, HotelTonight, CBS Sports HQ, Stand Up 2 Cancer, Special Olympics,
California Coastal Commission, Bleacher Report, Redbubble, Extra Space Storage

## Leadership

- **Matt Hofherr** — Founding Partner
- **Jamie Barrett** — Partner
- **Kevin Albrecht** — Strategy Lead (Named Strategist of the Year)
- **Kyle Duford** — Associate Partner, Director of Client Strategy Services
- **Conor Duignan** — Team Member
- **Brad Kamal** — Team Member
- **Charlotte Dugoni** — Team Member
- **Stephanie Farmas** — Team Member
- **Ted Bluey** — Team Member
- **Krista Osol** — Team Member
- **Todd Eisner** — Team Member

## Recent Thinking

- [Barrett Hofherr Is Now Optimism](https://optimismbh.com/insights/barrett-hofherr-is-now-optimism)
- [The Era of Brand Awareness Is Over](https://optimismbh.com/insights/the-era-of-brand-awareness-is-over)
- [It's Time for the Triumphant Return of Brand](https://optimismbh.com/insights/it-s-time-for-the-triumphant-return-of-brand)
- [Relevance vs. Resonance](https://optimismbh.com/insights/relevance-vs-resonance)
- [Kevin Albrecht Named Strategist of the Year](https://optimismbh.com/insights/albrecht-named-strategist-of-the-year)

## Key URLs

- Homepage: https://optimismbh.com/
- About: https://optimismbh.com/about
- Work Portfolio: https://optimismbh.com/work
- Capabilities: https://optimismbh.com/capabilities
- Insights / Blog: https://optimismbh.com/insights
- Team: https://optimismbh.com/people
- Sitemap: https://optimismbh.com/sitemap.xml
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function slugToTitle(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Returns the best meta object for a given pathname.
 * Falls back to pattern-based generation for work/insight/team pages.
 */
function getMetaForPath(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];

  const parts = pathname.split("/").filter(Boolean);

  // /work/{client}/{campaign}
  if (parts.length === 3 && parts[0] === "work") {
    const clientName = CLIENT_NAMES[parts[1]] || slugToTitle(parts[1]);
    const campaignTitle = slugToTitle(parts[2]);
    return {
      title: `${clientName}: ${campaignTitle} | Optimism`,
      description: `${campaignTitle} — a campaign by Optimism for ${clientName}.`,
      ogType: "article",
    };
  }

  // /work/{client}
  if (parts.length === 2 && parts[0] === "work") {
    const clientName = CLIENT_NAMES[parts[1]] || slugToTitle(parts[1]);
    return {
      title: `${clientName} | Work | Optimism`,
      description: `Optimism's creative campaigns and brand work for ${clientName}.`,
    };
  }

  // /insights/{slug}
  if (parts.length === 2 && parts[0] === "insights") {
    const articleTitle = slugToTitle(parts[1]);
    return {
      title: `${articleTitle} | Optimism Insights`,
      description: `${articleTitle} — thinking on brand and advertising from the team at Optimism.`,
      ogType: "article",
    };
  }

  // /{person-slug} — team member pages live at root level
  const NON_PERSON_PATHS = new Set([
    "about", "work", "capabilities", "insights", "people",
    "terms", "privacy", "crm", "brand",
  ]);
  if (parts.length === 1 && !NON_PERSON_PATHS.has(parts[0])) {
    const personName = slugToTitle(parts[0]);
    return {
      title: `${personName} | Optimism`,
      description: `${personName} is part of the team at Optimism, the San Francisco independent creative advertising agency.`,
    };
  }

  return {
    title: "Optimism | Independent Creative Agency | San Francisco",
    description:
      "Optimism is an independent creative advertising agency in San Francisco. Campaigns, brand strategy, and ideas that last.",
  };
}

/**
 * Builds the full block of SEO tags to inject into <head>.
 */
function buildHeadTags(pathname, meta) {
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  const ogType = meta.ogType || "website";
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const title = escapeAttr(meta.title);
  const desc = escapeAttr(meta.description);

  // Breadcrumb JSON-LD for pages deeper than root
  const parts = pathname.split("/").filter(Boolean);
  let breadcrumbTag = "";
  if (parts.length > 0) {
    const items = [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ];
    let cursor = "";
    parts.forEach((part, i) => {
      cursor += "/" + part;
      const label =
        PAGE_META[cursor]?.title?.split("|")[0]?.trim() ?? slugToTitle(part);
      items.push({
        "@type": "ListItem",
        position: i + 2,
        name: label,
        item: `${SITE_URL}${cursor}`,
      });
    });
    breadcrumbTag = `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    })}</script>`;
  }

  const orgJsonLd = meta.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    : "";

  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${desc}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${desc}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    orgJsonLd,
    breadcrumbTag,
  ]
    .filter(Boolean)
    .join("\n  ");
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { hostname, pathname } = url;

    // ── Subdomain routing (crm / brand) ──────────────────────────────────────
    const basePath = SUBDOMAIN_MAP[hostname];
    if (basePath) {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = MAIN_DOMAIN;

      const headers = new Headers(request.headers);
      headers.delete("host");

      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers,
      });

      const contentType = response.headers.get("content-type") || "";
      if (pathname === "/" && contentType.includes("text/html")) {
        const html = await response.text();
        const script = `<script>history.replaceState(null,'','${basePath}'+window.location.search+window.location.hash);</script>`;
        const modified = html.replace("<head>", `<head>${script}`);
        const newHeaders = new Headers(response.headers);
        newHeaders.delete("content-length");
        return new Response(modified, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return response;
    }

    // ── Static files served directly from the worker ──────────────────────────

    if (pathname === "/llms.txt") {
      return new Response(LLMS_TXT, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=86400",
        },
      });
    }

    if (pathname === "/robots.txt") {
      return new Response(ROBOTS_TXT, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    // ── Main domain: proxy to Lovable and inject SEO tags ────────────────────

    const targetUrl = new URL(request.url);
    targetUrl.hostname = MAIN_DOMAIN;

    const headers = new Headers(request.headers);
    headers.delete("host");

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
    });

    // Only process HTML — pass JS/CSS/images/fonts through untouched
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    const html = await response.text();
    const meta = getMetaForPath(pathname);
    const headTags = buildHeadTags(pathname, meta);

    // Insert immediately after <head> so our tags take precedence over any
    // duplicates the app may later render client-side.
    const modified = html.includes("<head>")
      ? html.replace("<head>", `<head>\n  ${headTags}`)
      : html;

    const newHeaders = new Headers(response.headers);
    newHeaders.delete("content-length");
    newHeaders.set("content-type", "text/html; charset=utf-8");

    return new Response(modified, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
