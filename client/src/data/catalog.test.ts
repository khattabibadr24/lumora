import { describe, expect, it } from "vitest";
import { demoProducts } from "./catalog";

describe("Lumora demo catalog", () => {
  it("contains purchasable products with normalized commerce fields", () => {
    expect(demoProducts.length).toBeGreaterThanOrEqual(2);
    for (const product of demoProducts) {
      expect(product.handle).toBeTruthy();
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.variants[0]?.availableForSale).toBe(true);
      expect(Number(product.priceRange.min.amount)).toBeGreaterThan(0);
    }
  });

  it("exposes technical tags used by storefront filters", () => {
    expect(demoProducts.some(product => product.tags.includes("IP44"))).toBe(true);
    expect(demoProducts.some(product => product.tags.includes("2700K"))).toBe(true);
  });
});
