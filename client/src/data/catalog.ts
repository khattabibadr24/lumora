import type { Product } from "@shared/commerce/types";
import { demoCollections, demoProducts } from "@shared/commerce/demo";

export { demoCollections, demoProducts };

export const collections = demoCollections.map((collection, index) => ({
  title: collection.title,
  eyebrow: String(index + 1).padStart(2, "0"),
  description: collection.description,
  handle: collection.handle,
  image: collection.image?.url ?? "",
}));

export const categoryFilters = ["Spots LED", "Suspensions", "Luminaires", "Éclairage artisanal", "Abat-jour", "Applique", "Lustre", "Plafonnier", "Lampadaire", "Éclairage extérieur", "Ampoules LED", "Interrupteurs"];

export function productFromCatalog(product: Product | undefined) {
  return product ?? null;
}
