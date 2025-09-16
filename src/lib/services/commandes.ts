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

interface CommandeResponse {
  id: number;
  numero_commande: string;
  statut: string;
  total: number;
  date_creation: string;
  // Autres champs selon la réponse de l'API
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

export type { CreerCommandeData, ArticleCommande, CommandeResponse };
