/**
 * Service pour la gestion des statistiques du dashboard
 */

import api from '@/lib/api';
import { getCommandesParBoutique } from './commandes';
import { getVuesBoutiqueDashboard } from './vues';

interface StatistiqueCA {
  date: string;
  montant: number;
}

interface StatistiqueCommandes {
  statut: string;
  nombre: number;
  pourcentage: number;
}

interface StatistiquesDashboard {
  ca_evolution: StatistiqueCA[];
  ca_total: number;
  ca_periode_precedente: number;
  variation_ca: number;
  commandes_par_statut: StatistiqueCommandes[];
  total_commandes: number;
  total_produits: number;
  total_clients: number;
  vues_mois: number;
  vues_total: number;
}

/**
 * Récupérer les statistiques du dashboard pour une boutique
 * @param boutiqueId - ID de la boutique
 * @param periode - Période pour l'évolution du CA (7, 30, 90, 365 jours)
 * @returns Promise<StatistiquesDashboard>
 */
export async function getStatistiquesDashboard(
  boutiqueId: number,
  periode: number = 30
): Promise<StatistiquesDashboard> {
  try {
    // Récupérer toutes les commandes de la boutique
    const commandesResponse = await getCommandesParBoutique(boutiqueId, {
      limite: 100
    });

    const commandes = commandesResponse.commandes;
    
    // Calculer les statistiques
    const maintenant = new Date();
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - periode);
    
    // Filtrer les commandes de la période
    const commandesPeriode = commandes.filter(cmd => {
      const dateCommande = new Date(cmd.date_commande);
      return dateCommande >= dateDebut && dateCommande <= maintenant;
    });

    // Calculer l'évolution du CA par jour
    const caParJour = new Map<string, number>();
    
    // Statuts considérés comme "confirmés" pour le CA
    const statutsConfirmes = ['confirmee', 'en_preparation', 'expedie', 'livree'];
    
    commandesPeriode.forEach(cmd => {
      // Ne compter que les commandes confirmées (pas en attente ni annulées)
      if (statutsConfirmes.includes(cmd.statut.toLowerCase())) {
        const date = new Date(cmd.date_commande).toISOString().split('T')[0];
        const montantActuel = caParJour.get(date) || 0;
        caParJour.set(date, montantActuel + cmd.total);
      }
    });

    // Créer le tableau d'évolution du CA avec tous les jours
    const ca_evolution: StatistiqueCA[] = [];
    for (let i = periode - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      ca_evolution.push({
        date: dateStr,
        montant: caParJour.get(dateStr) || 0
      });
    }

    // Calculer le CA total de la période (uniquement commandes confirmées)
    const ca_total = commandesPeriode
      .filter(cmd => statutsConfirmes.includes(cmd.statut.toLowerCase()))
      .reduce((sum, cmd) => sum + cmd.total, 0);

    // Calculer le CA de la période précédente pour comparaison
    const datePrecedenteDebut = new Date(dateDebut);
    datePrecedenteDebut.setDate(datePrecedenteDebut.getDate() - periode);
    
    const commandesPeriodePrecedente = commandes.filter(cmd => {
      const dateCommande = new Date(cmd.date_commande);
      return dateCommande >= datePrecedenteDebut && dateCommande < dateDebut;
    });

    const ca_periode_precedente = commandesPeriodePrecedente
      .filter(cmd => statutsConfirmes.includes(cmd.statut.toLowerCase()))
      .reduce((sum, cmd) => sum + cmd.total, 0);

    // Calculer la variation en pourcentage
    const variation_ca = ca_periode_precedente > 0
      ? ((ca_total - ca_periode_precedente) / ca_periode_precedente) * 100
      : ca_total > 0 ? 100 : 0;

    // Statistiques des commandes par statut
    const commandesParStatut = new Map<string, number>();
    commandesPeriode.forEach(cmd => {
      const count = commandesParStatut.get(cmd.statut) || 0;
      commandesParStatut.set(cmd.statut, count + 1);
    });

    const total_commandes = commandesPeriode.length;
    
    const commandes_par_statut: StatistiqueCommandes[] = Array.from(commandesParStatut.entries()).map(([statut, nombre]) => ({
      statut,
      nombre,
      pourcentage: total_commandes > 0 ? (nombre / total_commandes) * 100 : 0
    }));

    // Compter les clients uniques (par numéro de téléphone)
    const clientsUniques = new Set(commandesPeriode.map(cmd => cmd.client_telephone));
    const total_clients = clientsUniques.size;

    // Note: total_produits devrait venir d'une autre API, pour l'instant on retourne 0
    const total_produits = 0;

    // Récupérer les vues réelles depuis l'API
    let vues_mois = 0;
    let vues_total = 0;
    
    try {
      const vuesData = await getVuesBoutiqueDashboard(boutiqueId);
      vues_mois = vuesData.vues_mois;
      vues_total = vuesData.vues_total;
    } catch (error) {
      console.error('Erreur lors de la récupération des vues:', error);
      // Garder les valeurs par défaut à 0
    }

    return {
      ca_evolution,
      ca_total,
      ca_periode_precedente,
      variation_ca,
      commandes_par_statut,
      total_commandes,
      total_produits,
      total_clients,
      vues_mois,
      vues_total,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new Error('Impossible de récupérer les statistiques du dashboard.');
  }
}

export type {
  StatistiqueCA,
  StatistiqueCommandes,
  StatistiquesDashboard
};

