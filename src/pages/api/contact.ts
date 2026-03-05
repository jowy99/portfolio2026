import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

type ApiSuccess = { ok: true };
type ApiErrorCode = "invalid_input" | "rate_limited" | "service_unavailable" | "send_failed";
type ApiError = { ok: false; error: ApiErrorCode };

type RateBucket = {
  count: number;
  resetAt: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_BASE_URL = "http://localhost";
const DEFAULT_REDIRECT = "/es/#contact";
const DEFAULT_TO_EMAIL = "joelarnaudcarreras@gmail.com";
const DEFAULT_FROM_EMAIL = "Joël Arnaud Portfolio <onboarding@resend.dev>";
const DEFAULT_SUBJECT_PREFIX = "[Portfolio]";
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_MIN_FORM_AGE_MS = 3000;
const MAX_TRACKED_IPS = 4000;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 4000;

function parseIntEnv(key: string, fallback: number, min: number, max: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

const resendApiKey = process.env.RESEND_API_KEY?.trim() ?? "";
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;
const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO_EMAIL;
const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
const subjectPrefix = process.env.CONTACT_SUBJECT_PREFIX?.trim() || DEFAULT_SUBJECT_PREFIX;
const rateLimitWindowMs = parseIntEnv("CONTACT_RATE_LIMIT_WINDOW_MS", DEFAULT_RATE_LIMIT_WINDOW_MS, 1000, 60 * 60 * 1000);
const rateLimitMax = parseIntEnv("CONTACT_RATE_LIMIT_MAX", DEFAULT_RATE_LIMIT_MAX, 1, 50);
const minFormAgeMs = parseIntEnv("CONTACT_MIN_SUBMIT_MS", DEFAULT_MIN_FORM_AGE_MS, 500, 120_000);

const requestBuckets = new Map<string, RateBucket>();

const json = (status: number, body: ApiSuccess | ApiError): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
};

const readString = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const sanitizeRedirect = (value: string): string => {
  if (!value) return DEFAULT_REDIRECT;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_REDIRECT;
  if (value.length > 512) return DEFAULT_REDIRECT;
  return value;
};

const withContactStatus = (redirectTarget: string, status: string): string => {
  const nextUrl = new URL(redirectTarget, APP_BASE_URL);
  nextUrl.searchParams.set("contact", status);
  if (!nextUrl.hash) nextUrl.hash = "contact";
  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
};

const redirect = (request: Request, redirectTarget: string, status: string): Response | null => {
  const accepts = request.headers.get("accept") ?? "";
  if (!accepts.includes("text/html")) return null;
  return new Response(null, {
    status: 303,
    headers: {
      location: withContactStatus(redirectTarget, status),
      "cache-control": "no-store",
    },
  });
};

const trimForHeader = (value: string, maxLength: number): string => {
  return value.replace(/[\r\n]+/g, " ").slice(0, maxLength).trim();
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
};

const cleanupBuckets = (now: number): void => {
  if (requestBuckets.size <= MAX_TRACKED_IPS) return;
  for (const [key, value] of requestBuckets.entries()) {
    if (value.resetAt <= now) {
      requestBuckets.delete(key);
    }
  }
};

const consumeRateLimit = (ip: string, now: number): { allowed: boolean; retryAfterMs: number } => {
  cleanupBuckets(now);
  const current = requestBuckets.get(ip);
  if (!current || now >= current.resetAt) {
    requestBuckets.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return { allowed: true, retryAfterMs: rateLimitWindowMs };
  }

  current.count += 1;
  requestBuckets.set(ip, current);

  const allowed = current.count <= rateLimitMax;
  return { allowed, retryAfterMs: Math.max(0, current.resetAt - now) };
};

const isLikelyBot = (honeypot: string, startedAtRaw: string, now: number): boolean => {
  if (honeypot.length > 0) return true;
  if (!startedAtRaw) return false;

  const startedAt = Number.parseInt(startedAtRaw, 10);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return false;
  return now - startedAt < minFormAgeMs;
};

const validateInput = (name: string, email: string, message: string): boolean => {
  if (!name || name.length < 2 || name.length > MAX_NAME_LENGTH) return false;
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return false;
  if (!message || message.length < 10 || message.length > MAX_MESSAGE_LENGTH) return false;
  return true;
};

const buildEmailBody = (params: {
  name: string;
  email: string;
  message: string;
  lang: string;
  ip: string;
  userAgent: string;
}): { text: string; html: string } => {
  const { name, email, message, lang, ip, userAgent } = params;
  const text = [
    "Nuevo mensaje desde el formulario del portfolio.",
    "",
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Idioma: ${lang || "n/a"}`,
    `IP: ${ip}`,
    `User-Agent: ${userAgent || "n/a"}`,
    "",
    "Mensaje:",
    message,
  ].join("\n");

  const html = `
    <h2>Nuevo mensaje desde el portfolio</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Idioma:</strong> ${escapeHtml(lang || "n/a")}</p>
    <p><strong>IP:</strong> ${escapeHtml(ip)}</p>
    <p><strong>User-Agent:</strong> ${escapeHtml(userAgent || "n/a")}</p>
    <hr />
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  return { text, html };
};

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json(400, { ok: false, error: "invalid_input" });
  }

  const redirectTarget = sanitizeRedirect(readString(formData.get("redirect_to")));
  const now = Date.now();
  const clientIp = getClientIp(request);
  const honeypot = readString(formData.get("company"));
  const startedAtRaw = readString(formData.get("form_started_at"));

  if (isLikelyBot(honeypot, startedAtRaw, now)) {
    const maybeRedirect = redirect(request, redirectTarget, "sent");
    if (maybeRedirect) return maybeRedirect;
    return json(200, { ok: true });
  }

  const rateLimit = consumeRateLimit(clientIp, now);
  if (!rateLimit.allowed) {
    const maybeRedirect = redirect(request, redirectTarget, "rate_limit");
    if (maybeRedirect) return maybeRedirect;
    return new Response(JSON.stringify({ ok: false, error: "rate_limited" as ApiErrorCode }), {
      status: 429,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "retry-after": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
      },
    });
  }

  const name = readString(formData.get("name"));
  const email = readString(formData.get("email"));
  const message = readString(formData.get("message"));
  const lang = readString(formData.get("lang")).slice(0, 8);

  if (!validateInput(name, email, message)) {
    const maybeRedirect = redirect(request, redirectTarget, "invalid");
    if (maybeRedirect) return maybeRedirect;
    return json(400, { ok: false, error: "invalid_input" });
  }

  if (!resendClient) {
    const maybeRedirect = redirect(request, redirectTarget, "service_unavailable");
    if (maybeRedirect) return maybeRedirect;
    return json(503, { ok: false, error: "service_unavailable" });
  }

  const safeName = trimForHeader(name, MAX_NAME_LENGTH);
  const safeEmail = trimForHeader(email, MAX_EMAIL_LENGTH);
  const safeUserAgent = trimForHeader(request.headers.get("user-agent") ?? "", 300);
  const safeMessage = message.slice(0, MAX_MESSAGE_LENGTH);
  const subject = `${subjectPrefix} ${safeName}`;
  const body = buildEmailBody({
    name: safeName,
    email: safeEmail,
    message: safeMessage,
    lang,
    ip: clientIp,
    userAgent: safeUserAgent,
  });

  try {
    const { error } = await resendClient.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: safeEmail,
      subject,
      text: body.text,
      html: body.html,
    });

    if (error) {
      console.error("[contact] resend error", error);
      const maybeRedirect = redirect(request, redirectTarget, "send_error");
      if (maybeRedirect) return maybeRedirect;
      return json(502, { ok: false, error: "send_failed" });
    }

    const maybeRedirect = redirect(request, redirectTarget, "sent");
    if (maybeRedirect) return maybeRedirect;
    return json(200, { ok: true });
  } catch (error) {
    console.error("[contact] unexpected error", error);
    const maybeRedirect = redirect(request, redirectTarget, "send_error");
    if (maybeRedirect) return maybeRedirect;
    return json(502, { ok: false, error: "send_failed" });
  }
};
