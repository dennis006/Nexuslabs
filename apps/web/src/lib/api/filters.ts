import type { ThreadWithMeta } from "./types";

export const sortThreads = (
  threads: ThreadWithMeta[],
  sort: "new" | "top" | "active" | "unread" | "hottest" | "oldest" = "new"
) => {
  const sorted = [...threads];
  switch (sort) {
    case "new":
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "top":
      sorted.sort((a, b) => b.views + b.replies * 5 - (a.views + a.replies * 5));
      break;
    case "active":
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case "unread":
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case "hottest":
      sorted.sort((a, b) => b.replies - a.replies);
      break;
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    default:
      break;
  }
  return sorted;
};
