import { useCallback, useEffect, useState } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Chatbox from "@/components/chat/Chatbox";
import { Section } from "@/components/forumlist/Section";
import type { ForumSection } from "@/lib/api/types";
import { getForumBoard } from "@/lib/api/mockApi";

const Forums = () => {
  const [sections, setSections] = useState<ForumSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForumBoard();
      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forum board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 2xl:max-w-[1320px]">
        <div className="space-y-8 py-10 md:space-y-10">
          <header className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Forums</h1>
            <Button className="rounded-xl px-4 md:px-5" variant="default">
              Start new topic
            </Button>
          </header>

          <Chatbox />

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur"
                >
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:px-5">
                    <div className="flex items-center gap-3">
                      <span className="size-1.5 rounded-full bg-primary/60" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="space-y-4 p-4 md:p-6">
                    {Array.from({ length: 2 }).map((__, row) => (
                      <div key={`row-${row}`} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-56" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              <p className="font-medium">{error}</p>
              <Button variant="outline" className="mt-4 rounded-xl" onClick={() => loadBoard()}>
                Retry loading
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <Section key={section.id} section={section} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Forums;
