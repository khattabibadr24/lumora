# Lumora Éclairage

Lumora Éclairage est une boutique e-commerce spécialisée dans les luminaires d’intérieur et l’éclairage artisanal. Le projet a été conçu pour proposer une expérience moderne de storefront, un espace d’administration local, et un parcours de commande orienté vente directe.

## Présentation

La boutique permet de :
- parcourir une sélection de produits d’éclairage,
- filtrer par famille et type,
- ajouter des produits au panier,
- gérer les favoris et les produits vus récemment,
- passer une commande depuis le storefront,
- suivre les commandes côté admin,
- gérer un catalogue de produits depuis une interface d’administration locale.

## Stack technique

- Frontend : React + TypeScript + Vite
- Routing : Wouter
- UI : composants React + Tailwind
- Gestion d’état : React Query + contextes React
- Backend : Express + tRPC
- Base de données : Drizzle ORM
- Authentification admin : session locale avec cookies
- Notifications : préparation du flux WhatsApp pour envoi de commandes

## Fonctionnalités principales

### Storefront
- page d’accueil avec mise en avant des collections,
- catalogue produits,
- pages produit,
- panier et checkout local,
- validation de commande avec message de confirmation,
- création de commandes côté client avec informations acheteur.

### Administration
- accès sécurisé à l’interface admin,
- création de produits,
- modification de produits,
- suppression de produits,
- gestion des familles et types de produits,
- contrôle du catalogue affiché par la boutique.

### Commandes
- validation de commande depuis le parcours client,
- affichage des commandes côté admin,
- suivi d’état : validée, expédiée, annulée,
- affichage des informations client : nom, téléphone, ville, commande.

### WhatsApp
- message de commande préparé et formaté pour notification,
- route backend prête pour l’envoi automatique via WhatsApp Business API,
- numéro cible mis à jour pour l’utilisateur : +212661687918.

## Prérequis

- Node.js >= 20.19
- pnpm

## Installation

1. Installer les dépendances :

```bash
pnpm install
```

2. Démarrer le projet en développement :

```bash
pnpm run dev
```

3. Ouvrir le site dans le navigateur :

```text
http://localhost:3000
```

## Accès admin

L’interface admin est accessible ici :

```text
http://localhost:3000/admin
```

Identifiants locaux :
- email : admin@lumora.ma
- mot de passe : lumora2026

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

## Notes importantes

- Le projet est pensé comme une boutique de démonstration puis de production locale.
- Le paiement se fait à la livraison dans le parcours actuel.
- Le système WhatsApp est prêt pour l’intégration Meta / Business API, mais l’activation de l’envoi réel nécessite les identifiants du compte WhatsApp Business.

## Licence

MIT
