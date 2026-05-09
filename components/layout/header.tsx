"use client";

import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-serif font-bold tracking-tight hover:text-accent transition-colors"
        >
          我的博客
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/"
            className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors px-2 py-1"
          >
            首页
          </Link>
          <Link
            href="/tags"
            className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors px-2 py-1"
          >
            标签
          </Link>
          <Link
            href="/archive"
            className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors px-2 py-1"
          >
            归档
          </Link>
          <SearchBar />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
