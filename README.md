# Lumora Éclairage

Lumora Éclairage est une boutique de luminaires en ligne développée avec React, Vite, TypeScript et une API locale en Node.js/Express.

## Objectif du projet

Cette application permet de :
- afficher un catalogue de produits d’éclairage,
- ajouter des articles au panier,
- gérer les favoris,
- accéder à un espace d’administration local,
- modifier, ajouter ou supprimer des produits depuis l’interface d’admin,
- valider les commandes avec un parcours local de type livraison à domicile.

## Stack technique

- Frontend : React + TypeScript + Vite
- UI : Tailwind + composants React
- Routing : Wouter
- Gestion d’état : React Query + contextes React
- Backend : Express + tRPC
- Base de données : Drizzle ORM
- Authentification admin locale : cookie session

## Installation

Prérequis :
- Node.js 20+
- pnpm

1. Installer les dépendances :
   ```bash
   pnpm install
   ```

2. Lancer le projet en mode développement :
   ```bash
   pnpm run dev
   ```

3. Accéder à l’application dans le navigateur :
   - http://localhost:3000

## Accès administration

Pour accéder à l’espace d’administration :
- URL : http://localhost:3000/admin
- Email : admin@lumora.ma
- Mot de passe : lumora2026

## Scripts disponibles

```bash
pnpm run dev
pnpm run build
pnpm run check
pnpm run test
```

## Structure du projet

```text
client/
  src/
server/
shared/
public/
drizzle/
```

## Fonctionnement de l’admin

L’admin local peut :
- créer un produit,
- modifier un produit,
- modifier le prix,
- supprimer un produit,
- gérer le catalogue visible par la boutique.

## Notes

- Le projet est pensé comme une boutique locale de démonstration.
- Le paiement est géré à la livraison.
- Les commandes sont validées via la procédure locale du storefront.

## License

MIT
