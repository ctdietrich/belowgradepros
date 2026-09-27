const CITATION_RE = /\[([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)\]/g;

export type RichPart = { kind: "text"; value: string } | { kind: "cite"; id: string };

export function extractCitationIds(text: string): string[] {
  return [...text.matchAll(CITATION_RE)].map((match) => match[1]);
}

export function orderedCitationIds(texts: readonly string[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const text of texts) {
    for (const id of extractCitationIds(text)) {
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export function citationNotes(texts: readonly string[]): Record<string, number> {
  const notes: Record<string, number> = {};
  orderedCitationIds(texts).forEach((id, index) => {
    notes[id] = index + 1;
  });
  return notes;
}

export function splitRichText(text: string): RichPart[] {
  const parts: RichPart[] = [];
  const re = new RegExp(CITATION_RE.source, "g");
  let last = 0;
  for (const match of text.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", value: text.slice(last, index) });
    parts.push({ kind: "cite", id: match[1] });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}

/** Plain FAQ answer with footnote numbers, for JSON-LD. */
export function plainCited(text: string, notes: Record<string, number>): string {
  return text
    .replace(/\*\*/g, "")
    .replace(CITATION_RE, (_match, id: string) => (notes[id] ? ` [${notes[id]}]` : ""))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}
