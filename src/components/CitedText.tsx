"use client";

import { splitRichText } from "@/lib/citations";
import { getSource, SOURCE_ACCESSED } from "@/lib/sources";
import type { ReactNode } from "react";

function withBold(text: string, key: string): ReactNode[] {
  const chunks = text.split("**");
  return chunks.map((chunk, index) =>
    index % 2 === 1 ? (
      <strong key={`${key}-b${index}`} className="font-semibold text-slate">
        {chunk}
      </strong>
    ) : (
      <span key={`${key}-t${index}`}>{chunk}</span>
    ),
  );
}

export function CitedText({
  text,
  notes,
}: {
  text: string;
  notes: Record<string, number>;
}) {
  const parts = splitRichText(text);
  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === "text") return <span key={index}>{withBold(part.value, String(index))}</span>;
        const source = getSource(part.id);
        const number = notes[part.id];
        if (!source || !number) return <span key={index}>[{part.id}]</span>;
        return (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-deep hover:underline"
            aria-label={`${source.publisher}: ${source.title}, source ${number}, accessed ${SOURCE_ACCESSED}`}
            onClick={(event) => event.stopPropagation()}
          >
            <sup>{number}</sup>
          </a>
        );
      })}
    </>
  );
}
