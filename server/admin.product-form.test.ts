import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "local-admin",
    email: "admin@lumora.ma",
    name: "Admin Lumora",
    loginMethod: "local-admin",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {}, hostname: "localhost" } as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("admin products form", () => {
  it("stores the selected family and type distinctly", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.admin.products.create({
      title: "Lampe artisanale",
      descriptionHtml: "<p>Très belle lampe.</p>",
      vendor: "Lumora Studio",
      productType: "Suspension",
      family: "Éclairage artisanal",
      type: "Abat-jour",
      price: "1290.00",
      compareAtPrice: "1590.00",
    });

    expect(result.productType).toBe("Abat-jour");
    expect(result.tags).toEqual(expect.arrayContaining(["Éclairage artisanal", "Abat-jour"]));
  });
});
