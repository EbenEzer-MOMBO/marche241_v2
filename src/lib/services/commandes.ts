/**
 * Service pour la gestion des commandes
 */

import api from '@/lib/api';

interface ArticleCommande {
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  nom_produit: string;
  description: string;
  variants_selectionnes?: { [key: string]: any } | null;
}

interface CreerCommandeData {
  boutique_id: number;
  client_nom: string;
  client_telephone: string;
  client_adresse: string;
  client_ville: string;
  client_commune: string;
  client_instructions: string;
  frais_livraison: number;
  taxes: number;
  remise: number;
  articles: ArticleCommande[];
}

interface Commande {
  id: number;
  numero_commande: string;
  boutique_id: number;
  client_nom: string;
  client_telephone: string;
  client_adresse: string;
  client_ville: string;
  client_commune: string;
  client_instructions: string;
  date_commande: string;
  date_confirmation: string | null;
  date_expedition: string | null;
  date_livraison: string | null;
  date_modification: string;
  frais_livraison: number;
  methode_paiement: string | null;
  remise: number;
  sous_total: number;
  statut: string;
  statut_paiement: string;
  taxes: number;
  total: number;
}

interface CommandeResponse {
  success: boolean;
  message: string;
  commande: Commande;
}

/**
 * Créer une nouvelle commande
 * @param commandeData - Données de la commande à créer
 * @returns Promise<CommandeResponse>
 */
export async function creerCommande(commandeData: CreerCommandeData): Promise<CommandeResponse> {
  try {
    const response = await api.post<CommandeResponse>('/commandes', commandeData);
    return response;
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    throw new Error('Impossible de créer la commande. Veuillez réessayer.');
  }
}

export type { CreerCommandeData, ArticleCommande, CommandeResponse, Commande };
