import type { Boutique, ProduitDB, ProduitDetail } from '@/lib/database-types';

export const SITE_URL = 'https://marche241.ga';
export const OG_LOCALE = 'fr_GA';

export const SOCIAL_PROFILES = [
  'https://www.instagram.com/marche.241',
  'https://www.facebook.com/share/1aWtaTFYQQ/?mibextid=wwXIfr',
] as const;

/**
 * URL absolue du site pour canonical / Open Graph.
 * Prefer NEXT_PUBLIC_BASE_URL, puis NEXT_PUBLIC_SITE_URL, sinon production.
 * Ne jamais retomber sur localhost en production.
 */
export function getSiteBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv && !fromEnv.includes('localhost')) {
    return fromEnv.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'development' && fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return SITE_URL;
}

export function absoluteUrl(path = ''): string {
  const base = getSiteBaseUrl();
  if (!path || path === '/') {
    return base;
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function absoluteAssetUrl(url?: string | null, fallbackPath = '/default-shop.png'): string {
  if (url && url.trim() !== '') {
    try {
      new URL(url);
      return url;
    } catch {
      return absoluteUrl(url.startsWith('/') ? url : `/${url}`);
    }
  }
  return absoluteUrl(fallbackPath);
}

export function buildStoreJsonLd(boutique: Boutique, boutiqueSlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: boutique.nom,
    description:
      boutique.description || `Boutique en ligne ${boutique.nom} sur Marché241`,
    url: absoluteUrl(`/${boutiqueSlug}`),
    image: absoluteAssetUrl(boutique.logo),
    telephone: boutique.telephone || undefined,
    email: boutique.email || undefined,
    address: boutique.ville
      ? {
          '@type': 'PostalAddress',
          addressLocality: boutique.ville,
          addressCountry: 'GA',
          streetAddress: boutique.adresse || undefined,
        }
      : undefined,
    areaServed: {
      '@type': 'Country',
      name: 'Gabon',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Marché241',
      url: SITE_URL,
    },
  };
}

export function buildProductJsonLd(
  product: ProduitDetail | ProduitDB,
  boutiqueName: string,
  boutiqueSlug: string,
  productId: string | number
) {
  const name = 'nom' in product ? product.nom : '';
  const description =
    ('description' in product && product.description) ||
    ('description_courte' in product && product.description_courte) ||
    `${name} sur ${boutiqueName}`;
  const image =
    ('image_principale' in product && product.image_principale) ||
    undefined;
  const price = 'prix' in product ? product.prix : 0;
  const inStock =
    'en_stock' in product ? Boolean(product.en_stock) : true;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? [absoluteAssetUrl(image)] : undefined,
    sku: 'sku' in product ? product.sku || String(productId) : String(productId),
    brand: {
      '@type': 'Brand',
      name: boutiqueName,
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/${boutiqueSlug}/produit/${productId}`),
      priceCurrency: 'XAF',
      price: Number(price),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: boutiqueName,
      },
    },
  };
}
