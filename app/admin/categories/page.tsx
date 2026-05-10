import { getAllCategories } from "@/lib/actions";
import { CategoryManager } from "@/components/admin/category-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "目录管理" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return <CategoryManager categories={categories} />;
}
