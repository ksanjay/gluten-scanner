import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { analyzeRoute } from "./routes/analyze.js";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.route("/api", analyzeRoute);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = parseInt(process.env.PORT ?? "3000");
console.log(`Server running on port ${port}`);

serve({ fetch: app.fetch, port });
