import { z } from "zod";
import type { Cart, CartItem } from "@shared/commerce/types";
import { demoCollections, demoProducts } from "@shared/commerce/demo";
import { publicProcedure, router } from "../_core/trpc";

const cartLineInputSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const cartLineUpdateSchema = z.object({
  lineId: z.string().min(1),
  /** 0 means "remove this line" — the route forwards to removeLines. */
  quantity: z.number().int().min(0).max(99),
});

const productCatalog = demoProducts;
const collectionCatalog = demoCollections;
const inMemoryCarts = new Map<string, Cart>();

function money(amount: string) {
  return { amount, currencyCode: "MAD" };
}

function buildCartFromItems(items: CartItem[], cartId: string): Cart {
  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal.amount), 0).toFixed(2);
  const cart: Cart = {
    id: cartId,
    checkoutUrl: "",
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: money(subtotal),
    total: money(subtotal),
  };
  inMemoryCarts.set(cartId, cart);
  return cart;
}

function cartFromLines(cartId: string, lines: Array<{ variantId: string; quantity: number; lineId?: string }>): Cart {
  const items: CartItem[] = [];
  for (const line of lines) {
    const product = productCatalog.find(item => item.variants.some(variant => variant.id === line.variantId));
    const variant = product?.variants.find(item => item.id === line.variantId);
    if (!product || !variant) continue;
    const existing = items.find(item => item.variantId === line.variantId);
    const quantity = line.quantity;
    const nextQuantity = existing ? existing.quantity + quantity : quantity;
    const lineTotal = (Number(variant.price.amount) * nextQuantity).toFixed(2);
    if (existing) {
      existing.quantity = nextQuantity;
      existing.lineTotal = money(lineTotal);
    } else {
      items.push({
        lineId: line.lineId ?? `local-${line.variantId}-${Date.now()}`,
        variantId: line.variantId,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: variant.title,
        image: product.images[0] ?? null,
        unitPrice: variant.price,
        quantity: nextQuantity,
        lineTotal: money(lineTotal),
      });
    }
  }
  return buildCartFromItems(items, cartId);
}

export const commerceRouter = router({
  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            first: z.number().int().min(1).max(100).optional(),
            collectionHandle: z.string().min(1).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const first = input?.first ?? productCatalog.length;
        return productCatalog.slice(0, first);
      }),
    byHandle: publicProcedure
      .input(z.object({ handle: z.string().min(1) }))
      .query(async ({ input }) => {
        return productCatalog.find(product => product.handle === input.handle) ?? null;
      }),
  }),
  collections: router({
    list: publicProcedure
      .input(z.object({ first: z.number().int().min(1).max(50).optional() }).optional())
      .query(async ({ input }) => {
        const first = input?.first ?? collectionCatalog.length;
        return collectionCatalog.slice(0, first);
      }),
    byHandle: publicProcedure
      .input(z.object({ handle: z.string().min(1) }))
      .query(async ({ input }) => {
        return collectionCatalog.find(collection => collection.handle === input.handle) ?? null;
      }),
  }),
  cart: router({
    create: publicProcedure
      .input(z.object({ lines: z.array(cartLineInputSchema).min(1).max(50) }))
      .mutation(async ({ input }) => {
        const cartId = `local-cart-${Date.now()}`;
        return cartFromLines(cartId, input.lines);
      }),
    get: publicProcedure
      .input(z.object({ cartId: z.string().min(1) }))
      .query(async ({ input }) => {
        return inMemoryCarts.get(input.cartId) ?? null;
      }),
    addLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lines: z.array(cartLineInputSchema).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        const current = inMemoryCarts.get(input.cartId) ?? { id: input.cartId, checkoutUrl: "", items: [], itemCount: 0, subtotal: money("0.00"), total: money("0.00") };
        const nextItems = [...current.items];
        for (const line of input.lines) {
          const product = productCatalog.find(item => item.variants.some(variant => variant.id === line.variantId));
          const variant = product?.variants.find(item => item.id === line.variantId);
          if (!product || !variant) continue;
          const existingIndex = nextItems.findIndex(item => item.variantId === line.variantId);
          if (existingIndex >= 0) {
            const existing = nextItems[existingIndex];
            existing.quantity += line.quantity;
            existing.lineTotal = money((Number(existing.unitPrice.amount) * existing.quantity).toFixed(2));
          } else {
            nextItems.push({
              lineId: `local-${line.variantId}-${Date.now()}`,
              variantId: line.variantId,
              productHandle: product.handle,
              productTitle: product.title,
              variantTitle: variant.title,
              image: product.images[0] ?? null,
              unitPrice: variant.price,
              quantity: line.quantity,
              lineTotal: money((Number(variant.price.amount) * line.quantity).toFixed(2)),
            });
          }
        }
        return buildCartFromItems(nextItems, input.cartId);
      }),
    updateLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lines: z.array(cartLineUpdateSchema).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        const current = inMemoryCarts.get(input.cartId) ?? { id: input.cartId, checkoutUrl: "", items: [], itemCount: 0, subtotal: money("0.00"), total: money("0.00") };
        const nextItems = current.items
          .map(item => {
            const match = input.lines.find(line => line.lineId === item.lineId);
            if (!match) return item;
            const nextQuantity = Math.max(0, match.quantity);
            if (nextQuantity === 0) return null;
            return { ...item, quantity: nextQuantity, lineTotal: money((Number(item.unitPrice.amount) * nextQuantity).toFixed(2)) };
          })
          .filter(Boolean) as CartItem[];
        return buildCartFromItems(nextItems, input.cartId);
      }),
    removeLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lineIds: z.array(z.string().min(1)).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        const current = inMemoryCarts.get(input.cartId) ?? { id: input.cartId, checkoutUrl: "", items: [], itemCount: 0, subtotal: money("0.00"), total: money("0.00") };
        const nextItems = current.items.filter(item => !input.lineIds.includes(item.lineId));
        return buildCartFromItems(nextItems, input.cartId);
      }),
  }),
});

export type CommerceRouter = typeof commerceRouter;
