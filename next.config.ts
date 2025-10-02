import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['http://192.168.1.27:3000'],
  
  // Configuration pour l'export statique sur Netlify
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Optimisation pour les routes dynamiques
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Redirection de la racine vers marche_241 par défaut
  // Note: Les redirections sont gérées dans netlify.toml pour l'export statique
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/marche_241',
  //       permanent: false,
  //     },
  //   ];
  // },
};

export default nextConfig;
