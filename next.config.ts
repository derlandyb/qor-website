import type { NextConfig } from "next";

/**
 * Server-side-only proxy target for the api container — never exposed to
 * the browser (not NEXT_PUBLIC_*). Paired with lib/api/http.ts's same-origin
 * mode (NEXT_PUBLIC_API_BASE_URL=""): the browser calls this Next server's
 * own origin, relatively, and this rewrite forwards it internally over the
 * Docker network so Sanctum's session cookie — set with no explicit Domain
 * (api/.env's SESSION_DOMAIN=null) — is always same-origin from the
 * browser's point of view, whether that browser is a developer's host
 * Chrome hitting the website container's published port, or Playwright's
 * bundled Chromium running inside the website container itself
 * (make e2e-website). Same pattern as qor-admin's next.config.ts.
 */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://api:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` },
      { source: "/sanctum/:path*", destination: `${API_PROXY_TARGET}/sanctum/:path*` },
    ];
  },
};

export default nextConfig;
