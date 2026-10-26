import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Instagram,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { trpc } from "@/lib/trpc";
import type { Product } from "@shared/commerce/types";
import { collections as demoCollections, demoProducts } from "@/data/catalog";

const heroImage = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85";
const fallbackHeroImage = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85";
const fallbackCollectionImage = "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=85";

function formatPrice(amount: string, currency = "MAD") {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount));
}

function discountPercent(product: Product) {
  const variant = product.variants[0];
  if (!variant?.compareAtPrice) return null;
  const price = Number(variant.price.amount);
  const compare = Number(variant.compareAtPrice.amount);
  return compare > price ? Math.round((1 - price / compare) * 100) : null;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const variant = product.variants[0];
  const { isFavorite, toggleFavorite } = useFavorites();
  const discount = discountPercent(product);
  return (
    <article className="product-card group">
      <Link href={`/produit/${product.handle}`} className="product-card-image">
        <img src={product.images[0]?.url ?? fallbackCollectionImage} alt={product.images[0]?.altText ?? product.title} loading="lazy" />
        <div className="product-card-topline">
          {discount ? <span className="discount-pill">-{discount}%</span> : <span className="new-pill">Nouveau</span>}
          <button className={`icon-button icon-button-light ${isFavorite(product.handle) ? "is-favorite" : ""}`} aria-label={`Ajouter ${product.title} aux favoris`} onClick={event => { event.preventDefault(); event.stopPropagation(); toggleFavorite(product.handle); }}>
            <Heart size={17} strokeWidth={1.7} fill={isFavorite(product.handle) ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="product-card-quick">Aperçu rapide <ArrowRight size={14} /></div>
      </Link>
      <div className="product-card-body">
        <div className="eyebrow-row"><span>{product.productType}</span><span className="product-rating"><Sparkles size={12} /> Sélection Lumora</span></div>
        <Link href={`/produit/${product.handle}`}><h3>{product.title}</h3></Link>
        <div className="product-price-row">
          <strong>{formatPrice(variant?.price.amount ?? product.priceRange.min.amount, variant?.price.currencyCode)}</strong>
          {variant?.compareAtPrice && <span className="compare-price">{formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode)}</span>}
        </div>
        <button className="add-line" onClick={() => onAdd(product)} disabled={!variant?.availableForSale}>
          <span>{variant?.availableForSale ? "Ajouter au panier" : "Indisponible"}</span><Plus size={15} />
        </button>
      </div>
    </article>
  );
}

function StoreHeader({ query, setQuery, onCart, itemCount, favoriteCount }: { query: string; setQuery: (value: string) => void; onCart: () => void; itemCount: number; favoriteCount: number }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [, navigate] = useLocation();
  return (
    <>
      <div className="announcement"><div><span className="announcement-dot" /> Livraison offerte dès 800 DH <span className="announcement-separator">·</span> Expédition partout au Maroc</div><div className="announcement-right">Conseils lumière offerts <ArrowRight size={13} /></div></div>
      <header className="site-header">
        <div className="header-main container">
          <button className="mobile-menu" aria-label="Ouvrir le menu" onClick={() => setMegaOpen(open => !open)}><Menu size={22} /></button>
          <Link href="/" className="brand" aria-label="Lumora accueil"><span className="brand-mark"><span /></span><span className="brand-word">lumora</span></Link>
          <nav className="desktop-nav">
            <button className={`nav-link nav-link-button ${megaOpen ? "active" : ""}`} onClick={() => setMegaOpen(open => !open)}>Shop <ChevronDown size={14} /></button>
            <a className="nav-link" href="#collections">Collections</a>
            <a className="nav-link" href="#journal">Le journal</a>
            <a className="nav-link nav-link-sale" href="#selection">Les essentiels</a>
          </nav>
          <div className="header-actions">
            <label className="header-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === "Enter" && navigate(`/catalogue?search=${encodeURIComponent(query)}`)} placeholder="Rechercher" aria-label="Rechercher un produit" /></label>
            <Link href="/admin" className="header-icon" aria-label="Administration"><UserRound size={19} /></Link>
            <Link href="/favoris" className="header-icon header-icon-heart" aria-label="Mes favoris"><Heart size={19} /><span className="header-badge">{favoriteCount}</span></Link>
            <button className="header-icon" onClick={onCart} aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}><ShoppingBag size={19} /><span className="header-badge">{itemCount}</span></button>
          </div>
        </div>
        {megaOpen && <div className="mega-menu"><div className="container mega-grid"><div><span className="mega-kicker">L’univers Lumora</span><h2>La lumière<br /><em>à votre mesure.</em></h2><Link href="/catalogue" className="text-link" onClick={() => setMegaOpen(false)}>Voir tout le shop <ArrowRight size={15} /></Link></div><div><h3>Éclairage intérieur</h3><a href="#selection">Suspensions</a><a href="#selection">Spots & encastrables</a><a href="#selection">Plafonniers</a><a href="#selection">Appliques</a><a href="#selection">Lampes à poser</a></div><div><h3>LED & technique</h3><a href="#selection">Ampoules LED</a><a href="#selection">Rubans LED</a><a href="#selection">Néons LED</a><a href="#selection">Alimentations</a><a href="#selection">Interrupteurs</a></div><div className="mega-feature"><span>GUIDE LUMIÈRE</span><strong>Choisir la bonne température de couleur.</strong><a href="#journal">Lire le guide <ArrowRight size={14} /></a></div></div></div>}
      </header>
    </>
  );
}

