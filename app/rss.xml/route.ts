import { getRecentPosts } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getRecentPosts(20);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <pubDate>${post.publishedAt?.toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>我的博客</title>
    <link>${siteUrl}</link>
    <description>个人博客，分享技术文章和思考。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
