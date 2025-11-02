import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marché241 - Boutique en ligne au Gabon',
    short_name: 'Marché241',
    description: 'Plateforme de commerce en ligne pour les commerçants gabonais',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/site-logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    categories: ['shopping', 'business'],
    lang: 'fr-GA',
    dir: 'ltr',
  };
}

