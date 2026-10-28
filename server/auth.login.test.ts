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
    req: {
      protocol: "https",
      headers: {},
      hostname: "localhost",
    } as TrpcContext["req"],
    res: {
      cookie: () => undefined,
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
}

describe("auth.localLogin", () => {
  it("accepts the current admin email and the previous compatibility alias", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const current = await caller.auth.localLogin({ email: "admin@lumora.ma", password: "lumora2026" });
    const legacy = await caller.auth.localLogin({ email: "admin@lumora.com", password: "lumora2026" });

    expect(current.email).toBe("admin@lumora.ma");
    expect(legacy.email).toBe("admin@lumora.ma");
    expect(current.role).toBe("admin");
    expect(legacy.role).toBe("admin");
  });
});
