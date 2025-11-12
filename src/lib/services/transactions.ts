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
  montant: number;
  methode_paiement: string;
  type_paiement: string;
  statut: string;
  numero_telephone?: string;
  reference_operateur?: string | null;
  description?: string | null;
  date_creation: string;
  date_modification?: string;
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

export type { CreerTransactionData, Transaction, TransactionResponse };
