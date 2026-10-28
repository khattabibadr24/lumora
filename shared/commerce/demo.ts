import type { Collection, Product } from "./types";

export const demoProducts: Product[] = [
  {
    id: "demo-halo-sable",
    handle: "suspension-halo-sable",
    title: "Suspension Halo Sable",
    description: "Une suspension sculpturale en finition sable, pensée pour diffuser une lumière douce au-dessus d’une table ou d’un îlot.",
    descriptionHtml: "<p>Une suspension sculpturale en finition sable, pensée pour diffuser une lumière douce au-dessus d’une table ou d’un îlot.</p>",
    productType: "Suspensions",
    vendor: "Lumora Studio",
    tags: ["Éclairage intérieur", "Éclairage artisanal", "Suspension", "Sable", "2700K", "IP20", "Design"],
    options: [],
    priceRange: { min: { amount: "1290.00", currencyCode: "MAD" }, max: { amount: "1290.00", currencyCode: "MAD" } },
    images: [
      { url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=85", altText: "Suspension Halo Sable dans un intérieur contemporain", width: 1200, height: 1200 },
      { url: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1200&q=85", altText: "Détail d’une lumière chaleureuse", width: 1200, height: 1200 },
    ],
    variants: [{ id: "demo-halo-sable-variant", title: "Default Title", availableForSale: true, price: { amount: "1290.00", currencyCode: "MAD" }, compareAtPrice: { amount: "1590.00", currencyCode: "MAD" }, selectedOptions: [] }],
  },
  {
    id: "demo-orbit-black",
    handle: "spot-orbit-noir",
    title: "Spot Orbit Noir · 7W",
    description: "Un spot encastrable orientable au faisceau précis, avec lumière chaude et finition noire mate.",
    descriptionHtml: "<p>Un spot encastrable orientable au faisceau précis, avec lumière chaude et finition noire mate.</p>",
    productType: "Spots LED",
    vendor: "Lumora Studio",
    tags: ["Spots LED", "7W", "Noir", "3000K", "IP44", "Orientable"],
    options: [],
    priceRange: { min: { amount: "189.00", currencyCode: "MAD" }, max: { amount: "189.00", currencyCode: "MAD" } },
    images: [
      { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85", altText: "Spot Orbit Noir", width: 1200, height: 1200 },
      { url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=85", altText: "Éclairage directionnel dans un intérieur", width: 1200, height: 1200 },
    ],
    variants: [{ id: "demo-orbit-black-variant", title: "Default Title", availableForSale: true, price: { amount: "189.00", currencyCode: "MAD" }, compareAtPrice: null, selectedOptions: [] }],
  },
];

export const demoCollections: Collection[] = [
  { id: "demo-collection-interieur", title: "Éclairage intérieur", description: "Créer des atmosphères qui restent.", handle: "eclairage-interieur", image: { url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=85", altText: "Éclairage intérieur", width: 900, height: 900 } },
  { id: "demo-collection-spots", title: "Spots & encastrables", description: "La précision, sans surcharge.", handle: "spots-led", image: { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", altText: "Spots LED", width: 900, height: 900 } },
  { id: "demo-collection-exterieur", title: "Extérieur", description: "Prolonger les beaux jours.", handle: "eclairage-exterieur", image: { url: "https://images.unsplash.com/photo-1504198266285-165a4d1d5c9e?auto=format&fit=crop&w=900&q=85", altText: "Éclairage extérieur", width: 900, height: 900 } },
  { id: "demo-collection-led", title: "LED & technique", description: "La performance, avec style.", handle: "led", image: { url: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=900&q=85", altText: "Éclairage LED", width: 900, height: 900 } },
];
