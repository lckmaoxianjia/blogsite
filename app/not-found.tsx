import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <h1 className="text-6xl font-serif font-bold mb-4 text-gray-200 dark:text-gray-800">
        404
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">页面不存在</p>
      <Link href="/" className="text-accent hover:underline">
        返回首页 →
      </Link>
    </div>
  );
}
