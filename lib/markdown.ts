import { estimateReadingTime } from "./utils";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s]+/g, "-");
    items.push({ id, text, level: match[1].length });
  }

  return items;
}

export function getReadingTime(markdown: string): number {
  return estimateReadingTime(markdown);
}
