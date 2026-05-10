import { getPostsByCategory, getCategoryBySlug } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };
  return { title: category.name };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const [category, { posts, totalPages }] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategory(slug, page),
  ]);

  if (!category || (posts.length === 0 && page === 1)) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-2">{category.name}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        共 {category._count.posts} 篇文章
      </p>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
