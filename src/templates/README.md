# Templates Email et WhatsApp - Marché241

Ce répertoire contient tous les templates pour les emails et messages WhatsApp de l'application.

## Structure

```
templates/
├── email/
│   ├── verification-code.html      # Template HTML pour email de vérification
│   └── verification-code.txt       # Version texte pour email de vérification
├── whatsapp/
│   ├── verification-code.txt       # Template complet pour WhatsApp
│   └── verification-code-short.txt # Version courte pour WhatsApp
└── README.md
```

## Templates Email

### verification-code.html

Template HTML responsive avec :
- Design moderne et professionnel
- Gradient vert (couleurs de la marque)
- Code mis en évidence dans un bloc coloré
- Avertissement de sécurité
- Footer avec informations de contact
- Compatible avec tous les clients email

**Variables à remplacer :**
- `{{CODE}}` : Le code de vérification à 6 chiffres

### verification-code.txt

Version texte brut pour les clients email ne supportant pas HTML.

**Variables à remplacer :**
- `{{CODE}}` : Le code de vérification à 6 chiffres

## Templates WhatsApp

### verification-code.txt

Template complet pour WhatsApp avec :
- Formatage Markdown (gras, italique)
- Emojis pour améliorer la lisibilité
- Bloc de code encadré
- Message de sécurité
- Lien vers le site

**Variables à remplacer :**
- `{{CODE}}` : Le code de vérification à 4 chiffres

### verification-code-short.txt

Version courte et concise pour WhatsApp (si limitation de caractères).

**Variables à remplacer :**
- `{{CODE}}` : Le code de vérification à 4 chiffres

## Utilisation

### Dans le code backend (Node.js)

```javascript
const fs = require('fs');
const path = require('path');

// Charger le template email HTML
const emailTemplate = fs.readFileSync(
  path.join(__dirname, '../templates/email/verification-code.html'),
  'utf8'
);

// Remplacer les variables
const emailHtml = emailTemplate.replace('{{CODE}}', '123456');

// Charger le template WhatsApp
const whatsappTemplate = fs.readFileSync(
  path.join(__dirname, '../templates/whatsapp/verification-code.txt'),
  'utf8'
);

// Remplacer les variables
const whatsappMessage = whatsappTemplate.replace('{{CODE}}', '1234');
```

### Dans Next.js API Route

```typescript
import fs from 'fs';
import path from 'path';

// API Route : /api/send-verification
export default async function handler(req, res) {
  const { code, method } = req.body;
  
  if (method === 'email') {
    const template = fs.readFileSync(
      path.join(process.cwd(), 'src/templates/email/verification-code.html'),
      'utf8'
    );
    const html = template.replace('{{CODE}}', code);
    
    // Envoyer l'email avec html
    await sendEmail({ html });
  } else if (method === 'whatsapp') {
    const template = fs.readFileSync(
      path.join(process.cwd(), 'src/templates/whatsapp/verification-code.txt'),
      'utf8'
    );
    const message = template.replace('{{CODE}}', code);
    
    // Envoyer le message WhatsApp
    await sendWhatsApp({ message });
  }
}
```

## Personnalisation

### Couleurs de la marque

**Email HTML :**
- Vert principal : `#10b981`
- Vert foncé : `#059669`, `#047857`
- Vert clair : `#dcfce7`, `#f0fdf4`

**Pour modifier les couleurs :**
1. Ouvrir `email/verification-code.html`
2. Rechercher les codes couleur
3. Remplacer par vos couleurs

### Texte et messages

Tous les textes peuvent être modifiés directement dans les templates :
- Messages de bienvenue
- Instructions
- Avertissements de sécurité
- Informations de contact

### Ajout de nouveaux templates

Pour ajouter un nouveau template :

1. Créer le fichier dans le bon dossier (`email/` ou `whatsapp/`)
2. Utiliser des variables entre doubles accolades : `{{VARIABLE}}`
3. Documenter les variables dans ce README
4. Tester avec différents clients (email/WhatsApp)

## Templates à venir

- [ ] Email de bienvenue après inscription
- [ ] Email de confirmation de commande
- [ ] Email de notification de nouveau produit
- [ ] WhatsApp confirmation de commande
- [ ] WhatsApp notification livraison
- [ ] Email de réinitialisation de mot de passe
- [ ] Email de notification boutique créée

## Bonnes pratiques

### Email

1. **HTML :**
   - Toujours fournir une version texte alternative
   - Utiliser des tableaux pour la compatibilité
   - Tester sur plusieurs clients (Gmail, Outlook, Apple Mail)
   - Éviter JavaScript et CSS complexe
   - Utiliser des styles inline

2. **Texte :**
   - Maximum 78 caractères par ligne
   - Utiliser des séparateurs ASCII
   - Éviter les caractères spéciaux exotiques

### WhatsApp

1. **Formatage :**
   - `*gras*` pour le texte important
   - `_italique_` pour les notes
   - Utiliser les emojis avec modération
   - Garder les messages courts et clairs

2. **Longueur :**
   - Message court : < 1000 caractères (recommandé)
   - Message long : < 4096 caractères (limite WhatsApp)

3. **Liens :**
   - Utiliser des URLs complètes
   - Préférer les liens courts si possible

## Tests

### Tester les templates email

```bash
# Envoyer un email de test
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### Tester les templates WhatsApp

```bash
# Envoyer un message WhatsApp de test
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+24162648538","code":"1234"}'
```

## Support

Pour toute question ou suggestion concernant les templates :
- Créer une issue sur le projet
- Contacter l'équipe de développement

---

**Dernière mise à jour :** 2025-11-05

