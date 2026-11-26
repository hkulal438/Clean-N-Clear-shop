// Vercel serverless function: POST /api/quote  → { url } of the saved quotation PDF
import { handleStoreQuote } from "../server/quoteStore.js";

export default function handler(req, res) {
  return handleStoreQuote(req, res, process.env);
}
