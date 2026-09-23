import type { Metadata } from 'next';
import { absoluteUrl, OG_LOCALE, SITE_URL } from '@/lib/seo';
import MarketplaceProduitsClient from './MarketplaceProduitsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Recherche produits — Marché 241',
  description:
    'Recherchez et filtrez les produits de toutes les boutiques Marché 241 : mot-clé, prix, catégorie et localisation.',
  alternates: {
    canonical: `${SITE_URL}/produits`,
  },
  openGraph: {
    title: 'Recherche produits — Marché 241',
    description:
      'Catalogue marketplace avec recherche, filtres prix / catégorie / commune et URL partageable.',
    url: absoluteUrl('/produits'),
    locale: OG_LOCALE,
    type: 'website',
  },
};

export default function MarketplaceProduitsPage() {
  return <MarketplaceProduitsClient />;
}
