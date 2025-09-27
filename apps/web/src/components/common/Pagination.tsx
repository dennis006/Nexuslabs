import { Button } from "@/components/ui/button";

type RangeItem = number | "…";

function buildRange(page: number, total: number, siblings = 1, boundaries = 1): RangeItem[] {
  const start = Math.max(1, page - siblings);
  const end = Math.min(total, page + siblings);
  const items: RangeItem[] = [];

  for (let i = 1; i <= boundaries && i <= total; i += 1) {
    items.push(i);
  }
  if (start > boundaries + 1) {
    items.push("…");
  }
  for (let i = start; i <= end; i += 1) {
    if (i > boundaries && i <= total - boundaries) {
      items.push(i);
    }
  }
  if (end < total - boundaries) {
    items.push("…");
  }
  for (let i = Math.max(total - boundaries + 1, boundaries + 1); i <= total; i += 1) {
    if (i > 0) {
      items.push(i);
    }
  }

  return items.filter((value, index, array) => array.indexOf(value) === index);
}

export function Pagination({
  page,
  totalPages,
  onPageChange
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const clamp = (p: number) => Math.min(Math.max(p, 1), totalPages);
  const range = buildRange(page, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1 py-4"
      aria-label="Kommentare paginieren"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(clamp(page - 1))}
        disabled={page === 1}
        aria-label="Vorherige Seite"
      >
        «
      </Button>
      {range.map((item, index) =>
        item === "…" ? (
          <span key={`dots_${index}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={`p_${item}`}
            variant={item === page ? "default" : "ghost"}
            className="min-w-9"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(clamp(page + 1))}
        disabled={page === totalPages}
        aria-label="Nächste Seite"
      >
        »
      </Button>
    </nav>
  );
}
