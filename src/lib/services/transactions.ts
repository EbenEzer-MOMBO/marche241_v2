/**
 * Service pour la gestion des transactions
 */

import api from '@/lib/api';

interface CreerTransactionData {
  reference_transaction: string;
  commande_id: number;
  montant: number;
  methode_paiement: 'mobile_money' | 'airtel_money' | 'moov_money' | 'especes' | 'virement';
  type_paiement: 'paiement_complet' | 'acompte' | 'frais_livraison' | 'solde_apres_livraison' | 'complement';
  numero_telephone?: string;
  reference_operateur?: string;
  note?: string;
}

interface Transaction {
  id: number;
  commande_id: number;
  reference_transaction: string;
  montant: number;
  methode_paiement: string;
  type_paiement: string;
  statut: string;
  description?: string | null;
  numero_telephone?: string;
  reference_operateur?: string | null;
  date_creation: string;
  date_confirmation?: string | null;
  date_modification?: string;
  notes?: string | null;
}

interface TransactionResponse {
  success: boolean;
  message?: string;
  transaction: Transaction;
  commande?: {
    id: number;
    total: number;
    montant_paye: number;
    montant_restant: number;
    statut_paiement: 'en_attente' | 'partiellement_paye' | 'paye' | 'echec' | 'rembourse';
  };
}

/**
 * Créer une nouvelle transaction
 * @param transactionData - Données de la transaction à créer
 * @returns Promise<TransactionResponse>
 */
export async function creerTransaction(transactionData: CreerTransactionData): Promise<TransactionResponse> {
  try {
    const response = await api.post<TransactionResponse>('/transactions', transactionData);
    return response;
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    throw new Error('Impossible de créer la transaction. Veuillez réessayer.');
  }
}

interface TransactionsParams {
  page?: number;
  limite?: number;
  statut?: string;
  type_paiement?: string;
  recherche?: string;
  mois?: string;
}

/**
 * Réponse de l'API pour la liste des transactions
 */
interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
}

/**
 * Récupérer toutes les transactions d'une boutique
 * @param boutiqueId - ID de la boutique
 * @param params - Paramètres de pagination et filtres
 * @returns Promise<TransactionsResponse>
 */
export async function getTransactionsParBoutique(
  boutiqueId: number,
  params?: TransactionsParams
): Promise<TransactionsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params?.limite) {
      queryParams.append('limite', params.limite.toString());
    }

    if (params?.statut && params.statut !== 'all') {
      queryParams.append('statut', params.statut);
    }

    if (params?.type_paiement && params.type_paiement !== 'all') {
      queryParams.append('type_paiement', params.type_paiement);
    }

    if (params?.recherche) {
      queryParams.append('recherche', params.recherche);
    }

    if (params?.mois) {
      queryParams.append('mois', params.mois);
    }
    
    const url = `/transactions/boutique/${boutiqueId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<TransactionsResponse>(url);
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    throw new Error('Impossible de récupérer les transactions. Veuillez réessayer.');
  }
}

/**
 * Télécharger l'export CSV des transactions d'une boutique
 * @param boutiqueId - ID de la boutique
 * @param params - Filtres de recherche
 */
export async function telechargerExportTransactionsCSV(
  boutiqueId: number,
  boutiqueSlug: string,
  params?: Omit<TransactionsParams, 'page' | 'limite'>
): Promise<void> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.statut && params.statut !== 'all') {
      queryParams.append('statut', params.statut);
    }

    if (params?.type_paiement && params.type_paiement !== 'all') {
      queryParams.append('type_paiement', params.type_paiement);
    }

    if (params?.recherche) {
      queryParams.append('recherche', params.recherche);
    }

    if (params?.mois) {
      queryParams.append('mois', params.mois);
    }
    
    const url = `/transactions/boutique/${boutiqueId}/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<string>(url);
    
    // Créer un blob à partir du texte CSV
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const monthSuffix = params?.mois ? params.mois : 'GLOBAL';
    const filename = `transactions_${boutiqueSlug}_${monthSuffix}.csv`;
    
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'export CSV:', error);
    throw new Error('Impossible de télécharger l\'export CSV. Veuillez réessayer.');
  }
}

export type { CreerTransactionData, Transaction, TransactionResponse, TransactionsParams, TransactionsResponse };
