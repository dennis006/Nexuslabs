export const formatRelativeTime = (dateIso: string) => {
  const now = new Date();
  const date = new Date(dateIso);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return "gerade eben";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} w`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo`;
  const years = Math.round(days / 365);
  return `${years} y`;
};

export const formatDateTime = (dateIso: string) =>
  new Date(dateIso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
