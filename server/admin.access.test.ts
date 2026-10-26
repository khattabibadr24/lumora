import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "user"): TrpcContext { return { user: { id: 1, openId: `test-${role}`, email: `${role}@example.com`, name: role, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }

describe("admin.access", () => {
  it("allows admin users", async () => { const result = await appRouter.createCaller(context("admin")).admin.access(); expect(result).toEqual({ ok: true, role: "admin" }); });
  it("rejects regular users", async () => { await expect(appRouter.createCaller(context("user")).admin.access()).rejects.toMatchObject({ code: "FORBIDDEN" }); });
  it("protects product creation and reports missing Shopify Admin credentials", async () => {
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.admin.products.create({
      title: "Test",
      descriptionHtml: "<p>Test</p>",
      vendor: "Lumora Studio",
      productType: "Suspensions",
      price: "100",
      compareAtPrice: "",
    })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
  it("does not expose product mutations to regular users", async () => {
    await expect(appRouter.createCaller(context("user")).admin.products.delete({ id: "1" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
