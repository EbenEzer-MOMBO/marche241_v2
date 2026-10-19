import config from '@/lib/config';
import { ASSETS_MARQUE_DEFAUT, definirAssetsMarque, type CarteAssetsMarque, type CleAssetMarque } from '@/lib/assets-marque-defaut';

/**
 * Carte des assets de marque, fusionnée avec les fichiers statiques par défaut.
 * `fetch` direct plutôt que `api.get` : ce dernier lit les cookies et en-têtes de la requête,
 * ce qui rendrait dynamique toute page passant par le layout racine.
 */
export async function getAssetsMarque(): Promise<CarteAssetsMarque> {
  const carte: CarteAssetsMarque = { ...ASSETS_MARQUE_DEFAUT };
  try {
    const reponse = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/assets-marque`, {
      next: { revalidate: 300, tags: ['assets-marque'] },
      signal: AbortSignal.timeout(3000),
    });
    if (reponse.ok) {
      const corps = (await reponse.json()) as { assets?: Partial<Record<CleAssetMarque, string | null>> };
      for (const cle of Object.keys(ASSETS_MARQUE_DEFAUT) as CleAssetMarque[]) {
        const url = corps.assets?.[cle];
        if (url) {
          carte[cle] = url;
        }
      }
    }
  } catch {
    // API indisponible ou trop lente : fichiers statiques
  }
  definirAssetsMarque(carte);
  return carte;
}
