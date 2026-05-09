import Link from "next/link";
import { getPosts, getPopularTags } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";
import { getReadingTime } from "@/lib/markdown";
import { ArrowRight, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const [{ posts, totalPages }, popularTags] = await Promise.all([
    getPosts({ page, pageSize: 10 }),
    getPopularTags(12),
  ]);

  const heroPost = page === 1 ? posts[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      {heroPost && (
        <section className="mb-12">
          <Link
            href={`/posts/${heroPost.slug}`}
            className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"
          >
            {heroPost.coverImage && (
              <img
                src={heroPost.coverImage}
                alt={heroPost.title}
                className="w-full h-64 sm:h-80 object-cover opacity-60 group-hover:opacity-50 transition-opacity"
              />
            )}
            <div className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-10 ${!heroPost.coverImage ? "relative h-64 sm:h-72" : ""}`}>
              {heroPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {heroPost.tags.map((pt) => (
                    <span key={pt.tag.id} className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      {pt.tag.name}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 group-hover:underline decoration-white/30">
                {heroPost.title}
              </h1>
              <p className="text-white/70 text-sm line-clamp-2 mb-3 max-w-2xl">
                {heroPost.excerpt || heroPost.content.replace(/[#*`>\-\[\]()!|]/g, "").replace(/\n+/g, " ").trim().substring(0, 300)}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span>{formatDate(heroPost.publishedAt!)}</span>
                <span>·</span>
                <span>{getReadingTime(heroPost.content)} 分钟阅读</span>
                <span>·</span>
                <span>{heroPost.viewCount} 次阅读</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Post List */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            {page === 1 ? "最新文章" : `第 ${page} 页`}
          </h2>

          {posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-20 text-center">暂无文章</p>
          ) : (
            <>
              <div>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} />
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-8">
          {/* Popular Tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-1.5">
              <Tag size={14} /> 热门标签
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-accent hover:text-white transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">快速链接</h3>
            <nav className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/archive" className="flex items-center justify-between hover:text-accent transition-colors group">
                文章归档 <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/tags" className="flex items-center justify-between hover:text-accent transition-colors group">
                所有标签 <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
