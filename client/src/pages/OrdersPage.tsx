import { useState } from "react";
import { CheckCheck, Clock3, PackageCheck, ShoppingCart, Truck, XCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

type OrderStatus = "validée" | "expédiée" | "annulée";

type Order = {
  id: string;
  createdAt: string;
  buyer: {
    fullName: string;
    city: string;
    phone: string;
    email?: string;
  };
  items: string[];
  total: string;
  status: OrderStatus;
};

const initialOrders: Order[] = [
  {
    id: "CMD-2048",
    createdAt: "2026-10-27",
    buyer: {
      fullName: "Sofia Benali",
      city: "Casablanca",
      phone: "+212 6 12 34 56 78",
      email: "sofia@example.com",
    },
    items: ["Suspension Halo Sable", "Lampadaire Solis"],
    total: "4 690 MAD",
    status: "validée",
  },
  {
    id: "CMD-2049",
    createdAt: "2026-10-28",
    buyer: {
      fullName: "Yassine Idrissi",
      city: "Rabat",
      phone: "+212 6 98 77 66 55",
      email: "yassine@example.com",
    },
    items: ["Applique Ada Noir"],
    total: "1 290 MAD",
    status: "expédiée",
  },
  {
    id: "CMD-2050",
    createdAt: "2026-10-28",
    buyer: {
      fullName: "Nadia El Amrani",
      city: "Marrakech",
      phone: "+212 6 11 22 33 44",
      email: "nadia@example.com",
    },
    items: ["Lustre Sirocco", "Abat-jour Dune"],
    total: "7 980 MAD",
    status: "annulée",
  },
];

const statusPalette: Record<OrderStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  validée: { label: "Validée", className: "bg-amber-100 text-amber-800 border border-amber-200", icon: CheckCheck },
  expédiée: { label: "Expédiée", className: "bg-emerald-100 text-emerald-800 border border-emerald-200", icon: Truck },
  annulée: { label: "Annulée", className: "bg-rose-100 text-rose-800 border border-rose-200", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(current =>
      current.map(order =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <ShoppingCart className="h-3.5 w-3.5" />
              Commandes
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Suivi des commandes</h1>
          </div>
          <div className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            {orders.length} commande{orders.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="space-y-4">
          {orders.map(order => {
            const statusMeta = statusPalette[order.status];
            const StatusIcon = statusMeta.icon;

            return (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <strong className="text-lg">{order.id}</strong>
                      <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Commande du {order.createdAt}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant={order.status === "validée" ? "default" : "outline"} size="sm" onClick={() => updateStatus(order.id, "validée")}>
                      Valider
                    </Button>
                    <Button variant={order.status === "expédiée" ? "default" : "outline"} size="sm" onClick={() => updateStatus(order.id, "expédiée")}>
                      Expédier
                    </Button>
                    <Button variant={order.status === "annulée" ? "destructive" : "outline"} size="sm" onClick={() => updateStatus(order.id, "annulée")}>
                      Annuler
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <PackageCheck className="h-4 w-4" />
                      Articles
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {order.items.map(item => (
                        <li key={item} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                          <span>{item}</span>
                          <span className="font-medium text-foreground">1</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-3 text-sm font-medium text-foreground">Acheteur</div>
                    <dl className="space-y-2 text-sm text-muted-foreground">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">Nom</dt>
                        <dd className="mt-1 text-foreground">{order.buyer.fullName}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">Ville</dt>
                        <dd className="mt-1 text-foreground">{order.buyer.city}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">Téléphone</dt>
                        <dd className="mt-1 text-foreground">{order.buyer.phone}</dd>
                      </div>
                      {order.buyer.email && (
                        <div>
                          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">Email</dt>
                          <dd className="mt-1 text-foreground">{order.buyer.email}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <strong className="text-xl font-semibold">{order.total}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
