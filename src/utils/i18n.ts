import { defaultLocale, isLocale, type Locale } from "../i18n/locales";

export const assertLocale = (value: string | undefined): Locale => {
  const candidate = value ?? defaultLocale;
  if (!isLocale(candidate)) {
    throw new Error(`Locale no soportado: ${candidate}`);
  }
  return candidate;
};

export const getLocaleFromPath = (pathname: string): Locale | null => {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || !isLocale(segment)) {
    return null;
  }
  return segment;
};

export const getPathSegmentsWithoutLocale = (pathname: string): string[] => {
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  if (locale && isLocale(locale)) {
    return segments.slice(1);
  }
  return segments;
};
