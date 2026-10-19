import { ASSETS_MARQUE_DEFAUT, type CarteAssetsMarque, type CleAssetMarque } from '@/lib/assets-marque-defaut';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3001/api/v1';

export async function getAssetsMarque(): Promise<CarteAssetsMarque> {
  const carte: CarteAssetsMarque = { ...ASSETS_MARQUE_DEFAUT };
  try {
    const reponse = await fetch(`${API.replace(/\/$/, '')}/assets-marque`, {
      next: { revalidate: 300, tags: ['assets-marque'] },
    });
    if (!reponse.ok) {
      return carte;
    }
    const corps = (await reponse.json()) as { assets?: Partial<Record<CleAssetMarque, string | null>> };
    for (const cle of Object.keys(ASSETS_MARQUE_DEFAUT) as CleAssetMarque[]) {
      const url = corps.assets?.[cle];
      if (url) {
        carte[cle] = url;
      }
    }
  } catch {
    return carte;
  }
  return carte;
}
