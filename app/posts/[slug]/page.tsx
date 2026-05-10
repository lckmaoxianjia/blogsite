import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getPosts, incrementViewCount, getRelatedPosts } from "@/lib/actions";
import { formatDate, generateExcerpt } from "@/lib/utils";
import { getReadingTime, extractToc } from "@/lib/markdown";
import { MarkdownRenderer } from "@/components/posts/markdown-renderer";
import { TableOfContents } from "@/components/ui/toc";
import { CommentSection } from "@/components/comments/comment-section";
import { JsonLd } from "@/components/seo/json-ld";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { RelatedPosts } from "@/components/posts/related-posts";
import { BackToTop } from "@/components/ui/back-to-top";
import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

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

  await incrementViewCount(post.id);

  const toc = extractToc(post.content);
  const readingTime = getReadingTime(post.content);
  const categoryIds = post.categories.map((pc) => pc.category.id);
  const relatedPosts = await getRelatedPosts(post.id, categoryIds, 3);

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={{
          "@type": "Article",
          headline: post.title,
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt.toISOString(),
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
                  className="w-full rounded-2xl mb-8 object-cover max-h-[420px] shadow-lg"
                />
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt!)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {readingTime} 分钟阅读
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {post.viewCount + 1} 次阅读
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-5 leading-tight">
                {post.title}
              </h1>
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((pc) => (
                    <Link
                      key={pc.category.id}
                      href={`/categories/${pc.category.slug}`}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-accent hover:text-white transition-colors"
                    >
                      {pc.category.name}
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
        <div className="max-w-article mx-auto">
          <RelatedPosts posts={relatedPosts} />
        </div>
        <div className="max-w-article mx-auto mt-12">
          <CommentSection postId={post.id} />
        </div>
      </div>
      <BackToTop />
    </>
  );
}
