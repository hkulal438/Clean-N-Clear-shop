import React, { useState } from "react";
import { Link } from "react-router-dom";

import Icon, { WhatsAppIcon } from "../components/Icons";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import {
  brands,
  categories,
  products,
  productById,
  productsOfBrand,
  productsOfCategory,
  topSelling,
  featured,
  CATEGORY_COVER,
} from "../data/catalog";
import { SHOP } from "../config";

// categories shown as large round cards on the home page (the rest appear as chips)
const FEATURED_CATS = ["floor-care", "washroom", "kitchen", "glass-surface", "hand-hygiene", "air-care", "furniture-metal", "carpet-laundry", "industrial", "tools"];

// three points either side of the centre product
const WHY_LEFT = [
  { icon: "shield", title: "Genuine Brands", text: "Original Diversey-Taski, Reva and Miraclean products sourced from authorised channels." },
  { icon: "flask", title: "The Right Chemical", text: "We help you choose the correct product and dilution for every surface and space." },
  { icon: "box", title: "Retail & Bulk Packs", text: "From 500 ml bottles for homes to 5 L and 25 L cans for facilities." },
];

const WHY_RIGHT = [
  { icon: "file", title: "Instant PDF Quotation", text: "Add products to cart and get a neat quotation to share with us on WhatsApp." },
  { icon: "truck", title: "Delivery or Pickup", text: "We deliver your order anywhere, or you can pick it up from our KRR Road store." },
  { icon: "award", title: "Expert Support", text: "Housekeeping teams, hotels and hospitals trust us for regular supplies." },
];

const SectionHead = ({ title, text, link, linkLabel }) => (
  <div className="shead">
    <div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
    {link && (
      <Link to={link} className="shead-link">
        {linkLabel} <Icon name="arrow" size={16} />
      </Link>
    )}
  </div>
);

