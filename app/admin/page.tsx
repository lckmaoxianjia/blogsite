import { getPosts } from "@/lib/actions";
import { PostTable } from "@/components/admin/post-table";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.filter as "PUBLISHED" | "DRAFT") || undefined;
  const { posts } = await getPosts({
    page: 1,
    pageSize: 100,
    status: filter,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              !filter
                ? "bg-accent text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            全部
          </Link>
          <Link
            href="/admin?filter=PUBLISHED"
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              filter === "PUBLISHED"
                ? "bg-accent text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            已发布
          </Link>
          <Link
            href="/admin?filter=DRAFT"
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              filter === "DRAFT"
                ? "bg-accent text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            草稿
          </Link>
        </div>
        <Link
          href="/admin/posts/new"
          className="text-sm px-4 py-1.5 bg-accent text-white rounded-md hover:opacity-90 transition-opacity"
        >
          写文章
        </Link>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-4">还没有文章</p>
          <Link href="/admin/posts/new" className="text-accent hover:underline">
            写第一篇 →
          </Link>
        </div>
      ) : (
        <PostTable posts={posts} />
      )}
    </div>
  );
}
