import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type GlutenStatus = "safe" | "likely_safe" | "contains_gluten" | "uncertain";
export type Confidence = "high" | "medium" | "low";
export type Category = "appetizer" | "main" | "side" | "dessert" | "drink" | "unknown";

export interface MenuItem {
  name: string;
  category: Category;
  gluten_status: GlutenStatus;
  reason: string;
  confidence: Confidence;
}

export interface AnalyzeResponse {
  restaurant_context: string;
  items: MenuItem[];
  general_notes: string;
}

const SYSTEM_PROMPT = `You are a dietary safety assistant specializing in celiac disease and gluten intolerance.
Analyze menu images with caution: when uncertain, err on the side of marking an item as unsafe.
Never guess — if you cannot clearly read an item or determine its ingredients, mark it as "uncertain".`;

const USER_PROMPT = `Examine this restaurant menu image. For every food item you can identify, determine
whether it is safe for someone with a severe gluten allergy (celiac disease).

Gluten sources to check: wheat, barley, rye, malt, brewer's yeast, semolina,
spelt, kamut, farro, triticale, and any derivative (soy sauce, beer batter,
flour tortillas, most roux-based sauces, breaded items, pasta, croutons, etc.).

Return ONLY a JSON object in this exact shape, with no markdown fencing:
{
  "restaurant_context": "brief description of cuisine type if detectable",
  "items": [
    {
      "name": "item name as written on menu",
      "category": "appetizer | main | side | dessert | drink | unknown",
      "gluten_status": "safe | likely_safe | contains_gluten | uncertain",
      "reason": "one sentence explanation",
      "confidence": "high | medium | low"
    }
  ],
  "general_notes": "any cross-contamination warnings or kitchen-level concerns"
}

If the image is not a menu or is unreadable, return:
{ "error": "description of the problem" }`;

export const analyzeRoute = new Hono();

analyzeRoute.use(
  "/analyze",
  rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 20,
    standardHeaders: "draft-6",
    keyGenerator: (c) =>
      c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown",
  })
);

analyzeRoute.post("/analyze", async (c) => {
  let body: { image?: string; mediaType?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { image, mediaType } = body;

  if (!image || typeof image !== "string") {
    return c.json({ error: "Missing image field" }, 400);
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const type = (mediaType ?? "image/jpeg") as Anthropic.Base64ImageSource["media_type"];
  if (!allowedTypes.includes(type)) {
    return c.json({ error: "Unsupported image type" }, 400);
  }

  // Rough size check: base64 ~= 4/3 original, 10MB limit
  if (image.length > 13_400_000) {
    return c.json({ error: "Image too large. Please use a smaller image." }, 413);
  }

  try {
    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      thinking: { type: "adaptive" } as any,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: type, data: image },
            },
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return c.json({ error: "No response from model" }, 500);
    }

    let parsed: AnalyzeResponse & { error?: string };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      // Try to extract JSON from the text in case of minor formatting issues
      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (!match) {
        return c.json({ error: "Could not parse menu analysis" }, 500);
      }
      parsed = JSON.parse(match[0]);
    }

    if (parsed.error) {
      return c.json({ error: parsed.error }, 422);
    }

    return c.json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return c.json({ error: "Service busy. Please try again shortly." }, 429);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error:", err.status, err.message);
      return c.json({ error: "Analysis service unavailable" }, 502);
    }
    console.error("Unexpected error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
