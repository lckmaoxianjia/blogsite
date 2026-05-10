"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory, reorderCategories } from "@/lib/actions";
import { X, Plus, Edit2, Check, FolderTree, ChevronRight, GripVertical } from "lucide-react";

type CategoryData = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  _count: { posts: number };
  children: { id: string; name: string; sortOrder: number }[];
};

export function CategoryManager({
  categories: initialCategories,
}: {
  categories: CategoryData[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

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

  async function handleUpdate(id: string) {
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

  function getSiblings(parentIdVal: string | null): CategoryData[] {
    return categories.filter((c) => c.parentId === parentIdVal).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function handleDragStart(id: string) {
    dragItem.current = id;
  }

  function handleDragEnter(id: string) {
    dragOverItem.current = id;
  }

  async function handleDragEnd() {
    const fromId = dragItem.current;
    const toId = dragOverItem.current;
    if (!fromId || !toId || fromId === toId) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const fromCat = categories.find((c) => c.id === fromId);
    const toCat = categories.find((c) => c.id === toId);
    if (!fromCat || !toCat || fromCat.parentId !== toCat.parentId) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const siblings = getSiblings(fromCat.parentId);
    const fromIdx = siblings.findIndex((c) => c.id === fromId);
    const toIdx = siblings.findIndex((c) => c.id === toId);
    if (fromIdx === -1 || toIdx === -1) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updates = reordered.map((c, i) => ({
      id: c.id,
      sortOrder: i,
    }));

    setCategories((prev) =>
      prev.map((c) => {
        const u = updates.find((u) => u.id === c.id);
        return u ? { ...c, sortOrder: u.sortOrder } : c;
      })
    );

    await reorderCategories(updates);
    router.refresh();

    dragItem.current = null;
    dragOverItem.current = null;
  }

  const topLevel = getSiblings(null);

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
          onChange={(e) => setParentId(e.target.value || null)}
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
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
            />
            {getSiblings(cat.id).map((child) => (
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
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
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
  onDragStart,
  onDragEnter,
  onDragEnd,
}: {
  cat: CategoryData;
  allCategories: CategoryData[];
  editingId: string | null;
  editName: string;
  editParentId: string | null;
  setEditName: (v: string) => void;
  setEditParentId: (v: string | null) => void;
  onStartEdit: (cat: CategoryData) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
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
          onChange={(e) => setEditParentId(e.target.value || null)}
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
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-default"
      draggable
      onDragStart={() => onDragStart(cat.id)}
      onDragEnter={() => onDragEnter(cat.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="text-gray-300 dark:text-gray-600 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </span>
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
