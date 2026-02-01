/**
 * Service API centralisé pour toutes les requêtes
 */

import config from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Configuration par défaut pour les requêtes fetch
 */
const defaultRequestConfig: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Récupère le token d'authentification depuis le localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

/**
 * Déconnecte l'utilisateur et redirige vers la page de connexion
 */
function handleUnauthorized(): void {
  if (typeof window !== 'undefined') {
    // Nettoyer le localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_boutique');
    
    // Vérifier si on n'est pas déjà sur la page de login pour éviter une boucle
    if (!window.location.pathname.includes('/admin/login')) {
      // Sauvegarder l'URL actuelle pour rediriger après reconnexion
      const currentPath = window.location.pathname;
      localStorage.setItem('redirect_after_login', currentPath);
      
      // Rediriger vers la page de login
      window.location.href = '/admin/login?session=expired';
    }
  }
}

/**
 * Wrapper pour les requêtes API avec gestion d'erreurs
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  
  // Ajouter le token d'authentification si disponible
  const token = getAuthToken();
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  const requestConfig: RequestInit = {
    ...defaultRequestConfig,
    ...options,
    headers: {
      ...defaultRequestConfig.headers,
      ...authHeaders,
      ...options.headers,
    } as HeadersInit,
  };

  try {
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Gérer spécifiquement les erreurs 401 (token expiré ou invalide)
      if (response.status === 401) {
        console.error('🔒 Token expiré ou invalide, déconnexion...');
        handleUnauthorized();
        throw new ApiError(
          'Token invalide ou expiré',
          response.status,
          errorData
        );
      }
      
      throw new ApiError(
        errorData?.message || `Erreur HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    // Vérifier si la réponse contient du JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    // Retourner la réponse text pour les autres types de contenu
    return await response.text() as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erreur de réseau ou autre
    throw new ApiError(
      error instanceof Error ? error.message : 'Erreur de connexion',
      0
    );
  }
}

/**
 * Méthodes HTTP spécialisées
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
