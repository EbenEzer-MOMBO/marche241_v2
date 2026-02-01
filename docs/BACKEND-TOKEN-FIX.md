# Instructions Backend - Résolution Token Expiré

## Contexte
Les tokens JWT expirent après 7 jours, causant des erreurs 401. Le frontend a été mis à jour pour gérer ces erreurs et rediriger l'utilisateur. Il faut maintenant modifier le backend.

## Solution Rapide (Recommandée pour démarrer)

### Étape 1 : Allonger la durée du token à 30 jours

**Fichier à modifier :** Probablement `src/middlewares/auth.middleware.ts` ou `src/routes/vendeurs.ts`

**Chercher ce code :**
```javascript
const token = jwt.sign(
  { 
    id: vendeur.id, 
    telephone: vendeur.telephone, 
    nom: vendeur.nom,
    email: vendeur.email 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }  // ← CHANGER CETTE LIGNE
);
```

**Remplacer par :**
```javascript
const token = jwt.sign(
  { 
    id: vendeur.id, 
    telephone: vendeur.telephone, 
    nom: vendeur.nom,
    email: vendeur.email 
  },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }  // ← 30 jours au lieu de 7
);
```

### Étape 2 : Vérifier que l'erreur JWT renvoie bien un status 401

**Fichier à modifier :** `src/middlewares/auth.middleware.ts`

**Chercher ce code :**
```javascript
catch (error) {
  if (error.name === 'TokenExpiredError') {
    // Vérifier que ça renvoie bien un 401
    return res.status(401).json({ 
      success: false, 
      message: 'Token expiré' 
    });
  }
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
}
```

**S'assurer que les erreurs JWT renvoient toujours un status 401** (pas 403 ou autre).

### Étape 3 : Tester

1. Générer un nouveau token en se connectant
2. Vérifier dans les logs backend que l'expiration est bien à 30 jours
3. Pour tester l'expiration, créer temporairement un token de 10 secondes :
   ```javascript
   { expiresIn: '10s' }
   ```
4. Attendre 15 secondes
5. Faire une requête → Le frontend devrait rediriger vers login automatiquement

---

## Solution Avancée (Pour plus tard)

### Implémenter un système de Refresh Token

Cette solution est plus complexe mais plus sécurisée. Elle permet :
- Des access tokens courts (1h) → Plus sécurisé
- Des refresh tokens longs (30 jours) → Meilleure UX
- Révocation possible → Meilleur contrôle

**Voir le fichier `docs/TOKEN-EXPIRATION-FIX.md` pour les détails complets.**

**Étapes principales :**
1. Créer la table `refresh_tokens` en base de données
2. Créer la route `/api/v1/auth/refresh`
3. Modifier la route de login pour générer 2 tokens
4. Créer une route `/api/v1/auth/logout` pour révoquer les tokens
5. Modifier le frontend pour utiliser le refresh automatique

**Temps estimé :** 2-3 heures

---

## Changements Frontend Déjà Appliqués ✅

1. **`src/lib/api.ts`** :
   - Intercepte les erreurs 401
   - Nettoie le localStorage
   - Redirige vers `/admin/login?session=expired`

2. **`src/app/admin/login/page.tsx`** :
   - Affiche un message "Session expirée" avec icône
   - Message disparaît à la nouvelle connexion

3. **`src/app/admin/[boutique]/page.tsx`** :
   - Vérifie le token au chargement
   - Redirige si token manquant ou invalide
   - Gère les erreurs 401 dans toutes les fonctions

---

## Recommandation

**Commencer par la Solution Rapide** (30 minutes) :
1. ✅ Changer `expiresIn: '7d'` → `expiresIn: '30d'`
2. ✅ Vérifier les status 401
3. ✅ Tester le flow complet

**Puis planifier la Solution Avancée** pour améliorer la sécurité.

---

## Questions ?

Si tu ne trouves pas le fichier où changer `expiresIn`, cherche dans le backend :
```bash
grep -r "jwt.sign" .
grep -r "expiresIn" .
```

Ou envoie-moi le contenu des fichiers :
- `src/routes/vendeurs.ts`
- `src/middlewares/auth.middleware.ts`
- `src/controllers/vendeurs.controller.ts`

Et je t'indiquerai exactement où faire les modifications.
