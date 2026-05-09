import Link from "next/link";
import { getPosts, getPopularTags, getCarouselItems } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import { Carousel } from "@/components/home/carousel";
import { ArrowRight, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const [{ posts, totalPages }, popularTags, carouselItems] = await Promise.all([
    getPosts({ page, pageSize: 10 }),
    getPopularTags(12),
    getCarouselItems(),
  ]);

  return (
    <>
      <Carousel items={carouselItems} />

      <div className="max-w-5xl mx-auto px-4">
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
    </>
  );
}
