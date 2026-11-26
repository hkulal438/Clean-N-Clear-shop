import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Icon, { WhatsAppIcon } from "./Icons";
import { SHOP } from "../config";

const DURATION = 6500; // ms each slide stays

// Title words rise out of a mask one after another
const Words = ({ text, accent }) => {
  const words = text.split(" ");
  const accentWords = accent ? accent.split(" ") : [];
  const all = [...words.map((w) => [w, false]), ...accentWords.map((w) => [w, true])];
  return all.map(([w, isAccent], i) => (
    <React.Fragment key={i}>
      <span className="hs-word">
        <span className={isAccent ? "hs-accent" : ""} style={{ "--i": i }}>{w}</span>
      </span>
      {i === words.length - 1 && accentWords.length ? <br /> : " "}
    </React.Fragment>
  ));
};

const SLIDES = [
  {
    id: "diversey",
    photo: "/img/hero/slide-diversey.webp",
    title: "Professional Housekeeping,",
    accent: "Delivered",
    text: "Genuine Diversey-Taski R-series concentrates, Crew housekeeping and Sumabrite kitchen care — the same products top hotels and hospitals trust.",
    primary: { to: "/brands/diversey-taski", label: "Shop Diversey-Taski" },
    secondary: { to: "/shop", label: "All Products" },
  },
  {
    id: "range",
    photo: "/img/hero/slide-range.webp",
    title: "Everything to Keep",
    accent: "Spaces Sparkling",
    text: "Floor care, washroom care, kitchen & dishwash, hand hygiene and fresheners from Diversey, Reva and Miraclean — all in one shop.",
    primary: { to: "/categories", label: "Shop by Category" },
    secondary: { href: `https://wa.me/${SHOP.whatsapp}`, label: "Ask on WhatsApp", wa: true },
  },
  {
    id: "quote",
    photo: "/img/hero/slide-equipment.webp",
    title: "Add to Cart, Get a",
    accent: "PDF Quote Instantly",
    text: "Pick products and quantities, check out, and your quotation is created as a PDF and sent to our team on WhatsApp. We confirm rates and delivery fast.",
    primary: { to: "/shop", label: "Start Your Quote" },
    secondary: { to: "/track-order", label: "Track an Order" },
  },
];

function Cta({ c, primary }) {
  const cls = primary ? "hs-btn hs-btn--primary" : "hs-btn hs-btn--ghost";
  const inner = (
    <>
      {c.wa && <WhatsAppIcon size={18} />}
      {c.label}
      {primary && <span className="hs-btn-icon"><Icon name="arrow" size={15} stroke={2.2} /></span>}
    </>
  );
  return c.href ? (
    <a className={cls} href={c.href} target="_blank" rel="noreferrer">{inner}</a>
  ) : (
    <Link className={cls} to={c.to}>{inner}</Link>
  );
}

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = SLIDES.length;

  const go = useCallback((i) => setIndex((i + count) % count), [count]);

  // autoplay; restarts whenever the slide changes
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, go]);

  return (
    <section
      className={`hs ${paused ? "is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`hs-slide hs-slide--photo ${i === index ? "is-active" : ""}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i !== index}
        >
          <img className="hs-photo" src={s.photo} alt="" loading={i === 0 ? "eager" : "lazy"} />
          <span className="hs-shade" />

          <div className="container hs-inner">
            <div className="hs-copy">
              {i === 0 ? (
                <h1 className="hs-title"><Words text={s.title} accent={s.accent} /></h1>
              ) : (
                <h2 className="hs-title"><Words text={s.title} accent={s.accent} /></h2>
              )}
              <p className="hs-text hs-rise" style={{ "--d": "0.75s" }}>{s.text}</p>
              <div className="hs-ctas hs-rise" style={{ "--d": "0.95s" }}>
                <Cta c={s.primary} primary />
                <Cta c={s.secondary} />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="hs-arrow hs-arrow--prev" onClick={() => go(index - 1)} aria-label="Previous slide">
        <Icon name="chevron" size={22} stroke={2} />
      </button>
      <button type="button" className="hs-arrow hs-arrow--next" onClick={() => go(index + 1)} aria-label="Next slide">
        <Icon name="chevron" size={22} stroke={2} />
      </button>

      <div className="hs-dots" role="tablist" aria-label="Choose slide">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}`}
            className={`hs-dot ${i === index ? "is-active" : ""}`}
            onClick={() => go(i)}
          >
            <span style={{ animationDuration: `${DURATION}ms` }} />
          </button>
        ))}
      </div>
    </section>
  );
}
