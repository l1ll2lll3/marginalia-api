import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSearchIndex, getWords } from "./_data";

export const config = { runtime: "nodejs" };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = (req.query.q as string || "").trim().toLowerCase();
  if (!q) return res.status(400).json({ error: "?q= parameter required" });

  try {
    const index = await getSearchIndex();
    const words = await getWords();

    // 정확한 매칭
    let idx = index[q];

    // 부분 매칭
    if (idx === undefined) {
      const match = Object.keys(index).find(k => k.startsWith(q));
      if (match) idx = index[match];
    }

    if (idx === undefined) {
      // 유사 단어 추천
      const suggestions = Object.keys(index)
        .filter(k => k.includes(q))
        .sort((a, b) => a.length - b.length)
        .slice(0, 5);
      return res.status(404).json({ error: "not found", suggestions });
    }

    const entry = words[idx];
    return res.status(200).json(entry);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
