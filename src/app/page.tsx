import type { Metadata } from 'next';
import { absoluteUrl, OG_LOCALE, SITE_URL } from '@/lib/seo';
import { getAssetsMarque } from '@/lib/services/assets-marque';
import LandingHomeClient from '@/components/landing/LandingHomeClient';

/** `openGraph` d'une page remplace celui du layout : titre, description et image sont repris ici. */
export async function generateMetadata(): Promise<Metadata> {
  const assets = await getAssetsMarque();
  return {
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: 'website',
      url: absoluteUrl('/'),
      locale: OG_LOCALE,
      siteName: 'Marché241',
      title: 'Marché241 - Créez votre boutique en ligne au Gabon',
      description: 'Plateforme de commerce en ligne pour les commerçants gabonais. Créez, gérez et développez votre boutique facilement.',
      images: [{ url: assets.image_partage, width: 1200, height: 630, alt: 'Marché241 - Boutique en ligne' }],
    },
  };
}

export default function HomePage() {
  return <LandingHomeClient />;
}
