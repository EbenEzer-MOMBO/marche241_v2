import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['http://192.168.1.27:3000'],
  
  // Configuration des images externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aeukfmfxvcnrjfktahab.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Vous pouvez ajouter d'autres domaines ici si nécessaire
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

export default nextConfig;
