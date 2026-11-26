// =========================================================
// SHOP SETTINGS — change these in one place
// =========================================================

export const SHOP = {
  name: "Clean N Clear",
  legalName: "Clean N Clear",
  tagline: "Cleaning & Hygiene Solutions",

  // WhatsApp number that receives orders (country code + number, no "+" or spaces)
  whatsapp: "919901384734",
  phoneDisplay: "+91 99013 84734",
  phone2Display: "+91 81473 04734",
  phone2: "918147304734",

  // Office WhatsApp that receives every PDF quotation / order
  quoteWhatsapp: "918147304734",
  quoteDisplay: "+91 81473 04734",
  email: "cleannclear.ind@gmail.com",
  addressLines: [
    "Shop No. 1 & 2, Lower Ground, KRR Road,",
    "Opp. Symphony Mahendra Arcade,",
    "Near Radha Medical, PVS,",
    "Mangaluru, Karnataka – 575003",
  ],
  address: "Shop No. 1 & 2, Lower Ground, KRR Road, Opp. Symphony Mahendra Arcade, Near Radha Medical, PVS, Mangaluru, Karnataka – 575003",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Clean+N+Clear+KRR+Road+PVS+Mangaluru",

  // Main website (the "About" and "Home" links can point here)
  website: "",
  instagram: "https://www.instagram.com/clean_n_clear_official",

  // Quote prefix, e.g. CNC-251125-4821
  refPrefix: "CNC",
};

// Prices: products have `price: null` until you add them in src/data/catalog.js.
// Anything without a price is quoted as "On request" and the team confirms it on WhatsApp.
export const formatPrice = (n) => (n == null ? "Price on request" : "₹" + Number(n).toLocaleString("en-IN"));
