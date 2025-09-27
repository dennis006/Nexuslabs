import { useEffect, useState } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { useForumStore } from "@/store/forumStore";
import Composer from "@/components/forum/Composer";
import { SelectArrowIcon } from "@radix-ui/react-select";
import type { Category } from "@/lib/api/types";
import { toast } from "sonner";

const CreatePost = () => {
  const { categories, fetchCategories, createThread } = useForumStore();
  const [category, setCategory] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!categories.length) void fetchCategories();
  }, [categories.length, fetchCategories]);

  const handleSubmit = async ({ title, body }: { title?: string; body: string }) => {
    if (!title || !category) {
      toast.error("Bitte Kategorie und Titel wählen");
      return;
    }
    try {
      setSubmitting(true);
      await createThread({
        categoryId: category,
        title,
        tags: ["Community"],
        body,
        authorId: "user-1"
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
            <label className="text-sm font-medium text-muted-foreground" htmlFor="category">
              Kategorie
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-md border border-border/60 bg-background/60 px-4 py-2 text-sm"
              >
                <option value="">Kategorie wählen</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <SelectArrowIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <Composer onSubmit={handleSubmit} variant="thread" isSubmitting={submitting} />
        </div>
      </div>
    </PageTransition>
  );
};

export default CreatePost;
