import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCategoryTree } from "@/lib/actions";

export async function Header() {
  const topCategories = await getCategoryTree();

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
          {topCategories.map((cat) => (
            <div key={cat.id} className="relative group hidden sm:block">
              <Link
                href={`/categories/${cat.slug}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors px-2 py-1"
              >
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[120px] py-1 z-50">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="block px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-accent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <SearchBar />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
