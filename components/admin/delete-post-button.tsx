"use client";

import { deletePost } from "@/lib/actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeletePostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={async () => {
            await deletePost(postId);
          }}
          className="text-xs text-red-500 hover:underline px-1"
        >
          确认删除
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:underline px-1"
        >
          取消
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  );
}
