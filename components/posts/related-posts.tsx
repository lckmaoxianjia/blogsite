import Link from "next/link";
import type { Post, Tag, PostTag } from "@prisma/client";

type PostWithTags = Post & { tags: (PostTag & { tag: Tag })[] };

export function RelatedPosts({ posts }: { posts: PostWithTags[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-10 mt-12">
      <h2 className="text-xl font-serif font-bold mb-6">相关文章</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all"
          >
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            <h3 className="font-medium text-sm group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 2).map((pt) => (
                  <span
                    key={pt.tag.id}
                    className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500"
                  >
                    {pt.tag.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
