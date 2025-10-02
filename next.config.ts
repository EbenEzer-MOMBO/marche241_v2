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
  
  // Redirection de la racine vers marche_241 par défaut
  async redirects() {
    return [
      {
        source: '/',
        destination: '/marche_241',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
