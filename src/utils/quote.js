
import { SHOP } from "../config";
import { brandById } from "../data/catalog";

// ---------------------------------------------------------
// WhatsApp helpers
// ---------------------------------------------------------
export const waLink = (text, number = SHOP.whatsapp) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

// Short quote reference, e.g. CNC-251125-4821
export function newQuoteRef() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${SHOP.refPrefix}-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Orders placed from this browser, so Track Order can offer them
const ORDERS_KEY = "cnc-shop-orders";

export function saveOrder(order) {
  try {
    const list = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...list].slice(0, 10)));
  } catch {
    /* storage unavailable */
  }
}

export function savedOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

// chat with the office number that receives quotations
export const quoteLink = (text) => waLink(text, SHOP.quoteWhatsapp);

export function trackLink({ ref, phone, name }) {
  return quoteLink(
    [
      `Hello ${SHOP.name}, please share the status of my order.`,
      "",
      ref ? `Quote / Order ref: ${ref}` : null,
      `Mobile used for the order: ${phone}`,
      name ? `Name: ${name}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n")
  );
}

export const askLink = (productName) => waLink(`Hello ${SHOP.name}, I have a question about ${productName}.`);

const money = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function quoteDate(d = new Date()) {
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

// Text that goes with the PDF in WhatsApp
export function quoteMessage({ items, subtotal, allPriced, customer, ref, pdfUrl }) {
  const lines = items.map((l, i) => `${i + 1}. ${l.product.name} (${l.size}) × ${l.qty}`);
  return [
    `*QUOTATION REQUEST – ${ref}*`,
    `*${SHOP.name}*`,
    "",
    `*Name:* ${customer.name}${customer.company ? ` (${customer.company})` : ""}`,
    `*Mobile:* ${customer.phone}`,
    customer.fulfil === "pickup"
      ? `*Order type:* 🏬 STORE PICKUP — I will collect from your office`
      : `*Order type:* 🚚 DELIVERY`,
    customer.fulfil === "pickup" ? null : `*Deliver to:* ${customer.address}, ${customer.city} – ${customer.pincode}`,
    customer.gst ? `*GSTIN:* ${customer.gst}` : null,
    customer.note ? `*Note:* ${customer.note}` : null,
    "",
    "*Items*",
    ...lines,
    "",
    allPriced ? `*Total:* ₹${money(subtotal)} (+ GST${customer.fulfil === "pickup" ? "" : " & delivery"} as applicable)` : "_Please share the best rates for the above._",
    "",
    pdfUrl ? `📄 *Quotation PDF:* ${pdfUrl}` : "📄 PDF quotation attached.",
    "",
    "Please confirm my order. Thank you!",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// ---------------------------------------------------------
// PDF quotation
// ---------------------------------------------------------

// Load any image the browser can show (webp, avif, png) and turn it into a JPEG/PNG data URL for jsPDF
function loadImage(src, { type = "image/jpeg", max = 300, bg = "#ffffff" } = {}) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      const scale = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
      const w = Math.round(im.naturalWidth * scale);
      const h = Math.round(im.naturalHeight * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (type === "image/jpeg") {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(im, 0, 0, w, h);
      resolve({ data: c.toDataURL(type, 0.85), w, h });
    };
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

const BLUE = [8, 31, 239];
const NAVY = [7, 22, 66];
const GREEN = [145, 220, 0];
const GREY = [102, 102, 102];
const LINE = [226, 230, 240];

export async function buildQuotePdf({ items, subtotal, allPriced, customer, ref }) {
  const { jsPDF } = await import("jspdf"); // loaded only when a quote is made
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 14; // margin
  let y = 14;

  const [logo, ...thumbs] = await Promise.all([
    loadImage("/img/logo.png", { type: "image/png", max: 600 }),
    ...items.map((l) => loadImage(l.product.image, { max: 160 })),
  ]);

  // ---- header band ----
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 4, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 4, W, 1.2, "F");

  if (logo) {
    const lh = 16;
    doc.addImage(logo.data, "PNG", M, y, (logo.w / logo.h) * lh, lh);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text("QUOTATION", W - M, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Quote No: ${ref}`, W - M, y + 12, { align: "right" });
  doc.text(`Date: ${quoteDate()}`, W - M, y + 16.5, { align: "right" });
  y += 24;

  // ---- from / to ----
  doc.setDrawColor(...LINE);
  doc.line(M, y, W - M, y);
  y += 6;
  const colW = (W - 2 * M) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text("FROM", M, y);
  doc.text("QUOTATION FOR", M + colW + 4, y);

  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text(SHOP.name, M, y + 5.5);
  doc.text(customer.name + (customer.company ? ` – ${customer.company}` : ""), M + colW + 4, y + 5.5, { maxWidth: colW - 4 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  const fromLines = [...SHOP.addressLines, `Ph: ${SHOP.phoneDisplay} / ${SHOP.phone2Display}`, SHOP.email];
  doc.text(fromLines, M, y + 10.5);
  const pickup = customer.fulfil === "pickup";
  const toLines = [
    pickup
      ? "Order type: STORE PICKUP (customer will collect)"
      : "Order type: DELIVERY",
    ...(pickup ? [] : doc.splitTextToSize(`Deliver to: ${customer.address}, ${customer.city} – ${customer.pincode}`, colW - 4)),
    `Mobile: ${customer.phone}`,
    customer.email ? `Email: ${customer.email}` : null,
    customer.gst ? `GSTIN: ${customer.gst}` : null,
  ].filter(Boolean);
  doc.text(toLines, M + colW + 4, y + 10.5);
  y += 10.5 + Math.max(fromLines.length, toLines.length) * 3.8 + 5;

  // ---- items table ----
  const cols = [
    { k: "#", w: 8, a: "left" },
    { k: "", w: 14, a: "left" }, // image
    { k: "Product", w: 78, a: "left" },
    { k: "Pack", w: 26, a: "left" },
    { k: "Qty", w: 12, a: "right" },
    { k: "Rate (₹)", w: 22, a: "right" },
    { k: "Amount (₹)", w: 22, a: "right" },
  ];
  const xs = [];
  cols.reduce((x, c) => (xs.push(x), x + c.w), M);

  const head = () => {
    doc.setFillColor(...NAVY);
    doc.rect(M, y, W - 2 * M, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    cols.forEach((c, i) => {
      // jsPDF core fonts lack the ₹ glyph, so headers use "Rs."
      const label = c.k.replace("₹", "Rs.");
      doc.text(label, c.a === "right" ? xs[i] + c.w - 2 : xs[i] + 2, y + 5.4, { align: c.a });
    });
    y += 8;
  };
  head();

  doc.setFont("helvetica", "normal");
  items.forEach((l, idx) => {
    const brand = brandById[l.product.brand]?.name || "";
    const nameLines = doc.splitTextToSize(l.product.name, cols[2].w - 4);
    const rowH = Math.max(14, nameLines.length * 4 + 8);
    if (y + rowH > 262) {
      doc.addPage();
      y = 16;
      head();
      doc.setFont("helvetica", "normal");
    }
    if (idx % 2 === 1) {
      doc.setFillColor(246, 248, 255);
      doc.rect(M, y, W - 2 * M, rowH, "F");
    }
    const mid = y + rowH / 2;
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(String(idx + 1), xs[0] + 2, mid + 1);

    const t = thumbs[idx];
    if (t) {
      const s = 11;
      const r = t.w / t.h;
      const tw = r >= 1 ? s : s * r;
      const th = r >= 1 ? s / r : s;
      doc.addImage(t.data, "JPEG", xs[1] + 1 + (s - tw) / 2, mid - th / 2, tw, th);
    }

    doc.setFont("helvetica", "bold");
    doc.text(nameLines, xs[2] + 2, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text(brand, xs[2] + 2, y + 5.5 + nameLines.length * 4);

    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(doc.splitTextToSize(l.size, cols[3].w - 3), xs[3] + 2, mid + 1);
    doc.text(String(l.qty), xs[4] + cols[4].w - 2, mid + 1, { align: "right" });
    doc.text(l.price == null ? "On request" : money(l.price), xs[5] + cols[5].w - 2, mid + 1, { align: "right" });
    doc.text(l.total == null ? "—" : money(l.total), xs[6] + cols[6].w - 2, mid + 1, { align: "right" });

    y += rowH;
    doc.setDrawColor(...LINE);
    doc.line(M, y, W - M, y);
  });

  // ---- totals ----
  y += 6;
  const tx = W - M - 70;
  const row = (label, value, bold) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10.5 : 9);
    doc.setTextColor(...NAVY);
    doc.text(label, tx, y);
    doc.text(value, W - M - 2, y, { align: "right" });
    y += bold ? 7 : 5.5;
  };
  const qty = items.reduce((n, l) => n + l.qty, 0);
  row("Total items / qty", `${items.length} / ${qty}`);
  if (allPriced) {
    row("Subtotal", `Rs. ${money(subtotal)}`);
    row(pickup ? "GST" : "GST & delivery", "As applicable");
    doc.setFillColor(...BLUE);
    doc.rect(tx - 3, y - 4.5, W - M - tx + 3, 8.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Estimated Total", tx, y + 1);
    doc.text(`Rs. ${money(subtotal)}`, W - M - 2, y + 1, { align: "right" });
    y += 10;
  } else {
    doc.setFillColor(...BLUE);
    doc.rect(tx - 3, y - 4.5, W - M - tx + 3, 8.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Rates will be confirmed on WhatsApp", tx, y + 1);
    y += 10;
  }

  if (customer.note) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLUE);
    doc.text("CUSTOMER NOTE", M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    const n = doc.splitTextToSize(customer.note, W - 2 * M);
    doc.text(n, M, y + 4.5);
    y += 6 + n.length * 4;
  }

  // ---- terms ----
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y = Math.max(y + 4, 240);
  doc.setDrawColor(...LINE);
  doc.line(M, y, W - M, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text("Terms", M, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(
    [
      "1. This is a quotation request generated from the Clean N Clear online shop. Final rates, GST and delivery charges are confirmed by our team.",
      "2. Prices and availability are subject to change. Order is confirmed only after our confirmation on WhatsApp / phone.",
      "3. Delivery available everywhere (charges confirmed by our team), or pick up from our store.",
    ],
    M,
    y + 9.5,
    { maxWidth: W - 2 * M }
  );

  // footer
  doc.setFillColor(...NAVY);
  doc.rect(0, 287, W, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`${SHOP.name}  •  ${SHOP.phoneDisplay}  •  ${SHOP.email}`, W / 2, 293, { align: "center" });

  return doc.output("blob");
}

export const quoteFileName = (ref) => `Clean-N-Clear-Quotation-${ref}.pdf`;

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Can this device share a PDF straight into WhatsApp (phones/tablets)?
export function canSharePdf(file) {
  try {
    return !!(navigator.canShare && navigator.canShare({ files: [file] }));
  } catch {
    return false;
  }
}


// ---------------------------------------------------------
// Save the PDF online (server: /api/quote) so the WhatsApp message can carry a link to it.
// Returns the link, or null if saving is not possible (the page then falls back to sharing the file).
// ---------------------------------------------------------
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function uploadQuote(blob, ref) {
  try {
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, pdfBase64: await blobToBase64(blob) }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && data.url ? data.url : null;
  } catch {
    return null;
  }
}
