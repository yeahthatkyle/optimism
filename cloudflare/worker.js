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

const MAIN_DOMAIN = "figma-to-coder.pages.dev";
const SITE_URL = "https://optimismbh.com";
const SITE_NAME = "Optimism";
const DEFAULT_OG_IMAGE = "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/uploads/og-image.jpg";

const SUBDOMAIN_MAP = {
  "crm.optimismbh.com": "/crm",
  "brand.optimismbh.com": "/brand",
};

// ─── PER-PAGE META DATA ───────────────────────────────────────────────────────

const PAGE_META = {
  "/": {
    title: "Optimism BH | Independent Creative Agency | San Francisco",
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
    title: "About | Optimism BH Creative Agency",
    description:
      "Meet Optimism — an independent creative advertising agency founded on the belief that great work comes from optimistic thinking. Formerly Barrett Hofherr, reborn with a new name.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Optimism BH",
      url: `${SITE_URL}/about`,
      description: "Optimism BH is an independent creative advertising agency in San Francisco, CA. Formerly Barrett Hofherr.",
      mainEntity: {
        "@type": "Organization",
        name: "Optimism BH",
        alternateName: "Barrett Hofherr",
        url: SITE_URL,
        foundingDate: "2010",
        address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressRegion: "CA", addressCountry: "US" },
        sameAs: ["https://www.linkedin.com/company/optimismbh", "https://www.instagram.com/optimismbh"],
      },
    },
  },
  "/work": {
    title: "Our Work | Optimism BH Creative Agency",
    description:
      "Case studies and campaigns from Optimism. Work for Habit Burger Grill, Golden State Warriors, DoorDash, Walmart, Marvel, Chime, eBay, and more.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Our Work — Optimism BH",
      url: `${SITE_URL}/work`,
      description: "Creative campaigns and brand work from Optimism BH. Work for Habit Burger, Golden State Warriors, DoorDash, Walmart, Marvel, Chime, eBay, and more.",
      creator: { "@type": "Organization", name: "Optimism BH", url: SITE_URL },
    },
  },
  "/capabilities": {
    title: "Capabilities | Optimism BH Creative Agency",
    description:
      "Full-service creative agency capabilities: brand strategy, advertising, integrated production, media planning & buying, design, and data analytics.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Capabilities — Optimism BH",
      url: `${SITE_URL}/capabilities`,
      description: "Full-service creative agency capabilities: brand strategy, advertising, integrated production, media planning & buying, design, and data analytics.",
      about: {
        "@type": "ProfessionalService",
        name: "Optimism BH",
        url: SITE_URL,
        serviceType: ["Brand Strategy", "Advertising", "Integrated Production", "Media Planning & Buying", "Design", "Data & Analytics"],
      },
    },
  },
  "/insights": {
    title: "Insights | Optimism BH Creative Agency",
    description:
      "Thinking on brand strategy, advertising, and culture from the team at Optimism.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Optimism BH Insights",
      url: `${SITE_URL}/insights`,
      description: "Thinking on brand strategy, advertising, and culture from the team at Optimism BH.",
      publisher: { "@type": "Organization", name: "Optimism BH", url: SITE_URL },
    },
  },
  "/news": {
    title: "Insights | Optimism BH Creative Agency",
    description:
      "Thinking on brand strategy, advertising, and culture from the team at Optimism.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Optimism BH Insights",
      url: `${SITE_URL}/news`,
      description: "Thinking on brand strategy, advertising, and culture from the team at Optimism BH.",
      publisher: { "@type": "Organization", name: "Optimism BH", url: SITE_URL },
    },
  },
  "/people": {
    title: "Our Team | Optimism BH Creative Agency",
    description:
      "Meet the team at Optimism — strategists, creatives, producers, and media experts building brands that last.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Our Team — Optimism BH",
      url: `${SITE_URL}/people`,
      description: "Meet the strategists, creatives, producers, and media experts at Optimism BH.",
      about: { "@type": "Organization", name: "Optimism BH", url: SITE_URL },
    },
  },
  "/terms": {
    title: "Terms of Use | Optimism BH",
    description: "Terms of use for optimismbh.com.",
  },
  "/privacy": {
    title: "Privacy Policy | Optimism BH",
    description: "Privacy policy for optimismbh.com.",
  },

  // — Capabilities —
  "/capabilities/brand-strategy": {
    title: "Brand Strategy | Optimism BH Creative Agency",
    description:
      "We build brands with purpose and clarity. Optimism's brand strategy practice helps companies find their voice, define their positioning, and grow with conviction.",
  },
  "/capabilities/advertising": {
    title: "Advertising | Optimism BH Creative Agency",
    description:
      "Campaigns that break through. Optimism creates advertising that earns attention and drives results — TV, digital, OOH, social, and beyond.",
  },
  "/capabilities/media-planning-buying": {
    title: "Media Planning & Buying | Optimism BH Creative Agency",
    description:
      "Smart media that amplifies great creative. Optimism plans and buys media across all channels to reach the right audiences at the right moment.",
  },
  "/capabilities/integrated-production": {
    title: "Integrated Production | Optimism BH Creative Agency",
    description:
      "From concept to delivery. Optimism's production team brings campaigns to life across video, photo, digital, and experiential formats.",
  },
  "/capabilities/design": {
    title: "Design | Optimism BH Creative Agency",
    description:
      "Visual storytelling at every scale. Optimism's design practice spans brand identity, campaigns, digital experiences, and environmental design.",
  },
  "/capabilities/data-analytics": {
    title: "Data & Analytics | Optimism BH Creative Agency",
    description:
      "Insights that fuel better work. Optimism uses data and analytics to inform strategy, optimize campaigns, and measure what matters.",
  },

  // — Team —
  "/jamie-barrett": {
    title: "Jamie Barrett | Chief Creative Officer | Optimism BH",
    description:
      "Jamie founded Optimism with a vision to build brands through cultural momentum. With decades of experience at top agencies, Jamie has led some of the most iconic campaigns in advertising history.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Jamie Barrett",
      jobTitle: "Chief Creative Officer",
      description:
        "Jamie founded Optimism with a vision to build brands through cultural momentum. With decades of experience at top agencies, Jamie has led some of the most iconic campaigns in advertising history.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/jamie.jpg",
      url: "https://optimismbh.com/jamie-barrett",
    },
  },
  "/matt-hofherr": {
    title: "Matt Hofherr | Partner, Chief Strategy Officer | Optimism BH",
    description:
      "When Jamie moved to SF to work at Goodby Silverstein & Partners he moved into Matt's neighborhood and that's when the two of them became fast friends.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Matt Hofherr",
      jobTitle: "Partner, Chief Strategy Officer",
      description:
        "When Jamie moved to SF to work at Goodby Silverstein & Partners he moved into Matt's neighborhood and that's when the two of them became fast friends.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/matt.jpg",
      url: "https://optimismbh.com/matt-hofherr",
    },
  },
  "/krista-osol": {
    title: "Krista Osol | Director of Client Services | Optimism BH",
    description:
      "Krista is a seasoned professional in Client Services with 20 years of experience in advertising and marketing, inspiring creativity and mentoring diverse teams.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Krista Osol",
      jobTitle: "Director of Client Services",
      description:
        "Krista is a seasoned professional in Client Services with 20 years of experience in advertising and marketing. Throughout her career, she has taken on leadership roles that enable her to inspire creativity, mentor diverse teams, manage budgets, lead pitches, and acquire new clients.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/krista.jpeg",
      url: "https://optimismbh.com/krista-osol",
    },
  },
  "/todd-eisner": {
    title: "Todd Eisner | Partner, Executive Creative Director | Optimism BH",
    description:
      "Todd oversees operations and ensures seamless delivery across all projects. His strategic leadership has helped scale Optimism while maintaining the creative excellence that defines the agency.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Todd Eisner",
      jobTitle: "Partner, Executive Creative Director",
      description:
        "Todd oversees operations and ensures seamless delivery across all projects. His strategic leadership has helped scale Optimism while maintaining the creative excellence that defines the agency.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/todd.jpg",
      url: "https://optimismbh.com/todd-eisner",
    },
  },
  "/conor-duignan": {
    title: "Conor Duignan | Partner, Head of Production | Optimism BH",
    description:
      "Conor drives the creative vision behind Optimism's award-winning campaigns. His work has been recognized at every major advertising award show and has helped define the voice of numerous iconic brands.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Conor Duignan",
      jobTitle: "Partner, Head of Production",
      description:
        "Conor drives the creative vision behind Optimism's award-winning campaigns. His work has been recognized at every major advertising award show and has helped define the voice of numerous iconic brands.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/conor.jpg",
      url: "https://optimismbh.com/conor-duignan",
    },
  },
  "/kyle-duford": {
    title: "Kyle Duford | Author, Brander, Assoc. Partner | Optimism BH",
    description:
      "Kyle Duford is the author of 'The Brand Book,' 'Twice Found,' 'Optimism,' and 'Branding Without Permission.' He is also a partner at Optimism, an advertising agency in San Francisco.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Kyle Duford",
      givenName: "Kyle",
      familyName: "Duford",
      url: "https://optimismbh.com/kyle-duford",
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/main-1775743150727.jpg",
      description:
        "Kyle Duford is the author of 'The Brand Book,' 'Twice Found,' 'Optimism,' and 'Branding Without Permission.' He is also a partner at Optimism, an advertising agency in San Francisco.",
      jobTitle: ["Author", "Brand Strategist", "Partner"],
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      spouse: { "@type": "Person", name: "Jerushah Duford" },
      sameAs: [
        "https://twitter.com/kyleduford",
        "https://www.instagram.com/yeahthatkyle/",
        "https://www.linkedin.com/in/kyleduford/",
        "https://mastodon.social/@yeahthatkyle",
      ],
      author: [
        { "@type": "Book", name: "Twice Found" },
        { "@type": "Book", name: "The Brand Book" },
        { "@type": "Book", name: "Branding Without Permission" },
      ],
      alumniOf: [{ "@type": "EducationalOrganization", name: "University of Colorado" }],
      award: ["Webbie Award", "Telly Awards", "Addy Award", "NYX Awards"],
    },
  },
  "/charlotte-dugoni": {
    title: "Charlotte Dugoni | Associate Partner, Executive Producer | Optimism BH",
    description:
      "Charlotte leads production with precision and creative excellence. Her expertise spans film, digital, and experiential production.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Charlotte Dugoni",
      jobTitle: "Associate Partner, Executive Producer",
      description:
        "Charlotte leads production with precision and creative excellence. Her expertise spans film, digital, and experiential production.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/main-1775743137850.jpg",
      url: "https://optimismbh.com/charlotte-dugoni",
    },
  },
  "/ted-bluey": {
    title: "Ted Bluey | Associate Partner, Head of Design | Optimism BH",
    description:
      "Ted brings decades of experience to every production challenge. His calm leadership and deep industry relationships make the impossible possible.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Ted Bluey",
      jobTitle: "Associate Partner, Head of Design",
      description:
        "Ted brings decades of experience to every production challenge. His calm leadership and deep industry relationships make the impossible possible.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/ted.jpg",
      url: "https://optimismbh.com/ted-bluey",
    },
  },
  "/brad-kamal": {
    title: "Brad Kayal | Director of Strategy | Optimism BH",
    description:
      "Brad uncovers insights that fuel breakthrough brand strategies. His research-driven approach reveals opportunities others miss.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Brad Kayal",
      jobTitle: "Director of Strategy",
      description:
        "Brad uncovers insights that fuel breakthrough brand strategies. His research-driven approach reveals opportunities others miss.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/brad.jpg",
      url: "https://optimismbh.com/brad-kamal",
    },
  },
  "/kevin-albrecht": {
    title: "Kevin Albrecht | Ad Age Strategic Planner of the Year | Optimism BH",
    description:
      "Kevin is an Ad Age Strategic Planner of the Year, shaping brand futures with innovative thinking and deep consumer understanding.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Kevin Albrecht",
      jobTitle: "Associate Partner, Associate Strategy Director",
      description:
        "Kevin is an Ad Age Strategic Planner of the Year, shaping brand futures with innovative thinking and deep consumer understanding.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/kevin.jpg",
      url: "https://optimismbh.com/kevin-albrecht",
    },
  },
  "/stephanie-farmas": {
    title: "Stephanie Farmas | Marketing Director | Optimism BH",
    description:
      "Stephanie keeps Optimism running smoothly and efficiently. Her operational excellence enables the team to focus on what they do best: creating great work.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Stephanie Farmas",
      jobTitle: "Marketing Director",
      description:
        "Stephanie keeps Optimism running smoothly and efficiently. Her operational excellence enables the team to focus on what they do best: creating great work.",
      worksFor: { "@type": "Organization", name: "Optimism", url: "https://optimismbh.com" },
      image: "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/leadership/stephanie.jpg",
      url: "https://optimismbh.com/stephanie-farmas",
    },
  },

  // — Insights —
  "/insights/barrett-hofherr-is-now-optimism": {
    title: "Barrett Hofherr Is Now Optimism BH | Optimism BH Insights",
    description:
      "Barrett Hofherr, the San Francisco independent creative agency, has rebranded as Optimism. A new name, the same commitment to ideas that last.",
    ogType: "article",
  },
  "/insights/relevance-vs-resonance": {
    title: "Relevance vs. Resonance | Optimism BH Insights",
    description:
      "What's the difference between a brand that's relevant and one that resonates? Optimism explores the distinction that separates good brands from great ones.",
    ogType: "article",
  },
  "/insights/8-8-flips-the-script-on-b2b-marketing-with-ai-powered-hero-campaign": {
    title: "8x8 Flips the Script on B2B Marketing with AI | Optimism BH",
    description:
      "How Optimism and 8x8 used AI-powered creative to relaunch a B2B brand and cut through the noise in a crowded category.",
    ogType: "article",
  },
  "/insights/california-s-burger-wars-heat-up-as-habit-burger-grill-trolls-in-n-out-with-new-billboard": {
    title: "California's Burger Wars: Habit Burger Trolls In-N-Out | Optimism BH",
    description:
      "Optimism's work for Habit Burger Grill heats up California's burger wars with a cheeky billboard that took direct aim at In-N-Out.",
    ogType: "article",
  },
  "/insights/the-era-of-brand-awareness-is-over": {
    title: "The Era of Brand Awareness Is Over | Optimism BH Insights",
    description:
      "Brand awareness alone isn't enough anymore. Optimism makes the case for a new metric: brand conviction.",
    ogType: "article",
  },
  "/insights/albrecht-named-strategist-of-the-year": {
    title: "Kevin Albrecht Named Strategist of the Year | Optimism BH",
    description:
      "Optimism strategist Kevin Albrecht has been named Strategist of the Year, recognized for his work building brands that resonate.",
    ogType: "article",
  },
  "/insights/barrett-hofherr-names-kyle-duford-associate-partner-and-director-of-client-strategy-services": {
    title: "Kyle Duford Named Associate Partner at Optimism BH",
    description:
      "Barrett Hofherr (now Optimism) has named Kyle Duford Associate Partner and Director of Client Strategy Services.",
    ogType: "article",
  },
  "/insights/it-s-time-for-the-triumphant-return-of-brand": {
    title: "The Triumphant Return of Brand | Optimism BH Insights",
    description:
      "Performance marketing has dominated for a decade. Optimism argues it's time to bring brand back — and why the best companies never let it go.",
    ogType: "article",
  },

  // — Featured work —
  "/work/habit-burger/fresh-like-that": {
    title: "Habit Burger: Fresh Like That | Optimism BH",
    description:
      "Fresh Like That — Optimism's campaign for Habit Burger Grill celebrating fresh, never-frozen ingredients.",
  },
  "/work/habit-burger/better-by-char": {
    title: "Habit Burger: Better by Char | Optimism BH",
    description:
      "Better by Char — Optimism's charbroiler-focused campaign for Habit Burger Grill.",
  },
  "/work/habit-burger/winning-is-a-habit": {
    title: "Habit Burger: Winning Is a Habit | Optimism BH",
    description:
      "Winning Is a Habit — campaign by Optimism for Habit Burger Grill.",
  },
  "/work/golden-state-warriors/dub-nation": {
    title: "Golden State Warriors: Dub Nation | Optimism BH",
    description:
      "Dub Nation — Optimism's work for the Golden State Warriors celebrating the Bay Area fanbase.",
  },
  "/work/chime/happy-chime": {
    title: "Chime: Happy Chime | Optimism BH",
    description:
      "Happy Chime — Optimism's brand campaign for Chime, the fintech challenger bank.",
  },
  "/work/walmart/this-is-that-place": {
    title: "Walmart: This Is That Place | Optimism BH",
    description:
      "This Is That Place — Optimism's campaign for Walmart celebrating the store as a community hub.",
  },
  "/work/marvel/marvel-case-study": {
    title: "Marvel Case Study | Optimism BH",
    description:
      "Optimism's work with Marvel — creative advertising that brings the Marvel universe to life.",
  },
  "/work/doordash/cash-after-every-dash": {
    title: "DoorDash: Cash After Every Dash | Optimism BH",
    description:
      "Cash After Every Dash — Optimism's campaign for DoorDash promoting instant pay for dashers.",
  },
  "/work/ebay/magic-box": {
    title: "eBay: Magic Box | Optimism BH",
    description:
      "Magic Box — Optimism's campaign capturing the joy and surprise of finding treasure on eBay.",
  },
  "/work/meyer-sound/panther": {
    title: "Meyer Sound: Panther | Optimism BH",
    description:
      "Panther — Optimism's launch campaign for Meyer Sound's flagship large-scale speaker system.",
  },
  "/work/sutter-health/sutter-never-stops": {
    title: "Sutter Health: Sutter Never Stops | Optimism BH",
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

// ─── WORK PAGE SCHEMA ─────────────────────────────────────────────────────────
// Keyed by path. n=name, h=headline, d=description, img=thumbnail filename, kw=keywords
// Image base: https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/work/thumbnails/

const IMG_BASE = "https://kiifubxvxfdlpmsrueob.supabase.co/storage/v1/object/public/photos/work/thumbnails/";

const WORK_SCHEMA = {
  // ── Batch 1 (A–B) ────────────────────────────────────────────────────────────
  "/work/automobile-reel": {
    n: "Automobile Reel", img: "1771021555253-gnn1vhv.jpg",
  },
  "/work/extra-space-storage/for-whatever-life-has-in-storage": {
    n: "For Whatever Life has in Storage", h: "Space for everything life throws at you.",
    kw: "Advertising,Video,Broadcast & Streaming Video,Social",
  },
  "/work/8x8/8x8-case-study": {
    n: "8x8 Case Study", h: "One Super Bowl-sized commercial for every customer that actually features that customer.",
    img: "1775627119957-akxps.jpg",
  },
  "/work/8x8/brand-relaunch": {
    n: "Brand Relaunch", h: "8X8 is a business communications platform that makes the extremely complicated, extremely simple.",
    img: "1774294663279-luthbt.webp",
  },
  "/work/8x8/the-power-of-you": {
    n: "The Power of You", h: "Every customer becomes the star of their own commercial.",
    d: "92% of B2B customers have a shortlist of preferred vendors before they even start the buying process.",
  },
  "/work/1000-days/babies-for-babies": {
    n: "Babies For Babies", h: "We were asked to create a viral campaign for an important healthcare initiative.",
    img: "1774287720966-n7ff1nj.webp",
  },
  "/work/ariat/mountain": {
    n: "Mountain", h: "Life is rarely a level playing field.",
    img: "1775580447074-yoa8k.webp",
    kw: "Advertising,Integrated Production,Video,Broadcast & Streaming Video,Digital Video,Out-of-Home,Social,Paid Social,Email,In-Store Display",
  },
  "/work/ars-x-machina/welcome-to-the-media-revolution": {
    n: "Welcome to the Media Revolution", h: "Ars X Machina is a female-founded media agency.",
    img: "1774275345626-oiyrp7.webp",
    kw: "Branding & Identity,Naming,Re-Branding,Identity Design,Logo Design,Logo Lockup,Brand Tagline,Branded Design Elements",
  },
  "/work/asics/asics-case-study": {
    n: "Asics Case Study", h: "The Gel Cumulus 23 was one of the biggest global shoe launches in ASICS history.",
    d: "We conceived and executed the campaign across three continents, from video to in-store and everything in between.",
  },
  "/work/asics/metaride": {
    n: "MetaRide", h: "The MetaRide is the most technically advanced running shoe in the history of ASICS.",
    img: "1775628644881-z1j2wt.jpg",
    kw: "Brand Strategy,Digital,Video,Digital Video,Social,Out-of-Home,Print",
  },
  "/work/asics/sound-mind-sound-body": {
    n: "Sound Mind, Sound Body", h: "Running does more than condition your body. It clears your mind.",
    d: "Running does more than condition your body. It clears your mind. Gives you energy. And takes you to a better place than where you started.",
  },
  "/work/attentive/attentive-case-study": {
    n: "Attentive Case Study", h: "Text marketing is dramatically more effective than print, digital, and out-of-home. To effectively communicate that message, we used print, digital, and out-of-home.",
  },
  "/work/attentive/text-marketing": {
    n: "Text Marketing", h: "Text marketing is dramatically more effective than print, digital, and out-of-home.",
    img: "1774290595651-zml6xv.webp",
    kw: "Brand Strategy,Digital,Print,Out-of-Home",
  },
  "/work/bachans/look-for-the-octopus": {
    n: "Look for the Octopus", h: "Optimism brings Bachan's octopus logo to life.",
    d: "How do you launch Bachan's first-ever brand campaign? With a giant red octopus, of course.",
  },
  "/work/bleacher-report/bleacher-report-case-study": {
    n: "Bleacher Report Case Study", h: "For sports news and content, Bleacher Report was the leading challenger to ESPN. But unaided awareness was low — under 10 percent.",
  },
  "/work/bleacher-report/sports-alphabet": {
    n: "Sports Alphabet", h: "Bleacher Report defined from A to Z.",
    img: "1774293968052-hhj7p.webp", kw: "Video,Social,Digital",
  },
  "/work/bolla/bolla-sorte": {
    n: "Bolla Sorte", h: "How do you create and produce a multi-media launch campaign for a new sports betting app in Brazil in just three weeks?",
    img: "1774272447412-v9dorb.webp",
  },
  "/work/bonafide/power-information-precision": {
    n: "Power Information Precision", img: "1774289254674-zu9svr.webp",
  },
  "/work/optimism/agency-reel": {
    n: "Agency Reel", h: "You need the work to be incredibly great and work incredibly well.",
    img: "1775627615437-7t605i.png",
  },
  "/work/optimism/b2b-reel": {
    n: "B2B Reel", img: "1775756756843-b3lf69.jpg",
  },

  // ── Batch 2 (C–F) ────────────────────────────────────────────────────────────
  "/work/california-coastal-commission/you-are-bigger-than-you-think": {
    n: "You Are Bigger Than You Think", h: "The facts about marine debris are astonishing. But you aren't small.",
    img: "1774291989945-d3tuc.webp",
    kw: "Social,Paid Social,Organic Social,Print,Identity Design,Communication Strategy",
  },
  "/work/california-drought-prevention/drop-a-brick": {
    n: "Drop A Brick", h: "California faced its worst drought in history. Our solution? Make a product that saves water every time you flush.",
    img: "1774281491804-52mn2.webp", kw: "Video,Digital Video",
  },
  "/work/campaign-monitor/ooh": {
    n: "OOH", h: "Campaign Monitor creates emails that people can't ignore.",
    img: "1774276048853-a5mq7.webp", kw: "Out-of-Home",
  },
  "/work/cbs-sports-hq/thats-good-sports": {
    n: "That's Good Sports", h: "CBS Sports HQ is the most tingly, full-bodied sports coverage you can find.",
    img: "1774290863704-um9lk4.webp",
  },
  "/work/childrens-defense-fund/the-pumpkin-and-the-pantsuit": {
    n: "The Pumpkin and The Pantsuit", h: "After the results were in on Election Night 2016, CNN analyst Van Jones asked the question, How do we explain this to our kids?",
    img: "1774284872934-iv50zl.webp",
  },
  "/work/chime/better-banking": {
    n: "Better Banking", h: "Better banking for everyone.",
    img: "1775629929106-a1mqf.jpg",
  },
  "/work/chime/chime-case-study": {
    n: "Chime Case Study", h: "Chime is the leading mobile banking service with more than 5 million customers.",
    img: "1775635694449-kc80z.jpg",
  },
  "/work/chime/chime-feels": {
    n: "Chime Feels", h: "When your money's good, you feel good. And no one makes your money good-er than Chime.",
    img: "1774291805029-nxzk8.webp", kw: "Video,Digital,Social",
  },
  "/work/chime/financial-literacy": {
    n: "Financial Literacy", h: "21 Savage is passionate about financial literacy.",
    img: "1775629861359-u41x7.jpg",
  },
  "/work/chime/happy-chime": {
    n: "Happy Chime", h: "Puppies. Ice cream. Rainbows. The Chime mobile banking app.",
    img: "1774287525844-oknh1.webp", kw: "Video,Social,Digital",
  },
  "/work/coachart/ai-is-amazing": {
    n: "AI is Amazing", h: "CoachArt helps chronically ill kids live fuller lives every day.",
    img: "1774271381646-29ihdh.webp", kw: "Digital,Video",
  },
  "/work/coachart/erick": {
    n: "Erick", h: "CoachArt brings joy to chronically ill kids.",
    img: "1774288387858-ddqmu9.webp", kw: "Video,Digital",
  },
  "/work/coupa/behold-the-power-of-spend": {
    n: "Behold The Power Of Spend", h: "Take a complex and relatively unknown B2B brand, and introduce the world to both.",
    img: "1774287235537-2btwst.webp",
  },
  "/work/credit-karma/dads": {
    n: "Dads", h: "Staying on top of your credit score makes you feel really good.",
    img: "1775633596386-rsvew8.jpg",
  },
  "/work/daily-mvp/mvp": {
    n: "MVP", h: "How does a startup compete in the crowded fantasy sports marketplace?",
    img: "1775625134982-hbtdla.jpg",
  },
  "/work/doordash/cash-after-every-dash": {
    n: "Cash After Every Dash", h: "Cash After Every Dash",
    img: "1770950182322-4m5opp.webp", kw: "Re-Branding,Naming,Identity Design,Packaging",
  },
  "/work/dxl/man-up-for-your-man": {
    n: "Man Up For Your Man", h: "Manning up with Nicole Dubois",
    img: "1773493469778-a9eawc.webp", kw: "Social,Influencer Partnerships",
  },
  "/work/dxl/where-what-you-want": {
    n: "Where What You Want", h: "For Big + Tall men, the fact that someone has clothes that fit them is, well, huge news.",
    img: "1773492426424-5ezjr.webp",
    kw: "Broadcast & Streaming Video,Paid Social,Email,Out-of-Home,Radio,Digital",
  },
  "/work/ebay/magic-box": {
    n: "Magic Box", h: "You would need a magic box to showcase the endless amount of products on eBay Refurbished.",
    img: "1774278538187-gsxxfa.webp", kw: "Video,Digital,Packaging,Website",
  },
  "/work/freshworks/ridiculously-easy": {
    n: "Ridiculously Easy", h: "Freshworks makes software that's ridiculously easy to use.",
    img: "1774276463221-0259n2f.webp", kw: "Video",
  },

  // ── Batch 3 (G–O) ────────────────────────────────────────────────────────────
  "/work/golden-state-warriors/dub-nation": {
    n: "Dub Nation", h: "18,064 not-so-quiet fans pack the Chase Center every night.",
    img: "1774126868766-v79wg.webp",
  },
  "/work/golfnow/dinosaur": {
    n: "Dinosaur", h: "After decades of booking tee times over the phone, many golfers behaved like dinosaurs.",
    img: "1774126115901-7kkr1.webp", kw: "Video,Broadcast & Streaming Video,Digital Video",
  },
  "/work/gong/gong-ho": {
    n: "Gong Ho", h: "Let's make some noise on the Super Bowl.",
    img: "1774290467331-8xqygc.webp", kw: "Video,Broadcast & Streaming Video,Digital Video,Social",
  },
  "/work/grass-roots-farmers-co-op/meat-with-intention": {
    n: "Meat with Intention", h: "Here's how we helped Grass Roots Farmers Co-op look as good as their meat tastes.",
    img: "1774281739394-kunusl.webp",
    kw: "Branding & Identity,Identity Design,Branded Design Elements,Brand Strategy,Communication Strategy",
  },
  "/work/habit-burger/americas-number-1-burger": {
    n: "America's #1 Burger", h: "Habit delivers burgers by air, land, and sea.",
    img: "1775566523752-339imk.jpg",
    kw: "Advertising,Performance Marketing,Out-of-Home,Print,Paid Social,Activation Stunt,Logo Design,Merchandise,Experiential / Events",
  },
  "/work/habit-burger/better-by-char": {
    n: "Better By Char", h: "It takes the ultimate sacrifice to make the ultimate burger.",
    img: "1773493624836-ws5nqc.webp", kw: "Video,Broadcast & Streaming Video,Digital Video,Social",
  },
  "/work/habit-burger/case-study": {
    n: "Habit Burger Case Study", h: "What's the #1 burger in the country? It's Habit Burger & Grill.",
    img: "1774303467940-whwoac.webp",
  },
  "/work/habit-burger/everyone-deserves-the-1": {
    n: "Everyone Deserves the #1", h: "Habit delivers burgers by air, land, and sea.",
    img: "1770662715361-d308im.webp",
  },
  "/work/habit-burger/winning-is-a-habit": {
    n: "Winning is a Habit", h: "Habit won #1 Burger, #1 Side, and #1 Fast Casual Restaurant in USA Today's 2026 10 Best polls.",
    img: "1774270960715-jwye1j.webp", kw: "Social,Paid Social,Organic Social,Out-of-Home,Digital Video",
  },
  "/work/hoteltonight/give-your-house-a-break": {
    n: "Give Your House A Break", h: "We sympathized with houses stuck with their people.",
    img: "1774291204573-n5gkn.webp", kw: "Video,Social,Digital",
  },
  "/work/lifestraw/make-an-impact": {
    n: "Make An Impact", h: "LifeStraw's mission to bring safe drinking water to the whole entire world.",
    img: "1774275126577-84pwh.webp", kw: "Video",
  },
  "/work/made-in-a-free-world/call-and-response": {
    n: "Call and Response", h: "For the 150th anniversary of the Emancipation Proclamation, we reminded the world that slavery still very much exists.",
    img: "1774273246859-dtza1a.webp", kw: "Video",
  },
  "/work/marvel/marvel-case-study": {
    n: "Marvel Case Study", img: "1775772107076-oki2t.jpg",
  },
  "/work/meta-prosper/american": {
    n: "American", h: "May is AAPI Heritage Month. Every day is the right time to combat Asian American hate.",
    img: "1774288555373-phfvc.webp", kw: "Video,Social",
  },
  "/work/meyer-sound/constellation": {
    n: "Constellation", h: "Meyer Sound gives life to spectacular venues around the world.",
    img: "1774294474070-l3esiv.webp",
  },
  "/work/meyer-sound/hear-it-right": {
    n: "Hear It Right", h: "Meyer Sound uses curvilinear array technology to make the world's best speakers.",
    img: "1774126513168-4yi39h.webp",
  },
  "/work/meyer-sound/panther": {
    n: "Panther", h: "How do you help Meyer Sound launch their game-changing speaker system?",
    img: "1774275902864-8olfx.webp",
    kw: "Communication Strategy,Video,Print,Digital,Social,Experiential / Events",
  },
  "/work/mixt/the-way-to-salad": {
    n: "The Way to Salad", h: "MIXT wanted a brand identity as fresh as the salads they sell.",
    img: "1774277280752-0zofdz.webp",
    kw: "Branding & Identity,Identity Design,Branded Design Elements,Out-of-Home,Communication Strategy",
  },
  "/work/monster-hunter-now/hunt-anywhere": {
    n: "Monster Hunter Now", h: "No matter what you were doing then, just tap the app and become a Monster Hunter Now.",
    img: "1775625485365-zuxkbd.jpg", kw: "Advertising,Performance Marketing",
  },
  "/work/omaha-steaks/thanks-dad": {
    n: "Thanks Dad", h: "We knew Dads loved steak. And we knew ties were an extremely lame gift.",
    img: "1774126754362-s3pdm.webp",
  },

  // ── Batch 4 (O reels–W) ───────────────────────────────────────────────────────
  "/work/optimism/food-bev-reel": {
    n: "Food & Bev Reel", img: "1771021282030-8qozb8.webp",
  },
  "/work/optimism/gaming-reel": {
    n: "Gaming Reel", img: "1775756577915-jgor8f.jpg",
  },
  "/work/optimism/retail-reel": {
    n: "Retail Reel", img: "1775756885623-mw9d4m.jpg",
  },
  "/work/optimism/sports-reel": {
    n: "Sports Reel", img: "1771019981370-uh5swk.webp",
  },
  "/work/penny-golf/golf-is-hard-swing-easy": {
    n: "Golf is hard. Swing easy.", h: "Penny Golf is a women's golf wear brand that lives by the ideal: swing easy.",
    img: "1774295338608-fnn38q.webp",
    kw: "Brand Strategy,Branding & Identity,Re-Branding,Identity Design,Branded Design Elements,Communication Strategy",
  },
  "/work/pipette/whats-this": {
    n: "What's This?", h: "Parents will never have to question the clean, non-toxic products from Pipette.",
    img: "1774288250777-o5q42.webp", kw: "Brand Strategy,Video,Digital,Social",
  },
  "/work/redbubble/gift-the-very-thing": {
    n: "Gift The Very Thing", h: "Redbubble has an incredible variety of unique, wildly creative gifts.",
    img: "1774288111450-48n4dk.webp", kw: "Video,Social,Digital",
  },
  "/work/redwood/just-redwood": {
    n: "Just Redwood", h: "Redwood is beautiful. To create desire for redwood, you simply have to let people look at it.",
    img: "1774286976874-sz5omp.webp",
  },
  "/work/rubios/rubios-case-study": {
    n: "Rubio's Case Study", h: "Rubio's was famous for its Original Fish Taco.",
    img: "1775632911742-sx5qcr.jpg",
  },
  "/work/rubios/to-the-ocean": {
    n: "To the Ocean", h: "Rubio's was famous for its Original Fish Taco.",
    img: "1774271485917-qvmvr.webp", kw: "Video",
  },
  "/work/special-olypics/do-something-special": {
    n: "Do Something Special", h: "Special isn't what we are. It's what we do.",
    img: "1770316025101-rou1mo.webp",
    kw: "Video,Social,Out-of-Home,Digital,Website,Print,Content",
  },
  "/work/stand-up-2-cancer/not-alone": {
    n: "Not Alone", h: "Someday soon, the world will defeat cancer.",
    img: "1774274981757-efbi8j.webp", kw: "Video",
  },
  "/work/sutter-health/anthem": {
    n: "Anthem", h: "For the second installment of the Sutter Health A Thousand Things campaign.",
    img: "1775634749085-bl9tla.jpg",
  },
  "/work/sutter-health/mask": {
    n: "Mask", h: "One-third of Americans have experienced anxiety or depression since the pandemic began. Sutter Health is committed to changing that.",
    img: "1774284722490-i2zsie.webp", kw: "Video,Digital Video",
  },
  "/work/sutter-health/never-ending": {
    n: "Never-Ending", h: "There are a thousand things that separate Sutter Health from the competition.",
    img: "1774291331796-kxholh.webp",
    kw: "Video,Print,Communication Strategy,Brand Strategy,Radio,Social,Out-of-Home,Experiential / Events",
  },
  "/work/sutter-health/sutter-never-stops": {
    n: "Sutter Never Stops", h: "Listening never stops. 12,000 doctors never stop.",
    img: "1774296399246-6l55w.webp",
    kw: "Branding & Identity,Branded Design Elements,Communication Strategy,Brand Strategy,Video,Print,Out-of-Home,Social,Digital",
  },
  "/work/telosa/the-city-of-the-future": {
    n: "The City of the Future", h: "Optimism was asked to reimagine the very way humans coexist.",
    img: "1774274586217-e0094j.webp", kw: "Naming,Identity Design,Branding & Identity",
  },
  "/work/toto/water-for-your-whatever": {
    n: "Water For Your Whatever", h: "Our client Toto asked us to convince Americans to stop using toilet paper.",
    img: "1774375724863-b33zxd.webp",
  },
  "/work/world-market/designed-for-summer": {
    n: "Designed For Summer", h: "Pools, popsicles, sea shells. Inspiration for Cost Plus World Market furniture design.",
    img: "1774279082482-w1w80r.webp", kw: "Out-of-Home",
  },
  "/work/world-market/gift-thoughtfully": {
    n: "Gift Thoughtfully", h: "Hot sauce! Garden gnomes! Festive pillows! The list of thoughtful gift items at World Market never ends.",
    img: "1775628187012-icq4v.jpg",
  },
};

// ─── STATIC FILES ─────────────────────────────────────────────────────────────

const ROBOTS_TXT = `# optimismbh.com robots.txt
# Content Signals per EU Directive 2019/790:
#   search = yes | ai-train = no | ai-input = no

# Allow all crawlers by default
User-agent: *
Allow: /

# Training-only harvesters — disallowed
User-agent: CCBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

Sitemap: https://optimismbh.com/sitemap.xml
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
      title: `${clientName}: ${campaignTitle} | Optimism BH`,
      description: `${campaignTitle} — a campaign by Optimism for ${clientName}.`,
      ogType: "article",
    };
  }

  // /work/{client}
  if (parts.length === 2 && parts[0] === "work") {
    const clientName = CLIENT_NAMES[parts[1]] || slugToTitle(parts[1]);
    return {
      title: `${clientName} | Work | Optimism BH`,
      description: `Optimism's creative campaigns and brand work for ${clientName}.`,
    };
  }

  // /insights/{slug}
  if (parts.length === 2 && parts[0] === "insights") {
    const articleTitle = slugToTitle(parts[1]);
    return {
      title: `${articleTitle} | Optimism BH Insights`,
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
      title: `${personName} | Optimism BH`,
      description: `${personName} is part of the team at Optimism, the San Francisco independent creative advertising agency.`,
    };
  }

  return {
    title: "Optimism BH | Independent Creative Agency | San Francisco",
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
        const newHeaders = new Headers(response.headers);
        return new Response(response.body, {
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
