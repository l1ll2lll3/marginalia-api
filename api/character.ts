import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { runtime: "nodejs" };

const PAIRS: Record<string, { sim: number; c1: string; b1: string; c2: string; b2: string; insight: string }> = {
  "catherine_earnshaw/박영채": { sim: 0.902, c1: "Catherine Earnshaw", b1: "Wuthering Heights", c2: "박영채", b2: "무정", insight: "Both are tragic women caught between passion and duty. Catherine between Heathcliff and Edgar; Yeongchae between love for Hyeongshik and her fate as a gisaeng." },
  "charles_strickland/basil_hallward": { sim: 0.899, c1: "Charles Strickland", b1: "Moon and Sixpence", c2: "Basil Hallward", b2: "Dorian Gray", insight: "Both are consumed by artistic obsession. Strickland destroys others to create; Basil is destroyed by what he creates." },
  "blanche_stroeve/박영채": { sim: 0.898, c1: "Blanche Stroeve", b1: "Moon and Sixpence", c2: "박영채", b2: "무정", insight: "Both women sacrifice everything for a man who does not reciprocate, and both face tragic ends as a result." },
  "박영채/sibyl_vane": { sim: 0.894, c1: "박영채", b1: "무정", c2: "Sibyl Vane", b2: "Dorian Gray", insight: "Both are young women whose identity is bound to performance — Yeongchae as gisaeng, Sibyl as actress. Both attempt suicide when their constructed world collapses." },
  "dirk_stroeve/basil_hallward": { sim: 0.893, c1: "Dirk Stroeve", b1: "Moon and Sixpence", c2: "Basil Hallward", b2: "Dorian Gray", insight: "Both are devoted artists who worship a more powerful figure and are destroyed by that devotion." },
  "blanche_stroeve/catherine_earnshaw": { sim: 0.892, c1: "Blanche Stroeve", b1: "Moon and Sixpence", c2: "Catherine Earnshaw", b2: "Wuthering Heights", insight: "Both women transfer their passion from a devoted husband to a dangerous man, with fatal consequences." },
  "charles_strickland/heathcliff": { sim: 0.883, c1: "Charles Strickland", b1: "Moon and Sixpence", c2: "Heathcliff", b2: "Wuthering Heights", insight: "Both destroy relationships in pursuit of an obsession — Strickland for art, Heathcliff for revenge. Neither shows remorse." },
  "heathcliff/dorian_gray": { sim: 0.883, c1: "Heathcliff", b1: "Wuthering Heights", c2: "Dorian Gray", b2: "Dorian Gray", insight: "Two forms of monstrosity: Heathcliff's is forged by suffering and rejection; Dorian's by beauty and impunity." },
  "charles_strickland/dorian_gray": { sim: 0.870, c1: "Charles Strickland", b1: "Moon and Sixpence", c2: "Dorian Gray", b2: "Dorian Gray", insight: "Both are consumed by aesthetics at the cost of morality. Strickland through creation, Dorian through preservation of beauty." },
  "gatsby/charles_strickland": { sim: 0.851, c1: "Jay Gatsby", b1: "Great Gatsby", c2: "Charles Strickland", b2: "Moon and Sixpence", insight: "Both reinvent themselves completely. Gatsby transforms from Gatz to pursue Daisy; Strickland abandons everything to pursue art." },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const c1 = (req.query.c1 as string || "").trim().toLowerCase();
  const c2 = (req.query.c2 as string || "").trim().toLowerCase();

  // 특정 쌍 검색
  if (c1 && c2) {
    for (const [key, data] of Object.entries(PAIRS)) {
      const [a, b] = key.split("/");
      if ((a.includes(c1) && b.includes(c2)) || (a.includes(c2) && b.includes(c1))) {
        return res.status(200).json(data);
      }
    }
    return res.status(404).json({
      error: `No comparison found for "${c1}" and "${c2}"`,
      available: Object.values(PAIRS).map(p => `${p.c1} ↔ ${p.c2}`),
    });
  }

  // 전체 목록 또는 한 캐릭터의 매칭
  if (c1) {
    const matches = Object.values(PAIRS)
      .filter(p => p.c1.toLowerCase().includes(c1) || p.c2.toLowerCase().includes(c1))
      .sort((a, b) => b.sim - a.sim);
    return res.status(200).json({ character: c1, matches });
  }

  // 전체 Top 10
  const top = Object.values(PAIRS).sort((a, b) => b.sim - a.sim);
  return res.status(200).json({ pairs: top });
}
