import { describe, expect, it } from "vitest";
import { buildWhatsAppOrderMessage, getWhatsAppSendUrl, normalizeWhatsAppPhone } from "./whatsapp";

describe("WhatsApp order notification", () => {
  it("builds the expected message for a customer order", () => {
    const message = buildWhatsAppOrderMessage({
      customerName: "Ahmed",
      phone: "0612345678",
      city: "Fès",
      orderNumber: "CMD-1025",
      total: "350 DH",
      items: [{ title: "Chaussures", quantity: 2 }],
    });

    expect(message).toContain("🔔 NOUVELLE COMMANDE !");
    expect(message).toContain("👤 Client : Ahmed");
    expect(message).toContain("📞 Téléphone : 0612345678");
    expect(message).toContain("📦 Produit : Chaussures");
    expect(message).toContain("🔢 Quantité : 2");
    expect(message).toContain("💰 Total : 350 DH");
    expect(message).toContain("📍 Adresse : Fès");
    expect(message).toContain("🆔 Numéro de commande : CMD-1025");
  });

  it("creates a WhatsApp URL from a configured phone number", () => {
    const url = getWhatsAppSendUrl({
      phone: "212612345678",
      text: "Hello",
    });

    expect(url).toBe("https://wa.me/212612345678?text=Hello");
  });

  it("normalizes WhatsApp phone numbers before sending", () => {
    expect(normalizeWhatsAppPhone("+212 661 687 918")).toBe("212661687918");
    expect(normalizeWhatsAppPhone(" 212661687918 ")).toBe("212661687918");
  });
});
