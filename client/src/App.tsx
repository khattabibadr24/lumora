import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import ContentPage from "./pages/ContentPage";
import AdminPage from "@/pages/AdminPage";
import OrdersPage from "@/pages/OrdersPage";
import FavoritesPage from "./pages/FavoritesPage";

function formatPrice(amount: string | number, currency = "MAD") {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount));
}

function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, proceedToCheckout, loading } = useCart();
  const [customer, setCustomer] = useState({ fullName: "", city: "", phone: "" });

  useEffect(() => {
    if (!isOpen) {
      setCustomer({ fullName: "", city: "", phone: "" });
    }
  }, [isOpen]);

  const canConfirm = Boolean(customer.fullName.trim() && customer.city.trim() && customer.phone.trim());

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={closeCart}>
      <aside className="cart-drawer" onClick={event => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="drawer-kicker">Votre sélection</span>
            <h2>Le panier <span>({cart?.itemCount ?? 0})</span></h2>
          </div>
          <button className="icon-button" onClick={closeCart} aria-label="Fermer le panier"><X size={20} /></button>
        </div>
        {cart?.items?.length ? (
          <>
            <div className="cart-items">
              {cart.items.map(item => (
                <div className="cart-item" key={item.lineId}>
                  <img src={item.image?.url ?? "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=85"} alt={item.image?.altText ?? item.productTitle} />
                  <div className="cart-item-details">
                    <div className="cart-item-title">
                      <strong>{item.productTitle}</strong>
                      <button onClick={() => removeItem(item.lineId)} aria-label={`Supprimer ${item.productTitle}`}><X size={14} /></button>
                    </div>
                    <span className="cart-item-meta">{item.variantTitle !== "Default Title" ? item.variantTitle : "Lumora Studio"}</span>
                    <div className="cart-item-bottom">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} disabled={loading}><Minus size={12} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} disabled={loading}><Plus size={12} /></button>
                      </div>
                      <strong>{formatPrice(item.lineTotal.amount, item.lineTotal.currencyCode)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-summary">
              <div><span>Sous-total</span><strong>{formatPrice(cart.subtotal.amount, cart.subtotal.currencyCode)}</strong></div>
              <div className="drawer-total"><span>Total estimé</span><strong>{formatPrice(cart.total.amount, cart.total.currencyCode)}</strong></div>

              <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
                <input
                  value={customer.fullName}
                  onChange={event => setCustomer(current => ({ ...current, fullName: event.target.value }))}
                  placeholder="Nom complet"
                  aria-label="Nom complet"
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                />
                <input
                  value={customer.city}
                  onChange={event => setCustomer(current => ({ ...current, city: event.target.value }))}
                  placeholder="Ville"
                  aria-label="Ville"
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                />
                <input
                  value={customer.phone}
                  onChange={event => setCustomer(current => ({ ...current, phone: event.target.value }))}
                  placeholder="Téléphone"
                  aria-label="Téléphone"
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <p>Nous allons valider votre commande via WhatsApp. Le paiement se fera à la livraison.</p>
              <Button className="full-button" onClick={() => proceedToCheckout(customer)} disabled={!canConfirm}>Confirmer la commande <ArrowRight size={15} /></Button>
            </div>
          </>
        ) : (
          <div className="cart-empty">
            <p>Votre panier est vide.</p>
            <Button className="full-button" onClick={closeCart}>Continuer mes achats</Button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalogue" component={Catalog} />
      <Route path="/produit/:handle" component={ProductPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/commandes" component={OrdersPage} />
      <Route path="/favoris" component={FavoritesPage} />
      <Route path="/:slug" component={ContentPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <CartProvider>
            <FavoritesProvider>
              <RecentlyViewedProvider>
                <Toaster />
                <Router />
                <CartDrawer />
              </RecentlyViewedProvider>
            </FavoritesProvider>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
