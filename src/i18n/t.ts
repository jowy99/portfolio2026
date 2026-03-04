import { defaultLocale, type Locale } from "./locales";
import { strings, type TranslationKey } from "./strings";

const missingWarnings = new Set<string>();

const getTranslationRaw = (lang: Locale, key: TranslationKey): unknown => {
  const value = strings[lang]?.[key];
  if (value !== undefined) return value;

  const fallback = strings[defaultLocale][key];
  if (import.meta.env.DEV) {
    const warningKey = `${lang}:${String(key)}`;
    if (!missingWarnings.has(warningKey)) {
      missingWarnings.add(warningKey);
      console.warn(`[i18n] Missing key "${String(key)}" for locale "${lang}", falling back to "${defaultLocale}".`);
    }
  }
  return fallback;
};

export const t = (lang: Locale, key: TranslationKey): string => {
  const value = getTranslationRaw(lang, key);
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value.join(", ");
  return key;
};

export const tList = (lang: Locale, key: TranslationKey): string[] => {
  const value = getTranslationRaw(lang, key);
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  if (typeof value === "string" && value.length > 0) return [value];
  return [key];
};

export const tValue = <T = unknown>(lang: Locale, key: TranslationKey): T | undefined => {
  return getTranslationRaw(lang, key) as T | undefined;
};
