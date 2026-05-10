"use client";

import { addComment } from "@/lib/actions";
import { useState, useRef } from "react";

export function CommentForm({
  postId,
  parentId,
}: {
  postId: string;
  parentId?: number;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError("");
    try {
      await addComment({
        postId,
        authorName: formData.get("authorName") as string,
        authorEmail: (formData.get("authorEmail") as string) || undefined,
        authorWebsite: (formData.get("authorWebsite") as string) || undefined,
        content: formData.get("content") as string,
        parentId,
      });
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("评论失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 mb-8">
      <div className="flex gap-3">
        <input
          name="authorName"
          required
          placeholder="昵称 *"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
        <input
          name="authorEmail"
          type="email"
          placeholder="邮箱（可选，用于头像）"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
        <input
          name="authorWebsite"
          placeholder="网站（可选）"
          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <textarea
        name="content"
        required
        rows={3}
        placeholder="写评论..."
        className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-accent transition-colors resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 text-sm bg-accent text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? "提交中..." : parentId ? "回复" : "发表评论"}
        </button>
        {success && <span className="text-sm text-green-600">评论成功！</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}

export function ReplyButton({
  postId,
  parentId,
}: {
  postId: string;
  parentId: number;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-xs text-gray-400 hover:text-accent transition-colors mt-1"
      >
        {showForm ? "取消回复" : "回复"}
      </button>
      {showForm && (
        <div className="mt-3">
          <CommentForm postId={postId} parentId={parentId} />
        </div>
      )}
    </>
  );
}
