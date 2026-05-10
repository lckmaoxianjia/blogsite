import Link from "next/link";
import { Rss } from "lucide-react";
import { getCategoryTree } from "@/lib/actions";

export async function Footer() {
  const topCategories = await getCategoryTree();

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif font-bold text-lg mb-3">我的博客</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              记录技术思考与生活感悟。用文字分享知识，以代码改变世界。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">文章目录</h4>
            <nav className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
              {topCategories.map((cat) => (
                <div key={cat.id}>
                  <Link href={`/categories/${cat.slug}`} className="block hover:text-accent transition-colors">
                    {cat.name}
                  </Link>
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="block ml-3 text-xs hover:text-accent transition-colors mt-0.5"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">订阅</h4>
            <Link
              href="/rss.xml"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <Rss size={14} /> RSS 订阅
            </Link>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} 我的博客. All rights reserved. Powered by Next.js.</p>
        </div>
      </div>
    </footer>
  );
}
