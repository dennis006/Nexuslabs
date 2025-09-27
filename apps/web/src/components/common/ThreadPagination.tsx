import { Pagination } from "@/components/common/Pagination";

type ThreadPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  placement?: "top" | "bottom";
  show?: boolean;
};

export function ThreadPagination({
  page,
  totalPages,
  onPageChange,
  placement = "bottom",
  show = true
}: ThreadPaginationProps) {
  if (!show || totalPages <= 1) {
    return null;
  }

  return (
    <div className={placement === "top" ? "mb-3 md:mb-4" : "mt-4 md:mt-6"}>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
