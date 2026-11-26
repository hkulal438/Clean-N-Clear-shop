import React from "react";

import Icon from "./Icons";
import { useCart } from "../context/CartContext";
import { SHOP } from "../config";

// Delivery or store pickup — remembered for checkout
export const FULFIL = {
  delivery: {
    icon: "truck",
    title: "Delivery",
    text: "We deliver to your address — anywhere.",
    label: "Delivery",
  },
  pickup: {
    icon: "building",
    title: "Store pickup",
    text: "Visit our office and collect your order.",
    label: "Store pickup",
  },
};

export default function FulfilChoice({ compact = false }) {
  const { fulfil, setFulfil } = useCart();
  return (
    <div className={`fulfil ${compact ? "fulfil--compact" : ""}`}>
      <div className="fulfil-opts" role="radiogroup" aria-label="Delivery or pickup">
        {Object.entries(FULFIL).map(([id, f]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={fulfil === id}
            className={`fulfil-opt ${fulfil === id ? "is-active" : ""}`}
            onClick={() => setFulfil(id)}
          >
            <span className="fulfil-ico"><Icon name={f.icon} size={20} /></span>
            <span className="fulfil-copy">
              <strong>{f.title}</strong>
              <small>{f.text}</small>
            </span>
            <span className="fulfil-dot" aria-hidden="true" />
          </button>
        ))}
      </div>
      {fulfil === "pickup" && (
        <p className="fulfil-note">
          <Icon name="pin" size={16} />
          <span>
            Pick up from: <strong>{SHOP.addressLines.join(" ")}</strong>{" "}
            <a href={SHOP.mapUrl} target="_blank" rel="noreferrer">Open in Maps</a>
          </span>
        </p>
      )}
    </div>
  );
}
