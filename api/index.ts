import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { runtime: "nodejs" };

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: "Marginalia Literary API",
    version: "0.1.0",
    endpoints: {
      "GET /api/word?q=confess": "Look up a word in the literary dictionary",
      "GET /api/character?c1=strickland&c2=heathcliff": "Compare two characters",
      "GET /api/character?c1=strickland": "Find all comparisons for a character",
      "GET /api/character": "List all character pairs",
      "GET /api/emotion?book=moon&emotion=tension": "Emotion arc (top chapters + peaks)",
      "GET /api/emotion?book=moon&emotion=tension&chapter=30": "Specific chapter emotion",
      "GET /api/emotion?book=moon": "List available emotions",
    },
    dashboard: "https://l1ll2lll3.github.io/marginalia-dashboard/",
    source: "https://github.com/l1ll2lll3/marginalia-mcp",
  });
}
