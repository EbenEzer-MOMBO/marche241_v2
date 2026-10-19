import { MetadataRoute } from 'next';
import { getAssetsMarque } from '@/lib/services/assets-marque';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const assets = await getAssetsMarque();
  const iconeSvg = assets.logo_icone.endsWith('.svg');
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
        src: assets.logo_icone,
        sizes: 'any',
        type: iconeSvg ? 'image/svg+xml' : 'image/png',
      },
      {
        src: assets.icone_app,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['shopping', 'business'],
    lang: 'fr-GA',
    dir: 'ltr',
  };
}
