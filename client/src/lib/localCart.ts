import type { Cart, CartItem, Product } from "@shared/commerce/types";
import { demoProducts } from "@shared/commerce/demo";

export const DEMO_CART_ID = "demo-cart";
export const DEMO_CART_STORAGE_KEY = "commerce:demo-cart";

function money(amount: string) {
  return { amount, currencyCode: "MAD" };
}

function findVariant(variantId: string) {
  for (const product of demoProducts) {
    const variant = product.variants.find(item => item.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

function summarize(items: CartItem[]): Cart {
  const subtotal = items.reduce((total, item) => total + Number(item.lineTotal.amount), 0).toFixed(2);
  return { id: DEMO_CART_ID, checkoutUrl: "", items, itemCount: items.reduce((total, item) => total + item.quantity, 0), subtotal: money(subtotal), total: money(subtotal) };
}

export function addToDemoCart(current: Cart | null, variantId: string, quantity: number): Cart | null {
  const found = findVariant(variantId);
  if (!found) return current;
  const { product, variant } = found;
  const items = [...(current?.items ?? [])];
  const existing = items.find(item => item.variantId === variantId);
  if (existing) {
    existing.quantity += quantity;
    existing.lineTotal = money((Number(existing.unitPrice.amount) * existing.quantity).toFixed(2));
  } else {
    items.push({ lineId: `demo-line-${variantId}`, variantId, productHandle: product.handle, productTitle: product.title, variantTitle: variant.title, image: product.images[0] ?? null, unitPrice: variant.price, quantity, lineTotal: money((Number(variant.price.amount) * quantity).toFixed(2)) });
  }
  return summarize(items);
}

export function updateDemoCart(current: Cart, lineId: string, quantity: number): Cart {
  const items = current.items.filter(item => item.lineId !== lineId || quantity > 0).map(item => item.lineId === lineId ? { ...item, quantity, lineTotal: money((Number(item.unitPrice.amount) * quantity).toFixed(2)) } : item);
  return summarize(items);
}

export function removeFromDemoCart(current: Cart, lineId: string): Cart {
  return summarize(current.items.filter(item => item.lineId !== lineId));
}

export function readDemoCart(): Cart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) as Cart : null;
  } catch {
    return null;
  }
}

export function writeDemoCart(cart: Cart | null) {
  if (typeof window === "undefined") return;
  if (cart?.items.length) window.localStorage.setItem(DEMO_CART_STORAGE_KEY, JSON.stringify(cart));
  else window.localStorage.removeItem(DEMO_CART_STORAGE_KEY);
}
