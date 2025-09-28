import type { Language } from "@/lib/i18n/translations";

const LABELS: Record<Language, {
  justNow: string;
  minute: string;
  hour: string;
  day: string;
  week: string;
  month: string;
  year: string;
}> = {
  de: {
    justNow: "gerade eben",
    minute: "min",
    hour: "h",
    day: "d",
    week: "w",
    month: "mo",
    year: "y"
  },
  en: {
    justNow: "just now",
    minute: "min",
    hour: "h",
    day: "d",
    week: "w",
    month: "mo",
    year: "y"
  }
};

export const formatRelativeTime = (dateIso: string, language: Language = "de") => {
  const now = new Date();
  const date = new Date(dateIso);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.round(diff / 1000);
  const labels = LABELS[language];
  if (seconds < 60) return labels.justNow;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} ${labels.minute}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${labels.hour}`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ${labels.day}`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} ${labels.week}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} ${labels.month}`;
  const years = Math.round(days / 365);
  return `${years} ${labels.year}`;
};

export const formatDateTime = (dateIso: string, locale: string = "de-DE") =>
  new Date(dateIso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  });
