import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-10 text-center">
      <Ghost className="h-10 w-10 text-muted-foreground" />
      <div>
        <h3 className="text-lg font-semibold">{t("forum.emptyThreads.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("forum.emptyThreads.body")}</p>
      </div>
      <Button asChild>
        <Link to="/create">{t("forum.emptyThreads.cta")}</Link>
      </Button>
    </div>
  );
};

export default EmptyState;
