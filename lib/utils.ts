export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

import { nanoid } from "nanoid";

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s一-鿿㐀-䶿-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
  return slug || encodeURIComponent(text).substring(0, 200);
}

export function generateId(): string {
  return nanoid(21);
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function estimateReadingTime(content: string): number {
  const chineseChars = (content.match(/[一-鿿]/g) || []).length;
  const words = content
    .replace(/[一-鿿]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(chineseChars / 300 + words / 200));
}

export function generateExcerpt(content: string, maxLength = 200): string {
  const plain = content
    .replace(/[#*`>\-\[\]()!|]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLength ? plain.substring(0, maxLength) + "..." : plain;
}
