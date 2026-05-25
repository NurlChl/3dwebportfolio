import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "portfolio_admin_session";

function getSecret() {
  return process.env.SESSION_SECRET ?? "dev-only-change-this-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function verifyAdmin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const plainPassword = process.env.ADMIN_PASSWORD;
  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();

  if (!adminEmail || normalizedEmail !== adminEmail.trim()) {
    return false;
  }

  if (plainPassword && normalizedPassword === plainPassword) {
    return true;
  }

  if (!passwordHash) {
    return false;
  }

  return bcrypt.compare(normalizedPassword, passwordHash);
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
