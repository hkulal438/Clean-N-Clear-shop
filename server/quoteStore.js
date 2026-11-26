// =========================================================
// Saves a quotation PDF online and returns a link to it, so the
// WhatsApp message to the Clean N Clear office can carry the PDF.
//
// Production (Vercel): stored in Vercel Blob. Needs the env var
//   BLOB_READ_WRITE_TOKEN  (added automatically when a Blob store
//   is connected to the project in the Vercel dashboard).
// Local dev without a token: saved to ./.quotes and served by Vite.
// =========================================================
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_PDF_BYTES = 3 * 1024 * 1024; // 3 MB

export class StoreError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// small per-instance limit so the endpoint can't be used as free file hosting
const hits = new Map();
function limited(key, max = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) return true;
  list.push(now);
  hits.set(key, list);
  return false;
}

export async function storeQuote({ ref, pdfBase64 }, { env, origin, ip }) {
  if (!/^[A-Z]{2,5}-\d{6}-\d{4}$/.test(String(ref || ""))) throw new StoreError(400, "Invalid quote reference");
  if (limited(ip || "anon")) throw new StoreError(429, "Too many quotations. Please try again in a few minutes.");

  const pdf = Buffer.from(String(pdfBase64 || ""), "base64");
  if (pdf.length === 0 || pdf.length > MAX_PDF_BYTES) throw new StoreError(413, "Quotation PDF is too large");
  if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new StoreError(400, "Not a PDF file");

  // hard-to-guess file name: the PDF holds the customer's contact details
  const name = `Clean-N-Clear-Quotation-${ref}-${randomBytes(6).toString("hex")}.pdf`;

  if (env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`quotes/${name}`, pdf, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url };
  }

  if (env.VERCEL) throw new StoreError(503, "Quote storage is not connected yet");

  // local development fallback
  const dir = env.QUOTES_DIR || path.resolve(process.cwd(), ".quotes");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), pdf);
  return { url: `${origin}/quotes/${name}` };
}

// Shared request handler (Vercel function + Vite dev server)
export async function handleStoreQuote(req, res, env) {
  const reply = (status, data) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });

  try {
    let payload = req.body;
    if (!payload || typeof payload !== "object") {
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > 5 * 1024 * 1024) return reply(413, { error: "Request too large" });
        chunks.push(c);
      }
      payload = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    }
    const proto = req.headers["x-forwarded-proto"] || "http";
    const origin = `${proto}://${req.headers.host}`;
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
    return reply(200, await storeQuote(payload, { env, origin, ip }));
  } catch (e) {
    if (e instanceof StoreError) return reply(e.status, { error: e.message });
    console.error("storeQuote failed", e);
    return reply(500, { error: "Could not save the quotation" });
  }
}
