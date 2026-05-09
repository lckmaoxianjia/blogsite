import { getRecentPosts } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getRecentPosts(100);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const urls = [
    `<url><loc>${siteUrl}</loc><priority>1.0</priority></url>`,
    `<url><loc>${siteUrl}/search</loc><priority>0.5</priority></url>`,
    ...posts.map(
      (p) =>
        `<url><loc>${siteUrl}/posts/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>`
    ),
  ].join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
