import { create } from "zustand";
import { mockApi } from "@/lib/api/mockApi";
import type {
  Category,
  CategoryFilter,
  PaginatedResponse,
  ThreadFilter,
  ThreadWithMeta
} from "@/lib/api/types";

interface CategoryQueryState {
  q: string;
  sort: NonNullable<CategoryFilter["sort"]>;
  onlyNew: boolean;
  tag?: string;
  page: number;
  pageSize: number;
}

interface ForumState {
  categories: Category[];
  categoryTags: string[];
  categoryFilters: CategoryQueryState;
  hasMoreCategories: boolean;
  totalCategories: number;
  threads: ThreadWithMeta[];
  totalThreads: number;
  loadingCategories: boolean;
  loadingMoreCategories: boolean;
  loadingThreads: boolean;
  error?: string;
  selectedCategory?: string;
  fetchCategories: (
    filters?: CategoryFilter & {
      append?: boolean;
    }
  ) => Promise<void>;
  fetchThreads: (filter?: ThreadFilter) => Promise<void>;
  createThread: (
    payload: Pick<ThreadWithMeta, "categoryId" | "title" | "tags"> & { body: string; authorId: string }
  ) => Promise<void>;
}

const dedupeCategories = (items: Category[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

const defaultCategoryFilters: CategoryQueryState = {
  q: "",
  sort: "name",
  onlyNew: false,
  tag: undefined,
  page: 1,
  pageSize: 12
};

export const useForumStore = create<ForumState>((set, get) => ({
  categories: [],
  categoryTags: mockApi.getCategoryGenres(),
  categoryFilters: { ...defaultCategoryFilters },
  hasMoreCategories: false,
  totalCategories: 0,
  threads: [],
  totalThreads: 0,
  loadingCategories: false,
  loadingMoreCategories: false,
  loadingThreads: false,
  selectedCategory: undefined,
  async fetchCategories(filters) {
    const append = filters?.append ?? false;
    const currentFilters = get().categoryFilters;
    const nextFilters: CategoryQueryState = {
      q: filters?.q ?? currentFilters.q,
      sort: filters?.sort ?? currentFilters.sort,
      onlyNew: filters?.onlyNew ?? currentFilters.onlyNew,
      tag: filters?.tag !== undefined ? filters.tag : currentFilters.tag,
      page: append ? filters?.page ?? currentFilters.page + 1 : filters?.page ?? 1,
      pageSize: filters?.pageSize ?? currentFilters.pageSize
    };

    set({
      loadingCategories: !append,
      loadingMoreCategories: append,
      error: undefined
    });

    try {
      const response = await mockApi.getCategories(nextFilters);
      set((state) => {
        const merged = append ? dedupeCategories([...state.categories, ...response.data]) : response.data;
        const hasMore = response.page * response.pageSize < response.total;
        return {
          categories: merged,
          categoryFilters: nextFilters,
          hasMoreCategories: hasMore,
          totalCategories: response.total,
          loadingCategories: false,
          loadingMoreCategories: false,
          error: undefined
        };
      });
    } catch (error) {
      set({
        loadingCategories: false,
        loadingMoreCategories: false,
        error: error instanceof Error ? error.message : String(error)
      });
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
