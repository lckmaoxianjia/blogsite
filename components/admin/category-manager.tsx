"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions";
import { X, Plus, Edit2, Check, FolderTree, ChevronRight } from "lucide-react";

type CategoryData = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  _count: { posts: number };
  children: { id: number; name: string }[];
};

export function CategoryManager({
  categories,
}: {
  categories: CategoryData[];
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<number | null>(null);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await createCategory({ name: newName.trim(), parentId });
      setNewName("");
      setParentId(null);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim(), parentId: editParentId });
      setEditingId(null);
      router.refresh();
    } catch {
      // ignore
    }
  }

  function startEdit(cat: CategoryData) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditParentId(cat.parentId);
  }

  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
        <FolderTree size={24} /> 目录管理
      </h1>

      {/* Add new category */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="新目录名称..."
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
        <select
          value={parentId ?? ""}
          onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">顶级目录</option>
          {topLevel.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
        >
          <Plus size={14} /> 添加
        </button>
      </div>

      {/* Category tree */}
      <div className="space-y-3">
        {topLevel.map((cat) => (
          <div key={cat.id}>
            <CategoryRow
              cat={cat}
              allCategories={categories}
              editingId={editingId}
              editName={editName}
              editParentId={editParentId}
              setEditName={setEditName}
              setEditParentId={setEditParentId}
              onStartEdit={startEdit}
              onSave={handleUpdate}
              onCancel={() => setEditingId(null)}
              onDelete={async (id) => {
                await deleteCategory(id);
                router.refresh();
              }}
            />
            {/* Children */}
            {categories
              .filter((c) => c.parentId === cat.id)
              .map((child) => (
                <div key={child.id} className="ml-8 mt-1">
                  <CategoryRow
                    cat={child}
                    allCategories={categories}
                    editingId={editingId}
                    editName={editName}
                    editParentId={editParentId}
                    setEditName={setEditName}
                    setEditParentId={setEditParentId}
                    onStartEdit={startEdit}
                    onSave={handleUpdate}
                    onCancel={() => setEditingId(null)}
                    onDelete={async (id) => {
                      await deleteCategory(id);
                      router.refresh();
                    }}
                  />
                </div>
              ))}
          </div>
        ))}
        {topLevel.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 py-8 text-center">暂无目录，请先创建</p>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  cat,
  allCategories,
  editingId,
  editName,
  editParentId,
  setEditName,
  setEditParentId,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  cat: CategoryData;
  allCategories: CategoryData[];
  editingId: number | null;
  editName: string;
  editParentId: number | null;
  setEditName: (v: string) => void;
  setEditParentId: (v: number | null) => void;
  onStartEdit: (cat: CategoryData) => void;
  onSave: (id: number) => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
}) {
  const isEditing = editingId === cat.id;
  const topLevel = allCategories.filter((c) => !c.parentId && c.id !== cat.id);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-accent bg-accent/5">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave(cat.id)}
          className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none"
          autoFocus
        />
        <select
          value={editParentId ?? ""}
          onChange={(e) => setEditParentId(e.target.value ? parseInt(e.target.value) : null)}
          className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none"
        >
          <option value="">顶级</option>
          {topLevel.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => onSave(cat.id)}
          className="p-1.5 rounded text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <Check size={14} />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      <span className="flex items-center gap-1.5">
        {cat.parentId && <ChevronRight size={12} className="text-gray-400" />}
        <span className="font-medium">{cat.name}</span>
        <span className="text-xs text-gray-400">
          ({cat._count.posts} 篇文章)
        </span>
        {cat.children.length > 0 && (
          <span className="text-xs text-gray-400 ml-1">
            · {cat.children.length} 个子目录
          </span>
        )}
      </span>
      <span className="flex items-center gap-1">
        <button
          onClick={() => onStartEdit(cat)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-accent transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(cat.id)}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      </span>
    </div>
  );
}
