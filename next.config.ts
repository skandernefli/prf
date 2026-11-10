import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "skandernefli.eu" }],
        destination: "https://www.skandernefli.eu/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const scriptSources = [
      "'self'",
      "'unsafe-inline'",
      ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
    ];

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), geolocation=(), microphone=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "connect-src 'self'",
          "font-src 'self' data:",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "img-src 'self' data: blob:",
          "object-src 'none'",
          `script-src ${scriptSources.join(" ")}`,
          "style-src 'self' 'unsafe-inline'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000",
            },
          ]
        : []),
    ];

    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": [
        {
          condition: { not: { path: "*.module.css" } },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
        {
          condition: { path: "*.module.css" },
          loaders: ["@tailwindcss/turbopack"],
        },
      ],
    },
  },
};

export default nextConfig;
