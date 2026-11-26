import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { productById } from "../data/catalog";

const CartContext = createContext(null);
const KEY = "cnc-shop-cart";
const FULFIL_KEY = "cnc-shop-fulfil"; // "delivery" | "pickup"

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    // keep only lines that still match a product + pack
    return saved.filter((l) => productById[l.id]?.packs.some((k) => k.size === l.size));
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [fulfil, setFulfil] = useState(() => {
    try {
      return localStorage.getItem(FULFIL_KEY) === "pickup" ? "pickup" : "delivery";
    } catch {
      return "delivery";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FULFIL_KEY, fulfil);
    } catch {
      /* ignore */
    }
  }, [fulfil]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — cart still works for this visit */
    }
  }, [lines]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const items = lines.map((l) => {
      const product = productById[l.id];
      const pack = product.packs.find((k) => k.size === l.size);
      const price = pack.price ?? null;
      return { ...l, product, price, total: price == null ? null : price * l.qty };
    });

    const add = (id, size, qty = 1, { silent } = {}) => {
      setLines((prev) => {
        const found = prev.find((l) => l.id === id && l.size === size);
        if (found) return prev.map((l) => (l === found ? { ...l, qty: Math.min(999, l.qty + qty) } : l));
        return [...prev, { id, size, qty }];
      });
      if (!silent) setToast({ name: productById[id].name, size, qty });
    };

    const setQty = (id, size, qty) =>
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => !(l.id === id && l.size === size))
          : prev.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.min(999, qty) } : l))
      );

    const remove = (id, size) => setLines((prev) => prev.filter((l) => !(l.id === id && l.size === size)));
    const clear = () => setLines([]);

    const priced = items.filter((l) => l.total != null);
    return {
      items,
      count: items.reduce((s, l) => s + l.qty, 0),
      subtotal: priced.reduce((s, l) => s + l.total, 0),
      allPriced: priced.length === items.length,
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
      toast,
      fulfil,
      setFulfil,
    };
  }, [lines, open, toast, fulfil]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
