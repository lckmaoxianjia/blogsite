"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { savePost } from "@/lib/actions";
import type { Post, Tag } from "@prisma/client";

type PostData = Post & { tags: { tag: Tag }[] };

export function PostEditor({ post }: { post?: PostData | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tagInput, setTagInput] = useState(
    post?.tags.map((t) => t.tag.name).join(", ") || ""
  );
  const [saving, setSaving] = useState(false);

  const tagNames = tagInput
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    try {
      const result = await savePost({
        id: post?.id,
        title,
        content,
        excerpt,
        coverImage,
        status,
        tagNames,
      });
      if (!post?.id && result?.id) {
        router.push(`/admin/posts/${result.id}/edit`);
      }
      router.refresh();
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题..."
        className="w-full text-3xl font-serif font-bold px-0 py-2 border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-accent transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
      />

      <div className="flex gap-4">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="标签（逗号分隔）"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
        <input
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="封面图 URL"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <input
        type="text"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="文章摘要（可选）"
        className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
      />

      {coverImage && (
        <img
          src={coverImage}
          alt="Cover preview"
          className="w-full max-h-48 object-cover rounded-lg"
        />
      )}

      <div className="border rounded-lg overflow-hidden dark:border-gray-700">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
          preview="edit"
          visibleDragbar={false}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400">支持 Markdown 语法</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存草稿"}
          </button>
          <button
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "发布中..." : "发布"}
          </button>
        </div>
      </div>
    </div>
  );
}
