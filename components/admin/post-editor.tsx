"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { savePost, getAllCategories } from "@/lib/actions";
import type { Post, Category } from "@prisma/client";

type CategoryData = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: { id: string; name: string }[];
};

type PostData = Post & { categories: { category: Category }[] };

export function PostEditor({ post }: { post?: PostData | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    post?.categories.map((c) => c.category.id) || []
  );
  const [allCategories, setAllCategories] = useState<CategoryData[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCategories().then((cats) =>
      setAllCategories(cats as unknown as CategoryData[])
    );
  }, []);

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) return;
    if (selectedCategoryIds.length === 0) {
      alert("请至少选择一个目录");
      return;
    }
    setSaving(true);
    try {
      const result = await savePost({
        id: post?.id,
        title,
        content,
        excerpt,
        coverImage,
        status,
        categoryIds: selectedCategoryIds,
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

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const topLevel = allCategories.filter((c) => !c.parentId);

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
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="封面图 URL"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Category selector */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          选择目录（必选，可多选）
        </p>
        {topLevel.length === 0 ? (
          <p className="text-xs text-gray-400">暂无目录，请先在目录管理中创建</p>
        ) : (
          <div className="space-y-2">
            {topLevel.map((cat) => (
              <div key={cat.id}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </label>
                {allCategories.filter((c) => c.parentId === cat.id).length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {allCategories
                      .filter((c) => c.parentId === cat.id)
                      .map((child) => (
                        <label key={child.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(child.id)}
                            onChange={() => toggleCategory(child.id)}
                            className="rounded border-gray-300 text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {child.name}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {selectedCategoryIds.length > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            已选择 {selectedCategoryIds.length} 个目录
          </p>
        )}
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
