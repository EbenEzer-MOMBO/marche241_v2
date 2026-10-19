import { cache } from 'react';
import config from '@/lib/config';
import { ASSETS_MARQUE_DEFAUT, definirAssetsMarque, type CarteAssetsMarque, type CleAssetMarque } from '@/lib/assets-marque-defaut';

/** Après un échec (API absente ou trop lente), les fichiers par défaut sont servis sans réessayer pendant ce délai. */
const PAUSE_APRES_ECHEC_MS = 60_000;
let echecJusqua = 0;

/**
 * Carte des assets de marque, fusionnée avec les fichiers statiques par défaut.
 * `fetch` direct plutôt que `api.get` : ce dernier lit les cookies et en-têtes de la requête,
 * ce qui rendrait dynamique toute page passant par le layout racine.
 * `cache` partage une seule lecture entre layout, métadonnées et manifest d'une même requête.
 */
export const getAssetsMarque = cache(async (): Promise<CarteAssetsMarque> => {
  const carte: CarteAssetsMarque = { ...ASSETS_MARQUE_DEFAUT };
  if (Date.now() < echecJusqua) {
    definirAssetsMarque(carte);
    return carte;
  }
  try {
    const reponse = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/assets-marque`, {
      next: { revalidate: 300, tags: ['assets-marque'] },
      signal: AbortSignal.timeout(3000),
    });
    if (!reponse.ok) {
      throw new Error(`HTTP ${reponse.status}`);
    }
    const corps = (await reponse.json()) as { assets?: Partial<Record<CleAssetMarque, string | null>> };
    for (const cle of Object.keys(ASSETS_MARQUE_DEFAUT) as CleAssetMarque[]) {
      const url = corps.assets?.[cle];
      if (url) {
        carte[cle] = url;
      }
    }
  } catch {
    echecJusqua = Date.now() + PAUSE_APRES_ECHEC_MS;
  }
  definirAssetsMarque(carte);
  return carte;
});
