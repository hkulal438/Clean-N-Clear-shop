import React from "react";
import { Link } from "react-router-dom";

import Icon from "../components/Icons";
import { Crumbs } from "./Shop";
import { brands, categories, productById, productsOfBrand, productsOfCategory, CATEGORY_COVER } from "../data/catalog";

const MODES = {
  category: {
    title: "Shop By Category",
    text: "Choose what you need to clean — floors, washrooms, kitchens, glass and more.",
    items: [...categories].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({
      id: c.id,
      name: c.name,
      count: productsOfCategory(c.id).length,
      img: productById[CATEGORY_COVER[c.id]]?.image,
      icon: c.icon,
      to: `/shop?cat=${c.id}`,
    })),
    switchTo: { to: "/brands", label: "Browse by brand instead" },
  },
  brand: {
    title: "Our Brands",
    text: "Genuine products from trusted cleaning and hygiene brands.",
    items: brands.map((b) => ({
      id: b.id,
      name: b.name,
      count: productsOfBrand(b.id).length,
      img: b.logo,
      logo: true,
      to: `/shop?brand=${b.id}`,
    })),
    switchTo: { to: "/categories", label: "Browse by category instead" },
  },
};

export default function Categories({ mode = "category" }) {
  const m = MODES[mode];

  return (
    <div className="cats">
      <section className="cats-band">
        <div className="container">
          <Crumbs items={[[m.title, null]]} center />
          <h1>{m.title}</h1>
          <p>{m.text}</p>
        </div>
      </section>

      <section className="container cats-grid">
        {m.items.map((it) => (
          <Link key={it.id} to={it.to} className="cat">
            <span className="cat-ring">
              <span className={`cat-circle ${it.logo ? "cat-circle--logo" : "cat-circle--product"}`}>
                {it.img ? (
                  <img src={it.img} alt="" loading="lazy" />
                ) : (
                  <span className="cat-art"><Icon name={it.icon || "box"} size={64} stroke={1.3} /></span>
                )}
              </span>
            </span>
            <h2>{it.name}</h2>
            <span className="cat-count">
              {it.count ? `${it.count} products` : "Coming soon"} <Icon name="arrow" size={14} />
            </span>
          </Link>
        ))}
      </section>

      <section className="cats-switch">
        <div className="container">
          <Link to={m.switchTo.to} className="btn btn-outline btn-lg">
            {m.switchTo.label} <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
