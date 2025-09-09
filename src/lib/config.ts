/**
 * Configuration de l'environnement
 */

export const config = {
  // URL de base de l'API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.14:3000/api/v1',
  
  // Configuration de l'application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Marche241',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0',
  },
  
  // Configuration pour le développement
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Validation de la configuration
if (!config.apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL doit être définie dans les variables d\'environnement');
}

export default config;
