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

interface CommandesParams {
  page?: number;
  limite?: number;
  statut?: string;
  tri_par?: string;
  ordre?: 'ASC' | 'DESC';
  recherche?: string;
}

interface CommandesResponse {
  success: boolean;
  commandes: Commande[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
}

interface ModifierCommandeData {
  statut?: string;
  statut_paiement?: string;
  date_confirmation?: string;
  date_expedition?: string;
  date_livraison?: string;
  methode_paiement?: string;
}

interface ArticleDetails {
  id?: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  nom_produit: string;
  description?: string;
  image_url?: string;
  variants_selectionnes?: { [key: string]: any } | null;
}

interface CommandeDetailsResponse {
  success: boolean;
  commande: Commande;
  articles: ArticleDetails[];
  nombre_articles: number;
}

/**
 * Récupérer les commandes d'une boutique
 * @param boutiqueId - ID de la boutique
 * @param params - Paramètres de pagination et filtrage
 * @returns Promise<CommandesResponse>
 */
export async function getCommandesParBoutique(
  boutiqueId: number,
  params: CommandesParams = {}
): Promise<CommandesResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limite) queryParams.append('limite', params.limite.toString());
    if (params.statut) queryParams.append('statut', params.statut);
    if (params.tri_par) queryParams.append('tri_par', params.tri_par);
    if (params.ordre) queryParams.append('ordre', params.ordre);
    if (params.recherche) queryParams.append('recherche', params.recherche);

    const url = `/commandes/boutique/${boutiqueId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<CommandesResponse>(url);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    throw new Error('Impossible de récupérer les commandes. Veuillez réessayer.');
  }
}

/**
 * Récupérer une commande par son ID
 * @param commandeId - ID de la commande
 * @returns Promise<Commande>
 */
export async function getCommandeById(commandeId: number): Promise<Commande> {
  try {
    const response = await api.get<CommandeResponse>(`/commandes/${commandeId}`);
    return response.commande;
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    throw new Error('Impossible de récupérer la commande. Veuillez réessayer.');
  }
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

/**
 * Modifier une commande existante
 * @param commandeId - ID de la commande
 * @param data - Données à modifier
 * @returns Promise<Commande>
 */
export async function modifierCommande(
  commandeId: number,
  data: ModifierCommandeData
): Promise<Commande> {
  try {
    const response = await api.put<CommandeResponse>(`/commandes/${commandeId}`, data);
    return response.commande;
  } catch (error) {
    console.error('Erreur lors de la modification de la commande:', error);
    throw new Error('Impossible de modifier la commande. Veuillez réessayer.');
  }
}

/**
 * Annuler une commande
 * @param commandeId - ID de la commande
 * @returns Promise<Commande>
 */
export async function annulerCommande(commandeId: number): Promise<Commande> {
  try {
    const response = await api.put<CommandeResponse>(`/commandes/${commandeId}`, {
      statut: 'annulee'
    });
    return response.commande;
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    throw new Error('Impossible d\'annuler la commande. Veuillez réessayer.');
  }
}

/**
 * Récupérer les détails d'une commande avec ses articles
 * @param commandeId - ID de la commande
 * @returns Promise<CommandeDetailsResponse>
 */
export async function getCommandeAvecArticles(commandeId: number): Promise<CommandeDetailsResponse> {
  try {
    const response = await api.get<CommandeDetailsResponse>(`/commandes/${commandeId}/articles`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la commande:', error);
    throw new Error('Impossible de récupérer les détails de la commande. Veuillez réessayer.');
  }
}

export type { 
  CreerCommandeData, 
  ArticleCommande, 
  CommandeResponse, 
  Commande,
  CommandesParams,
  CommandesResponse,
  ModifierCommandeData,
  ArticleDetails,
  CommandeDetailsResponse
};
