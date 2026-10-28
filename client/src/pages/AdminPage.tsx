import { useState } from "react";
import { ArrowUpRight, Box, Check, CircleAlert, Eye, EyeOff, LayoutDashboard, LogIn, Package, Pencil, Plus, Save, ShoppingCart, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { demoProducts } from "@/data/catalog";
import type { Product } from "@shared/commerce/types";

const FAMILY_OPTIONS = ["Éclairage d’intérieur", "Éclairage artisanal", "Accessoires"];
const TYPE_OPTIONS = ["Abat-jour", "Applique", "Suspension", "Lustre", "Magnétique", "Lampadaire", "Plafonnier"];

type FormState = { title: string; descriptionHtml: string; family: string; type: string; price: string; compareAtPrice: string };
const emptyForm: FormState = { title: "", descriptionHtml: "", family: "Éclairage d’intérieur", type: "Suspension", price: "", compareAtPrice: "" };

function ProductForm({ initial, onCancel, onSaved }: { initial?: Product; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(() => {
    if (!initial) return emptyForm;
    const family = initial.tags.find(tag => FAMILY_OPTIONS.includes(tag)) ?? "Éclairage d’intérieur";
    const type = initial.productType || "Suspension";
    return {
      title: initial.title,
      descriptionHtml: initial.descriptionHtml || initial.description,
      family,
      type: TYPE_OPTIONS.includes(type) ? type : "Suspension",
      price: initial.variants[0]?.price.amount || initial.priceRange.min.amount,
      compareAtPrice: initial.variants[0]?.compareAtPrice?.amount || "",
    };
  });
  const create = trpc.admin.products.create.useMutation();
  const update = trpc.admin.products.update.useMutation();
  const mutation = initial ? update : create;
  const set = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const product = { ...form, vendor: "Lumora Studio", family: form.family, type: form.type, productType: form.type, compareAtPrice: form.compareAtPrice };
    if (initial) await update.mutateAsync({ id: initial.id, product });
    else await create.mutateAsync(product);
    onSaved();
  };
  return <form className="admin-product-form" onSubmit={submit}><div className="admin-form-heading"><div><span className="admin-label">{initial ? "Modifier l’article" : "Nouvel article"}</span><h2>{initial ? initial.title : "Ajouter une pièce"}</h2></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Fermer"><X size={18} /></button></div><label>Nom de l’article<Input required value={form.title} onChange={event => set("title", event.target.value)} /></label><div className="admin-form-row"><label>Famille<select required value={form.family} onChange={event => set("family", event.target.value)}><option value="">Sélectionner</option>{FAMILY_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}</select></label><label>Type<select required value={form.type} onChange={event => set("type", event.target.value)}><option value="">Sélectionner</option>{TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}</select></label></div><div className="admin-form-row"><label>Prix (MAD)<Input required inputMode="decimal" value={form.price} onChange={event => set("price", event.target.value)} /></label><label>Prix comparé (optionnel)<Input inputMode="decimal" value={form.compareAtPrice} onChange={event => set("compareAtPrice", event.target.value)} /></label></div><label>Description<Textarea required rows={5} value={form.descriptionHtml} onChange={event => set("descriptionHtml", event.target.value)} /></label>{mutation.error && <p className="admin-form-error"><CircleAlert size={14} /> {mutation.error.message}</p>}<div className="admin-form-actions"><Button type="button" variant="outline" onClick={onCancel}>Annuler</Button><Button type="submit" disabled={mutation.isPending}><Save size={15} /> {mutation.isPending ? "Enregistrement…" : initial ? "Enregistrer" : "Créer l’article"}</Button></div></form>;
}

function ProductRow({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  const variant = product.variants[0];
  return <div className="admin-product-row"><div className="admin-product-thumb">{product.images[0] && <img src={product.images[0].url} alt="" />}</div><div className="admin-product-copy"><strong>{product.title}</strong><span>{product.productType} · {product.vendor}</span></div><div className="admin-product-price"><strong>{variant?.price.amount} {variant?.price.currencyCode}</strong><span>{variant?.availableForSale ? "En stock" : "Indisponible"}</span></div><div className="admin-product-actions"><button onClick={onEdit} aria-label={`Modifier ${product.title}`}><Pencil size={15} /></button><button onClick={onDelete} aria-label={`Supprimer ${product.title}`}><Trash2 size={15} /></button></div></div>;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const adminAccess = trpc.admin.access.useQuery(undefined, { enabled: !authLoading && Boolean(user), retry: false });
  const productsQuery = trpc.commerce.products.list.useQuery({ first: 50 }, { enabled: adminAccess.data?.ok === true });
  const utils = trpc.useUtils();
  const remove = trpc.admin.products.delete.useMutation({ onSuccess: () => utils.commerce.products.list.invalidate() });
  const localLogin = trpc.auth.localLogin.useMutation();
  const [editing, setEditing] = useState<Product | undefined>();
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "admin@lumora.ma", password: "" });

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await localLogin.mutateAsync(loginForm);
      await utils.auth.me.invalidate();
      window.location.reload();
    } catch (error) {
      console.error("Local admin login failed", error);
    }
  };

  if (authLoading || (user && adminAccess.isLoading)) return <div className="account-loading">Chargement de l’espace administration…</div>;
  if (!user) return <div className="admin-login-page"><div className="content-hero"><span className="section-kicker"><span className="kicker-line" /> Accès administrateur</span><h1>Le pilotage<br /><em>de Lumora.</em></h1><p>Un seul compte administrateur permet de gérer les articles, les prix et la disponibilité de la boutique.</p><form onSubmit={submitLogin} style={{ display: "grid", gap: 12, maxWidth: 420, marginTop: 24 }}><label style={{ display: "grid", gap: 6 }}><span>Email</span><input type="email" value={loginForm.email} onChange={event => setLoginForm(current => ({ ...current, email: event.target.value }))} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d7d7d7" }} /></label><label style={{ display: "grid", gap: 6 }}><span>Mot de passe</span><div style={{ position: "relative" }}><input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={event => setLoginForm(current => ({ ...current, password: event.target.value }))} style={{ width: "100%", padding: "10px 42px 10px 12px", borderRadius: 8, border: "1px solid #d7d7d7" }} /><button type="button" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShowPassword(current => !current)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#3a3a3a", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} >{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><Button type="submit" disabled={localLogin.isPending}><LogIn size={16} /> {localLogin.isPending ? "Connexion…" : "Se connecter"}</Button></form></div></div>;
  if (adminAccess.isError || adminAccess.data?.ok !== true) return <div className="admin-login-page"><div className="content-hero"><span className="section-kicker"><span className="kicker-line" /> Accès refusé</span><h1>Compte non<br /><em>administrateur.</em></h1><p>Ce site ne possède pas de comptes clients. Seul le compte administrateur autorisé peut accéder à cet espace.</p><Link href="/" className="text-link">Retourner à la boutique <ArrowUpRight size={14} /></Link></div></div>;
  const catalog = productsQuery.data?.length ? productsQuery.data : demoProducts;
  const active = catalog.filter(product => product.variants[0]?.availableForSale).length;
  const promoted = catalog.filter(product => Boolean(product.variants[0]?.compareAtPrice)).length;
  const refresh = async () => { setCreating(false); setEditing(undefined); await utils.commerce.products.list.invalidate(); };
  const deleteProduct = async (product: Product) => { if (!window.confirm(`Supprimer « ${product.title} » ?`)) return; await remove.mutateAsync({ id: product.id }); };
  return <DashboardLayout><div className="admin-page"><div className="admin-topbar"><div><span className="section-kicker"><span className="kicker-line" /> Administration unique</span><h1>Bonjour, {user.name?.split(" ")[0] ?? "administrateur"}.</h1><p>Gérez les articles visibles dans la boutique Lumora.</p></div><div className="admin-actions"><Link href="/" className="admin-view-store">Voir la boutique <ArrowUpRight size={14} /></Link><Button onClick={() => { setCreating(true); setEditing(undefined); }}><Plus size={15} /> Ajouter un article</Button></div></div><div className="admin-kpis"><div><span>Articles au catalogue</span><strong>{catalog.length}</strong><small>{productsQuery.data?.length ? "Catalogue local" : "Mode aperçu"}</small></div><div><span>Disponibles</span><strong>{active}</strong><small><Check size={12} /> Prêts à la vente</small></div><div><span>En promotion</span><strong>{promoted}</strong><small>Prix comparés</small></div><div><span>Administration</span><strong><LayoutDashboard size={22} /></strong><small>Compte unique protégé</small></div></div>{(creating || editing) && <ProductForm initial={editing} onCancel={() => { setCreating(false); setEditing(undefined); }} onSaved={refresh} />}<section className="admin-panel admin-catalog-panel"><div className="admin-panel-heading"><div><span className="admin-label">Catalogue</span><h2>Articles Lumora</h2></div><Package size={17} /></div><div className="admin-product-list">{catalog.map(product => <ProductRow key={product.id} product={product} onEdit={() => { setEditing(product); setCreating(false); }} onDelete={() => deleteProduct(product)} />)}</div>{remove.error && <p className="admin-form-error"><CircleAlert size={14} /> {remove.error.message}</p>}</section><section className="admin-panel admin-help-panel"><CircleAlert size={18} /><div><strong>Gestion locale</strong><p>Les créations, modifications et suppressions restent en mode prototype local pour la boutique Lumora.</p></div></section><div className="admin-shortcuts"><Link href="/catalogue"><ShoppingCart size={18} /><span><strong>Voir la boutique</strong><small>Contrôler le rendu public du catalogue</small></span><ArrowUpRight size={15} /></Link><Link href="/" ><Box size={18} /><span><strong>Accueil Lumora</strong><small>Revenir à la vitrine</small></span><ArrowUpRight size={15} /></Link></div></div></DashboardLayout>;
}
