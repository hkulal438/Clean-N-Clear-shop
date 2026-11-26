import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import Icon, { WhatsAppIcon } from "../components/Icons";
import ProductCard from "../components/ProductCard";
import { QtyStepper } from "../components/CartDrawer";
import FulfilChoice from "../components/FulfilChoice";
import { brandById, categoryName, productById, products } from "../data/catalog";
import { useCart } from "../context/CartContext";
import { askLink } from "../utils/quote";
import { formatPrice } from "../config";

export default function ProductPage() {
  const { id } = useParams();
  const product = productById[id];
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(product?.packs[0]?.size);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState("product");

  useEffect(() => {
    setSize(product?.packs[0]?.size);
    setQty(1);
    setView("product");
  }, [product]);

  useEffect(() => {
    if (product) document.title = `${product.name} — Clean N Clear Shop`;
    return () => { document.title = "Clean N Clear Shop – Cleaning & Hygiene Supplies"; };
  }, [product]);

  if (!product) return <Navigate to="/shop" replace />;

  const brand = brandById[product.brand];
  const pack = product.packs.find((k) => k.size === size) || product.packs[0];
  const shots = [{ key: "product", src: product.image, label: "Product" }, ...(product.before ? [{ key: "before", src: product.before, label: "Before & After" }] : [])];
  const current = shots.find((s) => s.key === view) || shots[0];

  const related = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .sort((a, b) => (b.category === product.category) - (a.category === product.category) || (b.top ? 1 : 0) - (a.top ? 1 : 0))
    .slice(0, 4);

  return (
    <div className="container pdp">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <Icon name="chevron" size={14} />
        <Link to={`/shop?brand=${brand.id}`}>{brand.name}</Link>
        <Icon name="chevron" size={14} />
        <Link to={`/shop?cat=${product.category}`}>{categoryName(product.category)}</Link>
        <Icon name="chevron" size={14} />
        <span>{product.name}</span>
      </nav>

      <div className="pdp-grid">
        <div className="pdp-media-wrap">
          <div className={`pdp-media ${current.key === "before" ? "pdp-media--wide" : ""}`}>
            <div className="pimg pimg--photo">
              <img src={current.src} alt={`${product.name} – ${current.label}`} />
            </div>
          </div>
          {shots.length > 1 && (
            <div className="pdp-thumbs" role="tablist" aria-label="Product images">
              {shots.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={view === s.key}
                  aria-label={s.key === "product" ? "Product photo" : "Results photo"}
                  className={view === s.key ? "is-active" : ""}
                  onClick={() => setView(s.key)}
                >
                  <img src={s.src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <p className="pdp-cat">{brand.name} · {categoryName(product.category)}</p>
          <h1>{product.name}</h1>
          <p className="pdp-ref">
            <Icon name="shield" size={16} />
            Genuine {brand.name} product
          </p>

          {product.short && <p className="pdp-short">{product.short}</p>}

          <div className="pdp-price">
            <strong>{pack.price == null ? "Price on request" : formatPrice(pack.price * qty)}</strong>
            <span>
              {pack.price == null
                ? "Best rate is shared in your WhatsApp quotation"
                : `${formatPrice(pack.price)} per ${pack.size} · GST & delivery as applicable`}
            </span>
          </div>

          <div className="pdp-packs">
            <h2>Pack size</h2>
            <div className="pack-chips" role="radiogroup" aria-label="Pack size">
              {product.packs.map((k) => (
                <button
                  key={k.size}
                  type="button"
                  role="radio"
                  aria-checked={k.size === pack.size}
                  className={`pack-chip ${k.size === pack.size ? "is-active" : ""}`}
                  onClick={() => setSize(k.size)}
                >
                  <strong>{k.size}</strong>
                  <span>{k.price == null ? "On request" : formatPrice(k.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pdp-buy">
            <QtyStepper value={qty} onChange={setQty} large />
            <button type="button" className="btn btn-outline btn-lg" onClick={() => { add(product.id, pack.size, qty, { silent: true }); setOpen(true); }}>
              <Icon name="cart" size={18} /> Add to cart
            </button>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => { add(product.id, pack.size, qty, { silent: true }); navigate("/checkout"); }}>
              Buy Now
            </button>
          </div>

          <a className="pdp-ask" href={askLink(product.name)} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} /> Have a question? Ask us on WhatsApp
          </a>

          <div className="pdp-fulfil">
            <h2>How would you like it?</h2>
            <FulfilChoice compact />
          </div>

          <ul className="pdp-perks">
            <li><Icon name="file" size={18} /> Instant PDF quotation at checkout</li>
            <li><Icon name="truck" size={18} /> We deliver everywhere — or pick up from our store</li>
          </ul>
        </div>
      </div>

      <div className="pdp-details">
        <section>
          <h2>Why it is used</h2>
          <ul className="pdp-uses">
            {product.uses.map((u) => (
              <li key={u}><Icon name="check" size={16} stroke={2.4} /> {u}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Where it is used</h2>
          <ul className="pdp-where">
            {product.where.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </section>
        <section>
          <h2>Good to know</h2>
          <ul className="pdp-facts">
            <li><span>Brand</span><Link to={`/shop?brand=${brand.id}`}>{brand.name}</Link></li>
            <li><span>Category</span><Link to={`/shop?cat=${product.category}`}>{categoryName(product.category)}</Link></li>
            <li><span>Packs available</span>{product.packs.map((k) => k.size).join(", ")}</li>
          </ul>
          <p className="pdp-note">
            Always follow the dilution and safety directions printed on the label. Wear gloves for concentrated chemicals.
          </p>
        </section>
      </div>

      {related.length > 0 && (
        <section className="pdp-related">
          <h2>You may also need</h2>
          <div className="grid-products">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
