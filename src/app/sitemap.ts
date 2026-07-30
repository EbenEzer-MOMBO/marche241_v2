import { MetadataRoute } from 'next';
import { getAllBoutiquesActives } from '@/lib/services/boutiques';
import { getProduitsParBoutique } from '@/lib/services/produits';
import { getSiteBaseUrl } from '@/lib/seo';
import type { Boutique } from '@/lib/database-types';

/** Cache 1h — évite de régénérer le sitemap à chaque hit Google/Netlify */
export const revalidate = 3600;

/** Netlify ~10s : on garde une marge et on arrête d'ajouter des produits au-delà */
const PRODUCT_FETCH_BUDGET_MS = 7000;
const PRODUCT_FETCH_CONCURRENCY = 6;

function toDate(value: Date | string | undefined | null): Date {
  if (!value) {
    return new Date();
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const current = nextIndex;
        nextIndex += 1;
        results[current] = await mapper(items[current]);
      }
    }
  );

  await Promise.all(workers);
  return results;
}

function boutiqueEntries(
  baseUrl: string,
  boutiques: Boutique[]
): MetadataRoute.Sitemap {
  return boutiques.flatMap((boutique) => {
    const boutiqueModified = toDate(
      boutique.date_modification || boutique.date_creation
    );

    return [
      {
        url: `${baseUrl}/${boutique.slug}`,
        lastModified: boutiqueModified,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${boutique.slug}/produits`,
        lastModified: boutiqueModified,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ];
  });
}

async function productEntriesForBoutique(
  baseUrl: string,
  boutique: Boutique,
  deadline: number
): Promise<MetadataRoute.Sitemap> {
  if (Date.now() >= deadline) {
    return [];
  }

  try {
    const { produits } = await getProduitsParBoutique(boutique.id);
    return produits
      .filter((produit) => !produit.statut || produit.statut === 'actif')
      .map((produit) => ({
        url: `${baseUrl}/${boutique.slug}/produit/${produit.id}`,
        lastModified: toDate(
          produit.date_modification ||
            produit.date_publication ||
            produit.date_creation
        ),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error(
      `Sitemap: impossible de lister les produits de ${boutique.slug}`,
      error
    );
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/affiche_boutiques`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/admin/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];

  try {
    const boutiques = await getAllBoutiquesActives();
    entries.push(...boutiqueEntries(baseUrl, boutiques));

    const deadline = Date.now() + PRODUCT_FETCH_BUDGET_MS;
    const productChunks = await mapWithConcurrency(
      boutiques,
      PRODUCT_FETCH_CONCURRENCY,
      (boutique) => productEntriesForBoutique(baseUrl, boutique, deadline)
    );

    for (const chunk of productChunks) {
      entries.push(...chunk);
    }
  } catch (error) {
    console.error('Sitemap: impossible de lister les boutiques', error);
  }

  return entries;
}
