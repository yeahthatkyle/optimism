/**
 * Cloudflare Worker: 301 Redirects — barretthofherr.com → optimismbh.com
 *
 * Every request to barretthofherr.com is permanently redirected to the
 * corresponding page on optimismbh.com. Unknown paths fall back to the homepage.
 *
 * Deploy with:  npx wrangler deploy --config barretthofherr-wrangler.toml
 */

const DESTINATION = "https://optimismbh.com";

// ─── REDIRECT MAP ─────────────────────────────────────────────────────────────
// Keys   = old barretthofherr.com paths (decoded)
// Values = new optimismbh.com paths

const REDIRECTS = {
  // ── Root & top-level ────────────────────────────────────────────────────────
  "/": "/",
  "/about": "/about",
  "/contact": "/",
  "/people": "/people",
  "/work": "/work",

  // ── Old case-study slugs ─────────────────────────────────────────────────────
  // ⚠️  CONFIRM THESE 7 before deploying — new URL was a keyword, not a path:
  "/case-study-2":   "/work/marvel/heroes-only",                        // "marvel"
  "/case-study-5":   "/work/wwe-2k/suplex-city",                        // "suplex city"
  "/case-study-6":   "/work/sutter-health",                             // "sutter"
  "/case-study-7":   "/work/telosa/the-city-of-the-future",             // "telosa"
  "/case-study-7-3": "/work/walmart/this-is-that-place",                // "walmart"
  "/case-study-10":  "/work/special-olypics/do-something-special",      // "special olympics"
  "/case-study-11":  "/work/habit-burger",                              // "habit"
  // ── (these two had full paths) ───────────────────────────────────────────────
  "/case-study-12":  "/work/8x8/8x8-case-study",
  "/case-study-7-4": "/work/bleacher-report/bleacher-report-case-study",

  // ── /work/* ──────────────────────────────────────────────────────────────────
  "/work/8x8":                                      "/work/8x8/brand-relaunch",
  "/work/american":                                 "/work/meta-prosper/american",
  "/work/anthem":                                   "/work/sutter-health/anthem",
  "/work/asics":                                    "/work/asics",
  "/work/attentive":                                "/work/attentive",
  "/work/b-h-reel":                                 "/work/automobile-reel",
  "/work/b-h-reel-2":                               "/work/food-bev-reel",
  "/work/b-h-reel-3":                               "/work/agency-reel",
  "/work/babies-for-babies":                        "/work/1000-days/babies-for-babies",
  "/work/be-like-no-one":                           "/work/wwe-2k/be-like-no-one",
  "/work/better-banking":                           "/work/chime/better-banking",
  "/work/bleacher-report":                          "/work/bleacher-report",
  "/work/btob":                                     "/work",
  "/work/california-coastal-commission":            "/work/california-coastal-commission/you-are-bigger-than-you-think",
  "/work/call-and-response":                        "/work/made-in-a-free-world/call-and-response",
  "/work/case-study-4":                             "/case-studies",
  "/work/cash-after-every-dash":                    "/work/doordash/cash-after-every-dash",
  "/work/charlie":                                  "/work/habit-burger/better-by-char",
  "/work/chime":                                    "/work/chime",
  "/work/chime-feels":                              "/work/chime/chime-feels",
  "/work/coachart":                                 "/work/coachart",
  "/work/constellation":                            "/work/meyer-sound/constellation",
  "/work/corpay":                                   "/work/corpay",
  "/work/coupa-tbd":                                "/work/coupa/behold-the-power-of-spend",
  "/work/credit-karma-dads":                        "/work/credit-karma/dads",
  "/work/design":                                   "/work/design",
  "/work/designed-for-summer":                      "/work/world-market/designed-for-summer",
  "/work/do-something-special":                     "/work/special-olypics/do-something-special",
  "/work/drop-a-brick-2":                           "/work/california-drought-prevention/drop-a-brick",
  "/work/ebay":                                     "/work/ebay/magic-box",
  "/work/everyone-deserves-the-1":                  "/work/habit-burger/everyone-deserves-the-1",
  "/work/extra-space-storage":                      "/work/extra-space-storage",
  "/work/financial-literacy":                       "/work/chime/financial-literacy",
  "/work/gaming":                                   "/work/gaming-reel",
  "/work/get-unstuck":                              "/work/course-hero/get-unstuck",
  "/work/gift-thoughtfully":                        "/work/world-market/gift-thoughtfully",
  "/work/goldberg-case-study":                      "/work/wwe-2k/goldberg-case-study",
  "/work/golf-is-hard-swing-easy":                  "/work/penny-golf/golf-is-hard-swing-easy",
  "/work/gong":                                     "/work/gong",
  "/work/grassroots-rebrand":                       "/work/grass-roots-farmers-co-op/meat-with-intention",
  "/work/hear-it-right-main":                       "/work/meyer-sound/hear-it-right",
  "/work/hotel-tonight":                            "/work/hoteltonight",
  "/work/hoteltonight-airbnb-later":                "/work/hoteltonight/hoteltonight-airbnb-later",
  "/work/hunt-anywhere":                            "/work/monster-hunter-now/hunt-anywhere",
  "/work/just-redwood":                             "/work/redwood/just-redwood",
  "/work/legends":                                  "/work/wwe-2k/legends",
  "/work/make-an-impact":                           "/work/lifestraw/make-an-impact",
  "/work/make-it-magical":                          "/work/world-market/make-it-magical",
  "/work/marvel-strike-force":                      "/work/marvel/heroes-only",
  "/work/mask":                                     "/work/sutter-health/mask",
  "/work/metaride":                                 "/work/meta-prosper",
  "/work/meyer-sound":                              "/work/meyer-sound",
  "/work/mountain":                                 "/work/ariat/mountain",
  "/work/mvp":                                      "/work/daily-mvp/mvp",
  "/work/never-ending":                             "/work/sutter-health/never-ending",
  "/work/pipette":                                  "/work/pipette/whats-this",
  "/work/power-information-precision":              "/work/bonafide/power-information-precision",
  "/work/pro-bono":                                 "/work/pro-bono",
  "/work/redbubble":                                "/work/redbubble",
  "/work/reel":                                     "/work/b2b-reel",
  "/work/retail":                                   "/work/retail-reel",
  "/work/ridiculously-easy":                        "/work/freshworks/ridiculously-easy",
  "/work/save-the-drama":                           "/work/zappos/save-the-drama",
  "/work/showreels":                                "/work/reels",
  "/work/simon-wynton":                             "/work/chime/simon-wynton",
  "/work/sports":                                   "/work/sports-reel",
  "/work/stand-up-2-cancer":                        "/work/stand-up-2-cancer/not-alone",
  "/work/suplex-city":                              "/work/wwe-2k/suplex-city",
  "/work/thats-good-sports":                        "/work/cbs-sports-hq/thats-good-sports",
  "/work/the-city-of-the-future":                   "/work/telosa/the-city-of-the-future",
  "/work/the-delicious-powers-of-açaí-for-everyone": "/work/sambazon/delicious-powers-of-acai",
  "/work/the-intersection-of-humans-and-technology": "/work/ars-x-machina/welcome-to-the-media-revolution",
  "/work/the-performance":                          "/work/world-market/the-performance",
  "/work/the-power-of-you":                         "/work/8x8/the-power-of-you",
  "/work/the-pumpkin-and-the-pantsuit":             "/work/childrens-defense-fund/the-pumpkin-and-the-pantsuit",
  "/work/the-way-to-salad":                         "/work/mixt/the-way-to-salad",
  "/work/this-is-that-place":                       "/work/walmart/this-is-that-place",
  "/work/this-is-the-xfl":                          "/work/xfl/xfl-case-study",
  "/work/to-the-ocean":                             "/work/rubios/to-the-ocean",
  "/work/water-for-your-whatever":                  "/work/toto/water-for-your-whatever",
  "/work/were-1":                                   "/work/habit-burger/americas-number-1-burger",
  "/work/winning-is-a-habit":                       "/work/habit-burger/winning-is-a-habit",
};

// ─── HANDLER ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Decode percent-encoded characters (e.g. %C3%A7 → ç) so the map lookup works
    const pathname = decodeURIComponent(url.pathname);

    // Strip trailing slash for consistency (except root "/")
    const normalised = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

    const destination = REDIRECTS[normalised] ?? "/";

    return Response.redirect(`${DESTINATION}${destination}`, 301);
  },
};
