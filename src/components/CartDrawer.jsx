import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Icon from "./Icons";
import ProductImage from "./ProductImage";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../config";

// Same markup as the Anchan shop stepper; value/onChange so it works for cart lines and the product page
export function QtyStepper({ value, onChange, min = 1, label = "Quantity", large = false }) {
  return (
    <div className={`qty ${large ? "qty--lg" : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min - 1, value - 1))} aria-label="Decrease">
        <Icon name="minus" size={large ? 16 : 14} />
      </button>
      <input
        className="qty-input"
        type="number"
        inputMode="numeric"
        min={min}
        max={999}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.min(999, Math.max(min, n)));
        }}
        aria-label={label}
      />
      <button type="button" onClick={() => onChange(Math.min(999, value + 1))} aria-label="Increase">
        <Icon name="plus" size={large ? 16 : 14} />
      </button>
    </div>
  );
}

export function CartLine({ l }) {
  const { setQty, remove, setOpen } = useCart();
  return (
    <li className="line">
      <Link to={`/product/${l.id}`} className="line-img" onClick={() => setOpen(false)}>
        <ProductImage product={l.product} />
      </Link>
      <div className="line-info">
        <Link to={`/product/${l.id}`} className="line-name" onClick={() => setOpen(false)}>
          {l.product.name}
        </Link>
        <span className="line-meta">{l.size} · {formatPrice(l.price)}</span>
        <QtyStepper value={l.qty} min={0} onChange={(q) => setQty(l.id, l.size, q)} label={`Quantity of ${l.product.name}`} />
      </div>
      <div className="line-end">
        {l.total != null && <strong>{formatPrice(l.total)}</strong>}
        <button type="button" className="line-remove" onClick={() => remove(l.id, l.size)} aria-label={`Remove ${l.product.name}`}>
          <Icon name="trash" size={16} />
        </button>
      </div>
    </li>
  );
}

export function QuoteNote() {
  return (
    <div className="meter meter--quote">
      <p>
        <Icon name="file" size={15} /> At checkout you get a <strong>PDF quotation</strong> to send us on WhatsApp
      </p>
    </div>
  );
}

export default function CartDrawer() {
  const { items, subtotal, allPriced, count, open, setOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="drawer-backdrop" onClick={() => setOpen(false)} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer-head">
          <h2>Your Cart {count > 0 && <small>({count})</small>}</h2>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">
            <Icon name="close" size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <Icon name="cart" size={42} stroke={1.4} />
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setOpen(false)}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <QuoteNote />
            <ul className="drawer-list">
              {items.map((l) => <CartLine key={l.id + l.size} l={l} />)}
            </ul>

            <div className="drawer-foot">
              <div className="drawer-total">
                <span>{allPriced ? "Subtotal" : "Total"}</span>
                <strong>{allPriced ? formatPrice(subtotal) : "Quoted on WhatsApp"}</strong>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
              >
                Checkout <Icon name="arrow" size={18} />
              </button>
              <button type="button" className="btn btn-ghost btn-block" onClick={() => setOpen(false)}>
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
