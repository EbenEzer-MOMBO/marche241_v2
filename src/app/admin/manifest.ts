import { MetadataRoute } from 'next';
import { getAssetsMarque } from '@/lib/services/assets-marque';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const assets = await getAssetsMarque();
  return {
    name: 'Marché241 - Administration',
    short_name: 'Marché241 Admin',
    description: 'Interface d\'administration pour les boutiques Marché241',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: assets.icone_app,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: assets.icone_app,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity'],
    lang: 'fr-GA',
    dir: 'ltr',
  };
}
