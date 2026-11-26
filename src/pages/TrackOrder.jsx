import React, { useState } from "react";

import Icon, { WhatsAppIcon } from "../components/Icons";
import { Crumbs } from "./Shop";
import { savedOrders, trackLink } from "../utils/quote";
import { SHOP, formatPrice } from "../config";

const STAGES = [
  { icon: "file", title: "Quote received", text: "Your PDF quotation reaches our team on WhatsApp." },
  { icon: "shield", title: "Confirmed", text: "We confirm rates, GST, payment and the delivery address with you." },
  { icon: "box", title: "Packed", text: "Products are checked and packed at our store." },
  { icon: "truck", title: "Delivered or ready for pickup", text: "We dispatch your order and share the details — or tell you when it is ready to collect." },
  { icon: "check", title: "Delivered", text: "Your order arrives at your doorstep or business." },
];

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function TrackOrder() {
  const recent = savedOrders();
  const [form, setForm] = useState({ ref: recent[0]?.ref || "", phone: recent[0]?.phone || "", name: recent[0]?.name || "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      setError("Enter the 10-digit mobile number used for the order");
      return;
    }
    setError("");
    window.open(trackLink(form), "_blank", "noopener");
  };

  return (
    <div className="track">
      <section className="cats-band">
        <div className="container">
          <Crumbs items={[["Track Order", null]]} center />
          <h1>Track Your Order</h1>
          <p>Enter your quote reference and mobile number — we'll reply with the latest status on WhatsApp.</p>
        </div>
      </section>

      <section className="container track-grid">
        <form className="track-form" onSubmit={submit} noValidate>
          <h2>Find my order</h2>
          <label className="field">
            <span>Quote / order reference (e.g. CNC-251125-4821)</span>
            <input
              value={form.ref}
              onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value.toUpperCase() }))}
              placeholder="Optional if you don't have it"
            />
          </label>
          <label className={`field ${error ? "has-error" : ""}`}>
            <span>Mobile number used for the order</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
            />
            {error && <small>{error}</small>}
          </label>
          <button type="submit" className="btn btn-wa btn-lg btn-block">
            <WhatsAppIcon size={20} /> Get order status
          </button>
          <p className="track-help">
            Prefer to call? <a href={`tel:+${SHOP.whatsapp}`}>{SHOP.phoneDisplay}</a>
          </p>

          {recent.length > 0 && (
            <div className="track-recent">
              <h3>Orders from this device</h3>
              <ul>
                {recent.map((o) => (
                  <li key={o.ref}>
                    <button
                      type="button"
                      className={form.ref === o.ref ? "is-active" : ""}
                      onClick={() => setForm({ ref: o.ref, phone: o.phone, name: o.name })}
                    >
                      <span>
                        <strong>{o.ref}</strong>
                        <small>{fmtDate(o.date)} · {o.items.length} product{o.items.length > 1 ? "s" : ""}</small>
                      </span>
                      <em>{o.total == null ? "Quoted" : formatPrice(o.total)}</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        <div className="track-stages">
          <h2>What happens after you order</h2>
          <ol>
            {STAGES.map((s) => (
              <li key={s.title}>
                <span className="track-dot"><Icon name={s.icon} size={20} /></span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
