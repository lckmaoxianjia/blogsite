import { searchPosts } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "搜索" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q || "";
  const page = Math.max(1, parseInt(sp.page || "1"));

  if (!query) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif font-bold mb-4">搜索</h1>
        <p className="text-gray-500 dark:text-gray-400">请输入关键词搜索</p>
      </div>
    );
  }

  const { posts, totalPages } = await searchPosts(query, page);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">搜索: {query}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        找到 {posts.length} 篇文章
      </p>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-20 text-center">
          没有找到相关文章
        </p>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
