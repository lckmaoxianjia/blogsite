import Link from "next/link";
import { Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif font-bold text-lg mb-3">我的博客</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              记录技术思考与生活感悟。用文字分享知识，以代码改变世界。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">快速链接</h4>
            <nav className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="block hover:text-accent transition-colors">首页</Link>
              <Link href="/tags" className="block hover:text-accent transition-colors">标签</Link>
              <Link href="/archive" className="block hover:text-accent transition-colors">归档</Link>
              <Link href="/search" className="block hover:text-accent transition-colors">搜索</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">订阅</h4>
            <Link
              href="/rss.xml"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <Rss size={14} /> RSS 订阅
            </Link>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} 我的博客. All rights reserved. Powered by Next.js.</p>
        </div>
      </div>
    </footer>
  );
}
