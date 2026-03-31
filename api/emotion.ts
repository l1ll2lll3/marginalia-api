import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEmotionData } from "./_data";

export const config = { runtime: "nodejs" };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const book = (req.query.book as string || "moon").toLowerCase();
  const emotion = (req.query.emotion as string || "").toLowerCase();
  const chapter = req.query.chapter ? Number(req.query.chapter) : undefined;

  try {
    const data = await getEmotionData();
    const bookKey = book.includes("gatsby") ? "gatsby" : "moon";
    const bookData = bookKey === "moon" ? data.moon : data.gatsby;
    const bookTitle = bookKey === "moon" ? "The Moon and Sixpence" : "The Great Gatsby";

    // 감정 목록
    if (!emotion) {
      return res.status(200).json({
        book: bookTitle,
        available_emotions: data.emotions,
        chapters: bookData.chapters,
        sentence_count: bookData.sentence_count,
      });
    }

    if (!data.emotions.includes(emotion)) {
      return res.status(400).json({ error: `Unknown emotion. Available: ${data.emotions.join(", ")}` });
    }

    // 특정 챕터
    if (chapter !== undefined) {
      const scores = bookData.chapter_avg[chapter];
      if (!scores) return res.status(404).json({ error: `Chapter ${chapter} not found` });
      const event = data.story_events?.[bookKey]?.[chapter] || null;
      return res.status(200).json({
        book: bookTitle,
        chapter,
        emotion,
        score: scores[emotion],
        all_emotions: scores,
        story_event: event,
      });
    }

    // 전체: Top 5 + 피크 문장
    const chAvg = bookData.chapter_avg;
    const ranked = Object.entries(chAvg)
      .map(([ch, scores]) => ({
        chapter: Number(ch),
        score: (scores as Record<string, number>)[emotion] || 0,
        event: data.story_events?.[bookKey]?.[Number(ch)] || null,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const peaks = data.annotations?.[bookKey]?.[emotion] || [];

    return res.status(200).json({
      book: bookTitle,
      emotion,
      top_chapters: ranked,
      peak_sentences: peaks.map(p => ({
        chapter: p.ch,
        score: p.val,
        text: p.text,
        ko: p.ko,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
