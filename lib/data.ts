// 공통 데이터 로더 — GitHub Pages에서 fetch + 메모리 캐시

const BASE = "https://l1ll2lll3.github.io/marginalia-dashboard";
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 3600_000; // 1시간 캐시

async function load<T>(file: string): Promise<T> {
  const cached = cache.get(file);
  if (cached && Date.now() - cached.ts < TTL) return cached.data as T;

  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`fetch ${file}: ${res.status}`);
  const data = await res.json();
  cache.set(file, { data, ts: Date.now() });
  return data as T;
}

// ── 사전 ──
export interface WordEntry {
  lemma: string;
  pos: string;
  difficulty: string;
  pronunciation: string;
  etymology: string;
  senses: Array<{ gloss: string; example?: string }>;
  books: Record<string, {
    frequency: number;
    sentences: Array<{ text: string; ko: string; chapter: number }>;
  }>;
}

export async function getSearchIndex(): Promise<Record<string, number>> {
  return load<Record<string, number>>("search_index.json");
}

export async function getWords(): Promise<WordEntry[]> {
  return load<WordEntry[]>("words.json");
}

// ── 감정 ──
export interface EmotionData {
  emotions: string[];
  moon: {
    sentence_count: number;
    chapter_avg: Record<string, Record<string, number>>;
    chapters: number[];
  };
  gatsby: {
    sentence_count: number;
    chapter_avg: Record<string, Record<string, number>>;
    chapters: number[];
  };
  story_events: Record<string, Record<string, string>>;
  annotations: Record<string, Record<string, Array<{
    idx: number; val: number; ch: number; text: string; ko: string;
  }>>>;
}

export async function getEmotionData(): Promise<EmotionData> {
  return load<EmotionData>("emotion_arc_data.json");
}
