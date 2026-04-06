/**
 * Cloudflare Worker: Subdomain Proxy for optimismbh.com
 *
 * Routes subdomain traffic to the correct path on the main Lovable app,
 * injecting a path-correction script before React boots so the router
 * renders the right section.
 *
 *   crm.optimismbh.com   →  optimismbh.com/crm
 *   brand.optimismbh.com →  optimismbh.com/brand
 */

const SUBDOMAIN_MAP = {
  "crm.optimismbh.com": "/crm",
  "brand.optimismbh.com": "/brand",
};

const MAIN_DOMAIN = "optimismbh.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const basePath = SUBDOMAIN_MAP[url.hostname];

    // Not a subdomain we manage — pass through untouched
    if (!basePath) {
      return fetch(request);
    }

    // Rewrite the request to the main domain, keeping the path intact
    const targetUrl = new URL(request.url);
    targetUrl.hostname = MAIN_DOMAIN;

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
    });

    // For HTML at the root path, inject a script that sets the correct
    // initial browser path before React/React Router initialises.
    // This makes window.location.pathname === '/crm' (etc.) when React boots,
    // so the router renders the right section without any app code changes.
    const contentType = response.headers.get("content-type") || "";
    if (url.pathname === "/" && contentType.includes("text/html")) {
      const html = await response.text();

      // Runs synchronously before any other scripts: sets path to /crm or /brand
      const script = `<script>history.replaceState(null,'','${basePath}'+window.location.search+window.location.hash);</script>`;
      const modified = html.replace("<head>", `<head>${script}`);

      const headers = new Headers(response.headers);
      headers.delete("content-length"); // length changed after injection

      return new Response(modified, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // All other requests (JS, CSS, images, API calls, deep links) proxy as-is
    return response;
  },
};
