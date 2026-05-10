import { getCategoryTree } from "@/lib/actions";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "文章目录" };

export default async function CategoriesPage() {
  const categories = await getCategoryTree();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">文章目录</h1>
      {categories.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-20 text-center">暂无目录</p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-5">
              <Link
                href={`/categories/${cat.slug}`}
                className="text-lg font-serif font-bold hover:text-accent transition-colors"
              >
                {cat.name}
              </Link>
              <span className="ml-2 text-sm text-gray-400">({cat._count.posts} 篇)</span>
              {cat.children.length > 0 && (
                <div className="mt-3 ml-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4 space-y-1.5">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
                    >
                      <ChevronRight size={12} />
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
