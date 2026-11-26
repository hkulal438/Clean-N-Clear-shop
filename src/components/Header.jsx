import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

import Icon, { WhatsAppIcon } from "./Icons";
import { useCart } from "../context/CartContext";
import { brands, categories, productsOfBrand } from "../data/catalog";
import { SHOP } from "../config";

const catsAZ = [...categories].sort((a, b) => a.name.localeCompare(b.name));

const MENUS = {
  category: {
    label: "Shop By Category",
    page: "/categories",
    all: "View all categories",
    title: "Shop by category",
    text: "Floor care, washroom, kitchen, hygiene, tools and more.",
    img: "/img/cats/chemicals.webp",
  },
  brand: {
    label: "Brands",
    page: "/brands",
    all: "View all brands",
    title: "Shop by brand",
    text: "Diversey-Taski, Reva, Miraclean and more.",
    img: "/img/brands/diversey.webp",
  },
};

function MegaPanel({ id, onPick }) {
  const m = MENUS[id];
  return (
    <div className={`mega mega--${id}`} role="menu" aria-label={m.label}>
      {id === "category" ? (
        <ul className="mega-list mega-list--long">
          <li className="mega-all">
            <Link role="menuitem" to={m.page} onClick={onPick}>
              {m.all} <Icon name="arrow" size={14} />
            </Link>
          </li>
          {catsAZ.map((c) => (
            <li key={c.id}>
              <Link role="menuitem" to={`/shop?cat=${c.id}`} onClick={onPick}>{c.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mega-brands">
          <li className="mega-all">
            <Link role="menuitem" to={m.page} onClick={onPick}>
              {m.all} <Icon name="arrow" size={14} />
            </Link>
          </li>
          {brands.map((b) => {
            const n = productsOfBrand(b.id).length;
            return (
              <li key={b.id}>
                <Link role="menuitem" to={`/shop?brand=${b.id}`} onClick={onPick} className="mega-brand">
                  <span className="mega-brand-img"><img src={b.logo} alt="" loading="lazy" /></span>
                  <strong>{b.name}</strong>
                  <small>{n ? `${n} products` : "Coming soon"}</small>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mega-aside">
        <img src={m.img} alt="" />
        <p className="mega-aside-title">{m.title}</p>
        <p className="mega-aside-text">{m.text}</p>
        <Link to={m.page} className="mega-aside-link" onClick={onPick}>
          {m.all} <Icon name="arrow" size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function Header() {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false); // mobile menu
  const [mega, setMega] = useState(null); // "category" | "brand" | null
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInput = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    setMenu(false);
    setMega(null);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMega(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  // desktop: open on hover with a short grace period so the pointer can reach the panel
  const hoverOpen = (id) => {
    if (window.matchMedia("(max-width: 1279px)").matches) return;
    clearTimeout(closeTimer.current);
    setMega(id);
  };
  const hoverClose = () => {
    if (window.matchMedia("(max-width: 1279px)").matches) return;
    closeTimer.current = setTimeout(() => setMega(null), 160);
  };

  const params = new URLSearchParams(location.search);
  const onShop = location.pathname === "/shop";
  const activeMenu =
    location.pathname === "/categories" || (onShop && params.get("cat"))
      ? "category"
      : location.pathname === "/brands" || (onShop && params.get("brand"))
        ? "brand"
        : null;
  const allActive = onShop && !params.get("cat") && !params.get("brand");

  const toContact = (e) => {
    e.preventDefault();
    setMenu(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const link = ({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`;

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <p className="topbar-offer">
            <Icon name="file" size={16} />
            Add to cart &amp; get a PDF quotation on WhatsApp
          </p>
          <a className="topbar-wa" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={15} /> Order on WhatsApp: {SHOP.phoneDisplay}
          </a>
        </div>
      </div>

      <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-main">
          <button
            type="button"
            className="icon-btn header-burger"
            aria-label="Open menu"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <Icon name={menu ? "close" : "menu"} size={24} />
          </button>

          <Link to="/" className="logo" aria-label="Clean N Clear Shop — home">
            <img src="/img/logo.png" alt="Clean N Clear" />
          </Link>

          <nav className={`nav ${menu ? "is-open" : ""}`} aria-label="Main">
            <ul className="nav-list">
              <li className="nav-home nav-home--show">
                <NavLink to="/" end className={link}>Home</NavLink>
              </li>

              {Object.entries(MENUS).map(([id, m]) => (
                <li
                  key={id}
                  className={`has-mega ${mega === id ? "is-open" : ""}`}
                  onMouseEnter={() => hoverOpen(id)}
                  onMouseLeave={hoverClose}
                >
                  <button
                    type="button"
                    className={`nav-link nav-drop ${activeMenu === id || mega === id ? "is-active" : ""}`}
                    aria-expanded={mega === id}
                    aria-haspopup="true"
                    onClick={() => {
                      // desktop: the label opens the full page; mobile: it expands the list
                      if (window.matchMedia("(max-width: 1279px)").matches) setMega((cur) => (cur === id ? null : id));
                      else navigate(m.page);
                    }}
                  >
                    {m.label}
                    <Icon name="chevron" size={15} stroke={2} className="nav-caret" />
                  </button>
                  {mega === id && <MegaPanel id={id} onPick={() => setMega(null)} />}
                </li>
              ))}

              <li><NavLink to="/shop" className={`nav-link ${allActive ? "is-active" : ""}`}>All Products</NavLink></li>
              <li><NavLink to="/track-order" className={link}>Track Order</NavLink></li>
              <li><NavLink to="/about" className={link}>About Us</NavLink></li>
              <li><a href="#contact" className="nav-link" onClick={toContact}>Contact</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className={`search-toggle ${searchOpen ? "is-open" : ""}`}
              aria-label={searchOpen ? "Close search" : "Search products"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((s) => !s)}
            >
              <Icon name={searchOpen ? "close" : "search"} size={20} />
            </button>

            <button type="button" className="pill-btn" onClick={() => setOpen(true)} aria-label={`Cart, ${count} items`}>
              <span className="pill-label">Cart</span>
              <span className="pill-circle">
                {count > 0 ? (count > 99 ? "99+" : count) : <Icon name="cart" size={15} stroke={2.2} />}
              </span>
            </button>
          </div>
        </div>

        <div className={`search-panel ${searchOpen ? "is-open" : ""}`}>
          <form className="search" role="search" onSubmit={submit}>
            <Icon name="search" size={18} className="search-icon" />
            <input
              ref={searchInput}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, e.g. Taski R7, floor cleaner, hand wash"
              aria-label="Search products"
              tabIndex={searchOpen ? 0 : -1}
            />
            <button type="submit" className="search-btn" tabIndex={searchOpen ? 0 : -1}>Search</button>
          </form>
        </div>
      </header>
    </>
  );
}
