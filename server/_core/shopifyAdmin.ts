import { TRPCError } from "@trpc/server";

const API_VERSION = "2025-04";

type ProductInput = {
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  price: string;
  compareAtPrice?: string;
};

function adminToken() {
  return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "";
}

function domain() {
  return process.env.SHOPIFY_STORE_DOMAIN ?? "";
}

function configured() {
  return Boolean(domain() && adminToken());
}

function numericId(id: string) {
  const match = id.match(/(\d+)$/);
  return match?.[1] ?? id;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!configured()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "La connexion Shopify Admin n’est pas configurée. Ajoutez SHOPIFY_ADMIN_ACCESS_TOKEN pour gérer les articles.",
    });
  }
  const response = await fetch(`https://${domain()}/admin/api/${API_VERSION}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken(),
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[Shopify Admin] HTTP", response.status, body);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Shopify Admin a répondu HTTP ${response.status}` });
  }
  return (await response.json()) as T;
}

export async function createProduct(input: ProductInput) {
  const result = await request<{ product: { id: number; title: string } }>("/products.json", {
    method: "POST",
    body: JSON.stringify({ product: {
      title: input.title,
      body_html: input.descriptionHtml,
      vendor: input.vendor,
      product_type: input.productType,
      status: "active",
      variants: [{ price: input.price, compare_at_price: input.compareAtPrice || null }],
    } }),
  });
  return result.product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const productId = numericId(id);
  const result = await request<{ product: { id: number; title: string } }>(`/products/${productId}.json`, {
    method: "PUT",
    body: JSON.stringify({ product: {
      id: Number(productId),
      title: input.title,
      body_html: input.descriptionHtml,
      vendor: input.vendor,
      product_type: input.productType,
      variants: [{ price: input.price, compare_at_price: input.compareAtPrice || null }],
    } }),
  });
  return result.product;
}

export async function deleteProduct(id: string) {
  await request(`/products/${numericId(id)}.json`, { method: "DELETE" });
  return { success: true as const };
}
