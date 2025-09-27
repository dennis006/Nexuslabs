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

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Forum Übersicht</h1>
            <p className="text-sm text-muted-foreground">Was passiert gerade in der NexusLabs Community?</p>
          </div>
          <Button size="lg" onClick={() => navigate("/create")}> 
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Neuer Thread
          </Button>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kategorien</h2>
          {loadingCategories && categories.length === 0 ? (
            <LoadingSkeleton />
          ) : error && categories.length === 0 ? (
            <ErrorState message={error} onRetry={() => fetchCategories()} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <TabsBar onChange={(value) => fetchThreads({ sort: value as typeof activeTab })} />
          {loadingThreads && threads.length === 0 ? (
            <LoadingSkeleton />
          ) : error && threads.length === 0 ? (
            <ErrorState message={error} onRetry={() => fetchThreads({ sort: activeTab })} />
          ) : threads.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
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
