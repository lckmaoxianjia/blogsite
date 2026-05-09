import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getReadingTime } from "@/lib/markdown";
import type { PostWithTags } from "@/lib/actions";

export function PostCard({ post }: { post: PostWithTags }) {
  const readingTime = getReadingTime(post.content);

  return (
    <article className="group py-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-2">
          <time>{formatDate(post.publishedAt!)}</time>
          <span>·</span>
          <span>{readingTime} 分钟阅读</span>
        </div>
        <h2 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}
      </Link>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((pt) => (
            <Link
              key={pt.tag.id}
              href={`/tags/${pt.tag.slug}`}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-accent hover:text-white transition-colors"
            >
              {pt.tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
