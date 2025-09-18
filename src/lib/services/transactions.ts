/**
 * Service pour la gestion des transactions
 */

import api from '@/lib/api';

interface CreerTransactionData {
  commande_id: number;
  reference_transaction: string;
  montant: number;
  methode_paiement: 'mobile_money' | 'cash' | 'card';
  statut: 'en_attente' | 'reussie' | 'echouee' | 'annulee';
  numero_telephone: string;
  reference_operateur?: string;
  notes?: string;
}

interface Transaction {
  id: number;
  commande_id: number;
  reference_transaction: string;
  montant: number;
  methode_paiement: string;
  statut: string;
  numero_telephone: string;
  reference_operateur: string | null;
  notes: string | null;
  date_creation: string;
  date_modification: string;
}

interface TransactionResponse {
  success: boolean;
  message: string;
  transaction: Transaction;
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
