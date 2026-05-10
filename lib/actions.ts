"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { slugify } from "./utils";
import type { Post, Category, PostCategory } from "@prisma/client";

export type PostWithCategories = Post & { categories: (PostCategory & { category: Category })[] };

export async function getPosts({
  status = "PUBLISHED",
  page = 1,
  pageSize = 10,
  categoryId,
}: {
  status?: "DRAFT" | "PUBLISHED";
  page?: number;
  pageSize?: number;
  categoryId?: number;
}) {
  const skip = (page - 1) * pageSize;
  const where: Record<string, unknown> = { status };
  if (categoryId) {
    where.categories = { some: { categoryId } };
  }
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts: posts as PostWithCategories[], total, totalPages: Math.ceil(total / pageSize) };
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { categories: { include: { category: true } } },
  });
}

export async function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: { categories: { include: { category: true } } },
  });
}

export async function savePost(data: {
  id?: number;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED";
  categoryIds: number[];
}) {
  const slug = slugify(data.title);

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
        categories: {
          deleteMany: {},
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
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
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
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

export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { posts: true } },
      children: { select: { id: true, name: true, sortOrder: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryTree() {
  const all = await prisma.category.findMany({
    include: {
      _count: { select: { posts: true } },
      children: {
        select: { id: true, name: true, slug: true, sortOrder: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return all.filter((c) => !c.parentId);
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        select: { id: true, name: true, slug: true, sortOrder: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: { select: { posts: true } },
    },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      children: {
        select: { id: true, name: true, slug: true, sortOrder: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function getCategoryPath(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return [];
  const path = [category];
  let current = category;
  while (current.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: current.parentId } });
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }
  return path;
}

export async function reorderCategories(items: { id: number; sortOrder: number }[]) {
  for (const item of items) {
    await prisma.category.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createCategory(data: { name: string; parentId?: number | null }) {
  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      parentId: data.parentId || null,
    },
  });
  revalidatePath("/admin/categories");
  return category;
}

export async function updateCategory(id: number, data: { name?: string; parentId?: number | null }) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = slugify(data.name);
  }
  if (data.parentId !== undefined) {
    updateData.parentId = data.parentId;
  }
  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });
  revalidatePath("/admin/categories");
  return category;
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function getPostsByCategory(slug: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const where = {
    status: "PUBLISHED" as const,
    categories: { some: { category: { slug } } },
  };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { categories: { include: { category: true } }, _count: { select: { comments: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts: posts as PostWithCategories[], total, totalPages: Math.ceil(total / pageSize) };
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
  const where = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: query } },
      { content: { contains: query } },
    ],
  };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { categories: { include: { category: true } }, _count: { select: { comments: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts: posts as PostWithCategories[], total, totalPages: Math.ceil(total / pageSize) };
}

export async function getRecentPosts(limit = 20) {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { categories: { include: { category: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function incrementViewCount(id: number) {
  await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}

export type PostWithCommentCount = Post & {
  categories: (PostCategory & { category: Category })[];
  _count: { comments: number };
};

export async function getRelatedPosts(postId: number, categoryIds: number[], limit = 3) {
  if (categoryIds.length === 0) return [];
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: postId },
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    include: { categories: { include: { category: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPopularCategories(limit = 15) {
  return prisma.category.findMany({
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
