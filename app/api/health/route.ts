import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "").replace(/\\\$/g, "$");
}

export async function GET() {
  const databaseUrl = cleanEnvValue(process.env.DATABASE_URL ?? process.env.MONGODB_URI);
  const dbName = cleanEnvValue(process.env.MONGODB_DB) ?? getDatabaseNameFromUri(databaseUrl) ?? "portfolio3d";
  const adminEmail = cleanEnvValue(process.env.ADMIN_EMAIL);
  const adminPasswordHash = cleanEnvValue(process.env.ADMIN_PASSWORD_HASH);
  const sessionSecret = cleanEnvValue(process.env.SESSION_SECRET);
  const result = {
    ok: false,
    nodeEnv: process.env.NODE_ENV,
    env: {
      hasDatabaseUrl: Boolean(databaseUrl),
      hasMongoDbUri: Boolean(cleanEnvValue(process.env.MONGODB_URI)),
      databaseUrlLooksQuoted: Boolean(process.env.DATABASE_URL?.trim().match(/^['"]/)),
      dbName,
      hasAdminEmail: Boolean(adminEmail),
      hasAdminPasswordHash: Boolean(adminPasswordHash),
      adminPasswordHashLooksValid: Boolean(adminPasswordHash?.startsWith("$2") && adminPasswordHash.length >= 55),
      hasPlainAdminPassword: Boolean(cleanEnvValue(process.env.ADMIN_PASSWORD)),
      hasSessionSecret: Boolean(sessionSecret),
      sessionSecretLooksStrong: Boolean(sessionSecret && sessionSecret.length >= 32),
      siteUrl: cleanEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ?? null
    },
    mongo: {
      connected: false,
      profileCount: null as number | null,
      siteProfileCount: null as number | null,
      pagesCount: null as number | null,
      homeSectionsCount: null as number | null,
      testimonialsCount: null as number | null,
      footerCount: null as number | null,
      navigationCount: null as number | null,
      seoCount: null as number | null,
      designCount: null as number | null,
      portfolioCount: null as number | null,
      error: null as string | null
    }
  };

  if (!databaseUrl) {
    return NextResponse.json(result, { status: 500 });
  }

  const client = new MongoClient(databaseUrl, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    const [
      profileCount,
      siteProfileCount,
      pagesCount,
      homeSectionsCount,
      testimonialsCount,
      footerCount,
      navigationCount,
      seoCount,
      designCount,
      portfolioCount
    ] = await Promise.all([
      db.collection("profile").countDocuments(),
      db.collection("site_profile").countDocuments(),
      db.collection("pages").countDocuments(),
      db.collection("home_sections").countDocuments(),
      db.collection("testimonials").countDocuments(),
      db.collection("footer").countDocuments(),
      db.collection("navigation").countDocuments(),
      db.collection("seo").countDocuments(),
      db.collection("design").countDocuments(),
      db.collection("portfolios").countDocuments()
    ]);
    result.mongo.connected = true;
    result.mongo.profileCount = profileCount;
    result.mongo.siteProfileCount = siteProfileCount;
    result.mongo.pagesCount = pagesCount;
    result.mongo.homeSectionsCount = homeSectionsCount;
    result.mongo.testimonialsCount = testimonialsCount;
    result.mongo.footerCount = footerCount;
    result.mongo.navigationCount = navigationCount;
    result.mongo.seoCount = seoCount;
    result.mongo.designCount = designCount;
    result.mongo.portfolioCount = portfolioCount;
    result.ok = true;
    return NextResponse.json(result);
  } catch (error) {
    result.mongo.error = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown MongoDB error";
    return NextResponse.json(result, { status: 500 });
  } finally {
    await client.close().catch(() => {});
  }
}

function getDatabaseNameFromUri(uri?: string) {
  if (!uri) return null;
  try {
    const pathname = new URL(uri).pathname.replace(/^\//, "");
    return pathname || null;
  } catch {
    return null;
  }
}
