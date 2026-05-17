import type { PersonnalisationSelectionPanier } from '@/lib/types/personnalisations';

/** Somme des supplémentaires « personnalisation », par unité de produit dans la ligne panier */
export const getSupplementPersonnalisationsUnitaire = (
  selections?: PersonnalisationSelectionPanier[] | null
): number => {
  if (!selections?.length) {
    return 0;
  }
  return selections.reduce((acc, p) => acc + (Number(p.prix_supplementaire) || 0), 0);
};

export interface PanierItemPricingShape {
  quantite: number;
  variants_selectionnes: {
    variant?: { prix?: number };
    personnalisations?: PersonnalisationSelectionPanier[];
    [key: string]: unknown;
  } | null | undefined;
  produit: { prix: number };
}

export const getPrixVariantOuProduit = (item: PanierItemPricingShape): number =>
  item.variants_selectionnes?.variant?.prix ?? item.produit.prix;

export const getPrixUnitairePanier = (item: PanierItemPricingShape): number =>
  getPrixVariantOuProduit(item) +
  getSupplementPersonnalisationsUnitaire(item.variants_selectionnes?.personnalisations ?? null);

export const getSousTotalLignePanier = (item: PanierItemPricingShape): number =>
  getPrixUnitairePanier(item) * item.quantite;
