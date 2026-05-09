import { getPosts } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const { posts, totalPages } = await getPosts({ page, pageSize: 10 });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-10">最新文章</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-20 text-center">
          暂无文章
        </p>
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
  );
}
