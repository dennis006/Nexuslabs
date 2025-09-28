import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface ComposerProps {
  onSubmit: (payload: { title?: string; body: string }) => Promise<void> | void;
  variant?: "thread" | "reply";
  isSubmitting?: boolean;
}

const Composer = ({ onSubmit, variant = "reply", isSubmitting }: ComposerProps) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) return;
    await onSubmit({ title: variant === "thread" ? title.trim() : undefined, body: body.trim() });
    setBody("");
    if (variant === "thread") setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5">
      {variant === "thread" && (
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("composer.title.placeholder")}
          required
        />
      )}
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={
          variant === "thread" ? t("composer.body.placeholder") : t("composer.reply.placeholder")
        }
        rows={variant === "thread" ? 6 : 4}
        required
      />
      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isSubmitting || !body.trim()}>
          {isSubmitting
            ? t("composer.saving")
            : variant === "thread"
              ? t("composer.threadSubmit")
              : t("composer.replySubmit")}
        </Button>
      </div>
    </form>
  );
};

export default Composer;
