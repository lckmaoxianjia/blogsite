"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CarouselItem {
  id: number;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export function Carousel({ items }: { items: CarouselItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(next, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused, items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const toPreload = new Set<number>();
    toPreload.add(current);
    toPreload.add((current + 1) % items.length);
    toPreload.add((current - 1 + items.length) % items.length);
    toPreload.forEach((index) => {
      const img = new Image();
      img.src = items[index].imageUrl;
    });
  }, [current, items]);

  if (items.length === 0) return null;

  return (
    <section className="w-full mb-12">
      <div
        className="relative w-full h-56 sm:h-72 md:h-96 lg:h-[480px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 shadow-2xl group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === current
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0 pointer-events-none"
            }`}
            aria-hidden={index !== current}
            tabIndex={index === current ? 0 : -1}
          >
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
          </Link>
        ))}

        {items.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                prev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/60 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm z-20"
              aria-label="上一张"
            >
              <ChevronLeft size={22} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/60 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm z-20"
              aria-label="下一张"
            >
              <ChevronRight size={22} className="sm:w-6 sm:h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrent(i);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`第${i + 1}张`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
