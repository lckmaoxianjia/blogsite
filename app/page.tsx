import Link from "next/link";
import { getPosts, getCategoryTree, getCarouselItems } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import { Carousel } from "@/components/home/carousel";
import { Folder, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomeCategoryId() {
  const { prisma } = await import("@/lib/prisma");
  const home = await prisma.category.findUnique({ where: { slug: "shou-ye" } });
  return home?.id;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const homeCategoryId = await getHomeCategoryId();
  const [{ posts, totalPages }, topCategories, carouselItems] = await Promise.all([
    getPosts({ page, pageSize: 10, categoryId: homeCategoryId ?? undefined }),
    getCategoryTree(),
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
                <Folder size={14} /> 文章目录
              </h3>
              <nav className="space-y-1">
                {topCategories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors py-1"
                    >
                      {cat.name}
                      <span className="text-xs text-gray-400">({cat._count.posts})</span>
                    </Link>
                    {cat.children.length > 0 && (
                      <div className="ml-3 border-l border-gray-100 dark:border-gray-800 pl-3 space-y-0.5">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.slug}`}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-accent transition-colors py-0.5"
                          >
                            <ChevronRight size={10} />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
