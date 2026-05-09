import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500">
        <p>&copy; {new Date().getFullYear()} 我的博客. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/rss.xml" className="hover:text-accent transition-colors">
            RSS
          </Link>
          <Link href="/sitemap.xml" className="hover:text-accent transition-colors">
            Sitemap
          </Link>
        </div>
      </div>
    </footer>
  );
}
