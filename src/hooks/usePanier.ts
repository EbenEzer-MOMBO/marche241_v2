/**
 * Hook pour la gestion du panier
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ajouterAuPanier, 
  getPanier, 
  mettreAJourQuantitePanier, 
  supprimerDuPanier, 
  viderPanier 
} from '@/lib/services/panier';

interface PanierItem {
  id: number;
  session_id: string;
  boutique_id: number;
  produit_id: number;
  quantite: number;
  variants_selectionnes: { [key: string]: any } | null;
  date_creation: string;
  date_modification: string;
  boutique: {
    id: number;
    nom: string;
    logo?: string;
    slug: string;
    statut: string;
    adresse?: string;
    telephone?: string;
    vendeur_id: number;
    description?: string;
    nombre_avis: number;
    note_moyenne: number;
    date_creation: string;
    nombre_produits: number;
    couleur_primaire?: string;
    date_modification: string;
    couleur_secondaire?: string;
  };
  produit: {
    id: number;
    nom: string;
    sku?: string;
    prix: number;
    slug: string;
    tags?: any;
    poids?: number;
    images?: any;
    statut: string;
    en_stock: boolean;
    variants?: { [key: string]: any };
    dimensions?: any;
    boutique_id: number;
    description?: string;
    est_nouveau: boolean;
    nombre_avis: number;
    nombre_vues: number;
    categorie_id: number;
    est_featured: boolean;
    note_moyenne: number;
    date_creation: string;
    nombre_ventes: number;
    prix_original?: number;
    quantite_stock: number;
    date_publication?: string;
    est_en_promotion: boolean;
    image_principale?: string;
    date_modification: string;
    description_courte?: string;
  };
}

interface UsePanierResult {
  panier: PanierItem[];
  totalItems: number;
  totalPrix: number;
  loading: boolean;
  error: string | null;
  ajouterProduit: (
    boutiqueId: number,
    produitId: number,
    quantite: number,
    variantsSelectionnes?: { [key: string]: string }
  ) => Promise<boolean>;
  mettreAJourQuantite: (itemId: number, quantite: number) => Promise<boolean>;
  supprimerItem: (itemId: number) => Promise<boolean>;
  viderLePanier: () => Promise<boolean>;
  rafraichir: () => Promise<void>;
}

/**
 * Hook pour gérer le panier d'achat
 * @returns Panier, fonctions de gestion et état de chargement
 */
export function usePanier(): UsePanierResult {
  const [panier, setPanier] = useState<PanierItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrix, setTotalPrix] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chargerPanier = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPanier();
      setPanier(response.panier);
      
      // Calculer les totaux à partir des données du panier
      const totalItems = response.panier.reduce((total, item) => total + item.quantite, 0);
      const totalPrix = response.panier.reduce((total, item) => total + (item.produit.prix * item.quantite), 0);
      
      setTotalItems(totalItems);
      setTotalPrix(totalPrix);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement du panier:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const rafraichir = useCallback(async () => {
    await chargerPanier();
  }, [chargerPanier]);

  const ajouterProduit = useCallback(async (
    boutiqueId: number,
    produitId: number,
    quantite: number,
    variantsSelectionnes: { [key: string]: string } = {}
  ): Promise<boolean> => {
    try {
      setError(null);
      
      await ajouterAuPanier(boutiqueId, produitId, quantite, variantsSelectionnes);
      
      // Recharger le panier après ajout
      await chargerPanier();
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier';
      console.error('Erreur lors de l\'ajout au panier:', err);
      setError(errorMessage);
      return false;
    }
  }, [chargerPanier]);

  const mettreAJourQuantite = useCallback(async (
    itemId: number,
    quantite: number
  ): Promise<boolean> => {
    try {
      setError(null);
      
      await mettreAJourQuantitePanier(itemId, quantite);
      
      // Recharger le panier après mise à jour
      await chargerPanier();
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? 
        err.message : 'Erreur lors de la mise à jour de la quantité';
      console.error('Erreur lors de la mise à jour de la quantité:', err);
      setError(errorMessage);
      return false;
    }
  }, [chargerPanier]);

  const supprimerItem = useCallback(async (itemId: number): Promise<boolean> => {
    try {
      setError(null);
      
      await supprimerDuPanier(itemId);
      
      // Recharger le panier après suppression
      await chargerPanier();
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      console.error('Erreur lors de la suppression du panier:', err);
      setError(errorMessage);
      return false;
    }
  }, [chargerPanier]);

  const viderLePanier = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      await viderPanier();
      
      // Recharger le panier après vidage
      await chargerPanier();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du vidage du panier';
      console.error('Erreur lors du vidage du panier:', err);
      setError(errorMessage);
      return false;
    }
  }, [chargerPanier]);

  // Charger le panier au montage du composant
  useEffect(() => {
    chargerPanier();
  }, [chargerPanier]);

  return {
    panier,
    totalItems,
    totalPrix,
    loading,
    error,
    ajouterProduit,
    mettreAJourQuantite,
    supprimerItem,
    viderLePanier,
    rafraichir,
  };
}

/**
 * Hook simplifié pour ajouter un produit au panier sans gérer l'état complet
 * @returns Fonction d'ajout et état de chargement
 */
export function useAjoutPanier() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ajouterProduit = useCallback(async (
    boutiqueId: number,
    produitId: number,
    quantite: number,
    variantsSelectionnes: { [key: string]: string } = {}
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await ajouterAuPanier(boutiqueId, produitId, quantite, variantsSelectionnes);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout au panier';
      console.error('Erreur lors de l\'ajout au panier:', err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ajouterProduit,
    loading,
    error,
  };
}

export default {
  usePanier,
  useAjoutPanier
};
