import Link from "next/link";
import { FileText, PenLine, Tags } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "管理后台", template: "%s | 后台" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-48 shrink-0">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            管理后台
          </h2>
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText size={16} /> 文章列表
            </Link>
            <Link
              href="/admin/posts/new"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <PenLine size={16} /> 写文章
            </Link>
            <Link
              href="/admin/tags"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Tags size={16} /> 标签管理
            </Link>
          </nav>
          <hr className="my-4 border-gray-100 dark:border-gray-800" />
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            返回前台
          </Link>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
