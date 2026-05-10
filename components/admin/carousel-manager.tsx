"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveCarouselItem, deleteCarouselItem, reorderCarouselItems } from "@/lib/actions";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

const NEW_ID = "__new__";

interface CarouselItem {
  id: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export function CarouselManager({ items: initialItems }: { items: CarouselItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const editing = editingId !== null ? items.find((i) => i.id === editingId) ?? null : null;
  const isNew = editingId === NEW_ID;

  function openNew() {
    setEditingId(NEW_ID);
    setImageUrl("");
    setLinkUrl("");
  }

  function openEdit(item: CarouselItem) {
    setEditingId(item.id);
    setImageUrl(item.imageUrl);
    setLinkUrl(item.linkUrl);
  }

  function closeForm() {
    setEditingId(null);
  }

  async function handleSave() {
    if (!imageUrl.trim() || !linkUrl.trim()) return;
    setSaving(true);
    await saveCarouselItem({
      id: isNew ? undefined : editingId!,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
      sortOrder: isNew ? items.length : editing?.sortOrder ?? items.length,
      isActive: editing?.isActive ?? true,
    });
    setSaving(false);
    closeForm();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除？")) return;
    await deleteCarouselItem(id);
    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  }

  async function handleToggle(item: CarouselItem) {
    await saveCarouselItem({ ...item, isActive: !item.isActive });
    setItems(items.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i)));
    router.refresh();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    await reorderCarouselItems(newItems.map((item, i) => ({ id: item.id, sortOrder: i })));
    router.refresh();
  }

  async function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    await reorderCarouselItems(newItems.map((item, i) => ({ id: item.id, sortOrder: i })));
    router.refresh();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">轮播图管理</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> 新增
        </button>
      </div>

      {/* Edit Form */}
      {editingId !== null && (
        <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {isNew ? "新增轮播项" : "编辑轮播项"}
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="图片 URL"
              className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="跳转链接"
              className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? "上传中..." : "本地上传"}
            </button>
            <div className="flex-1" />
            <button onClick={closeForm} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !imageUrl.trim() || !linkUrl.trim()}
              className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md" />
          )}
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">排序</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">图片</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">跳转链接</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">状态</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 text-sm">
                  暂无轮播图
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 w-20">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleMoveUp(index)} className="text-gray-400 hover:text-gray-600" title="上移">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => handleMoveDown(index)} className="text-gray-400 hover:text-gray-600" title="下移">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <img src={item.imageUrl} alt="" className="w-28 h-16 object-cover rounded border border-gray-200 dark:border-gray-700" />
                  </td>
                  <td className="py-3 px-4">
                    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[220px] text-xs">
                      {item.linkUrl}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(item)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        item.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                      }`}
                    >
                      {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.isActive ? "启用" : "禁用"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEdit(item)}
                      className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors mr-1"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
