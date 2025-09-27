import { create } from "zustand";
import type { Post, PagedResponse } from "@/lib/api/types";
import { getPosts, createPost } from "@/lib/api/mockApi";

const PAGE_SIZE = 5;

type ThreadState = {
  loading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  posts: Post[];
  lastCreatedPostId?: string;
};

type ThreadActions = {
  fetchPage: (threadId: string, page: number) => Promise<void>;
  addPost: (
    threadId: string,
    content: string,
    authorId: string
  ) => Promise<"navigate-last">;
  reset: () => void;
};

export const useThreadStore = create<ThreadState & ThreadActions>((set, get) => ({
  loading: false,
  page: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  totalCount: 0,
  posts: [],
  lastCreatedPostId: undefined,
  async fetchPage(threadId, page) {
    // fetchPage: load posts for the requested page
    set({ loading: true });
    try {
      const res: PagedResponse<Post> = await getPosts(threadId, page, PAGE_SIZE);
      set({
        loading: false,
        posts: res.items,
        page: res.page,
        totalPages: res.totalPages,
        totalCount: res.totalCount,
        pageSize: res.pageSize,
        lastCreatedPostId: undefined
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async addPost(threadId, content, authorId) {
    // addPost: create and load the last page
    set({ loading: true });
    try {
      const created = await createPost(threadId, { authorId, content });
      const nextTotalCount = get().totalCount + 1;
      const lastPage = Math.max(1, Math.ceil(nextTotalCount / PAGE_SIZE));
      set({ page: lastPage });
      const res = await getPosts(threadId, lastPage, PAGE_SIZE);
      set({
        loading: false,
        posts: res.items,
        page: res.page,
        totalPages: res.totalPages,
        totalCount: res.totalCount,
        pageSize: res.pageSize,
        lastCreatedPostId: created.id
      });
      return "navigate-last";
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  reset() {
    set({
      loading: false,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
      totalCount: 0,
      posts: [],
      lastCreatedPostId: undefined
    });
  }
}));
