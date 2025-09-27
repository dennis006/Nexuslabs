import { useCallback, useEffect, useMemo, useState } from "react";
import { useForumStore } from "@/store/forumStore";
import { useUiStore } from "@/store/uiStore";
import PageTransition from "@/components/layout/PageTransition";
import TabsBar from "@/components/forum/TabsBar";
import ThreadItem from "@/components/forum/ThreadItem";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/forum/EmptyState";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/common/SearchBar";
import { MessageSquarePlus } from "lucide-react";
import { Loader2, ChevronDown, Check, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import type { CategoryFilter } from "@/lib/api/types";
import SidebarLeftStats from "@/components/layout/SidebarLeftStats";
import SidebarRightTrends from "@/components/layout/SidebarRightTrends";
import CategorySection from "@/components/forum/CategorySection";

const CATEGORY_SORT_OPTIONS: Array<{ value: NonNullable<CategoryFilter["sort"]>; label: string }> = [
  { value: "name", label: "Name A–Z" },
  { value: "threads", label: "Meiste Threads" },
  { value: "posts", label: "Meiste Posts" },
  { value: "new", label: "Neu hinzugefügt" }
];

const Forum = () => {
  const navigate = useNavigate();
  const activeTab = useUiStore((state) => state.activeTab);
  const {
    categories,
    categoryFilters,
    categoryTags,
    totalCategories,
    hasMoreCategories,
    threads,
    loadingCategories,
    loadingMoreCategories,
    loadingThreads,
    error,
    fetchCategories,
    fetchThreads
  } = useForumStore((state) => ({
    categories: state.categories,
    categoryFilters: state.categoryFilters,
    categoryTags: state.categoryTags,
    totalCategories: state.totalCategories,
    hasMoreCategories: state.hasMoreCategories,
    threads: state.threads,
    loadingCategories: state.loadingCategories,
    loadingMoreCategories: state.loadingMoreCategories,
    loadingThreads: state.loadingThreads,
    error: state.error,
    fetchCategories: state.fetchCategories,
    fetchThreads: state.fetchThreads
  }));

  const [searchTerm, setSearchTerm] = useState(categoryFilters.q);

  useEffect(() => {
    setSearchTerm(categoryFilters.q);
  }, [categoryFilters.q]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (searchTerm === categoryFilters.q) {
      return;
    }

    const timeout = setTimeout(() => {
      void fetchCategories({ q: searchTerm, page: 1 });
    }, 280);

    return () => clearTimeout(timeout);
  }, [searchTerm, categoryFilters.q, fetchCategories]);

  const handleSortChange = useCallback(
    (value: NonNullable<CategoryFilter["sort"]>) => {
      if (value === categoryFilters.sort) {
        return;
      }
      void fetchCategories({ sort: value, page: 1 });
    },
    [categoryFilters.sort, fetchCategories]
  );

  const handleToggleOnlyNew = useCallback(() => {
    void fetchCategories({ onlyNew: !categoryFilters.onlyNew, page: 1 });
  }, [categoryFilters.onlyNew, fetchCategories]);

  const handleTagSelect = useCallback(
    (tag?: string) => {
      if (tag === categoryFilters.tag) {
        return;
      }
      void fetchCategories({ tag, page: 1 });
    },
    [categoryFilters.tag, fetchCategories]
  );

  const handleLoadMoreCategories = useCallback(() => {
    void fetchCategories({ append: true });
  }, [fetchCategories]);

  const activeSortLabel = useMemo(
    () => CATEGORY_SORT_OPTIONS.find((option) => option.value === categoryFilters.sort)?.label ?? "Sortierung",
    [categoryFilters.sort]
  );

  const activeTagLabel = categoryFilters.tag ?? "Alle Genres/Tags";
  const remainingCategories = Math.max(totalCategories - categories.length, 0);
  const isInitialCategoryLoading = loadingCategories && categories.length === 0;
  const categoryError = error && categories.length === 0;
  const isCategoryEmpty = !loadingCategories && categories.length === 0 && !error;

  useEffect(() => {
    void fetchThreads({ sort: activeTab });
  }, [fetchThreads, activeTab]);

  const density = useUiStore((state) => state.density);

  return (
    <PageTransition>
      <div className="min-h-screen" data-density={density}>
        <main className="mx-auto max-w-[1600px] 2xl:max-w-[1720px] px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_360px] gap-6 xl:gap-8 2xl:gap-10 items-start">
            <aside className="hidden lg:block sticky top-24 space-y-4">
              <SidebarLeftStats />
            </aside>

            <section className="mx-auto w-full max-w-[1120px] 2xl:max-w-[1240px] space-y-8">
              <div
                className="space-y-6 md:space-y-8 data-[density=compact]:space-y-4 md:data-[density=compact]:space-y-5"
                data-density={density}
              >
                <div
                  className="rounded-3xl border border-border/60 bg-background/60 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] supports-[backdrop-filter]:bg-background/70 md:p-6 2xl:p-7 data-[density=compact]:p-4 md:data-[density=compact]:p-5"
                  data-density={density}
                >
                  <div
                    className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between data-[density=compact]:gap-4"
                    data-density={density}
                  >
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-tight">Forum Übersicht</h1>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Was passiert gerade in der NexusLabs Community?
                      </p>
                    </div>
                    <Button size="lg" onClick={() => navigate("/create")} className="self-start md:self-auto">
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      Neuer Thread
                    </Button>
                  </div>
                </div>
              </div>

              <section
                className="space-y-6 md:space-y-8 data-[density=compact]:space-y-4 md:data-[density=compact]:space-y-5"
                data-density={density}
              >
                <header className="sticky top-20 z-20 rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:p-5 md:p-6 2xl:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-2 sm:max-w-md">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategorien</span>
                      <SearchBar
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Suche Kategorien/Subkategorien…"
                        className="w-full"
                        inputClassName="h-10 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full px-4 text-xs font-medium"
                          >
                            <span className="mr-2 inline-flex items-center gap-1">
                              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                              {activeSortLabel}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[12rem]">
                          <DropdownMenuLabel>Sortieren nach</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {CATEGORY_SORT_OPTIONS.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onSelect={() => handleSortChange(option.value)}
                              className={cn(
                                "flex items-center justify-between gap-4 text-sm",
                                categoryFilters.sort === option.value ? "text-primary" : undefined
                              )}
                            >
                              {option.label}
                              {categoryFilters.sort === option.value ? (
                                <Check className="h-4 w-4" aria-hidden="true" />
                              ) : null}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full px-4 text-xs font-medium"
                          >
                            <span className="mr-2">{activeTagLabel}</span>
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[12rem]">
                          <DropdownMenuLabel>Genre / Tag</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleTagSelect(undefined)}
                            className={cn(
                              "flex items-center justify-between gap-4 text-sm",
                              !categoryFilters.tag ? "text-primary" : undefined
                            )}
                          >
                            Alle Genres/Tags
                            {!categoryFilters.tag ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                          </DropdownMenuItem>
                          {categoryTags.map((tag) => (
                            <DropdownMenuItem
                              key={tag}
                              onSelect={() => handleTagSelect(tag)}
                              className={cn(
                                "flex items-center justify-between gap-4 text-sm",
                                categoryFilters.tag === tag ? "text-primary" : undefined
                              )}
                            >
                              {tag}
                              {categoryFilters.tag === tag ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToggleOnlyNew}
                        aria-pressed={categoryFilters.onlyNew}
                        className={cn(
                          "h-9 rounded-full px-4 text-xs font-medium transition-colors",
                          categoryFilters.onlyNew
                            ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Nur mit neuen Beiträgen
                      </Button>
                    </div>
                  </div>
                </header>

                <div className="space-y-6 md:space-y-8">
                  {isInitialCategoryLoading ? (
                    <LoadingSkeleton />
                  ) : categoryError ? (
                    <ErrorState
                      message={error ?? "Es ist ein Fehler aufgetreten."}
                      onRetry={() => fetchCategories()}
                    />
                  ) : isCategoryEmpty ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-10 text-center text-sm text-muted-foreground">
                      Keine Kategorien gefunden. Versuche es mit anderen Filtern.
                    </div>
                  ) : (
                    <>
                      <CategorySection categories={categories} />

                      {hasMoreCategories ? (
                        <div className="mt-6 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full px-6"
                            disabled={loadingMoreCategories}
                            onClick={handleLoadMoreCategories}
                          >
                            {loadingMoreCategories ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                Lädt weitere Kategorien…
                              </>
                            ) : remainingCategories > 0 ? (
                              `Mehr laden (${remainingCategories})`
                            ) : (
                              "Mehr laden"
                            )}
                          </Button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </section>

              <section
                className="space-y-6 md:space-y-8 data-[density=compact]:space-y-4 md:data-[density=compact]:space-y-5"
                data-density={density}
              >
                <TabsBar onChange={(value) => fetchThreads({ sort: value as typeof activeTab })} />
                {loadingThreads && threads.length === 0 ? (
                  <LoadingSkeleton />
                ) : error && threads.length === 0 ? (
                  <ErrorState message={error} onRetry={() => fetchThreads({ sort: activeTab })} />
                ) : threads.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    className="flex flex-col divide-y divide-border/60 space-y-6 rounded-3xl border border-border/60 bg-background/60 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] supports-[backdrop-filter]:bg-background/70 md:space-y-7 md:p-6 2xl:space-y-8 2xl:p-7 data-[density=compact]:space-y-4 md:data-[density=compact]:space-y-5"
                    data-density={density}
                  >
                    {threads.map((thread) => (
                      <ThreadItem key={thread.id} thread={thread} />
                    ))}
                  </div>
                )}
              </section>
            </section>

            <aside className="hidden xl:block sticky top-24 space-y-4 w-[360px]">
              <SidebarRightTrends />
            </aside>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Forum;
