import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";

import { getServerEnv } from "./env";

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

export type SendContactEmailInput = {
  name: string;
  email: string;
  message: string;
  ip: string;
  isoDate: string;
  lang?: string;
  userAgent?: string;
};

let cachedTransporter: Transporter | null = null;

const sanitizeHeaderValue = (value: string, maxLength: number): string => {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, maxLength);
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await new Promise<T>((resolve, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("smtp_timeout"));
      }, timeoutMs);

      promise.then(resolve).catch(reject);
    });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const getTransporter = (): Transporter => {
  if (cachedTransporter) return cachedTransporter;

  const env = getServerEnv();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.gmailUser,
      pass: env.gmailAppPassword,
    },
    connectionTimeout: env.smtpTimeoutMs,
    greetingTimeout: env.smtpTimeoutMs,
    socketTimeout: env.smtpTimeoutMs,
  });

  return cachedTransporter;
};

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  ca: "Catalán",
  fr: "Francés",
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(date);
};

const describeUserAgent = (userAgent: string): string => {
  if (!userAgent) return "Navegador desconocido";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Otro navegador";
  const system = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return system ? `${browser} en ${system}` : browser;
};

const FONT = "Arial,'Segoe UI',Helvetica,sans-serif";

const buildEmailContent = (input: SendContactEmailInput): { subject: string; text: string; html: string } => {
  const env = getServerEnv();

  const safeName = sanitizeHeaderValue(input.name, MAX_NAME_LENGTH);
  const safeEmail = sanitizeHeaderValue(input.email, MAX_EMAIL_LENGTH);
  const safeMessage = input.message.slice(0, MAX_MESSAGE_LENGTH).trim();
  const langCode = input.lang?.trim() ?? "";
  const language = LANGUAGE_NAMES[langCode] ?? (langCode || "Idioma desconocido");
  const date = formatDate(input.isoDate);
  const device = describeUserAgent(sanitizeHeaderValue(input.userAgent ?? "", 300));

  const subjectBase = sanitizeHeaderValue(`Nuevo mensaje de ${safeName}`, 180);
  const subjectPrefix = sanitizeHeaderValue(env.subjectPrefix, 40);
  const subject = subjectPrefix ? `${subjectPrefix} ${subjectBase}` : subjectBase;
  const replyHref = `mailto:${encodeURIComponent(safeEmail)}?subject=${encodeURIComponent(`Re: tu mensaje en joelarnaud.com`)}`;

  const text = [
    `Nuevo mensaje de ${safeName}`,
    `${safeEmail} · ${language}`,
    date,
    "",
    safeMessage,
    "",
    "Responde a este correo para contestar.",
    "",
    `IP ${input.ip} · ${device}`,
  ].join("\n");

  const messageHtml = escapeHtml(safeMessage).replace(/\r?\n/g, "<br />");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef2f1;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(safeMessage.slice(0, 120))}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eef2f1;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #d6dddb;border-radius:16px;">
            <tr>
              <td style="padding:28px 32px 20px 32px;font-family:${FONT};color:#1c292b;">
                <p style="margin:0 0 12px 0;font-size:12px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#1f5f55;font-weight:700;">Nuevo mensaje desde tu web</p>
                <p style="margin:0;font-size:22px;line-height:1.3;font-weight:700;">${escapeHtml(safeName)}</p>
                <p style="margin:6px 0 0 0;font-size:14px;line-height:1.5;color:#4b5b5d;"><a href="mailto:${escapeHtml(safeEmail)}" style="color:#1f5f55;text-decoration:none;">${escapeHtml(safeEmail)}</a> · ${escapeHtml(language)}</p>
                <p style="margin:2px 0 0 0;font-size:14px;line-height:1.5;color:#4b5b5d;">${escapeHtml(date)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;"><div style="height:1px;background-color:#e3e9e7;line-height:1px;font-size:1px;">&nbsp;</div></td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px 32px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1c292b;word-break:break-word;">${messageHtml}</td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px 32px;">
                <a href="${escapeHtml(replyHref)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background-color:#1f5f55;color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;text-decoration:none;">Responder a ${escapeHtml(safeName)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 18px 32px;border-top:1px solid #e3e9e7;font-family:${FONT};font-size:12px;line-height:1.5;color:#8a9a98;">IP ${escapeHtml(input.ip)} · ${escapeHtml(device)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
};

export const sendContactEmail = async (input: SendContactEmailInput): Promise<void> => {
  const env = getServerEnv();
  const transporter = getTransporter();
  const { subject, text, html } = buildEmailContent(input);

  const mailOptions: SendMailOptions = {
    from: { name: "Portfolio Joël Arnaud", address: env.gmailUser },
    to: [env.contactTo || env.gmailUser],
    replyTo: sanitizeHeaderValue(input.email, MAX_EMAIL_LENGTH),
    subject,
    text,
    html,
  };

  await withTimeout(transporter.sendMail(mailOptions), env.smtpTimeoutMs);
};
