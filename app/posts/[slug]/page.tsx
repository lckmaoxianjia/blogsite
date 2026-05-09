import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPosts } from "@/lib/actions";
import { formatDate, generateExcerpt } from "@/lib/utils";
import { getReadingTime, extractToc } from "@/lib/markdown";
import { MarkdownRenderer } from "@/components/posts/markdown-renderer";
import { TableOfContents } from "@/components/ui/toc";
import { CommentSection } from "@/components/comments/comment-section";
import { JsonLd } from "@/components/seo/json-ld";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Static params generated at build time when DB is available; falls back to dynamic
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ page: 1, pageSize: 100 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.excerpt || generateExcerpt(post.content),
    openGraph: {
      title: post.title,
      description: post.excerpt || generateExcerpt(post.content),
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const toc = extractToc(post.content);
  const readingTime = getReadingTime(post.content);

  return (
    <>
      <JsonLd
        data={{
          "@type": "Article",
          headline: post.title,
          datePublished: post.publishedAt?.toISOString(),
          description: post.excerpt || generateExcerpt(post.content),
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex gap-12">
          <article className="flex-1 min-w-0">
            <header className="mb-8">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full rounded-xl mb-6 object-cover max-h-96"
                />
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-3">
                <time>{formatDate(post.publishedAt!)}</time>
                <span>·</span>
                <span>{readingTime} 分钟阅读</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                {post.title}
              </h1>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((pt) => (
                    <Link
                      key={pt.tag.id}
                      href={`/tags/${pt.tag.slug}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-accent hover:text-white transition-colors"
                    >
                      {pt.tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </header>
            <MarkdownRenderer content={post.content} />
          </article>
          {toc.length > 0 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <TableOfContents items={toc} />
            </aside>
          )}
        </div>
        <div className="max-w-article mx-auto mt-12">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </>
  );
}
