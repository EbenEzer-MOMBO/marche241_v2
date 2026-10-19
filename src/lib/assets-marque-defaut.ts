export const ASSETS_MARQUE_DEFAUT = {
  logo_icone: '/marche241_Web_without_text-01-01.svg',
  logo_texte: '/Logo_vector_text-02.svg',
  logo_complet: '/marche241_Web_with_text-01.svg',
  logo_email: '/images/site-logo-mail.png',
  favicon: '/favicon.ico',
  icone_app: '/site-logo.png',
  image_partage: '/marche241_Web-01.svg',
  hero_home: '/home1.jpg',
  illustration_1: '/home1.png',
  illustration_2: '/home2.png',
  illustration_3: '/home3.jpg',
  fond_billetterie: '/images/billetterie/concert-fond.jpg',
  image_boutique_defaut: '/default-shop.png',
  image_produit_defaut: '/default-product.png',
} as const;

export type CleAssetMarque = keyof typeof ASSETS_MARQUE_DEFAUT;
export type CarteAssetsMarque = Record<CleAssetMarque, string>;
