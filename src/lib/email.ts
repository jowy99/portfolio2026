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

const buildEmailContent = (input: SendContactEmailInput): { subject: string; text: string; html: string } => {
  const env = getServerEnv();

  const safeName = sanitizeHeaderValue(input.name, MAX_NAME_LENGTH);
  const safeEmail = sanitizeHeaderValue(input.email, MAX_EMAIL_LENGTH);
  const safeMessage = input.message.slice(0, MAX_MESSAGE_LENGTH);
  const safeLang = input.lang?.trim() || "n/a";
  const safeUserAgent = sanitizeHeaderValue(input.userAgent ?? "", 300) || "n/a";

  const subjectBase = sanitizeHeaderValue(`Nueva solicitud desde la web: ${safeName}`, 180);
  const subjectPrefix = sanitizeHeaderValue(env.subjectPrefix, 40);
  const subject = subjectPrefix ? `${subjectPrefix} ${subjectBase}` : subjectBase;

  const text = [
    "Nuevo mensaje desde el formulario del portfolio.",
    "",
    `Nombre: ${safeName}`,
    `Email: ${safeEmail}`,
    `Idioma: ${safeLang}`,
    `Fecha ISO: ${input.isoDate}`,
    `IP: ${input.ip}`,
    `User-Agent: ${safeUserAgent}`,
    "",
    "Mensaje:",
    safeMessage,
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="es">
      <body style="margin:0;padding:18px;background:#f3f6f5;color:#304545;font-family:Inter,Segoe UI,Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d6dddb;border-radius:14px;overflow:hidden;">
          <div style="background:#304545;color:#f3f6f5;padding:16px 20px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#bec8c6;">Nuevo contacto</p>
            <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;">Nueva solicitud desde la web</h1>
          </div>
          <div style="padding:18px 20px;">
            <p><strong>Nombre:</strong> ${escapeHtml(safeName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
            <p><strong>Idioma:</strong> ${escapeHtml(safeLang)}</p>
            <p><strong>Fecha ISO:</strong> ${escapeHtml(input.isoDate)}</p>
            <p><strong>IP:</strong> ${escapeHtml(input.ip)}</p>
            <p><strong>User-Agent:</strong> ${escapeHtml(safeUserAgent)}</p>
            <p style="margin:14px 0 8px;"><strong>Mensaje:</strong></p>
            <div style="padding:12px;border:1px solid #d6dddb;border-radius:10px;background:#f8fbfa;line-height:1.55;white-space:pre-wrap;word-break:break-word;">
              ${escapeHtml(safeMessage)}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};

export const sendContactEmail = async (input: SendContactEmailInput): Promise<void> => {
  const env = getServerEnv();
  const transporter = getTransporter();
  const { subject, text, html } = buildEmailContent(input);

  const mailOptions: SendMailOptions = {
    from: env.gmailUser,
    to: [env.contactTo || env.gmailUser],
    replyTo: sanitizeHeaderValue(input.email, MAX_EMAIL_LENGTH),
    subject,
    text,
    html,
  };

  await withTimeout(transporter.sendMail(mailOptions), env.smtpTimeoutMs);
};
