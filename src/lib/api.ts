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
 * Wrapper pour les requêtes API avec gestion d'erreurs
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  
  const requestConfig: RequestInit = {
    ...defaultRequestConfig,
    ...options,
    headers: {
      ...defaultRequestConfig.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
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
