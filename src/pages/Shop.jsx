import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import Icon, { WhatsAppIcon } from "../components/Icons";
import ProductCard from "../components/ProductCard";
import {
  brands,
  categories,
  brandById,
  categoryName,
  products,
  productsOfBrand,
  productsOfCategory,
  searchProducts,
} from "../data/catalog";
import { SHOP } from "../config";

const PAGE = 24;

const SORTS = {
  top: { label: "Recommended", fn: (a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0) },
  name: { label: "Name: A to Z", fn: (a, b) => a.name.localeCompare(b.name) },
  "name-desc": { label: "Name: Z to A", fn: (a, b) => b.name.localeCompare(a.name) },
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const brand = brandById[params.get("brand")] ? params.get("brand") : "";
  const cat = categories.some((c) => c.id === params.get("cat")) ? params.get("cat") : "";
  const sort = SORTS[params.get("sort")] ? params.get("sort") : "top";

  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [qInput, setQInput] = useState(q);

  useEffect(() => setQInput(q), [q]);
  useEffect(() => setShown(PAGE), [q, brand, cat, sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setFiltersOpen(false);
  };

  const list = useMemo(() => {
    let r = brand ? productsOfBrand(brand) : products;
    if (cat) r = r.filter((p) => p.category === cat);
    if (q) {
      const hits = new Set(searchProducts(q).map((p) => p.id));
      r = r.filter((p) => hits.has(p.id));
    }
    return [...r].sort(SORTS[sort].fn);
  }, [q, brand, cat, sort]);

  const b = brandById[brand];
  const heading = q ? `Results for “${q}”` : brand ? b.name : cat ? categoryName(cat) : "All Products";

  const activeChips = [
    q && { key: "q", label: `“${q}”` },
    brand && { key: "brand", label: b.name },
    cat && { key: "cat", label: categoryName(cat) },
  ].filter(Boolean);

  const brandCount = (id) => productsOfBrand(id).filter((p) => !cat || p.category === cat).length;
  const catCount = (id) => (brand ? productsOfBrand(brand) : products).filter((p) => p.category === id).length;

  return (
    <div className="shop container">
      {b && (
        <div className="shop-brand">
          <span className="shop-brand-logo"><img src={b.logo} alt={`${b.name} logo`} /></span>
          <p>{b.about}</p>
        </div>
      )}

      <div className="shop-head">
        <div>
          <h1>{heading}</h1>
          <p>{list.length} {list.length === 1 ? "product" : "products"} · add to cart and get a PDF quote on WhatsApp</p>
        </div>
        <div className="shop-tools">
          <form
            className="shop-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update("q", qInput.trim());
            }}
          >
            <Icon name="search" size={17} />
            <input
              type="search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search in shop"
              aria-label="Search in shop"
            />
          </form>
          <label className="shop-sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => update("sort", e.target.value === "top" ? "" : e.target.value)}>
              {Object.entries(SORTS).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-outline btn-sm shop-filter-btn" onClick={() => setFiltersOpen(true)}>
            Filters
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="chips">
          {activeChips.map((c) => (
            <button key={c.key} type="button" className="chip" onClick={() => update(c.key, "")}>
              {c.label} <Icon name="close" size={14} />
            </button>
          ))}
          <button type="button" className="chip chip--clear" onClick={() => setParams({}, { replace: true })}>
            Clear all
          </button>
        </div>
      )}

      <div className="shop-layout">
        <aside className={`filters ${filtersOpen ? "is-open" : ""}`} aria-label="Filters">
          <div className="filters-head">
            <h2>Filters</h2>
            <button type="button" className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="filter-group">
            <h3>Brand</h3>
            <button type="button" className={`filter-opt ${!brand ? "is-active" : ""}`} onClick={() => update("brand", "")}>
              All brands <span>{products.length}</span>
            </button>
            {brands.map((x) => (
              <button key={x.id} type="button" className={`filter-opt ${brand === x.id ? "is-active" : ""}`} onClick={() => update("brand", x.id)}>
                {x.name} <span>{brandCount(x.id)}</span>
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h3>Category</h3>
            <button type="button" className={`filter-opt ${!cat ? "is-active" : ""}`} onClick={() => update("cat", "")}>
              All categories
            </button>
            {categories.map((c) => (
              <button key={c.id} type="button" className={`filter-opt ${cat === c.id ? "is-active" : ""}`} onClick={() => update("cat", c.id)}>
                {c.name} <span>{catCount(c.id)}</span>
              </button>
            ))}
          </div>
        </aside>
        {filtersOpen && <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />}

        <div className="shop-results">
          {list.length === 0 ? (
            <div className="empty">
              <Icon name={q ? "search" : "box"} size={40} stroke={1.4} />
              <h2>{q ? "No products found" : "Products coming soon"}</h2>
              <p>
                {q
                  ? "Try another word — for example “floor”, “toilet” or “glass”."
                  : "We stock these in store. Message us on WhatsApp and we'll share options and a quotation."}
              </p>
              <div className="center">
                <a className="btn btn-wa" href={`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(`Hello ${SHOP.name}, I'm looking for ${heading}.`)}`} target="_blank" rel="noreferrer">
                  <WhatsAppIcon size={18} /> Ask on WhatsApp
                </a>
                <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
                  Show all products
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid-products grid-products--shop">
                {list.slice(0, shown).map((p, i) => <ProductCard key={p.id} product={p} eager={i < 6} />)}
              </div>
              {shown < list.length && (
                <div className="center">
                  <button type="button" className="btn btn-outline btn-lg" onClick={() => setShown((s) => s + PAGE)}>
                    Show more ({list.length - shown} left)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// old links (/brands/:id, /category/:id) → shop filters
export function BrandRedirect() {
  const { id } = useParams();
  return <Navigate to={`/shop?brand=${id}`} replace />;
}

export function CategoryRedirect() {
  const { id } = useParams();
  return <Navigate to={`/shop?cat=${id}`} replace />;
}

export function Crumbs({ items, center }) {
  return (
    <nav className={`crumbs ${center ? "crumbs--center" : ""}`} aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map(([label, to]) => (
        <React.Fragment key={label}>
          <Icon name="chevron" size={14} />
          {to ? <Link to={to}>{label}</Link> : <span>{label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}
