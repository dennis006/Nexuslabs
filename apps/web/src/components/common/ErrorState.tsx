import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
      <AlertTriangle className="h-6 w-6" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry} className="text-destructive">
          {t("error.retry")}
        </Button>
      ) : null}
    </div>
  );
};

export default ErrorState;
