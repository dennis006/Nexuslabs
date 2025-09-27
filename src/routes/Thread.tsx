import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

const Thread = () => {
  const { threadId } = useParams();
  const [thread, setThread] = useState<ThreadWithMeta | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!threadId) return;
    try {
      setLoading(true);
      const [threadData, postData, userData] = await Promise.all([
        mockApi.getThreadById(threadId),
        mockApi.getPosts(threadId),
        mockApi.getUsers()
      ]);
      if (!threadData) throw new Error("Thread nicht gefunden");
      setThread(threadData);
      setPosts(postData);
      setUsers(userData);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async ({ body }: { body: string }) => {
    if (!threadId) return;
    try {
      setSubmitting(true);
      const newPost = await mockApi.createPost({ threadId, body, authorId: users[0]?.id ?? "user-1" });
      setPosts((prev) => [...prev, newPost]);
    } finally {
      setSubmitting(false);
    }
  };

  const participants = useMemo(() => {
    const ids = new Set(posts.map((post) => post.authorId));
    return users.filter((user) => ids.has(user.id)).slice(0, 6);
  }, [posts, users]);

  if (loading && !thread) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!thread) return null;

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <header className="space-y-4 rounded-3xl border border-border/60 bg-card/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge variant="accent" className="uppercase">
                  {thread.tags?.[0] ?? "Thread"}
                </Badge>
                <h1 className="mt-2 text-3xl font-bold text-foreground">{thread.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Gestartet von {thread.authorId} • {formatRelativeTime(thread.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="mr-2 h-4 w-4" /> Abonnieren
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="mr-2 h-4 w-4" /> Melden
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{thread.replies} Antworten</span>
              <span>{thread.views.toLocaleString("de-DE")} Aufrufe</span>
              <span>Aktualisiert {formatRelativeTime(thread.updatedAt)}</span>
            </div>
          </header>

          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostItem
                key={post.id}
                post={post}
                author={users.find((user) => user.id === post.authorId)}
                isOp={index === 0}
              />
            ))}
          </div>

          <Composer onSubmit={handleSubmit} isSubmitting={submitting} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Teilnehmer
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {participants.map((user) => (
                <div key={user.id} className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
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
              Ähnliche Threads
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Patch Notes Analyse 1.27</li>
              <li>Scrim Partner gesucht EU</li>
              <li>Controller vs. Maus – Meta Update</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
};

export default Thread;
