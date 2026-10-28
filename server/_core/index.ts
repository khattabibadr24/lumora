import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { buildWhatsAppOrderMessage, normalizeWhatsAppPhone } from "../../client/src/lib/whatsapp";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.post("/api/whatsapp/order", async (req, res) => {
    const payload = req.body ?? {};
    const customerName = String(payload.customerName ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const city = String(payload.city ?? "").trim();
    const orderNumber = String(payload.orderNumber ?? "CMD-UNKNOWN").trim();
    const total = String(payload.total ?? "").trim();
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!customerName || !phone || !city || !orderNumber) {
      return res.status(400).json({ ok: false, error: "Commande incomplète" });
    }

    const message = buildWhatsAppOrderMessage({
      customerName,
      phone,
      city,
      orderNumber,
      total: total || "À déterminer",
      items: items.map((item: { title?: string; quantity?: number }) => ({
        title: String(item?.title ?? "Produit"),
        quantity: Number(item?.quantity ?? 1),
      })),
    });

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const targetPhone = normalizeWhatsAppPhone(process.env.WHATSAPP_TARGET_PHONE ?? "212661687918");

    if (!token || !phoneNumberId) {
      console.warn("[WhatsApp] Missing Meta credentials. Message built but not sent.", { phoneNumberId: !!phoneNumberId, token: !!token });
      return res.status(501).json({
        ok: false,
        error: "WhatsApp credentials are not configured",
        message,
      });
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: targetPhone,
          type: "text",
          text: { body: message },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("[WhatsApp] send failed", data);
        return res.status(response.status).json({ ok: false, error: data?.error ?? "WhatsApp send failed" });
      }

      return res.json({ ok: true, data });
    } catch (error) {
      console.error("[WhatsApp] unexpected error", error);
      return res.status(500).json({ ok: false, error: "Unable to send WhatsApp notification" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
