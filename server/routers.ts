import { COOKIE_NAME, LOCAL_ADMIN_COOKIE_NAME, LOCAL_ADMIN_EMAIL, LOCAL_ADMIN_EMAIL_ALIASES, LOCAL_ADMIN_PASSWORD } from "@shared/const";
import { demoProducts } from "@shared/commerce/demo";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { commerceRouter } from "./routers/commerce";
import { z } from "zod";

const FAMILY_OPTIONS = ["Éclairage d’intérieur", "Éclairage artisanal", "Accessoires"] as const;
const TYPE_OPTIONS = ["Abat-jour", "Applique", "Suspension", "Lustre", "Magnétique", "Lampadaire", "Plafonnier"] as const;

const adminProductInput = z.object({
  title: z.string().trim().min(1).max(255),
  descriptionHtml: z.string().max(10000),
  vendor: z.string().trim().min(1).max(255).optional().default("Lumora Studio"),
  family: z.enum(FAMILY_OPTIONS).or(z.string().trim().min(1).max(255)),
  type: z.enum(TYPE_OPTIONS).or(z.string().trim().min(1).max(255)),
  productType: z.string().trim().min(1).max(255),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix invalide"),
  compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix comparé invalide").optional().or(z.literal("")),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  commerce: commerceRouter,
  admin: router({
    access: adminProcedure.query(({ ctx }) => ({ ok: true as const, role: ctx.user.role })),
    products: router({
      create: adminProcedure.input(adminProductInput).mutation(({ input }) => ({
        ...demoProducts[0],
        id: `demo-${Date.now()}`,
        title: input.title,
        description: input.descriptionHtml,
        descriptionHtml: input.descriptionHtml,
        vendor: input.vendor ?? "Lumora Studio",
        productType: input.type || input.productType,
        tags: Array.from(new Set([input.family, input.type, input.productType].filter(Boolean))),
        priceRange: {
          min: { amount: input.price, currencyCode: "MAD" },
          max: { amount: input.price, currencyCode: "MAD" },
        },
        variants: [{
          id: `demo-${Date.now()}-variant`,
          title: "Default Title",
          availableForSale: true,
          price: { amount: input.price, currencyCode: "MAD" },
          compareAtPrice: input.compareAtPrice ? { amount: input.compareAtPrice, currencyCode: "MAD" } : null,
          selectedOptions: [],
        }],
      })),
      update: adminProcedure.input(z.object({ id: z.string().min(1), product: adminProductInput })).mutation(({ input }) => ({
        ...demoProducts[0],
        id: input.id,
        title: input.product.title,
        description: input.product.descriptionHtml,
        descriptionHtml: input.product.descriptionHtml,
        vendor: input.product.vendor ?? "Lumora Studio",
        productType: input.product.type || input.product.productType,
        tags: Array.from(new Set([input.product.family, input.product.type, input.product.productType].filter(Boolean))),
        priceRange: {
          min: { amount: input.product.price, currencyCode: "MAD" },
          max: { amount: input.product.price, currencyCode: "MAD" },
        },
        variants: [{
          id: `${input.id}-variant`,
          title: "Default Title",
          availableForSale: true,
          price: { amount: input.product.price, currencyCode: "MAD" },
          compareAtPrice: input.product.compareAtPrice ? { amount: input.product.compareAtPrice, currencyCode: "MAD" } : null,
          selectedOptions: [],
        }],
      })),
      delete: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(({ input }) => ({
        id: input.id,
        deleted: true,
      })),
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    localLogin: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          password: z.string().min(6),
        })
      )
      .mutation(({ input, ctx }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const isValidEmail = LOCAL_ADMIN_EMAIL_ALIASES.some(alias => alias === normalizedEmail);

        if (!isValidEmail || input.password !== LOCAL_ADMIN_PASSWORD) {
          throw new Error("Identifiants administrateur invalides");
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        const adminSession = {
          id: 1,
          openId: "local-admin",
          name: "Admin Lumora",
          email: LOCAL_ADMIN_EMAIL,
          role: "admin",
        };

        ctx.res.cookie(LOCAL_ADMIN_COOKIE_NAME, JSON.stringify(adminSession), {
          ...cookieOptions,
          httpOnly: true,
          secure: cookieOptions.secure,
          maxAge: 60 * 60 * 24 * 7,
        });

        return {
          id: adminSession.id,
          openId: adminSession.openId,
          name: adminSession.name,
          email: adminSession.email,
          loginMethod: "local-admin",
          role: "admin",
        } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(LOCAL_ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
