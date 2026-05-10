import Link from "next/link";
import { getPostsByCategory, getCategoryBySlug, getCategoryPath } from "@/lib/actions";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";
import { notFound } from "next/navigation";
import { ChevronRight, Folder } from "lucide-react";
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
  const [category, { posts, totalPages }, breadcrumbs] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategory(slug, page),
    getCategoryPath(slug),
  ]);

  if (!category) notFound();

  const isEmpty = category.children.length === 0 && posts.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} />}
            {i < breadcrumbs.length - 1 ? (
              <Link
                href={`/categories/${crumb.slug}`}
                className="hover:text-accent transition-colors"
              >
                {crumb.name}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {crumb.name}
              </span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-3xl font-serif font-bold mb-2">{category.name}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        共 {category._count.posts} 篇文章
      </p>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
            <Folder size={14} /> 子目录
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 hover:border-accent hover:text-accent transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {isEmpty ? (
        <p className="text-gray-500 dark:text-gray-400 py-20 text-center">暂无内容</p>
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
