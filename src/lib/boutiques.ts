/**
 * Service pour la récupération des boutiques depuis l'API
 */

import { getBoutiqueBySlug, getBoutiqueTheme } from './services/boutiques';

export type BoutiqueConfig = {
  name: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

/**
 * Récupère la configuration d'une boutique depuis l'API
 * @param slug - Le slug de la boutique
 * @returns Promise<BoutiqueConfig> - Configuration de la boutique
 * @throws Error si la boutique n'est pas trouvée
 */
export async function getBoutiqueConfig(slug: string): Promise<BoutiqueConfig> {
  const boutique = await getBoutiqueBySlug(slug);
  
  return {
    name: boutique.nom,
    description: boutique.description || '',
    theme: getBoutiqueTheme(boutique),
  };
}

// Export des services pour utilisation directe
export { getBoutiqueBySlug, getBoutiqueById, getAllBoutiques, updateBoutique, boutiqueExists, getBoutiqueTheme } from './services/boutiques';