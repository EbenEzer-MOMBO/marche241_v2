# marche241_v2 — Front public & espace vendeur

> Contexte plateforme, contrats inter-projets et conventions Linear : voir `../CLAUDE.md` (chargé automatiquement dans le workspace). Ce front ne parle **qu'à** `marche241-api` ; il n'a aucun accès direct à la base.

## Stack

Next.js 16 (App Router, Turbopack en dev) · React 19 · TypeScript · Tailwind CSS 4 (`@tailwindcss/postcss`) · Sentry (`@sentry/nextjs`) · `@simplewebauthn/browser` (passkeys) · recharts · icônes `lucide-react` / `@phosphor-icons/react`.

## Commandes

```bash
npm run dev     # next dev --turbopack (port 3000)
npm run build   # build de prod — sert de vérification typage + lint Next
npm run lint
```

- Pas de tests automatisés. Vérifier au minimum avec `npx tsc --noEmit`, puis dans le navigateur pour tout changement d'UI.
- L'API doit tourner (`../marche241-api`, `npm run dev`) : URL dans `NEXT_PUBLIC_API_BASE_URL` (`.env`, modèle `env.example`).
- `server.js` = serveur Node custom utilisé en production (`npm start`).

## Architecture (`src/`)

```
app/
  [boutique]/                 vitrine d'une boutique (slug) : produits, produit, commande (checkout), confirmation
  admin/                      espace VENDEUR (login, register, verify, onboarding, [boutique]/… dashboard)
  billets/[jeton]/            consultation publique d'un billet d'événement
  produits/, affiche_boutiques/, promo-poster/, politique-de-confidentialite/
components/   admin/ (dashboard vendeur), storefront/, catalog/, products/, onboarding/, tickets/, landing/, ui/
lib/
  api.ts                      client HTTP vers l'API (base URL, token JWT)
  services/*.ts               un module par ressource API (boutiques, produits, commandes, paiements, auth, push, vues…)
  database-types.ts           copie des types de l'API — garder synchro avec ../marche241-api/src/lib/database-types.ts
  types/, utils/, constants/, errors/, onboarding/, templates/
hooks/, templates/ (email, whatsapp)
middleware.ts                 mode maintenance + prévisualisation vendeur (?preview=1, cookie boutique_preview)
```

## Conventions

- **Appels API** : uniquement via `src/lib/services/<ressource>.ts` en utilisant `@/lib/api` ; jamais de `fetch` direct dans les composants. Les services renvoient des données typées et gèrent `success: false`.
- **Types** : partir de `@/lib/database-types` ; si l'API ajoute un champ/enum, mettre à jour la copie locale (cf. contrat n°2 du workspace).
- **Server vs Client Components** : Server Components par défaut (SEO des vitrines) ; `'use client'` seulement pour l'interactivité (panier, formulaires, dashboard). `localStorage` uniquement côté client (session panier : `lib/services/session.ts`, panier isolé par boutique).
- **Styles** : Tailwind 4 ; thème par boutique via `lib/utils/shop-theme.ts`. Réutiliser `components/ui` avant de créer un composant.
- **UI en français**, montants en FCFA formatés sans décimales ; numéros mobile money gabonais (`lib/utils/mobileMoneyMsisdn.ts`).
- **SEO** : metadata/sitemap à préserver sur les pages vitrine (`docs/seo-guide.md`, `docs/INDEXATION-GOOGLE.md`).
- Erreurs : remonter via Sentry (MCP Sentry configuré dans `.mcp.json`, projet `kordex/marche241-frontend`).

## Parcours critiques (à tester après modification)

- Panier → checkout → paiement mobile money → confirmation (`docs/FLUX-PAIEMENT.md`, `docs/PAIEMENT-COMPLET-OBLIGATOIRE.md`).
- Checkout **événement** : paiement complet, pas de mix produits/billets, page billets avec QR.
- Variants produits dans le panier (`docs/AFFICHAGE-VARIANTS-PANIER.md`, `docs/VARIANTS-QUANTITES.md`).
- Connexion vendeur OTP / passkey et expiration du token (`docs/TOKEN-EXPIRATION-FIX.md`).

## Impacts inter-projets

- Besoin d'un nouveau champ ou endpoint → le faire d'abord dans `../marche241-api` (route + Joi + Swagger), puis consommer ici.
- Nouvelle origine / domaine du front → prévenir que l'API doit mettre à jour `CORS_ORIGIN`, `FRONTEND_URL`, `WEBAUTHN_ORIGIN`.

## Exécution des plans (résumé)

Plan validé → 3 étapes obligatoires (détail dans `../CLAUDE.md`, section « Exécution des plans ») :

1. **Lancement avec Ralph si disponible** : `/ralph-loop "<plan + critères de fin, tests et vérifs visuelles inclus>" --max-iterations 20 --completion-promise "PLAN TERMINE"`. Toujours fixer `--max-iterations` ; n'émettre la promesse que si tout est fait et vérifié. Sans Ralph : exécution pas à pas, en le signalant.
2. **Tests** : `npx tsc --noEmit` puis `npm run lint`. Un échec bloque la suite.
3. **Vérifications visuelles** : serveurs `api` + `front` via `.claude/launch.json`, ouvrir chaque écran modifié dans le navigateur intégré en **desktop et mobile (375 px)**, états vide / chargement / erreur, console sans erreur, appels réseau vers l'API corrects ; dérouler le parcours concerné (cf. « Parcours critiques ») et joindre des captures.

Le compte rendu final liste ce qui a été testé, vérifié visuellement, et ce qui n'a pas pu l'être (avec la raison).

## Cycle de vie d'une PR (résumé)

Détail dans `../CLAUDE.md`, section « Cycle de vie d'une PR » :

1. **Revue automatique** : dès l'ouverture de la PR, lancer `/code-review` (niveau `high` pour paiements, auth, migrations SQL, versements).
2. **Corrections sur la même branche** : commits sur la branche de la PR (jamais une nouvelle PR), puis tests + lint, push, attente de la CI. Constats écartés listés avec la raison.
3. **Confirmation du merge** : jamais de fusion sans accord explicite de l'utilisateur dans le chat ; présenter constats, CI et état de fusion. PR liées entre projets : ordre API → front → admin.
4. **Nettoyage après merge** (automatique, sans redemander) : supprimer la branche sur GitHub et en local (`git checkout main && git pull --ff-only`, puis `git branch -d`, jamais `-D`). Ne jamais supprimer `main`, `dev`, `dev_test` ni une branche portant une autre PR ouverte ; si un worktree utilise la branche, le signaler.
