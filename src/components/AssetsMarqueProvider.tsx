'use client';

import { createContext, useContext } from 'react';
import { ASSETS_MARQUE_DEFAUT, type CarteAssetsMarque, type CleAssetMarque } from '@/lib/assets-marque-defaut';

const AssetsMarqueContext = createContext<CarteAssetsMarque>(ASSETS_MARQUE_DEFAUT);

export function AssetsMarqueProvider({
  assets,
  children,
}: {
  assets: CarteAssetsMarque;
  children: React.ReactNode;
}) {
  return <AssetsMarqueContext.Provider value={assets}>{children}</AssetsMarqueContext.Provider>;
}

export function useAssetMarque(cle: CleAssetMarque): string {
  return useContext(AssetsMarqueContext)[cle] || ASSETS_MARQUE_DEFAUT[cle];
}
