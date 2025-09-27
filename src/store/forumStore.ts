import { create } from "zustand";
import { mockApi } from "@/lib/api/mockApi";
import type { Category, PaginatedResponse, ThreadFilter, ThreadWithMeta } from "@/lib/api/types";

interface ForumState {
  categories: Category[];
  threads: ThreadWithMeta[];
  totalThreads: number;
  loadingCategories: boolean;
  loadingThreads: boolean;
  error?: string;
  selectedCategory?: string;
  fetchCategories: () => Promise<void>;
  fetchThreads: (filter?: ThreadFilter) => Promise<void>;
  createThread: (
    payload: Pick<ThreadWithMeta, "categoryId" | "title" | "tags"> & { body: string; authorId: string }
  ) => Promise<void>;
}

export const useForumStore = create<ForumState>((set, get) => ({
  categories: [],
  threads: [],
  totalThreads: 0,
  loadingCategories: false,
  loadingThreads: false,
  selectedCategory: undefined,
  async fetchCategories() {
    set({ loadingCategories: true, error: undefined });
    try {
      const data = await mockApi.getCategories();
      set({ categories: data, loadingCategories: false });
    } catch (error) {
      set({ loadingCategories: false, error: error instanceof Error ? error.message : String(error) });
    }
  },
  async fetchThreads(filter) {
    set({ loadingThreads: true, error: undefined });
    try {
      const response: PaginatedResponse<ThreadWithMeta> = await mockApi.getThreads({
        sort: filter?.sort,
        categoryId: filter?.categoryId ?? get().selectedCategory,
        page: filter?.page,
        pageSize: filter?.pageSize
      });
      set({
        threads: response.data,
        totalThreads: response.total,
        loadingThreads: false,
        selectedCategory: filter?.categoryId ?? get().selectedCategory
      });
    } catch (error) {
      set({ loadingThreads: false, error: error instanceof Error ? error.message : String(error) });
    }
  },
  async createThread(payload) {
    set({ loadingThreads: true, error: undefined });
    try {
      await mockApi.createThread(payload);
      await get().fetchThreads({ categoryId: payload.categoryId });
      set({ loadingThreads: false });
    } catch (error) {
      set({ loadingThreads: false, error: error instanceof Error ? error.message : String(error) });
    }
  }
}));