function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, proceedToCheckout, loading } = useCart();
  const [customer, setCustomer] = useState({ fullName: "", city: "", phone: "" });
  const canConfirm = Boolean(customer.fullName.trim() && customer.city.trim() && customer.phone.trim());
  if (!isOpen) return null;
  return <div className="drawer-backdrop" onClick={closeCart}><aside className="cart-drawer" onClick={event => event.stopPropagation()}><div className="drawer-header"><div><span className="drawer-kicker">Votre sélection</span><h2>Le panier <span>({cart?.itemCount ?? 0})</span></h2></div><button className="icon-button" onClick={closeCart} aria-label="Fermer le panier"><X size={20} /></button></div>{cart?.items?.length ? <><div className="cart-items">{cart.items.map(item => <div className="cart-item" key={item.lineId}><img src={item.image?.url ?? fallbackCollectionImage} alt={item.image?.altText ?? item.productTitle} /><div className="cart-item-details"><div className="cart-item-title"><strong>{item.productTitle}</strong><button onClick={() => removeItem(item.lineId)} aria-label={`Supprimer ${item.productTitle}`}><X size={14} /></button></div><span className="cart-item-meta">{item.variantTitle !== "Default Title" ? item.variantTitle : "Lumora Studio"}</span><div className="cart-item-bottom"><div className="quantity-control"><button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} disabled={loading}><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} disabled={loading}><Plus size={12} /></button></div><strong>{formatPrice(item.lineTotal.amount, item.lineTotal.currencyCode)}</strong></div></div></div>)}</div><div className="drawer-summary"><div><span>Sous-total</span><strong>{formatPrice(cart.subtotal.amount, cart.subtotal.currencyCode)}</strong></div><div className="drawer-total"><span>Total estimé</span><strong>{formatPrice(cart.total.amount, cart.total.currencyCode)}</strong></div><div style={{ display: "grid", gap: 10, margin: "12px 0" }}><input value={customer.fullName} onChange={event => setCustomer(current => ({ ...current, fullName: event.target.value }))} placeholder="Nom complet" aria-label="Nom complet" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }} /><input value={customer.city} onChange={event => setCustomer(current => ({ ...current, city: event.target.value }))} placeholder="Ville" aria-label="Ville" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }} /><input value={customer.phone} onChange={event => setCustomer(current => ({ ...current, phone: event.target.value }))} placeholder="Téléphone" aria-label="Téléphone" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }} /></div><p>Nous allons valider votre commande via WhatsApp. Le paiement se fera à la livraison.</p><Button className="full-button" onClick={() => proceedToCheckout(customer)} disabled={!canConfirm}>Confirmer la commande <ArrowRight size={16} /></Button><button className="continue-link" onClick={closeCart}>Continuer mes achats</button></div></> : <div className="empty-cart"><div className="empty-cart-icon"><ShoppingBag size={24} /></div><h3>Votre panier est encore vide</h3><p>Les belles pièces commencent ici. Découvrez notre sélection pensée pour durer.</p><button className="text-link" onClick={closeCart}>Explorer la collection <ArrowRight size={15} /></button></div>}</aside></div>;
}

