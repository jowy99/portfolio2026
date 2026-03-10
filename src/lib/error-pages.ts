import type { TranslationKey } from "../i18n/strings";

export const ERROR_CODES = [400, 401, 403, 404, 405, 408, 429, 500, 502, 503, 504] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
export type ErrorAction = "home" | "retry" | "back" | "projects" | "contact";

type ErrorPageConfigMap = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  primaryAction: Extract<ErrorAction, "home" | "retry">;
  secondaryAction?: Exclude<ErrorAction, "retry">;
};

const ERROR_PAGE_CONFIG: Record<ErrorCode, ErrorPageConfigMap> = {
  400: {
    titleKey: "error.400.title",
    descriptionKey: "error.400.description",
    primaryAction: "home",
    secondaryAction: "back",
  },
  401: {
    titleKey: "error.401.title",
    descriptionKey: "error.401.description",
    primaryAction: "home",
    secondaryAction: "contact",
  },
  403: {
    titleKey: "error.403.title",
    descriptionKey: "error.403.description",
    primaryAction: "home",
    secondaryAction: "contact",
  },
  404: {
    titleKey: "error.404.title",
    descriptionKey: "error.404.description",
    primaryAction: "home",
    secondaryAction: "projects",
  },
  405: {
    titleKey: "error.405.title",
    descriptionKey: "error.405.description",
    primaryAction: "home",
    secondaryAction: "back",
  },
  408: {
    titleKey: "error.408.title",
    descriptionKey: "error.408.description",
    primaryAction: "retry",
    secondaryAction: "home",
  },
  429: {
    titleKey: "error.429.title",
    descriptionKey: "error.429.description",
    primaryAction: "retry",
    secondaryAction: "home",
  },
  500: {
    titleKey: "error.500.title",
    descriptionKey: "error.500.description",
    primaryAction: "retry",
    secondaryAction: "home",
  },
  502: {
    titleKey: "error.502.title",
    descriptionKey: "error.502.description",
    primaryAction: "retry",
    secondaryAction: "home",
  },
  503: {
    titleKey: "error.503.title",
    descriptionKey: "error.503.description",
    primaryAction: "retry",
    secondaryAction: "contact",
  },
  504: {
    titleKey: "error.504.title",
    descriptionKey: "error.504.description",
    primaryAction: "retry",
    secondaryAction: "home",
  },
};

export type ErrorPageConfig = ErrorPageConfigMap & {
  code: ErrorCode;
};

export const isErrorCode = (value: number): value is ErrorCode => {
  return ERROR_CODES.includes(value as ErrorCode);
};

export const parseErrorCode = (value: string | undefined): ErrorCode | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return isErrorCode(parsed) ? parsed : null;
};

export const getErrorPageConfig = (code: ErrorCode): ErrorPageConfig => {
  return {
    code,
    ...ERROR_PAGE_CONFIG[code],
  };
};
