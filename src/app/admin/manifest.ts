import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marché241 - Administration',
    short_name: 'Marché241 Admin',
    description: 'Interface d\'administration pour les boutiques Marché241',
    start_url: '/admin',
    scope: '/admin/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/marche241_Web_without_text-01-01.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity'],
    lang: 'fr-GA',
    dir: 'ltr',
  };
}
