"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
        className="w-28 sm:w-40 h-8 pl-8 pr-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
      />
      <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
    </form>
  );
}
