/**
 * Service pour la gestion des sessions locales
 */

/**
 * Génère un ID de session unique
 * @returns string - ID de session unique
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomPart}`;
}

/**
 * Récupère ou crée un ID de session avec une durée d'un mois
 * @param boutiqueId - ID de la boutique (optionnel pour compatibilité)
 * @returns string - ID de session
 */
export function getOrCreateSessionId(boutiqueId?: number): string {
  // Si un boutiqueId est fourni, créer une session spécifique à cette boutique
  const SESSION_KEY = boutiqueId 
    ? `marche241_session_id_${boutiqueId}` 
    : 'marche241_session_id';
  const SESSION_EXPIRY_KEY = boutiqueId 
    ? `marche241_session_expiry_${boutiqueId}` 
    : 'marche241_session_expiry';
  
  try {
    // Vérifier si une session existe et n'est pas expirée
    const existingSessionId = localStorage.getItem(SESSION_KEY);
    const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    if (existingSessionId && sessionExpiry) {
      const expiryDate = new Date(sessionExpiry);
      const now = new Date();
      
      // Si la session n'est pas expirée, la retourner
      if (now < expiryDate) {
        return existingSessionId;
      }
    }
    
    // Créer une nouvelle session
    const newSessionId = generateSessionId();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Expiration dans 1 mois
    
    localStorage.setItem(SESSION_KEY, newSessionId);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString());
    
    return newSessionId;
  } catch (error) {
    console.error('Erreur lors de la gestion de la session:', error);
    // Fallback: générer un ID temporaire si localStorage n'est pas disponible
    return generateSessionId();
  }
}

/**
 * Supprime la session actuelle
 * @param boutiqueId - ID de la boutique (optionnel)
 */
export function clearSession(boutiqueId?: number): void {
  const SESSION_KEY = boutiqueId 
    ? `marche241_session_id_${boutiqueId}` 
    : 'marche241_session_id';
  const SESSION_EXPIRY_KEY = boutiqueId 
    ? `marche241_session_expiry_${boutiqueId}` 
    : 'marche241_session_expiry';
  
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
  }
}

/**
 * Vérifie si une session est valide
 * @param boutiqueId - ID de la boutique (optionnel)
 * @returns boolean - true si la session est valide
 */
export function isSessionValid(boutiqueId?: number): boolean {
  const SESSION_KEY = boutiqueId 
    ? `marche241_session_id_${boutiqueId}` 
    : 'marche241_session_id';
  const SESSION_EXPIRY_KEY = boutiqueId 
    ? `marche241_session_expiry_${boutiqueId}` 
    : 'marche241_session_expiry';
  
  try {
    const sessionId = localStorage.getItem(SESSION_KEY);
    const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    if (!sessionId || !sessionExpiry) {
      return false;
    }
    
    const expiryDate = new Date(sessionExpiry);
    const now = new Date();
    
    return now < expiryDate;
  } catch (error) {
    console.error('Erreur lors de la vérification de la session:', error);
    return false;
  }
}

export default {
  generateSessionId,
  getOrCreateSessionId,
  clearSession,
  isSessionValid
};
