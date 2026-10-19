import type { Metadata } from 'next';
import { absoluteUrl, OG_LOCALE, PARTAGE_SITE, SITE_URL } from '@/lib/seo';
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
      siteName: PARTAGE_SITE.siteName,
      title: PARTAGE_SITE.title,
      description: PARTAGE_SITE.description,
      images: [{ url: assets.image_partage, width: 1200, height: 630, alt: PARTAGE_SITE.imageAlt }],
    },
  };
}

export default function HomePage() {
  return <LandingHomeClient />;
}
