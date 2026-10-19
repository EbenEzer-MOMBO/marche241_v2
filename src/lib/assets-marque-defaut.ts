import type { CleAssetMarque } from '@/lib/database-types';

export type { CleAssetMarque };
export type CarteAssetsMarque = Record<CleAssetMarque, string>;

/** Fichiers statiques utilisés quand un emplacement est vide ou que l'API ne répond pas. */
export const ASSETS_MARQUE_DEFAUT: CarteAssetsMarque = {
  logo_icone: '/marche241_Web_without_text-01-01.svg',
  logo_texte: '/Logo_vector_text-02.svg',
  logo_complet: '/marche241_Web_with_text-01.svg',
  logo_email: '/images/site-logo-mail.png',
  favicon: '/favicon-defaut.ico',
  icone_app: '/site-logo.png',
  image_partage: '/partage-defaut.png',
  hero_home: '/home1.jpg',
  illustration_1: '/home1.png',
  illustration_2: '/home2.png',
  illustration_3: '/home3.jpg',
  fond_billetterie: '/images/billetterie/concert-fond.jpg',
  image_boutique_defaut: '/default-shop.png',
  image_produit_defaut: '/default-product.png',
};

let carteCourante: CarteAssetsMarque = ASSETS_MARQUE_DEFAUT;

/**
 * Mémorise la carte chargée (layout racine côté serveur, provider côté client) pour les utilitaires
 * qui ne sont pas des composants (`getProduitImageUrl`, `absoluteAssetUrl`). La carte est commune
 * à tous les visiteurs, la partager au niveau du module est sans risque.
 */
export function definirAssetsMarque(carte: CarteAssetsMarque): void {
  carteCourante = carte;
}

export function assetMarque(cle: CleAssetMarque): string {
  return carteCourante[cle] || ASSETS_MARQUE_DEFAUT[cle];
}

/** URL absolue d'une image (logo de boutique, image de produit), ou l'image par défaut si elle est absente ou invalide. */
export function urlImageOuDefaut(url: string | null | undefined, defaut: string): string {
  if (url && url.trim() !== '') {
    try {
      new URL(url);
      return url;
    } catch {
      return defaut;
    }
  }
  return defaut;
}
