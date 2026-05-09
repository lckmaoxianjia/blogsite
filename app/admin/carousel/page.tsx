import { getAllCarouselItems } from "@/lib/actions";
import { CarouselManager } from "@/components/admin/carousel-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "轮播图管理" };

export default async function AdminCarouselPage() {
  const items = await getAllCarouselItems();
  return <CarouselManager items={items} />;
}
