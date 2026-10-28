export type WhatsAppOrderMessageInput = {
  customerName: string;
  phone: string;
  city: string;
  orderNumber: string;
  total: string;
  items: Array<{ title: string; quantity: number }>;
};

export function buildWhatsAppOrderMessage({
  customerName,
  phone,
  city,
  orderNumber,
  total,
  items,
}: WhatsAppOrderMessageInput): string {
  const productLine = items[0]?.title ?? "Produit";
  const quantityLine = items.reduce((sum, item) => sum + item.quantity, 0);

  return [
    "🔔 NOUVELLE COMMANDE !",
    "",
    `👤 Client : ${customerName}`,
    `📞 Téléphone : ${phone}`,
    `📦 Produit : ${productLine}`,
    `🔢 Quantité : ${quantityLine}`,
    `💰 Total : ${total}`,
    `📍 Adresse : ${city}`,
    `🆔 Numéro de commande : ${orderNumber}`,
  ].join("\n");
}

export function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\s+/g, "").replace(/^\+/, "").replace(/^00/, "").trim();
}

export function getWhatsAppSendUrl({
  phone,
  text,
}: {
  phone: string;
  text: string;
}): string {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}
