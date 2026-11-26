import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Icon, { WhatsAppIcon } from "../components/Icons";
import { CartLine } from "../components/CartDrawer";
import FulfilChoice, { FULFIL } from "../components/FulfilChoice";
import { useCart } from "../context/CartContext";
import {
  buildQuotePdf,
  canSharePdf,
  downloadBlob,
  newQuoteRef,
  quoteFileName,
  quoteMessage,
  saveOrder,
  quoteLink,
  uploadQuote,
} from "../utils/quote";
import { SHOP, formatPrice } from "../config";

const FORM_KEY = "cnc-shop-customer";
const empty = { name: "", company: "", phone: "", email: "", address: "", city: "", pincode: "", gst: "", note: "" };

const loadForm = () => {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(FORM_KEY) || "{}"), note: "" };
  } catch {
    return empty;
  }
};

export default function Checkout() {
  const { items, subtotal, allPriced, count, clear, fulfil } = useCart();
  const delivery = fulfil === "delivery";
  const [form, setForm] = useState(loadForm);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { ref, file, text, name, pdfUrl, shareable, sent }

  useEffect(() => () => done?.pdfUrl && URL.revokeObjectURL(done.pdfUrl), [done]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a 10-digit mobile number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (delivery) {
      if (form.address.trim().length < 8) e.address = "Please enter the delivery address";
      if (form.city.trim().length < 2) e.city = "Enter your city";
      if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a 6-digit pincode";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sharePdf = async (d = done) => {
    if (!d) return false;
    if (canSharePdf(d.file)) {
      try {
        await navigator.share({ files: [d.file], title: `Quotation ${d.ref}` });
        return true;
      } catch {
        /* cancelled or not allowed — buttons below still work */
      }
    }
    return false;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || busy) return;
    setBusy(true);
    // open the WhatsApp tab right away (inside the click) so pop-up blockers allow it;
    // it is pointed at the Clean N Clear chat once the PDF link is ready
    const waTab = window.open("", "_blank");
    if (waTab) waTab.document.write("<p style='font:16px sans-serif;padding:24px'>Preparing your quotation for WhatsApp…</p>");
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify({ ...form, note: "" }));
    } catch {
      /* ignore */
    }

    const ref = newQuoteRef();
    const customer = { ...form, phone: form.phone.trim(), fulfil };
    const payload = { items, subtotal, allPriced, customer, ref };
    const blob = await buildQuotePdf(payload);
    const name = quoteFileName(ref);
    const file = new File([blob], name, { type: "application/pdf" });

    // save the PDF online → WhatsApp message to the office carries the PDF link
    const link = await uploadQuote(blob, ref);
    const text = quoteMessage({ ...payload, pdfUrl: link });

    saveOrder({
      ref,
      date: new Date().toISOString(),
      phone: customer.phone,
      name: customer.name,
      total: allPriced ? subtotal : null,
      fulfil,
      items: items.map((l) => `${l.product.name} (${l.size}) × ${l.qty}`),
    });

    const d = { ref, file, text, name, pdfUrl: URL.createObjectURL(blob), shareable: canSharePdf(file), link };
    setDone(d);
    setBusy(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (link) {
      // one tap: WhatsApp opens to the office number with the order + PDF link typed in
      if (waTab) waTab.location.href = quoteLink(text);
      return;
    }
    // Fallback when the PDF could not be saved online.
    // Computers can't share files into WhatsApp: save the PDF and point the tab we opened
    // during the click at the Clean N Clear chat (a new window.open here would be blocked).
    // Phones get two big buttons instead (open our chat, then share the PDF into it).
    if (!d.shareable) {
      downloadBlob(blob, name);
      if (waTab) waTab.location.href = quoteLink(text);
      else window.open(quoteLink(text), "_blank", "noopener");
    } else if (waTab) {
      waTab.close();
    }
  };

  if (done?.link) {
    return (
      <div className="container checkout-done">
        <span className="done-icon done-icon--wa"><WhatsAppIcon size={36} /></span>
        <h1>Tap “Send” in WhatsApp</h1>
        <p>
          WhatsApp has opened a chat with <strong>Clean N Clear ({SHOP.quoteDisplay})</strong> with your order
          and the PDF quotation link typed in. Just press <strong>Send</strong> — our office receives it straight away.
        </p>
        <p className="done-ref">
          Quote reference: <strong>{done.ref}</strong>
          <span>Keep it to track your order.</span>
        </p>
        <div className="done-actions">
          <a className="btn btn-wa btn-lg" href={quoteLink(done.text)} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} /> WhatsApp didn't open? Send quotation
          </a>
          <button type="button" className="btn btn-outline btn-lg" onClick={() => downloadBlob(done.file, done.name)}>
            <Icon name="download" size={18} /> Download PDF
          </button>
          <a className="btn btn-outline btn-lg" href={done.pdfUrl} target="_blank" rel="noreferrer">
            <Icon name="file" size={18} /> View PDF
          </a>
        </div>
        <div className="done-foot">
          <Link to="/shop" className="btn btn-primary" onClick={clear}>Done — clear cart & keep shopping</Link>
          <Link to="/track-order" className="btn btn-link">Track this order</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container checkout-done">
        <span className="done-icon"><Icon name="file" size={34} /></span>
        <h1>Your quotation is ready</h1>
        <p>Send it to <strong>Clean N Clear ({SHOP.quoteDisplay})</strong> on WhatsApp to place your order.</p>
        <p className="done-ref">
          Quote reference: <strong>{done.ref}</strong>
          <span>Keep it to track your order.</span>
        </p>

        {done.shareable ? (
          <div className="share-steps">
            <div className="share-step">
              <span className="share-no">1</span>
              <div>
                <strong>Open our WhatsApp chat</strong>
                <small>Your order details are typed in — just press send.</small>
              </div>
              <a className="btn btn-wa" href={quoteLink(done.text)} target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> Open chat
              </a>
            </div>
            <div className="share-step">
              <span className="share-no">2</span>
              <div>
                <strong>Share the PDF quote</strong>
                <small>Choose WhatsApp → <b>Clean N Clear</b> (now at the top of your chats) → send.</small>
              </div>
              <button type="button" className="btn btn-wa" onClick={() => sharePdf()}>
                <Icon name="share" size={17} /> Share PDF
              </button>
            </div>
          </div>
        ) : (
          <ol className="done-steps">
            <li>The PDF <strong>{done.name}</strong> has been downloaded.</li>
            <li>Our WhatsApp chat ({SHOP.quoteDisplay}) opened with your order typed in — attach the PDF (📎) and press send.</li>
            <li>Our team replies with final rates, payment and delivery.</li>
          </ol>
        )}

        <div className="done-actions">
          {!done.shareable && (
            <a className="btn btn-wa btn-lg" href={quoteLink(done.text)} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} /> Open Clean N Clear chat
            </a>
          )}
          <button type="button" className="btn btn-outline btn-lg" onClick={() => downloadBlob(done.file, done.name)}>
            <Icon name="download" size={18} /> Download PDF
          </button>
          <a className="btn btn-outline btn-lg" href={done.pdfUrl} target="_blank" rel="noreferrer">
            <Icon name="file" size={18} /> View PDF
          </a>
        </div>

        <div className="done-foot">
          <Link to="/shop" className="btn btn-primary" onClick={clear}>Done — clear cart & keep shopping</Link>
          <Link to="/track-order" className="btn btn-link">Track this order</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container checkout-done">
        <span className="done-icon done-icon--muted"><Icon name="cart" size={34} /></span>
        <h1>Your cart is empty</h1>
        <p>Add products and come back here to get your PDF quotation on WhatsApp.</p>
        <div className="done-actions">
          <Link to="/shop" className="btn btn-primary btn-lg">Browse products</Link>
        </div>
      </div>
    );
  }

  const field = (k, label, props = {}) => (
    <label className={`field ${errors[k] ? "has-error" : ""} ${props.wide ? "field--wide" : ""}`}>
      <span>{label}</span>
      {props.textarea ? (
        <textarea value={form[k]} onChange={set(k)} rows={3} {...props.input} />
      ) : (
        <input value={form[k]} onChange={set(k)} {...props.input} />
      )}
      {errors[k] && <small>{errors[k]}</small>}
    </label>
  );

  return (
    <div className="container checkout">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><Icon name="chevron" size={14} /><Link to="/shop">Shop</Link><Icon name="chevron" size={14} /><span>Checkout</span>
      </nav>
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <h2>Your details</h2>
          <div className="field-row">
            {field("name", "Full name *", { input: { autoComplete: "name" } })}
            {field("company", "Company / organisation", { input: { autoComplete: "organization" } })}
          </div>
          <div className="field-row">
            {field("phone", "Mobile number (WhatsApp) *", { input: { type: "tel", inputMode: "tel", autoComplete: "tel" } })}
            {field("email", "Email", { input: { type: "email", autoComplete: "email" } })}
          </div>

          <h2>Delivery or pickup</h2>
          <FulfilChoice />

          {delivery && (
            <>
              <h2 className="checkout-sub">Delivery address</h2>
              {field("address", "Address (building, street, area) *", { textarea: true, input: { autoComplete: "street-address" } })}
              <div className="field-row">
                {field("city", "City *", { input: { autoComplete: "address-level2" } })}
                {field("pincode", "Pincode *", { input: { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" } })}
              </div>
            </>
          )}
          <div className="field-row">
            {field("gst", "GSTIN (for business invoice)", { input: { maxLength: 15, style: { textTransform: "uppercase" } } })}
            {field("note", "Note for us", { input: { placeholder: delivery ? "Delivery time, brand preference…" : "When will you visit? Brand preference…" } })}
          </div>

          <div className="checkout-how">
            <Icon name="file" size={22} />
            <p>
              We'll create a <strong>PDF quotation</strong> with your items and quantities and open WhatsApp to
              our office ({SHOP.quoteDisplay}) with it ready to go — just tap <strong>Send</strong>. We then confirm
              the final rates, GST, payment and delivery with you.
            </p>
          </div>

          <button type="submit" className="btn btn-wa btn-lg btn-block" disabled={busy}>
            <WhatsAppIcon size={20} /> {busy ? "Creating your quotation…" : "Create PDF Quote & Send on WhatsApp"}
          </button>
        </form>

        <aside className="summary">
          <h2>Order summary <span>({count} item{count === 1 ? "" : "s"})</span></h2>
          <ul className="summary-list">
            {items.map((l) => <CartLine key={l.id + l.size} l={l} />)}
          </ul>
          <dl className="summary-totals">
            <div><dt>Products</dt><dd>{items.length}</dd></div>
            <div><dt>Total quantity</dt><dd>{count}</dd></div>
            <div><dt>Order type</dt><dd>{FULFIL[fulfil].label}</dd></div>
            <div><dt>{delivery ? "Delivery charges" : "Pickup from"}</dt><dd>{delivery ? "Confirmed on WhatsApp" : "Our store, KRR Road"}</dd></div>
            <div className="summary-grand">
              <dt>Estimated total</dt>
              <dd>{allPriced ? formatPrice(subtotal) : "Rates in quotation"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
