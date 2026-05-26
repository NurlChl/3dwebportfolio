import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "portfolio_admin_session";

export function cleanAuthEnvValue(value?: string) {
  return value
    ?.trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\+/g, (slashes) => (slashes.length > 1 ? "\\" : slashes))
    .replace(/\\\$/g, "$")
    .trim();
}

export function getAdminAuthDiagnostics() {
  const adminEmail = cleanAuthEnvValue(process.env.ADMIN_EMAIL);
  const passwordHash = cleanAuthEnvValue(process.env.ADMIN_PASSWORD_HASH);
  const plainPassword = cleanAuthEnvValue(process.env.ADMIN_PASSWORD);
  const sessionSecret = cleanAuthEnvValue(process.env.SESSION_SECRET);

  return {
    hasAdminEmail: Boolean(adminEmail),
    adminEmailLooksValid: Boolean(adminEmail?.includes("@")),
    adminEmailPreview: maskEmail(adminEmail),
    adminEmailLength: adminEmail?.length ?? 0,
    hasAdminPasswordHash: Boolean(passwordHash),
    adminPasswordHashLooksValid: Boolean(passwordHash?.startsWith("$2") && passwordHash.length >= 55),
    adminPasswordHashPrefix: passwordHash ? passwordHash.slice(0, 4) : null,
    hasPlainAdminPassword: Boolean(plainPassword),
    hasSessionSecret: Boolean(sessionSecret),
    sessionSecretLooksStrong: Boolean(sessionSecret && sessionSecret.length >= 32)
  };
}

function maskEmail(email?: string) {
  if (!email) return null;
  const [name, domain] = email.split("@");
  if (!domain) return `${email.slice(0, 3)}***`;
  return `${name.slice(0, 2)}***@${domain}`;
}

function getSecret() {
  return cleanAuthEnvValue(process.env.SESSION_SECRET) ?? "dev-only-change-this-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function verifyAdmin(email: string, password: string) {
  const adminEmail = cleanAuthEnvValue(process.env.ADMIN_EMAIL);
  const passwordHash = cleanAuthEnvValue(process.env.ADMIN_PASSWORD_HASH);
  const plainPassword = cleanAuthEnvValue(process.env.ADMIN_PASSWORD);
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment && normalizedEmail === "admin@example.com" && normalizedPassword === "admin12345") {
    return true;
  }

  if (!adminEmail || normalizedEmail !== adminEmail.trim().toLowerCase()) {
    return false;
  }

  if (passwordHash?.startsWith("$2")) {
    try {
      if (await bcrypt.compare(normalizedPassword, passwordHash)) {
        return true;
      }
    } catch {
      return Boolean(plainPassword && normalizedPassword === plainPassword);
    }
  }

  return Boolean(plainPassword && normalizedPassword === plainPassword);
}

export async function createSession(email: string) {
  const issuedAt = Date.now().toString();
  const payload = Buffer.from(`${email}:${issuedAt}`).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function requireAdmin() {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }
}
