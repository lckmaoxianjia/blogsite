"use client";

import type { TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-24">
      <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
        目录
      </h4>
      <ul className="space-y-1.5 border-l-2 border-gray-200 dark:border-gray-800">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-sm py-0.5 transition-colors",
                item.level === 3 && "pl-4",
                activeId === item.id
                  ? "text-accent border-l-2 -ml-[2px] border-accent pl-3"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 pl-2"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
