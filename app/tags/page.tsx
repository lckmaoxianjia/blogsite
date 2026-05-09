import { getAllTags } from "@/lib/actions";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "标签" };

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">所有标签</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm hover:bg-accent hover:text-white transition-colors"
          >
            {tag.name}
            <span className="ml-1.5 text-xs opacity-60">
              ({tag._count.posts})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
