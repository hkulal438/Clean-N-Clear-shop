import React from "react";
import { Link } from "react-router-dom";

import Icon, { WhatsAppIcon } from "../components/Icons";
import { Crumbs } from "./Shop";
import { brands, productsOfBrand } from "../data/catalog";
import { SHOP } from "../config";

const SERVE = [
  { icon: "building", title: "Commercial", text: "Offices, malls, showrooms and IT parks." },
  { icon: "sparkle", title: "Hospitality", text: "Hotels, restaurants, resorts and caterers." },
  { icon: "shield", title: "Healthcare", text: "Hospitals, clinics and laboratories." },
  { icon: "box", title: "Institutions", text: "Schools, colleges, hostels and factories." },
];

export default function About() {
  return (
    <div className="about">
      <section className="cats-band">
        <div className="container">
          <Crumbs items={[["About Us", null]]} center />
          <h1>About Clean N Clear</h1>
          <p>Complete cleaning and hygiene solutions for commercial, household and institutional needs.</p>
        </div>
      </section>

      <section className="block">
        <div className="container about-split">
          <div className="about-photo">
            <img src="/img/about.webp" alt="The Clean N Clear team in our store" loading="lazy" />
          </div>
          <div className="about-copy">
            <p className="about-kicker">Who we are</p>
            <h2>Cleaning made simple, from one trusted store</h2>
            <p>
              Clean N Clear is a cleaning products and solutions provider based in Mangaluru, delivering everywhere and serving
              commercial, household and institutional customers. We supply cleaning chemicals, cleaning
              tools, hygiene supplies and professional equipment.
            </p>
            <p>
              We work with leading brands such as <strong>Diversey-Taski</strong>, <strong>Reva</strong> and{" "}
              <strong>Miraclean</strong>, so every customer gets the right product for their surfaces, budget
              and cleaning routine.
            </p>
            <div className="center center--left">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop now <Icon name="arrow" size={18} /></Link>
              <a className="btn btn-wa btn-lg" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> Talk to us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="block block--cream">
        <div className="container">
          <div className="shead"><div><h2>Who we serve</h2><p>Solutions for every space.</p></div></div>
          <div className="trust-grid about-serve">
            {SERVE.map((s) => (
              <div key={s.title}>
                <Icon name={s.icon} size={26} />
                <p><strong>{s.title}</strong><span>{s.text}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="shead"><div><h2>Brands we supply</h2><p>Genuine products from trusted names.</p></div></div>
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

      <section className="block block--cream" id="how-to-order">
        <div className="container">
          <div className="shead"><div><h2>How ordering works</h2><p>No account or online payment needed.</p></div></div>
          <ol className="steps">
            <li><span>1</span><h3>Choose your products</h3><p>Pick the pack size and quantity, then add to cart.</p></li>
            <li><span>2</span><h3>Enter your details</h3><p>At checkout, add your name, mobile number and delivery address — we create a PDF quotation.</p></li>
            <li><span>3</span><h3>Send on WhatsApp</h3><p>Share the PDF with Clean N Clear on {SHOP.phoneDisplay}. We confirm rates, payment and delivery.</p></li>
          </ol>
          <div className="center">
            <Link to="/shop" className="btn btn-primary btn-lg">Start shopping <Icon name="arrow" size={18} /></Link>
            <a className="btn btn-wa btn-lg" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} /> Chat with us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
