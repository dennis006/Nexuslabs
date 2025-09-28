import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import PostItem from "@/components/forum/PostItem";
import Composer from "@/components/forum/Composer";
import { mockApi } from "@/lib/api/mockApi";
import type { Post, ThreadWithMeta, User } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Flag } from "lucide-react";
import { ThreadPagination } from "@/components/common/ThreadPagination";
import { useThreadStore } from "@/store/threadStore";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const Thread = () => {
  const { threadId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const requestedPage = Number.isNaN(rawPageParam) ? 1 : Math.max(1, rawPageParam);

  const {
    posts,
    loading: postsLoading,
    page,
    pageSize,
    totalPages,
    totalCount,
    fetchPage,
    addPost,
    lastCreatedPostId
  } = useThreadStore((state) => ({
    posts: state.posts,
    loading: state.loading,
    page: state.page,
    pageSize: state.pageSize,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    fetchPage: state.fetchPage,
    addPost: state.addPost,
    lastCreatedPostId: state.lastCreatedPostId
  }));

  const [thread, setThread] = useState<ThreadWithMeta | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadError, setThreadError] = useState<string>();
  const [postsError, setPostsError] = useState<string>();
  const [hasFetchedPosts, setHasFetchedPosts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { t, locale, language } = useTranslation();

  const handlePageChange = useCallback(
    (next: number) => {
      setSearchParams({ page: String(next) });
    },
    [setSearchParams]
  );

  const loadThread = useCallback(async () => {
    if (!threadId) return;
    try {
      setLoading(true);
      const [threadData, userData] = await Promise.all([
        mockApi.getThreadById(threadId),
        mockApi.getUsers()
      ]);
      if (!threadData) throw new Error(t("forum.error.generic"));
      setThread(threadData);
      setUsers(userData);
      setThreadError(undefined);
    } catch (err) {
      setThreadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [threadId, t]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  useEffect(() => {
    return () => {
      useThreadStore.getState().reset();
    };
  }, []);

  useEffect(() => {
    if (!threadId) return;
    setPostsError(undefined);
    setHasFetchedPosts(false);
    fetchPage(threadId, requestedPage)
      .then(() => {
        setPostsError(undefined);
        setHasFetchedPosts(true);
      })
      .catch((err) => {
        setPostsError(err instanceof Error ? err.message : String(err));
        setHasFetchedPosts(true);
      });
  }, [threadId, requestedPage, fetchPage]);

  useEffect(() => {
    // URL-Sync: clamp invalid page parameters and reflect the current page in the query string
    if (!threadId) return;
    if (!hasFetchedPosts) return;
    const effectiveTotal = Math.max(totalPages, totalCount > 0 ? 1 : 0);
    if (effectiveTotal === 0) {
      if (requestedPage !== 1) {
        setSearchParams({ page: "1" }, { replace: true });
      }
      return;
    }
    const safePage = Math.min(Math.max(requestedPage, 1), totalPages || 1);
    if (safePage !== requestedPage || safePage !== page) {
      setSearchParams({ page: String(safePage) }, { replace: true });
    }
  }, [threadId, requestedPage, totalPages, totalCount, hasFetchedPosts, setSearchParams, page]);

  useEffect(() => {
    if (!lastCreatedPostId) return;
    const element = document.getElementById(`post-${lastCreatedPostId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [lastCreatedPostId]);

  const handleSubmit = async ({ body }: { body: string }) => {
    if (!threadId) return;
    const authorId = users[0]?.id ?? "user-1";
    try {
      setSubmitting(true);
      setPostsError(undefined);
      await addPost(threadId, body, authorId);
      const { page: lastPage } = useThreadStore.getState();
      setSearchParams({ page: String(Math.max(1, lastPage)) });
      setThread((prev) => {
        if (!prev) return prev;
        const created = useThreadStore.getState().posts.at(-1);
        return {
          ...prev,
          replies: prev.replies + 1,
          updatedAt: created?.createdAt ?? prev.updatedAt,
          lastPostAt: created?.createdAt ?? prev.lastPostAt,
          lastPosterId: authorId
        };
      });
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const retryPosts = useCallback(() => {
    if (!threadId) return;
    setHasFetchedPosts(false);
    fetchPage(threadId, requestedPage)
      .then(() => {
        setPostsError(undefined);
        setHasFetchedPosts(true);
      })
      .catch((err) => {
        setPostsError(err instanceof Error ? err.message : String(err));
        setHasFetchedPosts(true);
      });
  }, [threadId, requestedPage, fetchPage]);

  const participants = useMemo(() => {
    const ids = new Set(posts.map((post) => post.authorId));
    return users.filter((user) => ids.has(user.id)).slice(0, 6);
  }, [posts, users]);

  const offset = (page - 1) * pageSize;

  if (loading && !thread) return <LoadingSkeleton />;
  if (threadError) return <ErrorState message={threadError} onRetry={loadThread} />;
  if (!thread) return null;

  const showTopPagination = (totalPages ?? 0) >= 6;

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <header className="space-y-4 rounded-3xl border border-border/60 bg-card/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge variant="accent" className="uppercase">
                  {thread.tags?.[0] ?? t("thread.defaultTag")}
                </Badge>
                <h1 className="mt-2 text-3xl font-bold text-foreground">{thread.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("thread.started", {
                    author: thread.authorId,
                    time: formatRelativeTime(thread.createdAt, language)
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="mr-2 h-4 w-4" /> {t("thread.subscribe")}
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="mr-2 h-4 w-4" /> {t("thread.report")}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{t("thread.replies", { count: thread.replies.toLocaleString(locale) })}</span>
              <span>{t("thread.views", { count: thread.views.toLocaleString(locale) })}</span>
              <span>{t("thread.updated", { time: formatRelativeTime(thread.updatedAt, language) })}</span>
            </div>
          </header>

          <div className="space-y-6">
            <ThreadPagination
              page={page}
              totalPages={totalPages || 0}
              onPageChange={handlePageChange}
              placement="top"
              show={showTopPagination}
            />
            <div className="space-y-4">
              {postsLoading && !postsError ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`skeleton_${index}`}
                    className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5 md:p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
                        <div className="h-2 w-32 rounded-full bg-muted/80 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded-full bg-muted/80 animate-pulse" />
                      <div className="h-3 w-4/5 rounded-full bg-muted/70 animate-pulse" />
                      <div className="h-3 w-2/3 rounded-full bg-muted/60 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : postsError ? (
                <ErrorState message={postsError ?? t("forum.error.generic")} onRetry={retryPosts} />
              ) : totalCount === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center text-sm text-muted-foreground">
                  {t("thread.noReplies")}
                </div>
              ) : (
                posts.map((post: Post, index) => (
                  <div id={`post-${post.id}`} key={post.id}>
                    <PostItem
                      post={post}
                      author={users.find((user) => user.id === post.authorId)}
                      isOp={offset + index === 0}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <ThreadPagination
                page={page}
                totalPages={totalPages || 0}
                onPageChange={handlePageChange}
                placement="bottom"
                show={totalPages > 1}
              />
              <Composer onSubmit={handleSubmit} isSubmitting={submitting} />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("thread.participants")}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {participants.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("thread.similar")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>{t("thread.similar.first")}</li>
              <li>{t("thread.similar.second")}</li>
              <li>{t("thread.similar.third")}</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
};

export default Thread;
