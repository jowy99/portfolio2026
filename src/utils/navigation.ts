import type { Locale } from "../i18n/locales";
import type { TranslationKey } from "../i18n/strings";
import { getPathSegmentsWithoutLocale } from "./i18n";

export type BackLinkDefinition = {
  href: string;
  labelKey: TranslationKey;
  ariaLabelKey?: TranslationKey;
};

type LocalizedPathOptions = {
  hash?: string;
};

export const buildLocalizedPath = (
  lang: Locale,
  segments: string[] = [],
  options: LocalizedPathOptions = {},
): string => {
  const normalizedSegments = segments.map((segment) => segment.trim()).filter(Boolean);
  const hash = options.hash ? `#${options.hash.replace(/^#/, "")}` : "";

  return `/${lang}${normalizedSegments.length ? `/${normalizedSegments.join("/")}` : ""}${hash}`;
};

const HOME_BACK_LINK: Pick<BackLinkDefinition, "labelKey" | "ariaLabelKey"> = {
  labelKey: "back.toHome",
  ariaLabelKey: "back.toHomeAria",
};

const PROJECTS_BACK_LINK: Pick<BackLinkDefinition, "labelKey" | "ariaLabelKey"> = {
  labelKey: "back.toProjects",
  ariaLabelKey: "back.toProjectsAria",
};

export const resolveBackLink = (lang: Locale, pathname: string): BackLinkDefinition | null => {
  const segments = getPathSegmentsWithoutLocale(pathname);

  if (segments.length === 0) {
    return null;
  }

  const [section, ...rest] = segments;

  if (section === "projects") {
    if (rest.length > 0) {
      return {
        href: buildLocalizedPath(lang, ["projects"]),
        ...PROJECTS_BACK_LINK,
      };
    }

    return {
      href: buildLocalizedPath(lang),
      ...HOME_BACK_LINK,
    };
  }

  return {
    href: buildLocalizedPath(lang),
    ...HOME_BACK_LINK,
  };
};
