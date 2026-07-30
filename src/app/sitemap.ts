import { MetadataRoute } from 'next';
import { getAllBoutiquesActives } from '@/lib/services/boutiques';
import { getProduitsParBoutique } from '@/lib/services/produits';
import { getSiteBaseUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

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

    for (const boutique of boutiques) {
      const boutiqueModified = toDate(
        boutique.date_modification || boutique.date_creation
      );

      entries.push(
        {
          url: `${baseUrl}/${boutique.slug}`,
          lastModified: boutiqueModified,
          changeFrequency: 'daily',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/${boutique.slug}/produits`,
          lastModified: boutiqueModified,
          changeFrequency: 'daily',
          priority: 0.8,
        }
      );

      try {
        const { produits } = await getProduitsParBoutique(boutique.id);
        for (const produit of produits) {
          if (produit.statut && produit.statut !== 'actif') {
            continue;
          }
          entries.push({
            url: `${baseUrl}/${boutique.slug}/produit/${produit.id}`,
            lastModified: toDate(
              produit.date_modification ||
                produit.date_publication ||
                produit.date_creation
            ),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      } catch (error) {
        console.error(
          `Sitemap: impossible de lister les produits de ${boutique.slug}`,
          error
        );
      }
    }
  } catch (error) {
    console.error('Sitemap: impossible de lister les boutiques', error);
  }

  return entries;
}
