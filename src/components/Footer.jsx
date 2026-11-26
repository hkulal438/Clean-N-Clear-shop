import React from "react";
import { Link } from "react-router-dom";

import Icon, { WhatsAppIcon } from "./Icons";
import { brands } from "../data/catalog";
import { SHOP } from "../config";

const QUICK = [
  { to: "/categories", label: "Shop By Category" },
  { to: "/brands", label: "Brands" },
  { to: "/shop", label: "All Products" },
  { to: "/track-order", label: "Track Order" },
  { to: "/about", label: "About Us" },
];

const POPULAR = [
  { to: "/product/taski-r7", label: "TASKI R7 Floor Cleaner" },
  { to: "/product/taski-r1-super", label: "TASKI R1 Super" },
  { to: "/product/reva-maklin", label: "Reva Maklin" },
  { to: "/product/reva-bio-clean", label: "Reva Bio Clean" },
  { to: "/product/miraclean-multipurpose-floor-cleaner", label: "Miraclean Floor Cleaner" },
  { to: "/product/taski-mop-wringer-trolley", label: "TASKI Mop Wringer Trolley" },
];

// soft sparkle/bubble ornament (the Anchan footer uses a leafy branch here)
const Bubbles = ({ className }) => (
  <svg className={className} viewBox="0 0 400 260" fill="none" aria-hidden="true">
    {[[40, 220, 26], [110, 170, 14], [160, 210, 9], [210, 120, 34], [290, 80, 16], [340, 150, 22], [370, 40, 10], [80, 90, 12]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} stroke="currentColor" strokeWidth="1.4" />
    ))}
    <path d="M250 200l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="ft" id="contact">
      {/* ================= HELP BAND ================= */}
      <div className="container">
        <div className="ft-cta">
          <div className="ft-cta-copy">
            <h2>Not sure which product is right for you?</h2>
            <p>Tell us the surface or space you clean — our team will suggest the right product and quantity.</p>
          </div>
          <div className="ft-cta-actions">
            <Link to="/shop" className="btn btn-light btn-lg">
              Browse Products <Icon name="arrow" size={18} />
            </Link>
            <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-wa btn-lg">
              <WhatsAppIcon size={18} /> WhatsApp us
            </a>
          </div>
        </div>
      </div>

      <Bubbles className="ft-branch ft-branch--r" />
      <Bubbles className="ft-branch ft-branch--l" />

      {/* ================= MAIN COLUMNS ================= */}
      <div className="container ft-main">
        <div className="ft-brand">
          <Link to="/" className="ft-logo" aria-label="Clean N Clear Shop — home">
            <span className="ft-logo-badge ft-logo-badge--wide">
              <img src="/img/logo.png" alt="Clean N Clear logo" />
            </span>
          </Link>
          <p>
            Clean N Clear supplies cleaning chemicals, hygiene products and professional tools from
            Diversey-Taski, Reva, Miraclean and more — for homes, offices, hotels, hospitals and institutions.
            We deliver everywhere, or you can pick up from our store.
          </p>
          <Link to="/about" className="ft-more">
            Read more <Icon name="arrow" size={16} />
          </Link>
          <div className="ft-social">
            <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon size={18} />
            </a>
            <a href={`tel:+${SHOP.whatsapp}`} aria-label="Call us">
              <Icon name="phone" size={17} />
            </a>
            <a href={`mailto:${SHOP.email}`} aria-label="Email us">
              <Icon name="mail" size={17} />
            </a>
            {SHOP.instagram && (
              <a href={SHOP.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Icon name="instagram" size={17} />
              </a>
            )}
          </div>
        </div>

        <nav className="ft-col" aria-label="Quick links">
          <h3>Quick Links</h3>
          <ul>
            {QUICK.map((l) => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav className="ft-col" aria-label="Popular products">
          <h3>Popular Products</h3>
          <ul>
            {POPULAR.map((l) => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="ft-col">
          <h3>For Product Enquiries</h3>
          <p className="ft-enq">
            Questions about a product, dilution or bulk supply? Message us and our team will get back to you.
          </p>
          <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer" className="ft-wa">
            <span className="ft-wa-icon"><WhatsAppIcon size={20} /></span>
            <span>
              <small>Chat on WhatsApp</small>
              <strong>{SHOP.phoneDisplay}</strong>
            </span>
            <Icon name="arrow" size={18} className="ft-wa-arrow" />
          </a>
        </div>
      </div>

      {/* ================= CONTACT + BRANDS ================= */}
      <div className="container">
        <div className="ft-lower">
          <div>
            <h3>Contact Information</h3>
            <ul className="ft-contact">
              <li>
                <Icon name="pin" size={19} />
                <a href={SHOP.mapUrl} target="_blank" rel="noreferrer">
                  {SHOP.addressLines.map((l) => <span key={l}>{l}</span>)}
                </a>
              </li>
              <li>
                <Icon name="phone" size={19} />
                <span>
                  <a href={`tel:+${SHOP.whatsapp}`}>{SHOP.phoneDisplay}</a>
                  <a href={`tel:+${SHOP.phone2}`}>{SHOP.phone2Display}</a>
                </span>
              </li>
              <li>
                <Icon name="mail" size={19} />
                <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3>Our Brands</h3>
            <div className="ft-badges">
              {brands.slice(0, 3).map((b) => (
                <Link key={b.id} to={`/shop?brand=${b.id}`} className="ft-seal ft-seal--brand" aria-label={b.name}>
                  <img src={b.logo} alt={b.name} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="ft-bottom">
        <div className="container ft-bottom-inner">
          <p>© {new Date().getFullYear()} {SHOP.name}. All rights reserved.</p>
          {SHOP.website && (
            <a href={SHOP.website} target="_blank" rel="noreferrer">Visit our main website <Icon name="arrow" size={14} /></a>
          )}
        </div>
      </div>
    </footer>
  );
}