export default function Home() {
  const tabs = ["floor-care", "washroom", "kitchen", "hand-hygiene", "tools"];
  const [tab, setTab] = useState(tabs[0]);
  const tabProducts = productsOfCategory(tab).slice(0, 8);

  return (
    <>
      {/* ================= HERO SLIDER ================= */}
      <HeroSlider />

      {/* ================= TRUST STRIP ================= */}
      <section className="trust">
        <div className="container trust-grid">
          <div><Icon name="file" size={26} /><p><strong>PDF quotation</strong><span>for every order, in seconds</span></p></div>
          <div><WhatsAppIcon size={24} /><p><strong>Order on WhatsApp</strong><span>we confirm every order personally</span></p></div>
          <div><Icon name="shield" size={26} /><p><strong>Genuine brands</strong><span>Diversey-Taski, Reva, Miraclean</span></p></div>
          <div><Icon name="truck" size={26} /><p><strong>Delivery or pickup</strong><span>we deliver everywhere</span></p></div>
        </div>
      </section>

      {/* ================= TOP SELLING ================= */}
      <section className="block">
        <div className="container">
          <SectionHead title="Top Selling Products" text="The cleaning products our customers order again and again." link="/shop" linkLabel="View all" />
          <div className="grid-products">
            {topSelling.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} eager={i < 4} />)}
          </div>
          {topSelling.length > 8 && (
            <div className="center">
              <Link to="/shop?sort=top" className="btn btn-outline btn-lg">
                See all {topSelling.length} top sellers <Icon name="arrow" size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= BRANDS ================= */}
      <section className="block block--cream">
        <div className="container">
          <SectionHead title="Shop by Brand" text="Trusted names in professional and household cleaning." link="/brands" linkLabel="All brands" />
          <div className="types types--brands">
            {brands.map((b) => {
              const n = productsOfBrand(b.id).length;
              return (
                <Link key={b.id} to={`/shop?brand=${b.id}`} className="type-tile">
                  <div className="type-media">
                    <div className="pimg pimg--photo pimg--logo"><img src={b.logo} alt="" loading="lazy" /></div>
                  </div>
                  <div className="type-body">
                    <h3>{b.name}</h3>
                    <span>{n ? `${n} products` : "Coming soon"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="block">
        <div className="container">
          <SectionHead title="Featured Products" text="Professional favourites from the Diversey Crew, Sumabrite and Reva ranges." link="/shop" linkLabel="See more" />
          <div className="rail">
            {featured.map((p) => (
              <div className="rail-item" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="hn">
        <div className="container">
          <div className="hn-head">
            <div>
              <h2>Shop by Category</h2>
              <p>Find the right product for every surface and space.</p>
            </div>
            <Link to="/categories" className="hn-all">
              View all {categories.length} categories <Icon name="arrow" size={16} />
            </Link>
          </div>

          <div className="hn-grid">
            {FEATURED_CATS.map((id) => {
              const c = categories.find((x) => x.id === id);
              const cover = productById[CATEGORY_COVER[id]];
              return (
                <Link key={id} to={`/shop?cat=${id}`} className="hn-item">
                  <span className="hn-circle">
                    <span className="hn-ring" />
                    <span className="hn-photo hn-photo--product">
                      {cover && <img src={cover.image} alt="" loading="lazy" />}
                    </span>
                  </span>
                  <strong>{c.name}</strong>
                  <span className="hn-count">{productsOfCategory(id).length} products</span>
                </Link>
              );
            })}
          </div>

          <div className="hn-chips">
            {categories
              .filter((c) => !FEATURED_CATS.includes(c.id))
              .map((c) => (
                <Link key={c.id} to={`/shop?cat=${c.id}`} className="hn-chip">{c.name}</Link>
              ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CLEAN N CLEAR ================= */}
      <section className="whyx">
        <div className="container whyx-grid">
          <div className="whyx-photo">
            <img src="/img/why-crew.webp" alt="Diversey Crew bathroom cleaner and glass cleaner" loading="lazy" />
          </div>

          <div className="whyx-copy">
            <p className="whyx-kicker">Why choose us</p>
            <h2>Why buy from Clean N Clear</h2>
            <p className="whyx-lead">
              One store for professional cleaning chemicals, hygiene supplies and tools — with honest
              advice on what to use, where and how much.
            </p>

            <ul className="whyx-list">
              {[...WHY_LEFT, ...WHY_RIGHT].map((p) => (
                <li key={p.title}>
                  <span className="whyx-ico"><Icon name={p.icon} size={22} stroke={1.8} /></span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="whyx-ctas">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop now <Icon name="arrow" size={18} /></Link>
              <a className="btn btn-outline btn-lg" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> Talk to us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OUR PRODUCTS ================= */}
      <section className="block block--cream">
        <div className="container">
          <SectionHead title="Our Products" text="Browse a few of our ranges, or see the full list." link="/shop" linkLabel={`All ${products.length} products`} />
          <div className="tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={`tab ${tab === t ? "is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {categories.find((c) => c.id === t).name}
              </button>
            ))}
          </div>
          <div className="grid-products">
            {tabProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="center">
            <Link to={`/shop?cat=${tab}`} className="btn btn-outline btn-lg">
              View all {categories.find((c) => c.id === tab).name} <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= HOW TO ORDER ================= */}
      <section className="block">
        <div className="container">
          <SectionHead title="Ordering is simple" />
          <ol className="steps">
            <li><span>1</span><h3>Add to cart</h3><p>Pick the product, pack size and quantity you need.</p></li>
            <li><span>2</span><h3>Get your PDF quote</h3><p>Fill in your details at checkout — we create a PDF quotation instantly.</p></li>
            <li><span>3</span><h3>Send on WhatsApp</h3><p>Share the quote with Clean N Clear on WhatsApp and we confirm rates and delivery.</p></li>
          </ol>
        </div>
      </section>
    </>
  );
}
