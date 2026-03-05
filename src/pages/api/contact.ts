import type { APIRoute } from "astro";

import { sendContactEmail } from "../../lib/email";
import { getContactRuntimeEnv, getServerEnv } from "../../lib/env";
import { checkRateLimit } from "../../lib/rateLimit";

export const prerender = false;

type ApiSuccess = { ok: true };
type ApiErrorCode =
  | "invalid_input"
  | "invalid_name"
  | "invalid_email"
  | "invalid_message"
  | "rate_limited"
  | "service_unavailable"
  | "send_failed";
type ApiError = { ok: false; error: ApiErrorCode };

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  company: string;
  formStartedAt: string;
  lang: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

const json = (status: number, body: ApiSuccess | ApiError, headers: Record<string, string> = {}): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
};

const readString = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const parseFromJson = async (request: Request): Promise<ContactPayload | null> => {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return null;

    const record = body as Record<string, unknown>;
    return {
      name: readString(record.name),
      email: readString(record.email),
      message: readString(record.message),
      company: readString(record.company),
      formStartedAt: readString(record.form_started_at ?? record.formStartedAt),
      lang: readString(record.lang).slice(0, 8),
    };
  } catch {
    return null;
  }
};

const parseFromFormData = async (request: Request): Promise<ContactPayload | null> => {
  try {
    const formData = await request.formData();
    return {
      name: readString(formData.get("name")),
      email: readString(formData.get("email")),
      message: readString(formData.get("message")),
      company: readString(formData.get("company")),
      formStartedAt: readString(formData.get("form_started_at")),
      lang: readString(formData.get("lang")).slice(0, 8),
    };
  } catch {
    return null;
  }
};

const parseContactPayload = async (request: Request): Promise<ContactPayload | null> => {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json")) {
    return parseFromJson(request);
  }
  return parseFromFormData(request);
};

const getClientIp = (request: Request): string => {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = request.headers.get("x-real-ip")?.trim();
  return xRealIp || "unknown";
};

const isTooFastSubmission = (formStartedAtRaw: string, now: number, minSubmitMs: number): boolean => {
  if (!formStartedAtRaw) return false;

  const startedAt = Number.parseInt(formStartedAtRaw, 10);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return false;

  return now - startedAt < minSubmitMs;
};

const validateInput = (
  name: string,
  email: string,
  message: string,
): { ok: true } | { ok: false; error: Extract<ApiErrorCode, "invalid_name" | "invalid_email" | "invalid_message"> } => {
  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "invalid_name" };
  }

  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: "invalid_email" };
  }

  if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "invalid_message" };
  }

  return { ok: true };
};

export const POST: APIRoute = async ({ request }) => {
  const payload = await parseContactPayload(request);
  if (!payload) {
    return json(400, { ok: false, error: "invalid_input" });
  }

  const runtimeEnv = getContactRuntimeEnv();
  const now = Date.now();
  const name = payload.name;
  const email = payload.email.toLowerCase();
  const message = payload.message;
  const company = payload.company;

  // Honeypot: behave as success but do not send email.
  if (company.length > 0) {
    return json(200, { ok: true });
  }

  // Time-trap as an extra anti-spam signal.
  if (isTooFastSubmission(payload.formStartedAt, now, runtimeEnv.minSubmitMs)) {
    return json(200, { ok: true });
  }

  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, {
    windowMs: runtimeEnv.rateLimitWindowMs,
    maxRequests: runtimeEnv.rateLimitMax,
    now,
  });

  if (!rateLimit.ok) {
    return json(
      429,
      { ok: false, error: "rate_limited" },
      { "retry-after": String(rateLimit.retryAfterSeconds) },
    );
  }

  const validation = validateInput(name, email, message);
  if (!validation.ok) {
    return json(400, { ok: false, error: validation.error });
  }

  try {
    getServerEnv();
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "unknown";
    console.error("[contact] service_unavailable", errorName);
    return json(500, { ok: false, error: "service_unavailable" });
  }

  try {
    await sendContactEmail({
      name,
      email,
      message,
      lang: payload.lang,
      ip: clientIp,
      isoDate: new Date().toISOString(),
      userAgent: request.headers.get("user-agent")?.trim() ?? "",
    });

    return json(200, { ok: true });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "unknown";
    console.error("[contact] send_failed", errorName);
    return json(500, { ok: false, error: "send_failed" });
  }
};
