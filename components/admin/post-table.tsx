import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PostWithTags } from "@/lib/actions";
import { Pencil } from "lucide-react";
import { DeletePostButton } from "./delete-post-button";

export function PostTable({ posts }: { posts: PostWithTags[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="text-left py-3 px-2 font-medium">标题</th>
            <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">
              状态
            </th>
            <th className="text-left py-3 px-2 font-medium hidden md:table-cell">
              日期
            </th>
            <th className="text-right py-3 px-2 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-2">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-accent transition-colors font-medium"
                >
                  {post.title}
                </Link>
              </td>
              <td className="py-3 px-2 hidden sm:table-cell">
                <Badge
                  variant={
                    post.status === "PUBLISHED" ? "success" : "warning"
                  }
                >
                  {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                </Badge>
              </td>
              <td className="py-3 px-2 text-gray-500 hidden md:table-cell">
                {formatDate(post.createdAt)}
              </td>
              <td className="py-3 px-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
