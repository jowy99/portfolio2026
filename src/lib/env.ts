const DEFAULT_SUBJECT_PREFIX = "[Portfolio]";
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_MIN_SUBMIT_MS = 3000;
const DEFAULT_SMTP_TIMEOUT_MS = 10_000;

type NumericEnvConfig = {
  key: string;
  fallback: number;
  min: number;
  max: number;
};

type RuntimeEnv = {
  gmailUser?: string;
  gmailAppPassword?: string;
  contactTo?: string;
  subjectPrefix: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  minSubmitMs: number;
  smtpTimeoutMs: number;
};

export type ServerEnv = RuntimeEnv & {
  gmailUser: string;
  gmailAppPassword: string;
};

let cachedEnv: RuntimeEnv | null = null;

const ensureServerRuntime = (): void => {
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error("[contact] Environment variables are only available on the server runtime.");
  }
};

const readEnv = (key: string): string => {
  const value = process.env[key];
  if (typeof value !== "string") return "";
  return value.trim();
};

const readNumberEnv = ({ key, fallback, min, max }: NumericEnvConfig): number => {
  const raw = readEnv(key);
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

export const getContactRuntimeEnv = (): RuntimeEnv => {
  if (cachedEnv) return cachedEnv;

  ensureServerRuntime();

  const gmailUser = readEnv("GMAIL_USER");
  const gmailAppPassword = readEnv("GMAIL_APP_PASSWORD");
  const subjectPrefix = readEnv("CONTACT_SUBJECT_PREFIX") || DEFAULT_SUBJECT_PREFIX;
  const contactTo = readEnv("CONTACT_TO");

  cachedEnv = {
    gmailUser: gmailUser || undefined,
    gmailAppPassword: gmailAppPassword || undefined,
    contactTo: contactTo || undefined,
    subjectPrefix,
    rateLimitWindowMs: readNumberEnv({
      key: "CONTACT_RATE_LIMIT_WINDOW_MS",
      fallback: DEFAULT_RATE_LIMIT_WINDOW_MS,
      min: 1000,
      max: 60 * 60 * 1000,
    }),
    rateLimitMax: readNumberEnv({
      key: "CONTACT_RATE_LIMIT_MAX",
      fallback: DEFAULT_RATE_LIMIT_MAX,
      min: 1,
      max: 50,
    }),
    minSubmitMs: readNumberEnv({
      key: "CONTACT_MIN_SUBMIT_MS",
      fallback: DEFAULT_MIN_SUBMIT_MS,
      min: 500,
      max: 120_000,
    }),
    smtpTimeoutMs: readNumberEnv({
      key: "CONTACT_SMTP_TIMEOUT_MS",
      fallback: DEFAULT_SMTP_TIMEOUT_MS,
      min: 3000,
      max: 30_000,
    }),
  };

  return cachedEnv;
};

export const getServerEnv = (): ServerEnv => {
  const runtimeEnv = getContactRuntimeEnv();
  const missingRequired = [
    !runtimeEnv.gmailUser ? "GMAIL_USER" : null,
    !runtimeEnv.gmailAppPassword ? "GMAIL_APP_PASSWORD" : null,
  ].filter((key): key is string => Boolean(key));

  if (missingRequired.length > 0) {
    throw new Error(`[contact] Missing required environment variables: ${missingRequired.join(", ")}.`);
  }

  return {
    ...runtimeEnv,
    gmailUser: runtimeEnv.gmailUser,
    gmailAppPassword: runtimeEnv.gmailAppPassword,
  };
};