function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tout voir");
  const [email, setEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const { openCart, addItem, itemCount } = useCart();
  const { count: favoriteCount } = useFavorites();
  const { data: shopifyProducts, isLoading: isProductsLoading } = trpc.commerce.products.list.useQuery({ first: 24 });
  const { data: shopifyCollections } = trpc.commerce.collections.list.useQuery({ first: 12 });
  const products = shopifyProducts?.length ? shopifyProducts : demoProducts;
  const collectionCards = shopifyCollections?.length ? shopifyCollections.map((collection, index) => ({ title: collection.title, eyebrow: String(index + 1).padStart(2, "0"), description: collection.description || "Des pièces choisies avec intention.", handle: collection.handle, image: collection.image?.url ?? fallbackCollectionImage })) : demoCollections;
  const promotionProduct = products.find(product => discountPercent(product)) ?? products[0];
  const newProduct = products.find(product => !discountPercent(product)) ?? products[0];

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter(product => {
      const matchesCategory = activeCategory === "Tout voir" || product.productType === activeCategory || product.tags.includes(activeCategory);
      const matchesQuery = !normalized || `${product.title} ${product.description} ${product.vendor} ${product.tags.join(" ")}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, query]);

  const addProduct = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;
    await addItem(variant.id, 1);
  };

  return <div className="lumora-site"><StoreHeader query={query} setQuery={setQuery} onCart={openCart} itemCount={itemCount} favoriteCount={favoriteCount} />
    <main>
      <section className="hero container">
        <div className="hero-copy"><div className="section-kicker"><span className="kicker-line" /> Collection 06 · Lumière essentielle</div><h1>La lumière<br /><em>change tout.</em></h1><p>Des objets lumineux dessinés pour habiter vos espaces avec justesse, chaleur et caractère.</p><div className="hero-actions"><Link href="/catalogue" className="primary-cta">Découvrir la collection <ArrowRight size={16} /></Link><a href="#journal" className="secondary-cta">Notre approche <span>↘</span></a></div><div className="hero-proof"><div className="hero-proof-mark"><Sparkles size={16} /></div><div><small>Choisie avec soin par l’équipe Lumora</small></div></div></div>
        <div className="hero-visual"><img src={heroImage} alt="Intérieur contemporain éclairé par des suspensions Lumora" onError={(event) => { event.currentTarget.src = fallbackHeroImage; }} /><div className="hero-note"><span className="hero-note-dot" /><span>Le détail qui<br /><strong>réchauffe tout.</strong></span></div><div className="hero-scroll">SCROLL <span /></div></div>
      </section>

      <section className="marquee"><div className="marquee-track"><span>Éclairer avec intention</span><span className="marquee-symbol">✳</span><span>Des pièces qui restent</span><span className="marquee-symbol">✳</span><span>Éclairer avec intention</span><span className="marquee-symbol">✳</span><span>Des pièces qui restent</span></div></section>

      <section className="section container" id="collections"><div className="section-heading"><div><span className="section-kicker"><span className="kicker-line" /> Explorer par univers</span><h2>Tout commence<br /><em>par une ambiance.</em></h2></div><Link className="text-link" href="/catalogue">Voir toutes les collections <ArrowRight size={15} /></Link></div><div className="collection-grid">{collectionCards.map((collection, index) => <Link href={`/catalogue?collection=${collection.handle}`} className={`collection-card collection-card-${index + 1}`} key={collection.handle}><img src={collection.image} alt={collection.title} loading="lazy" /><div className="collection-overlay"><span>{collection.eyebrow}</span><div><h3>{collection.title}</h3><p>{collection.description}</p></div><span className="collection-arrow"><ArrowUpRightIcon /></span></div></Link>)}</div></section>

      <section className="feature-doors container"><Link href={`/produit/${newProduct?.handle ?? ""}`} className="feature-door feature-door-new"><img src={newProduct?.images[0]?.url ?? fallbackCollectionImage} alt={newProduct?.title ?? "Nouveauté Lumora"} loading="lazy" /><div><span>Nouveautés</span><h2>Les pièces<br /><em>qui arrivent.</em></h2><strong>Découvrir <ArrowRight size={14} /></strong></div></Link><Link href={`/produit/${promotionProduct?.handle ?? ""}`} className="feature-door feature-door-sale"><img src={promotionProduct?.images[0]?.url ?? fallbackCollectionImage} alt={promotionProduct?.title ?? "Offre Lumora"} loading="lazy" /><div><span>Les essentiels</span><h2>Une lumière<br /><em>à saisir.</em></h2><strong>Voir les offres <ArrowRight size={14} /></strong></div></Link></section>

      <section className="section product-section" id="selection"><div className="container"><div className="section-heading product-heading"><div><span className="section-kicker"><span className="kicker-line" /> La sélection Lumora</span><h2>Beau, utile,<br /><em>bien pensé.</em></h2></div><div className="product-tabs">{["Tout voir", "Suspensions", "Spots LED", "Éclairage extérieur"].map(category => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div><div className="product-toolbar"><span>{isProductsLoading ? "Chargement de la sélection…" : `${filteredProducts.length} pièces à découvrir`}</span><button onClick={() => setQuery("")}>Nouveautés <ChevronDown size={14} /></button></div><div className="product-grid">{filteredProducts.map(product => <ProductCard product={product} onAdd={addProduct} key={product.id} />)}</div>{!filteredProducts.length && <div className="empty-products"><Sparkles size={22} /><strong>Aucune pièce dans cet univers pour le moment.</strong><button className="text-link" onClick={() => setActiveCategory("Tout voir")}>Voir toute la sélection <ArrowRight size={15} /></button></div>}</div></section>

      <section className="editorial container" id="journal"><div className="editorial-image"><img src="https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1200&q=85" alt="Lumière douce sur une table en bois" loading="lazy" /><div className="editorial-stamp"><span>LUMORA</span><span>OBJETS LUMINEUX</span><span>DEPUIS 2018</span></div></div><div className="editorial-copy"><span className="section-kicker"><span className="kicker-line" /> Notre manifeste</span><h2>Pas seulement<br /><em>une ampoule.</em></h2><p>Nous pensons chaque lumière comme un geste d’architecture. Une présence discrète le jour, une atmosphère le soir. Des matières honnêtes, des proportions justes et une chaleur qui ne s’éteint pas.</p><a className="text-link" href="#footer">Lire notre histoire <ArrowRight size={15} /></a><div className="editorial-signature">L’équipe Lumora <span>✳</span></div></div></section>

      <section className="service-band"><div className="container service-grid"><div className="service-item"><span className="service-icon"><Truck size={20} /></span><div><strong>Livraison offerte</strong><p>Dès 800 DH, partout au Maroc</p></div></div><div className="service-item"><span className="service-icon"><ShieldCheck size={20} /></span><div><strong>Paiement sécurisé</strong><p>CB ou paiement à la livraison</p></div></div><div className="service-item"><span className="service-icon"><PackageCheck size={20} /></span><div><strong>Retours sous 14 jours</strong><p>Simple et sans justification</p></div></div><div className="service-item"><span className="service-icon"><ClockIcon /></span><div><strong>Conseil lumière</strong><p>Une question ? On vous éclaire</p></div></div></div></section>

      <section className="newsletter"><div className="container newsletter-inner"><div><span className="section-kicker"><span className="kicker-line" /> La lettre Lumora</span><h2>Un peu de lumière<br /><em>dans vos emails.</em></h2></div><div className="newsletter-form-wrap">{newsletterDone ? <div className="newsletter-success"><span><Check size={17} /></span><strong>Bienvenue dans le cercle Lumora.</strong><p>À très bientôt dans votre boîte mail.</p></div> : <form className="newsletter-form" onSubmit={event => { event.preventDefault(); if (email) setNewsletterDone(true); }}><label htmlFor="email">Inspirations, nouveautés et conseils bien choisis.</label><div><Input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="votre@email.com" required /><button type="submit" aria-label="S’inscrire à la newsletter"><ArrowRight size={17} /></button></div><small>En vous inscrivant, vous acceptez notre politique de confidentialité.</small></form>}</div></div></section>
    </main>
    <footer className="site-footer" id="footer"><div className="container footer-top"><div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark"><span /></span><span className="brand-word">lumora</span></Link><p>La lumière comme<br />matière à vivre.</p><div className="socials"><a href="#footer" aria-label="Instagram"><Instagram size={17} /></a><a href="#footer" aria-label="Pinterest"><span className="pinterest-icon">p</span></a></div></div><div className="footer-col"><h3>Découvrir</h3><a href="#collections">Collections</a><a href="#selection">Nouveautés</a><a href="#selection">Les essentiels</a><a href="#journal">Le journal</a></div><div className="footer-col"><h3>Besoin d’aide ?</h3><Link href="/contact">Nous contacter</Link><Link href="/faq">FAQ</Link><Link href="/livraison">Livraison</Link><Link href="/retours">Retours</Link><Link href="/admin">Suivre ma commande</Link></div><div className="footer-col footer-address"><h3>Showroom</h3><p>12, rue des Artisans<br />Casablanca, Maroc</p><a href="#footer" className="text-link">Voir l’itinéraire <ArrowRight size={15} /></a></div></div><div className="container footer-bottom"><span>© 2026 Lumora Studio</span><div><Link href="/cgv">CGV</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/mentions">Mentions légales</Link></div><span>Fait avec intention <Zap size={13} fill="currentColor" /></span></div></footer></div>;
}

function ClockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>; }
function ArrowUpRightIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>; }

export default Home;
