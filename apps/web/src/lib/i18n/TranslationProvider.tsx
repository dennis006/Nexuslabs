import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "./translations";
import { useUiStore } from "@/store/uiStore";

interface TranslationContextValue {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

const LOCALES: Record<Language, string> = {
  de: "de-DE",
  en: "en-US"
};

const replaceParams = (template: string, params?: Record<string, string | number>) =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (!params) return match;
    const value = params[key as keyof typeof params];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);

  const value = useMemo<TranslationContextValue>(() => {
    const locale = LOCALES[language];
    const dictionary = translations[language];
    const t = (key: TranslationKey, params?: Record<string, string | number>) => {
      const template = dictionary[key] ?? translations.de[key] ?? key;
      return replaceParams(template, params);
    };
    return {
      language,
      locale,
      setLanguage,
      t
    };
  }, [language, setLanguage]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
