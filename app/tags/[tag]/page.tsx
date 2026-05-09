import { getPostsByTag } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return { title: `标签: ${tag}` };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const { posts, totalPages } = await getPostsByTag(tag, page);

  if (posts.length === 0 && page === 1) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">标签: {tag}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        共 {posts.length} 篇文章
      </p>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
