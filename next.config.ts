import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['http://192.168.1.27:3000'],
  
  // Configuration Turbopack (Next.js 16+)
  turbopack: {},
  
  // Configuration des images externes
  images: {
    remotePatterns: [
      // CDN Cloudflare R2 (stockage actuel)
      {
        protocol: 'https',
        hostname: 'cdn.marche241.ga',
        port: '',
        pathname: '/**',
      },
      // Sous-domaine public R2, utilisé en secours
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
      // Supabase Storage (obsolète, conservé le temps de la migration)
      {
        protocol: 'https',
        hostname: 'aeukfmfxvcnrjfktahab.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Optimisation pour les routes dynamiques
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Redirection désactivée - landing page à la racine
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/marche_241',
  //       permanent: false,
  //     },
  //   ];
  // },

  // Configuration des headers pour le sitemap et robots.txt
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },

  // Configuration webpack pour supprimer les console.log en production
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
            },
          },
        })
      );
    }
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "kordex",

  project: "marche241-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
