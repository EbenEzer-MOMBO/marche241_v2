'use client';

import { createContext, useContext } from 'react';
import {
  ASSETS_MARQUE_DEFAUT,
  definirAssetsMarque,
  logoBoutiqueOuDefaut,
  type CarteAssetsMarque,
  type CleAssetMarque,
} from '@/lib/assets-marque-defaut';

const AssetsMarqueContext = createContext<CarteAssetsMarque>(ASSETS_MARQUE_DEFAUT);

export function AssetsMarqueProvider({
  assets,
  children,
}: {
  assets: CarteAssetsMarque;
  children: React.ReactNode;
}) {
  definirAssetsMarque(assets);
  return <AssetsMarqueContext.Provider value={assets}>{children}</AssetsMarqueContext.Provider>;
}

export function useAssetMarque(cle: CleAssetMarque): string {
  return useContext(AssetsMarqueContext)[cle] || ASSETS_MARQUE_DEFAUT[cle];
}

/** Retourne une fonction qui donne le logo d'une boutique, avec l'image par défaut courante en repli. */
export function useLogoBoutique(): (logoUrl?: string | null) => string {
  const defaut = useAssetMarque('image_boutique_defaut');
  return (logoUrl) => logoBoutiqueOuDefaut(logoUrl, defaut);
}
