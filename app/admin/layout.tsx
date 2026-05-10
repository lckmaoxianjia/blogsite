import Link from "next/link";
import { FileText, PenLine, FolderTree, Image, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "管理后台", template: "%s | 后台" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Dark Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 text-gray-300 flex flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-gray-800">
          <h1 className="text-white font-bold text-base">管理后台</h1>
        </div>
        <nav className="flex-1 py-4 space-y-0.5">
          <p className="px-5 py-1 text-xs text-gray-500 uppercase tracking-wider mb-2">内容管理</p>
          <SidebarLink href="/admin" icon={<FileText size={16} />} label="文章列表" />
          <SidebarLink href="/admin/posts/new" icon={<PenLine size={16} />} label="写文章" />
          <SidebarLink href="/admin/categories" icon={<FolderTree size={16} />} label="目录管理" />
          <SidebarLink href="/admin/carousel" icon={<Image size={16} />} label="轮播图" />
          <div className="mx-4 my-4 border-t border-gray-800" />
          <SidebarLink href="/" icon={<Home size={16} />} label="返回前台" />
        </nav>
        <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-600">
          Blog Admin v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-[#0f0f1a] min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm hover:bg-gray-800 hover:text-white transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
