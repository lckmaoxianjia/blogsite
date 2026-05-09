import { getArchive } from "@/lib/actions";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "归档" };

export default async function ArchivePage() {
  const groups = await getArchive();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">文章归档</h1>
      {groups.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-20 text-center">暂无文章</p>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={`${g.year}-${g.month}`}>
              <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 sticky top-[72px] bg-white dark:bg-[#0f0f1a] py-2">
                {g.year} 年 {g.month} 月
                <span className="text-sm text-gray-400 font-normal ml-2">({g.posts.length} 篇)</span>
              </h2>
              <ul className="space-y-2">
                {g.posts.map((post) => (
                  <li key={post.id} className="flex items-center justify-between group">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-accent transition-colors flex-1"
                    >
                      {post.title}
                    </Link>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">
                      {post.publishedAt ? new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date(post.publishedAt)) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
