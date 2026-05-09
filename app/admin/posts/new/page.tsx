import { PostEditor } from "@/components/admin/post-editor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "写文章" };

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6">写文章</h1>
      <PostEditor />
    </div>
  );
}
