import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
}

const SearchBar = ({
  placeholder,
  className,
  inputClassName,
  "aria-label": ariaLabel,
  ...props
}: SearchBarProps) => {
  const { t } = useTranslation();
  const effectivePlaceholder = placeholder ?? t("search.placeholder");
  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        placeholder={effectivePlaceholder}
        aria-label={ariaLabel ?? effectivePlaceholder}
        className={cn("pl-9", inputClassName)}
      />
    </div>
  );
};

export default SearchBar;
