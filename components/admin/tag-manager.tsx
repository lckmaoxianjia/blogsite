"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTag, deleteTag } from "@/lib/actions";
import { X, Plus } from "lucide-react";

export function TagManager({
  tags,
}: {
  tags: { id: number; name: string; slug: string; _count: { posts: number } }[];
}) {
  const router = useRouter();
  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newTagName.trim()) return;
    setAdding(true);
    try {
      await createTag(newTagName.trim());
      setNewTagName("");
      router.refresh();
    } catch {
      // tag already exists or other error
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6">标签管理</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="新标签名称..."
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newTagName.trim()}
          className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
        >
          <Plus size={14} /> 添加
        </button>
      </div>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
          >
            <span>
              <span className="font-medium">{tag.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                ({tag._count.posts} 篇文章)
              </span>
            </span>
            <button
              onClick={async () => {
                await deleteTag(tag.id);
                router.refresh();
              }}
              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
