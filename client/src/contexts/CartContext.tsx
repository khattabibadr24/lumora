import { trpc } from "@/lib/trpc";
import type { Cart } from "@shared/commerce/types";
import { DEMO_CART_ID, addToDemoCart, readDemoCart, removeFromDemoCart, updateDemoCart, writeDemoCart } from "@/lib/localCart";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

/**
 * Storefront cart context.
 *
 * - Talks ONLY to backend-agnostic `commerce.*` tRPC procedures.
 * - Persists the cart id in localStorage and rehydrates on mount.
 * - Exposes a tiny imperative surface to UI: addItem, updateQuantity,
 *   removeItem, openCart, proceedToCheckout. Everything is typed against
 *   `shared/commerce/types` — the Shopify backend is invisible.
 */

const CART_STORAGE_KEY = "commerce:cart-id";

function readStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_STORAGE_KEY);
}

function writeStoredCartId(value: string | null) {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(CART_STORAGE_KEY, value);
  else window.localStorage.removeItem(CART_STORAGE_KEY);
}

type CheckoutCustomer = {
  fullName: string;
  city: string;
  phone: string;
};

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  loading: boolean;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
  proceedToCheckout: (customer: CheckoutCustomer) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(() => readStoredCartId());
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const utils = trpc.useUtils();

  // Re-hydrate cart on mount or whenever cartId changes.
  useEffect(() => {
    if (!cartId) {
      setCart(null);
      return;
    }
    if (cartId === DEMO_CART_ID) {
      setCart(readDemoCart());
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    utils.commerce.cart.get
      .fetch({ cartId })
      .then(c => {
        if (cancelled) return;
        if (c) setCart(c);
        else {
          // Stored cart id no longer valid — drop it.
          writeStoredCartId(null);
          setCartId(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        writeStoredCartId(null);
        setCartId(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cartId, utils.commerce.cart.get]);

  const itemCount = cart?.itemCount ?? 0;

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      setLoading(true);
      try {
        if (variantId.startsWith("demo-")) {
          const next = addToDemoCart(cartId === DEMO_CART_ID ? cart : null, variantId, quantity);
          if (!next) return;
          setCart(next);
          setCartId(DEMO_CART_ID);
          writeStoredCartId(DEMO_CART_ID);
          writeDemoCart(next);
          setIsOpen(true);
          return;
        }
        if (!cartId || !cart) {
          const created = await utils.client.commerce.cart.create.mutate({
            lines: [{ variantId, quantity }],
          });
          if (!created) {
            setIsOpen(true);
            return;
          }
          setCart(created);
          setCartId(created.id);
          writeStoredCartId(created.id);
        } else {
          const updated = await utils.client.commerce.cart.addLines.mutate({
            cartId,
            lines: [{ variantId, quantity }],
          });
          setCart(updated);
        }
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [cart, cartId, utils.client]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;
      if (cartId === DEMO_CART_ID && cart) {
        const next = updateDemoCart(cart, lineId, quantity);
        setCart(next.items.length ? next : null);
        writeDemoCart(next);
        if (!next.items.length) {
          writeStoredCartId(null);
          setCartId(null);
        }
        return;
      }
      setLoading(true);
      try {
        const updated = await utils.client.commerce.cart.updateLines.mutate({
          cartId,
          lines: [{ lineId, quantity }],
        });
        if (updated) setCart(updated);
      } finally {
        setLoading(false);
      }
    },
    [cart, cartId, utils.client]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      if (cartId === DEMO_CART_ID && cart) {
        const next = removeFromDemoCart(cart, lineId);
        setCart(next.items.length ? next : null);
        writeDemoCart(next);
        if (!next.items.length) {
          writeStoredCartId(null);
          setCartId(null);
        }
        return;
      }
      setLoading(true);
      try {
        const updated = await utils.client.commerce.cart.removeLines.mutate({
          cartId,
          lineIds: [lineId],
        });
        setCart(updated);
      } finally {
        setLoading(false);
      }
    },
    [cart, cartId, utils.client]
  );

  const clearCart = useCallback(() => {
    writeStoredCartId(null);
    writeDemoCart(null);
    setCartId(null);
    setCart(null);
  }, []);

  const proceedToCheckout = useCallback((customer: CheckoutCustomer) => {
    if (!cart) return;
    const cleanName = customer.fullName.trim();
    const cleanCity = customer.city.trim();
    const cleanPhone = customer.phone.trim();
    if (!cleanName || !cleanCity || !cleanPhone) return;
    const message = `Nouvelle commande Lumora\nNom: ${cleanName}\nVille: ${cleanCity}\nTéléphone: ${cleanPhone}\nTotal: ${cart.total.amount} ${cart.total.currencyCode}\nPaiement: à la livraison.`;
    toast.success("Commande reçue", {
      description: "Nous allons valider votre commande via WhatsApp. Le paiement se fera à la livraison.",
      duration: 5000,
    });
    console.info(message);
    clearCart();
    setIsOpen(false);
  }, [cart, clearCart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      loading,
      itemCount,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      proceedToCheckout,
    }),
    [
      cart,
      isOpen,
      loading,
      itemCount,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      proceedToCheckout,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
