export type ID = string;

export interface User {
  id: ID;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface LastPost {
  id: ID;
  threadTitle: string;
  author: { id: ID; name: string; avatarUrl?: string };
  createdAt: string;
}

export interface ForumNode {
  id: ID;
  emoji?: string;
  icon?: string;
  title: string;
  description?: string;
  posts: number;
  topics?: number;
  lastPost?: LastPost;
  children?: ForumNode[];
}

export interface ForumSection {
  id: ID;
  title: string;
  forums: ForumNode[];
}

export interface SubCategory {
  id: ID;
  name: string;
  threadCount: number;
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  threadCount: number;
  postCount: number;
  subcategories?: SubCategory[];
}

export interface CategoryFilter {
  q?: string;
  sort?: "name" | "threads" | "posts" | "new";
  onlyNew?: boolean;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface Thread {
  id: ID;
  categoryId: ID;
  title: string;
  authorId: ID;
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  tags?: string[];
}

export interface Post {
  id: ID;
  threadId: ID;
  authorId: ID;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: ID;
  author?: Pick<User, "id" | "name" | "avatarUrl">;
  text: string;
  createdAt: string;
  system?: boolean;
}

export interface Stats {
  usersTotal: number;
  usersOnline: number;
  categoriesTotal: number;
  threadsTotal: number;
  postsTotal: number;
  messagesTotal: number;
}

export interface ThreadFilter {
  categoryId?: ID;
  sort?: "new" | "top" | "active" | "unread" | "hottest" | "oldest";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ThreadWithMeta extends Thread {
  lastPostAt: string;
  lastPosterId: ID;
}
