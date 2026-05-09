"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { slugify } from "./utils";
import type { Post, Tag, PostTag } from "@prisma/client";

export type PostWithTags = Post & { tags: (PostTag & { tag: Tag })[] };

export async function getPosts({
  status = "PUBLISHED",
  page = 1,
  pageSize = 10,
}: {
  status?: "DRAFT" | "PUBLISHED";
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where: { status } }),
  ]);
  return { posts, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  });
}

export async function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}

export async function savePost(data: {
  id?: number;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED";
  tagNames: string[];
}) {
  const slug = slugify(data.title);
  const tags = await upsertTags(data.tagNames);

  if (data.id) {
    const post = await prisma.post.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
        tags: {
          deleteMany: {},
          create: tags.map((t) => ({ tagId: t.id })),
        },
      },
    });
    revalidatePath("/");
    revalidatePath(`/posts/${slug}`);
    revalidatePath("/admin");
    return post;
  } else {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        tags: {
          create: tags.map((t) => ({ tagId: t.id })),
        },
      },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return post;
  }
}

export async function deletePost(id: number) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}

async function upsertTags(names: string[]): Promise<Tag[]> {
  const tags: Tag[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    tags.push(tag);
  }
  return tags;
}

export async function getAllTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createTag(name: string) {
  const tag = await prisma.tag.create({
    data: { name, slug: slugify(name) },
  });
  revalidatePath("/admin/tags");
  return tag;
}

export async function deleteTag(id: number) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}

export async function getPostsByTag(tag: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        tags: { some: { tag: { slug: tag } } },
      },
      include: { tags: { include: { tag: true } }, _count: { select: { comments: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({
      where: {
        status: "PUBLISHED",
        tags: { some: { tag: { slug: tag } } },
      },
    }),
  ]);
  return { posts, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getComments(postId: number) {
  return prisma.comment.findMany({
    where: { postId, isApproved: true, parentId: null },
    include: {
      replies: {
        where: { isApproved: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addComment(data: {
  postId: number;
  authorName: string;
  authorEmail?: string;
  authorWebsite?: string;
  content: string;
  parentId?: number;
}) {
  const comment = await prisma.comment.create({
    data: {
      postId: data.postId,
      authorName: data.authorName,
      authorEmail: data.authorEmail || null,
      authorWebsite: data.authorWebsite || null,
      content: data.content,
      parentId: data.parentId || null,
    },
  });
  revalidatePath(`/posts/${data.postId}`);
  return comment;
}

export async function searchPosts(query: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      },
      include: { tags: { include: { tag: true } }, _count: { select: { comments: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      },
    }),
  ]);
  return { posts, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getRecentPosts(limit = 20) {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { tags: { include: { tag: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function incrementViewCount(id: number) {
  await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}

export type PostWithCommentCount = Post & {
  tags: (PostTag & { tag: Tag })[];
  _count: { comments: number };
};

export async function getRelatedPosts(postId: number, tagIds: number[], limit = 3) {
  if (tagIds.length === 0) return [];
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: postId },
      tags: { some: { tagId: { in: tagIds } } },
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getArchive() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const grouped: Record<string, { year: number; month: number; posts: typeof posts }> = {};
  for (const p of posts) {
    if (!p.publishedAt) continue;
    const d = new Date(p.publishedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) {
      grouped[key] = { year: d.getFullYear(), month: d.getMonth() + 1, posts: [] };
    }
    grouped[key].posts.push(p);
  }
  return Object.values(grouped).sort((a, b) => b.year - a.year || b.month - a.month);
}

export async function getPopularTags(limit = 15) {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: limit,
  });
}

// --- Carousel ---

export async function getCarouselItems() {
  return prisma.carouselItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllCarouselItems() {
  return prisma.carouselItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function saveCarouselItem(data: {
  id?: number;
  imageUrl: string;
  linkUrl: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  if (data.id) {
    const item = await prisma.carouselItem.update({
      where: { id: data.id },
      data: {
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/carousel");
    return item;
  }
  const item = await prisma.carouselItem.create({
    data: {
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/carousel");
  return item;
}

export async function deleteCarouselItem(id: number) {
  await prisma.carouselItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/carousel");
}

export async function reorderCarouselItems(items: { id: number; sortOrder: number }[]) {
  for (const item of items) {
    await prisma.carouselItem.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/carousel");
}
