# Gestion de l'Expiration des Tokens JWT

## Problème Identifié

Les tokens JWT expirent après 7 jours, causant des erreurs 401 et laissant l'utilisateur sur le dashboard sans données.

## Solutions Implémentées

### 1. Frontend (✅ Complété)

#### A. Intercepteur d'erreurs 401 (`src/lib/api.ts`)
- Détecte automatiquement les erreurs 401 (token expiré)
- Nettoie le localStorage (token, user, boutique)
- Redirige vers `/admin/login?session=expired`
- Sauvegarde l'URL actuelle pour redirection post-connexion

#### B. Message d'expiration (`src/app/admin/login/page.tsx`)
- Affiche un message clair : "Votre session a expiré. Veuillez vous reconnecter."
- Message en amber avec icône d'alerte
- Se cache lors de la nouvelle soumission du formulaire

#### C. Vérification au chargement (`src/app/admin/[boutique]/page.tsx`)
- Vérifie la présence du token avant toute requête
- Détecte les erreurs 401 dans `loadBoutiqueData()` et `loadStats()`
- Redirige immédiatement vers login si token manquant ou invalide

### 2. Backend (⚠️ À Implémenter)

#### A. Allonger la durée du token (Solution rapide)

**Fichier à modifier :** `src/middlewares/auth.middleware.ts` ou équivalent

**Changement :**
```javascript
// Avant
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

// Après - 30 jours
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
```

**Avantages :**
- ✅ Simple à implémenter
- ✅ Réduit les déconnexions fréquentes

**Inconvénients :**
- ⚠️ Moins sécurisé pour les tokens volés
- ⚠️ Ne résout pas le problème à long terme

#### B. Système de Refresh Token (Solution recommandée)

**Architecture :**

1. **Access Token** : Courte durée (15 min - 1h)
2. **Refresh Token** : Longue durée (30 jours)

**Fichiers à créer/modifier :**

##### 1. Table `refresh_tokens` dans la base de données
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  vendeur_id INTEGER NOT NULL REFERENCES vendeurs(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  INDEX idx_vendeur (vendeur_id),
  INDEX idx_token (token)
);
```

##### 2. Route de refresh (`/api/v1/auth/refresh`)
```javascript
const refreshAccessToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Refresh token manquant' 
    });
  }

  try {
    // Vérifier le refresh token dans la base de données
    const tokenRecord = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = FALSE',
      [refresh_token]
    );

    if (!tokenRecord.rows.length) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token invalide' 
      });
    }

    const token = tokenRecord.rows[0];

    // Vérifier l'expiration
    if (new Date() > new Date(token.expires_at)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expiré' 
      });
    }

    // Générer un nouveau access token
    const vendeur = await db.query(
      'SELECT id, email, nom, telephone FROM vendeurs WHERE id = $1',
      [token.vendeur_id]
    );

    if (!vendeur.rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur introuvable' 
      });
    }

    const newAccessToken = jwt.sign(
      { 
        id: vendeur.rows[0].id, 
        email: vendeur.rows[0].email,
        nom: vendeur.rows[0].nom
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Access token de courte durée
    );

    res.json({
      success: true,
      token: newAccessToken,
      vendeur: vendeur.rows[0]
    });

  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};
```

##### 3. Modifier la route de login pour générer les 2 tokens
```javascript
const login = async (req, res) => {
  // ... vérification du code ...

  // Générer access token (courte durée)
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // Générer refresh token (longue durée)
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

  // Stocker le refresh token en base
  await db.query(
    'INSERT INTO refresh_tokens (vendeur_id, token, expires_at) VALUES ($1, $2, $3)',
    [vendeur.id, refreshToken, expiresAt]
  );

  res.json({
    success: true,
    token: accessToken,
    refresh_token: refreshToken,
    vendeur: vendeur
  });
};
```

##### 4. Route de logout pour révoquer le refresh token
```javascript
const logout = async (req, res) => {
  const { refresh_token } = req.body;

  if (refresh_token) {
    await db.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1',
      [refresh_token]
    );
  }

  res.json({ success: true, message: 'Déconnexion réussie' });
};
```

#### C. Frontend - Intercepteur de refresh automatique

**Modifier `src/lib/api.ts` :**

```typescript
/**
 * Tente de rafraîchir le token
 */
async function refreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    
    if (data.success && data.token) {
      // Sauvegarder le nouveau token
      localStorage.setItem('admin_token', data.token);
      return data.token;
    }

    return null;
  } catch (error) {
    console.error('Erreur refresh token:', error);
    return null;
  }
}

/**
 * Wrapper pour les requêtes API avec gestion d'erreurs et refresh automatique
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
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
      if (response.status === 401 && retryCount === 0) {
        console.log('🔄 Token expiré, tentative de refresh...');
        
        // Tenter de rafraîchir le token
        const newToken = await refreshToken();
        
        if (newToken) {
          console.log('✅ Token rafraîchi, nouvelle tentative...');
          // Réessayer la requête avec le nouveau token
          return apiRequest<T>(endpoint, options, retryCount + 1);
        }
        
        // Si le refresh échoue, déconnecter
        console.error('🔒 Refresh échoué, déconnexion...');
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
```

**Modifier `src/hooks/useAuth.ts` :**

```typescript
const verifier = async (data: VerifierCodeData): Promise<boolean> => {
  // ... code existant ...
  
  if (response.success && response.vendeur && response.token) {
    // Stocker AUSSI le refresh token
    localStorage.setItem('admin_token', response.token);
    localStorage.setItem('admin_refresh_token', response.refresh_token); // NOUVEAU
    localStorage.setItem('admin_user', JSON.stringify(response.vendeur));
    
    // ... reste du code ...
  }
};

const logout = () => {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  
  // Appeler l'API pour révoquer le refresh token
  if (refreshToken) {
    api.post('/auth/logout', { refresh_token: refreshToken })
      .catch(err => console.error('Erreur lors de la révocation du token:', err));
  }
  
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token'); // NOUVEAU
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_boutique');
  setUser(null);
  success('Déconnexion réussie', 'À bientôt !');
  router.push('/admin/login');
};
```

## Recommandations

### Pour Production :
1. ✅ **Implémenter le système de refresh token** (Solution B)
2. ✅ Nettoyer les refresh tokens expirés avec un cron job
3. ✅ Limiter le nombre de refresh tokens actifs par utilisateur (ex: max 5 appareils)
4. ✅ Logger les tentatives de refresh pour détecter les abus

### Pour Développement Rapide :
1. ⚠️ **Allonger la durée du token à 30 jours** (Solution A)
2. ✅ Garder les redirections et messages d'expiration du frontend

## Variables d'Environnement Backend

Ajouter dans `.env` :

```env
# Durée de vie des tokens
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=30d

# Secret pour les tokens (utiliser un secret différent en production)
JWT_SECRET=votre_secret_jwt_ici
```

## Tests à Effectuer

1. ✅ Connexion normale
2. ✅ Accès au dashboard avec token valide
3. ✅ Token expiré → Redirection vers login avec message
4. ✅ Message d'expiration affiché correctement
5. ✅ Reconnexion après expiration
6. ⚠️ Refresh automatique du token (si implémenté)
7. ⚠️ Déconnexion avec révocation du refresh token (si implémenté)

## État Actuel

- ✅ Frontend : Gestion complète des erreurs 401 et redirections
- ⚠️ Backend : À modifier selon la solution choisie (A ou B)

## Prochaines Étapes

1. Choisir la solution (A = rapide, B = robuste)
2. Implémenter les changements backend
3. Tester le flux complet
4. Déployer en production
5. Monitorer les logs d'authentification
