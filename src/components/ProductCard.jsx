import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ProductImage from "./ProductImage";
import Icon from "./Icons";
import { useCart } from "../context/CartContext";
import { brandById, categoryById } from "../data/catalog";
import { formatPrice } from "../config";

export default function ProductCard({ product, eager = false }) {
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(product.packs[0]?.size);
  const pack = product.packs.find((k) => k.size === size) || product.packs[0];

  const addToCart = () => {
    add(product.id, pack.size, 1, { silent: true });
    setOpen(true);
  };

  const buyNow = () => {
    add(product.id, pack.size, 1, { silent: true });
    navigate("/checkout");
  };

  return (
    <article className="pcard">
      <Link to={`/product/${product.id}`} className="pcard-media" aria-label={product.name}>
        <ProductImage product={product} eager={eager} />
        {product.top && (
          <span className="pcard-flag">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
              <path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8Z" />
            </svg>
            Best Seller
          </span>
        )}
      </Link>

      <div className="pcard-body">
        <p className="pcard-cat">{brandById[product.brand]?.name} · {categoryById[product.category]?.name}</p>
        <h3 className="pcard-name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        {product.short && <p className="pcard-short">{product.short}</p>}

        <div className="pcard-buy">
          <div className="pcard-price-row">
            <span className={`pcard-price ${pack.price == null ? "pcard-price--ask" : ""}`}>{formatPrice(pack.price)}</span>
            {product.packs.length > 1 ? (
              <select
                className="pcard-pack"
                value={pack.size}
                onChange={(e) => setSize(e.target.value)}
                aria-label={`Pack size for ${product.name}`}
              >
                {product.packs.map((k) => (
                  <option key={k.size} value={k.size}>{k.size}</option>
                ))}
              </select>
            ) : (
              <span className="pcard-pack pcard-pack--fixed">{pack.size}</span>
            )}
          </div>

          <div className="pcard-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={addToCart}>
              <Icon name="cart" size={16} /> Add
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={buyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
