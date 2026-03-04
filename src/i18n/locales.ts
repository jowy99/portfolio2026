export const locales = ["es", "en", "ca", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale);
};
