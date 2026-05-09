import { getAllTags } from "@/lib/actions";
import { TagManager } from "@/components/admin/tag-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "标签管理" };

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return <TagManager tags={tags} />;
}
