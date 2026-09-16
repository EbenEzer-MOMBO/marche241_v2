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

const PREVIEW_COOKIE = 'boutique_preview';

/**
 * Détecte si la requête en cours est une prévisualisation vendeur (?preview=1).
 * Côté navigateur : l'URL de la page (premier chargement) ou, à défaut, le
 * cookie de session posé par le middleware — les liens internes de la
 * boutique (header, produits, panier...) ne portent pas ?preview=1, donc
 * sans ce cookie la prévisualisation ne survivrait pas à la navigation.
 * Côté serveur, les layouts n'ont pas accès à searchParams, donc on relit le
 * header posé par le middleware (lui-même dérivé de l'URL ou du cookie).
 * Import dynamique de next/headers pour ne jamais le faire atterrir dans le
 * bundle client (server-only).
 */
async function isPreviewRequest(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    if (new URLSearchParams(window.location.search).get('preview') === '1') {
      return true;
    }
    return document.cookie
      .split('; ')
      .some((cookie) => cookie === `${PREVIEW_COOKIE}=1`);
  }
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return h.get('x-boutique-preview') === '1';
  } catch {
    return false;
  }
}

/**
 * Wrapper pour les requêtes API avec gestion d'erreurs
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isPreview: boolean = false
): Promise<T> {
  const url = isPreview
    ? `${config.apiBaseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}preview=1`
    : `${config.apiBaseUrl}${endpoint}`;

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
 * Coalesce les GET concurrentes + cache court (2s) pour Strict Mode / parent+enfant.
 */
const inflightGetRequests = new Map<string, Promise<unknown>>();
const recentGetResults = new Map<string, { expiresAt: number; value: unknown }>();
const GET_CACHE_TTL_MS = 2000;

function coalesceGet<T>(cacheKey: string, factory: () => Promise<T>): Promise<T> {
  const cached = recentGetResults.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.value as T);
  }

  const existing = inflightGetRequests.get(cacheKey);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = factory()
    .then((value) => {
      recentGetResults.set(cacheKey, {
        value,
        expiresAt: Date.now() + GET_CACHE_TTL_MS,
      });
      return value;
    })
    .finally(() => {
      inflightGetRequests.delete(cacheKey);
    });
  inflightGetRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Méthodes HTTP spécialisées
 */
export const api = {
  get: async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const isPreview = await isPreviewRequest();
    // La prévisualisation vendeur ne doit jamais partager le cache/coalescing
    // d'une requête publique concurrente sur le même endpoint (sinon l'une des
    // deux hérite du comportement de tracking de l'autre, cf. MAR-37).
    const cacheKey = isPreview ? `${endpoint}::preview` : endpoint;
    return coalesceGet(cacheKey, () => apiRequest<T>(endpoint, { ...options, method: 'GET' }, isPreview));
  },

  post: async <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    const isPreview = await isPreviewRequest();
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, isPreview);
  },

  put: async <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    const isPreview = await isPreviewRequest();
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, isPreview);
  },

  patch: async <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    const isPreview = await isPreviewRequest();
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, isPreview);
  },

  delete: async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const isPreview = await isPreviewRequest();
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' }, isPreview);
  },
};

export default api;
