import type { ProduitDB } from '@/lib/database-types';

export type ProductSalesKind = 'produit' | 'evenement' | 'service';

type VariantsBag = {
  type?: string;
  meta?: Record<string, unknown>;
  variants?: Array<Record<string, unknown>>;
};

function asVariantsBag(variants: unknown): VariantsBag | null {
  if (!variants || typeof variants !== 'object') return null;
  return variants as VariantsBag;
}

/**
 * Détermine le format de vente d'un produit à partir de `variants.type`.
 */
export function getProductSalesKind(product: {
  variants?: unknown;
  categorie?: { nom?: string; slug?: string } | null;
}): ProductSalesKind {
  const typed = asVariantsBag(product.variants);
  if (typed?.type === 'evenement') return 'evenement';
  if (typed?.type === 'service') return 'service';

  const slug = product.categorie?.slug?.toLowerCase() || '';
  const nom = product.categorie?.nom?.toLowerCase() || '';
  if (slug === 'evenements' || nom.includes('événement') || nom.includes('evenement')) {
    return 'evenement';
  }
  if (slug === 'services' || nom.includes('service')) {
    return 'service';
  }

  return 'produit';
}

function formatEventDateBadge(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d
    .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase();
}

function formatEventDateLine(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Mappe un produit DB vers les props d'une CardEvenement.
 */
export function toCardEvenementData(produit: ProduitDB) {
  const typed = asVariantsBag(produit.variants);
  const meta = typed?.meta || {};
  const tickets = Array.isArray(typed?.variants) ? typed!.variants! : [];
  const places = tickets.reduce(
    (sum, t) => sum + (typeof t.stock === 'number' ? t.stock : 0),
    0
  );
  const dateDebut = typeof meta.date_debut === 'string' ? meta.date_debut : undefined;

  return {
    id: produit.id,
    nom: produit.nom,
    prix: produit.prix,
    image_principale: produit.image_principale,
    dateBadge: formatEventDateBadge(dateDebut),
    dateLine: formatEventDateLine(dateDebut),
    lieu: typeof meta.lieu === 'string' ? meta.lieu : undefined,
    placesLine:
      places > 0
        ? places <= 10
          ? `Plus que ${places} place${places > 1 ? 's' : ''}`
          : `${places} places`
        : 'Complet',
    placesUrgent: places > 0 && places <= 10,
    en_stock: produit.en_stock && places > 0,
  };
}

/**
 * Mappe un produit DB vers les props d'une CardService.
 */
export function toCardServiceData(produit: ProduitDB) {
  const typed = asVariantsBag(produit.variants);
  const meta = typed?.meta || {};
  const duree = typeof meta.duree === 'string' ? meta.duree : undefined;
  const surDevis = Boolean(meta.sur_devis);

  return {
    id: produit.id,
    nom: produit.nom,
    prix: produit.prix,
    image_principale: produit.image_principale,
    dureeBadge: duree,
    dureeLine: duree ? `Durée · ${duree}` : undefined,
    lieu: typeof meta.lieu === 'string' ? meta.lieu : undefined,
    dispoLine:
      typeof meta.dispo_label === 'string' ? meta.dispo_label : 'Sur rendez-vous',
    dispoOk: true,
    unitLabel: typeof meta.unit_label === 'string' ? meta.unit_label : 'séance',
    surDevis,
    en_stock: produit.en_stock !== false,
  };
}
