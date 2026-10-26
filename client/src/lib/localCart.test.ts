import { describe, expect, it } from "vitest";
import { addToDemoCart, removeFromDemoCart, updateDemoCart } from "./localCart";

describe("local demo cart", () => {
  it("adds an item and computes the total", () => {
    const cart = addToDemoCart(null, "demo-halo-sable-variant", 2);
    expect(cart?.itemCount).toBe(2);
    expect(cart?.items[0].productTitle).toBe("Suspension Halo Sable");
    expect(cart?.total.amount).toBe("2580.00");
  });

  it("updates quantity and removes the line", () => {
    const initial = addToDemoCart(null, "demo-orbit-black-variant", 1)!;
    const updated = updateDemoCart(initial, initial.items[0].lineId, 3);
    expect(updated.itemCount).toBe(3);
    expect(updated.total.amount).toBe("567.00");
    const empty = removeFromDemoCart(updated, initial.items[0].lineId);
    expect(empty.itemCount).toBe(0);
    expect(empty.items).toHaveLength(0);
  });
});
