import { getPostById } from "@/lib/actions";
import { PostEditor } from "@/components/admin/post-editor";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "编辑文章" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(parseInt(id));
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6">编辑文章</h1>
      <PostEditor post={post} />
    </div>
  );
}
