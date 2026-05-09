import Link from "next/link";
import { Calendar, Clock, MessageCircle, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getReadingTime } from "@/lib/markdown";
import type { Post, Tag, PostTag } from "@prisma/client";

type PostCardData = Post & {
  tags: (PostTag & { tag: Tag })[];
  _count?: { comments: number };
};

export function PostCard({ post }: { post: PostCardData }) {
  const readingTime = getReadingTime(post.content);
  const commentCount = post._count?.comments ?? 0;

  return (
    <article className="group flex flex-col sm:flex-row gap-5 py-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
      {post.coverImage && (
        <Link href={`/posts/${post.slug}`} className="sm:w-48 shrink-0 overflow-hidden rounded-lg">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-32 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <Link href={`/posts/${post.slug}`} className="block">
          <h2 className="text-lg font-serif font-bold mb-1.5 group-hover:text-accent transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(post.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {readingTime} 分钟
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {commentCount} 条评论
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {post.viewCount} 次阅读
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
          {post.excerpt || post.content.replace(/[#*`>\-\[\]()!|]/g, "").replace(/\n+/g, " ").trim().substring(0, 200)}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((pt) => (
              <Link
                key={pt.tag.id}
                href={`/tags/${pt.tag.slug}`}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-accent hover:text-white transition-colors"
              >
                {pt.tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
