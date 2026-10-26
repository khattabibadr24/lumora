# Validation visuelle Lumora

Les contrôles desktop et mobile réalisés le 27 août 2026 montrent une boutique responsive, lisible et cohérente avec la direction éditoriale ivoire, encre et argile.

Le parcours contrôlé couvre l’accueil, le catalogue Shopify, la fiche produit avec remise réelle et recommandations, les favoris, les retours, le compte et l’administration. Sur mobile, le hero remplit correctement son cadre, le header se replie, le catalogue conserve sa hiérarchie et la fiche produit empile la galerie puis les informations commerciales.

Les éléments volontairement délégués à Shopify sont l’adresse, le paiement, la livraison et les codes promotionnels au checkout. Aucun code de réduction n’est affiché dans le storefront conformément à la référence d’intégration Shopify. Les vues commandes, adresses et récemment consultés du compte sont présentes avec des états vides honnêtes en l’absence de données métier persistées.

Le catalogue affiche deux produits Shopify publiés, dont une Suspension Halo Sable à 1 290 MAD avec prix comparé à 1 590 MAD et un Spot Orbit Noir · 7W à 189 MAD. TypeScript et Vitest passent après les dernières modifications.

Le dernier contrôle desktop après le garde serveur confirme que le compte client et la fiche produit restent lisibles. Il révèle toutefois que la nouvelle liste de pilotage du dashboard admin hérite d’un style insuffisant : ses icônes, textes et liens se collent horizontalement. Une règle dédiée pour `.admin-live-list` est ajoutée avant le checkpoint final.

Le contrôle final du 27 août 2026 confirme que le dashboard admin affiche un catalogue de secours lisible pendant la synchronisation, puis les données Shopify disponibles : 2 produits, 2 disponibles, 1 en promotion, 0 indisponible. Le compte affiche désormais 1 produit récent après consultation de la fiche. Le garde serveur `admin.access` est appelé avant d’autoriser le chargement du dashboard.
