import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Icon, { WhatsAppIcon } from "./components/Icons";
import Home from "./pages/Home";
import Shop, { BrandRedirect, CategoryRedirect } from "./pages/Shop";
import Categories from "./pages/Categories";
import ProductPage from "./pages/ProductPage";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import About from "./pages/About";
import { useCart } from "./context/CartContext";
import { SHOP } from "./config";

function Toast() {
  const { toast, setOpen } = useCart();
  return (
    <div className={`toast ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
      {toast && (
        <>
          <span className="toast-ico"><Icon name="check" size={16} stroke={2.6} /></span>
          <span className="toast-text">
            <strong>Added to cart</strong>
            <small>{toast.qty} × {toast.name} ({toast.size})</small>
          </span>
          <button type="button" onClick={() => setOpen(true)}>View cart</button>
        </>
      )}
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  // new page → start at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/brands" element={<Categories mode="brand" />} />
          <Route path="/brands/:id" element={<BrandRedirect />} />
          <Route path="/categories" element={<Categories mode="category" />} />
          <Route path="/category/:id" element={<CategoryRedirect />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <Toast />

      <a className="wa-float" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <WhatsAppIcon size={28} />
      </a>
    </>
  );
}
