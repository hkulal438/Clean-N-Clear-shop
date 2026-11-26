import React from "react";

// Same frame as the Anchan shop (.pimg). All Clean N Clear products have real photos.
export default function ProductImage({ product, className = "", eager = false }) {
  return (
    <div className={`pimg pimg--photo ${className}`}>
      <img src={product.image} alt={product.name} loading={eager ? "eager" : "lazy"} />
    </div>
  );
}
