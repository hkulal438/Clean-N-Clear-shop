import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { handleStoreQuote } from "./server/quoteStore.js";

// Runs /api/quote inside `npm run dev` the same way Vercel runs it,
// and serves locally saved quotation PDFs from ./.quotes
function apiInDev() {
  return {
    name: "cnc-api-dev",
    configureServer(server) {
      const root = path.dirname(fileURLToPath(import.meta.url));
      const env = { ...loadEnv(server.config.mode, root, "BLOB_"), QUOTES_DIR: path.join(root, ".quotes") };
      server.middlewares.use("/api/quote", (req, res) => handleStoreQuote(req, res, env));
      server.middlewares.use("/quotes", (req, res, next) => {
        const file = path.join(env.QUOTES_DIR, path.basename(decodeURIComponent(req.url.split("?")[0])));
        if (!file.endsWith(".pdf") || !existsSync(file)) return next();
        res.setHeader("Content-Type", "application/pdf");
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiInDev()],
  server: { port: 5175 },
});
