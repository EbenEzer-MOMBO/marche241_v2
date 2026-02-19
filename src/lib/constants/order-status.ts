/**
 * Configuration centralisée des statuts de commande
 * Couleurs harmonisées pour tous les composants
 */

export type OrderStatus = 
  | 'en_attente' 
  | 'confirmee' 
  | 'en_preparation' 
  | 'expedie' 
  | 'livree' 
  | 'annulee' 
  | 'remboursee';

interface StatusConfig {
  label: string;
  color: {
    primary: string;      // Couleur principale (graphiques, badges)
    bg: string;           // Background (badges)
    text: string;         // Texte (badges)
    border: string;       // Bordure (badges)
    bgHover: string;      // Background hover (boutons)
  };
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  en_attente: {
    label: 'En attente',
    color: {
      primary: '#f59e0b',     // amber-500
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      bgHover: 'hover:bg-amber-100'
    }
  },
  confirmee: {
    label: 'Confirmée',
    color: {
      primary: '#3b82f6',     // blue-500
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      bgHover: 'hover:bg-blue-100'
    }
  },
  en_preparation: {
    label: 'En préparation',
    color: {
      primary: '#8b5cf6',     // violet-500
      bg: 'bg-violet-50',
      text: 'text-violet-800',
      border: 'border-violet-200',
      bgHover: 'hover:bg-violet-100'
    }
  },
  expedie: {
    label: 'Expédiée',
    color: {
      primary: '#6366f1',     // indigo-500
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      bgHover: 'hover:bg-indigo-100'
    }
  },
  livree: {
    label: 'Livrée',
    color: {
      primary: '#10b981',     // emerald-500
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      bgHover: 'hover:bg-emerald-100'
    }
  },
  annulee: {
    label: 'Annulée',
    color: {
      primary: '#ef4444',     // red-500
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      bgHover: 'hover:bg-red-100'
    }
  },
  remboursee: {
    label: 'Remboursée',
    color: {
      primary: '#f97316',     // orange-500
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      bgHover: 'hover:bg-orange-100'
    }
  }
};

/**
 * Obtenir la configuration d'un statut
 */
export function getStatusConfig(status: string): StatusConfig {
  const normalizedStatus = status.toLowerCase() as OrderStatus;
  return ORDER_STATUS_CONFIG[normalizedStatus] || {
    label: status,
    color: {
      primary: '#6b7280',
      bg: 'bg-gray-50',
      text: 'text-gray-800',
      border: 'border-gray-200',
      bgHover: 'hover:bg-gray-100'
    }
  };
}

/**
 * Obtenir la classe CSS complète pour un badge de statut
 */
export function getStatusBadgeClasses(status: string): string {
  const config = getStatusConfig(status);
  return `${config.color.bg} ${config.color.text} ${config.color.border}`;
}

/**
 * Obtenir la couleur principale pour les graphiques
 */
export function getStatusColor(status: string): string {
  const config = getStatusConfig(status);
  return config.color.primary;
}

/**
 * Obtenir le label d'un statut
 */
export function getStatusLabel(status: string): string {
  const config = getStatusConfig(status);
  return config.label;
}
