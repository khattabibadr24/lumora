import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { LOCAL_ADMIN_COOKIE_NAME } from "@shared/const";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = opts.req.headers.cookie ?? "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").flatMap(entry => {
        const [key, ...rest] = entry.trim().split("=");
        if (!key) return [];
        return [[key, decodeURIComponent(rest.join("="))]];
      })
    );

    const localAdminCookie = cookies[LOCAL_ADMIN_COOKIE_NAME];
    if (localAdminCookie) {
      const parsed = JSON.parse(localAdminCookie) as {
        id?: number;
        openId?: string;
        name?: string;
        email?: string | null;
        role?: "admin" | "user";
      };
      user = {
        id: parsed.id ?? 1,
        openId: parsed.openId ?? "local-admin",
        name: parsed.name ?? "Admin Lumora",
        email: parsed.email ?? "admin@lumora.ma",
        loginMethod: "local-admin",
        role: parsed.role ?? "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      } satisfies User;
    }
  } catch {
    user = null;
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
