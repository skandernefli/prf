import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    ...(isDev && {
      serverComponentsHmrCache: false,
    }),
  },

  cacheComponents: false,

  turbopack: {
    rules: {
      "*.css": [
        {
          condition: {
            not: { path: "*.module.css" },
          },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
        {
          condition: {
            path: "*.module.css",
          },
          loaders: ["@tailwindcss/turbopack"],
        },
      ],
    },
  },
};

export default nextConfig;
