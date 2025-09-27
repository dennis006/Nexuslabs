import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { useForumStore } from "@/store/forumStore";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import ThreadItem from "@/components/forum/ThreadItem";
import EmptyState from "@/components/forum/EmptyState";
import { ChevronDown } from "lucide-react";

const sortOptions = [
  { value: "new", label: "Neueste" },
  { value: "oldest", label: "Älteste" },
  { value: "hottest", label: "Meiste Antworten" },
  { value: "active", label: "Aktiv" }
] as const;

const Category = () => {
  const { categoryId } = useParams();
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>("new");
  const { categories, threads, loadingThreads, error, fetchCategories, fetchThreads } = useForumStore();

  const category = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);

  useEffect(() => {
    if (!categories.length) void fetchCategories();
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (categoryId) void fetchThreads({ categoryId, sort });
  }, [categoryId, sort, fetchThreads]);

  if (!categoryId) return null;

  return (
    <PageTransition>
      <div className="space-y-6">
        <header className="rounded-3xl border border-border/60 bg-card/70 p-6">
          {category ? (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{category.name}</h1>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          ) : (
            <LoadingSkeleton />
          )}
        </header>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{threads.length} Threads</p>
          <div className="relative">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="appearance-none rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {loadingThreads && threads.length === 0 ? (
          <LoadingSkeleton />
        ) : error && threads.length === 0 ? (
          <ErrorState message={error} onRetry={() => fetchThreads({ categoryId, sort })} />
        ) : threads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Category;
