import type { Metadata } from 'next';
import { absoluteUrl, OG_LOCALE, SITE_URL } from '@/lib/seo';
import MarketplaceProduitsClient from './MarketplaceProduitsClient';

export const dynamic = 'force-dynamic';

const url = absoluteUrl('/produits');

export const metadata: Metadata = {
  title: 'Tous les produits',
  description:
    'Recherchez et filtrez les produits de toutes les boutiques Marché241 : prix, commune, catégorie.',
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: 'Tous les produits | Marché241',
    description:
      'Catalogue marketplace : recherche, prix, localisation et catégories, avec URL partageable.',
    url,
    locale: OG_LOCALE,
    type: 'website',
    siteName: SITE_URL,
  },
};

export default function MarketplaceProduitsPage() {
  return <MarketplaceProduitsClient />;
}
