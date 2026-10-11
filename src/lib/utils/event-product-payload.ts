import type { ProduitDB } from '@/lib/database-types';
import { genererSlugProduit } from '@/lib/services/products';
import { calculerPrixPourApi } from '@/lib/utils/prix-promo';

export interface EventTicketInput {
  id: string;
  nom: string;
  prix: number;
  prix_promo?: number;
  stock: number;
  image?: string;
}

/** Données émises par `EventProductForm.onSave`. */
export interface EventFormPayload {
  id?: number;
  nom: string;
  description?: string;
  categorie_id: number;
  statut?: 'actif' | 'inactif' | 'brouillon' | 'en_attente_validation';
  images?: string[];
  image_principale?: string;
  meta?: Record<string, unknown>;
  variants: EventTicketInput[];
}

/**
 * Convertit la saisie du formulaire événement en payload API produit :
 * billets dans `variants.variants`, stock = somme des places,
 * prix = billet le moins cher en prix effectif (promo comprise), envoyé avec prix_promo (contrat unique : cf. prix-promo.ts).
 */
export function buildEventProductApiPayload(data: EventFormPayload) {
  const tickets = Array.isArray(data.variants) ? data.variants : [];
  const variants = {
    type: 'evenement',
    meta: data.meta || {},
    variants: tickets.map((t) => ({
      id: t.id,
      nom: t.nom,
      prix: t.prix,
      prix_promo: t.prix_promo,
      stock: t.stock || 0,
      image: t.image,
    })),
  };

  const stock = tickets.reduce((sum, t) => sum + (t.stock || 0), 0);

  const { prix, prix_promo } = calculerPrixPourApi({ category: 'evenement', variants: tickets });

  const images = data.images || [];

  return {
    nom: data.nom,
    slug: genererSlugProduit(data.nom),
    description: data.description || '',
    prix,
    prix_promo,
    en_stock: stock,
    categorie_id: data.categorie_id,
    images,
    image_principale: data.image_principale || images[0] || undefined,
    variants,
    statut: data.statut || 'brouillon',
  };
}

/** Produit API → valeur `productToEdit` attendue par `EventProductForm`. */
export function eventProductToFormValue(produit: ProduitDB) {
  const bag = (produit.variants && typeof produit.variants === 'object' ? produit.variants : {}) as {
    meta?: Record<string, unknown>;
    variants?: unknown[];
  };
  return {
    id: produit.id,
    nom: produit.nom,
    description: produit.description,
    categorie_id: produit.categorie_id,
    statut: produit.statut === 'actif' ? 'actif' : produit.statut === 'brouillon' ? 'brouillon' : 'inactif',
    images: produit.images || [],
    meta: bag.meta || {},
    tickets: Array.isArray(bag.variants) ? bag.variants : [],
  };
}
