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
    <html lang="es" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f3f6f5;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;">
          Nuevo mensaje desde el formulario del portfolio.
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f3f6f5" style="background-color:#f3f6f5;margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:18px 10px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background-color:#ffffff;border:1px solid #d6dddb;border-collapse:collapse;">
                <tr>
                  <td bgcolor="#304545" style="background-color:#304545;padding:16px 20px;">
                    <p style="margin:0 0 6px 0;font-family:Arial,'Segoe UI',sans-serif;font-size:11px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#bec8c6;">Nuevo contacto</p>
                    <p style="margin:0;font-family:Arial,'Segoe UI',sans-serif;font-size:22px;line-height:1.3;font-weight:700;color:#f3f6f5;">Nueva solicitud desde la web</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;font-family:Arial,'Segoe UI',sans-serif;color:#304545;">
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:1.55;"><strong>Nombre:</strong> ${escapeHtml(safeName)}</p>
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:1.55;"><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:1.55;"><strong>Idioma:</strong> ${escapeHtml(safeLang)}</p>
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:1.55;"><strong>Fecha ISO:</strong> ${escapeHtml(input.isoDate)}</p>
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:1.55;"><strong>IP:</strong> ${escapeHtml(input.ip)}</p>
                    <p style="margin:0 0 14px 0;font-size:14px;line-height:1.55;"><strong>User-Agent:</strong> ${escapeHtml(safeUserAgent)}</p>
                    <p style="margin:0 0 8px 0;font-size:14px;line-height:1.4;"><strong>Mensaje:</strong></p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f8fbfa" style="background-color:#f8fbfa;border:1px solid #d6dddb;border-collapse:collapse;">
                      <tr>
                        <td style="padding:12px;font-family:Arial,'Segoe UI',sans-serif;font-size:14px;line-height:1.55;color:#304545;white-space:pre-wrap;word-break:break-word;">
                          ${escapeHtml(safeMessage)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
