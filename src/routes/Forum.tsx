import { useEffect } from "react";
import { useForumStore } from "@/store/forumStore";
import { useUiStore } from "@/store/uiStore";
import PageTransition from "@/components/layout/PageTransition";
import TabsBar from "@/components/forum/TabsBar";
import CategoryCard from "@/components/forum/CategoryCard";
import ThreadItem from "@/components/forum/ThreadItem";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/forum/EmptyState";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Forum = () => {
  const navigate = useNavigate();
  const activeTab = useUiStore((state) => state.activeTab);
  const { categories, threads, loadingCategories, loadingThreads, error, fetchCategories, fetchThreads } = useForumStore();

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchThreads({ sort: activeTab });
  }, [fetchThreads, activeTab]);

  const density = useUiStore((state) => state.density);

  return (
    <PageTransition>
      <div className="space-y-6 md:space-y-8 data-[density=compact]:space-y-4 md:data-[density=compact]:space-y-5" data-density={density}>
        <div
          className="mx-auto w-full max-w-[1040px] rounded-3xl border border-border/60 bg-background/60 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] supports-[backdrop-filter]:bg-background/70 md:p-6 2xl:p-7 data-[density=compact]:p-4 md:data-[density=compact]:p-5"
          data-density={density}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between data-[density=compact]:gap-4" data-density={density}>
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

        <section className="space-y-5 data-[density=compact]:space-y-4" data-density={density}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kategorien</h2>
          {loadingCategories && categories.length === 0 ? (
            <LoadingSkeleton />
          ) : error && categories.length === 0 ? (
            <ErrorState message={error} onRetry={() => fetchCategories()} />
          ) : (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6 2xl:gap-7 data-[density=compact]:gap-4"
              data-density={density}
            >
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5 data-[density=compact]:space-y-4" data-density={density}>
          <TabsBar onChange={(value) => fetchThreads({ sort: value as typeof activeTab })} />
          {loadingThreads && threads.length === 0 ? (
            <LoadingSkeleton />
          ) : error && threads.length === 0 ? (
            <ErrorState message={error} onRetry={() => fetchThreads({ sort: activeTab })} />
          ) : threads.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              className="flex flex-col divide-y divide-border/60 space-y-4 rounded-3xl border border-border/60 bg-background/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] supports-[backdrop-filter]:bg-background/70 md:space-y-5 2xl:space-y-6 data-[density=compact]:space-y-3 md:data-[density=compact]:space-y-4"
              data-density={density}
            >
              {threads.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Forum;
