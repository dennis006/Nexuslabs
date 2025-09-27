import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { useForumStore } from "@/store/forumStore";
import Composer from "@/components/forum/Composer";
import type { Category } from "@/lib/api/types";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";

const CreatePost = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, fetchCategories, createThread } = useForumStore();
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryId ?? undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!categories.length) void fetchCategories();
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    if (!categoryId) {
      navigate("/forum", { replace: true });
    } else {
      setSelectedCategory(categoryId);
    }
  }, [categoryId, navigate]);

  const activeCategory = useMemo(
    () => categories.find((cat: Category) => cat.id === (selectedCategory ?? categoryId)),
    [categories, selectedCategory, categoryId]
  );

  const handleSubmit = async ({ title, body }: { title?: string; body: string }) => {
    const targetCategory = selectedCategory ?? categoryId;
    if (!user) {
      toast.error("Bitte logge dich ein.");
      return;
    }
    if (!title || !targetCategory) {
      toast.error("Bitte Kategorie und Titel wählen");
      return;
    }
    try {
      setSubmitting(true);
      await createThread({
        categoryId: targetCategory,
        title,
        tags: ["Community"],
        body,
        authorId: user.id
      });
      toast.success("Thread veröffentlicht");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler beim Erstellen");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <header className="rounded-3xl border border-border/60 bg-card/70 p-6">
          <h1 className="text-2xl font-bold">Neuen Thread erstellen</h1>
          <p className="text-sm text-muted-foreground">Teile deine Insights mit der Community.</p>
        </header>
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card/70 p-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Kategorie</span>
            {isAdmin ? (
              <div className="relative">
                <select
                  value={selectedCategory ?? ""}
                  onChange={(event) => setSelectedCategory(event.target.value || undefined)}
                  className="w-full appearance-none rounded-md border border-border/60 bg-background/60 px-4 py-2 text-sm"
                >
                  <option value="">Kategorie wählen</option>
                  {categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm">
                {activeCategory ? activeCategory.name : "Kategorie wird geladen…"}
              </div>
            )}
          </div>
          <Composer onSubmit={handleSubmit} variant="thread" isSubmitting={submitting} />
        </div>
      </div>
    </PageTransition>
  );
};

export default CreatePost;
